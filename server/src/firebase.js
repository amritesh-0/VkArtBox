import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBrWwExFon-eXKWkIcC6OgzOHp5deDvjjQ",
    authDomain: "vkartbox-4affb.firebaseapp.com",
    projectId: "vkartbox-4affb",
    storageBucket: "vkartbox-4affb.firebasestorage.app",
    messagingSenderId: "232392314113",
    appId: "1:232392314113:web:a2a44687cf766f25961f00",
    measurementId: "G-P5N0FK7FNK"
};


let app, db, storage;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
} catch (error) {
    console.warn("Firebase config not set. Please update firebase.js");
}

export { db, storage };
