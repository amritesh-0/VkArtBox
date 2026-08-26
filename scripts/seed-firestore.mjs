import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import {
    collection,
    doc,
    getDocs,
    Timestamp,
    serverTimestamp,
    setDoc,
    writeBatch,
    getFirestore,
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAjSxTBKs85-S7eyPjapcj5q-qn6BJ2qp4",
    authDomain: "vkartbox-web.firebaseapp.com",
    projectId: "vkartbox-web",
    storageBucket: "vkartbox-web.firebasestorage.app",
    messagingSenderId: "222198316821",
    appId: "1:222198316821:web:38f4016e0ac5f089bbb31c",
    measurementId: "G-9RRN2HSV5V",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const uploadedImageCache = new Map();

const MIME_BY_EXT = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
};

async function readExportedArray(filePath, exportName) {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const exportRegex = new RegExp(`export\\s+const\\s+${exportName}\\s*=\\s*([\\s\\S]*?);\\s*$`);
    const match = fileContent.match(exportRegex);

    if (!match) {
        throw new Error(`Could not parse export "${exportName}" from ${filePath}`);
    }

    const arrayExpression = match[1];
    const evaluateArray = new Function(`return (${arrayExpression});`);
    return evaluateArray();
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

function sanitizePathSegment(value) {
    return String(value).replace(/[^a-zA-Z0-9-_/.]/g, '-');
}

function getExtensionFromSource(source, contentType = '') {
    const cleanSource = source.split('?')[0];
    const ext = path.extname(cleanSource).toLowerCase();
    if (ext) return ext;

    const matchedType = Object.entries(MIME_BY_EXT).find(([, mime]) => mime === contentType);
    return matchedType ? matchedType[0] : '.jpg';
}

async function readImageBytes(source) {
    if (source.startsWith('http://') || source.startsWith('https://')) {
        const response = await fetch(source);
        if (!response.ok) {
            throw new Error(`Failed to download remote image: ${source} (${response.status})`);
        }

        const contentType = response.headers.get('content-type') || MIME_BY_EXT[getExtensionFromSource(source)] || 'image/jpeg';
        const bytes = new Uint8Array(await response.arrayBuffer());
        return { bytes, contentType, ext: getExtensionFromSource(source, contentType) };
    }

    if (source.startsWith('/')) {
        const relativeSource = source.replace(/^\/+/, '');
        const publicPath = path.join(rootDir, 'public', relativeSource);
        const srcPath = path.join(rootDir, 'src', relativeSource);
        const candidatePaths = [publicPath, srcPath];

        for (const candidate of candidatePaths) {
            if (await fileExists(candidate)) {
                const bytes = await fs.readFile(candidate);
                const ext = getExtensionFromSource(candidate);
                return {
                    bytes,
                    contentType: MIME_BY_EXT[ext] || 'application/octet-stream',
                    ext,
                };
            }
        }
    }

    throw new Error(`Unsupported image source: ${source}`);
}

async function uploadImageSource(source, storagePathBase) {
    if (!source || typeof source !== 'string') return source;

    if (
        source.includes('firebasestorage.googleapis.com') ||
        source.includes('storage.googleapis.com')
    ) {
        return source;
    }

    if (uploadedImageCache.has(source)) {
        return uploadedImageCache.get(source);
    }

    const { bytes, contentType, ext } = await readImageBytes(source);
    const finalPath = `${sanitizePathSegment(storagePathBase)}${ext}`;
    const imageRef = storageRef(storage, finalPath);

    await uploadBytes(imageRef, bytes, { contentType });
    const downloadUrl = await getDownloadURL(imageRef);
    uploadedImageCache.set(source, downloadUrl);
    return downloadUrl;
}

async function normalizeCollectionDoc(collectionDoc) {
    const normalized = { ...collectionDoc };

    normalized.bgImage = await uploadImageSource(collectionDoc.bgImage, `seed/collections/${collectionDoc.id}/bg-image`);
    normalized.heroImage = await uploadImageSource(collectionDoc.heroImage, `seed/collections/${collectionDoc.id}/hero-image`);

    if (Array.isArray(collectionDoc.previews)) {
        normalized.previews = await Promise.all(
            collectionDoc.previews.map(async (preview, index) => ({
                ...preview,
                img: await uploadImageSource(preview.img, `seed/collections/${collectionDoc.id}/previews/${index + 1}`),
            }))
        );
    }

    if (collectionDoc.printFeature?.img) {
        normalized.printFeature = {
            ...collectionDoc.printFeature,
            img: await uploadImageSource(collectionDoc.printFeature.img, `seed/collections/${collectionDoc.id}/print-feature`),
        };
    }

    return normalized;
}

async function normalizeArtworkDoc(collectionId, artwork) {
    return {
        ...artwork,
        image: await uploadImageSource(artwork.image, `seed/artworks/${collectionId}/${artwork.id}/image`),
    };
}

async function normalizeBlogDoc(blog) {
    return {
        ...blog,
        image: await uploadImageSource(blog.image, `seed/blogs/${blog.id}/cover-image`),
    };
}

function getCreatedAtFromDate(dateValue) {
    if (!dateValue || typeof dateValue !== 'string') return serverTimestamp();
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return serverTimestamp();
    return Timestamp.fromDate(parsed);
}

async function authenticateIfConfigured() {
    const email = process.env.FIREBASE_ADMIN_EMAIL;
    const password = process.env.FIREBASE_ADMIN_PASSWORD;

    if (!email || !password) {
        console.warn('No Firebase admin credentials found in env. Seeding will run unauthenticated.');
        console.warn('Set FIREBASE_ADMIN_EMAIL and FIREBASE_ADMIN_PASSWORD if your rules require sign-in.');
        return false;
    }

    await signInWithEmailAndPassword(auth, email, password);
    console.log(`Authenticated as ${email}`);
    return true;
}

async function clearCollection(collectionName) {
    const snapshot = await getDocs(collection(db, collectionName));
    if (snapshot.empty) return 0;

    let deleted = 0;
    let batch = writeBatch(db);
    let ops = 0;

    for (const document of snapshot.docs) {
        batch.delete(doc(db, collectionName, document.id));
        ops += 1;
        deleted += 1;

        if (ops === 450) {
            await batch.commit();
            batch = writeBatch(db);
            ops = 0;
        }
    }

    if (ops > 0) {
        await batch.commit();
    }

    return deleted;
}

async function seed() {
    const shouldReset = process.argv.includes('--reset');
    const collectionsPath = path.join(rootDir, 'scripts', 'seed-data', 'collectionData.js');
    const blogsPath = path.join(rootDir, 'scripts', 'seed-data', 'blogData.js');
    const isAuthenticated = await authenticateIfConfigured();

    const sourceCollections = await readExportedArray(collectionsPath, 'collections');
    const sourceBlogs = await readExportedArray(blogsPath, 'BLOG_POSTS');

    if (shouldReset) {
        const [deletedCollections, deletedArtworks, deletedBlogs] = await Promise.all([
            clearCollection('collections'),
            clearCollection('artworks'),
            clearCollection('blogs'),
        ]);
        console.log(`Cleared docs -> collections: ${deletedCollections}, artworks: ${deletedArtworks}, blogs: ${deletedBlogs}`);
    }

    let seededCollections = 0;
    let seededArtworks = 0;
    let seededBlogs = 0;

    for (const collectionItem of sourceCollections) {
        const normalizedCollection = await normalizeCollectionDoc(collectionItem);
        const { id, artworks = [], ...collectionDoc } = normalizedCollection;
        await setDoc(
            doc(db, 'collections', id),
            {
                ...collectionDoc,
                createdAt: collectionDoc.createdAt || serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
        seededCollections += 1;

        for (const artwork of artworks) {
            const normalizedArtwork = await normalizeArtworkDoc(id, artwork);
            await setDoc(
                doc(db, 'artworks', normalizedArtwork.id),
                {
                    ...normalizedArtwork,
                    collectionId: id,
                    createdAt: normalizedArtwork.createdAt || serverTimestamp(),
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );
            seededArtworks += 1;
        }
    }

    for (const blog of sourceBlogs) {
        const normalizedBlog = await normalizeBlogDoc(blog);
        const { id, ...blogData } = normalizedBlog;
        await setDoc(
            doc(db, 'blogs', id),
            {
                ...blogData,
                createdAt: blogData.createdAt || getCreatedAtFromDate(blogData.date),
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
        seededBlogs += 1;
    }

    console.log(`Seed complete -> collections: ${seededCollections}, artworks: ${seededArtworks}, blogs: ${seededBlogs}`);

    if (isAuthenticated) {
        await signOut(auth);
    }
}

seed().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
});
