import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzsDFI0QjjUfGF3Gy5Y9YUteFyVjn7FXE",
  authDomain: "cuidadomaisfamilia.firebaseapp.com",
  projectId: "cuidadomaisfamilia",
  storageBucket: "cuidadomaisfamilia.firebasestorage.app",
  messagingSenderId: "934761133424",
  appId: "1:934761133424:web:ab7fa47abdb1449cd74bb5"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
