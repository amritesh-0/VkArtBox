import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

const requiredFirebaseEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
];

const missingFirebaseEnvVars = requiredFirebaseEnvVars.filter((key) => !import.meta.env[key]);
const isFirebaseConfigured = missingFirebaseEnvVars.length === 0;

let app, auth, db, storage;

try {
    if (!isFirebaseConfigured) {
        console.warn(`Missing Firebase env vars: ${missingFirebaseEnvVars.join(', ')}`);
    } else {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
    }
} catch {
    console.warn('Firebase config not set. Please update firebase.js');
}

export { auth, db, storage };
export { firebaseConfig };
export { isFirebaseConfigured, missingFirebaseEnvVars };
