import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAL7wc1qx2LfQB5VSUQc4rZWb-71npZJVo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mihsef-ops.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mihsef-ops",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mihsef-ops.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "340767221226",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:340767221226:web:d77127fe34cc035acffe93"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
