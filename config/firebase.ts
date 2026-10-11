import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBLNRKhpbsgteKAK7lOPuUks_lNmuOClx0",
  authDomain: "cercatuyo-app.firebaseapp.com",
  projectId: "cercatuyo-app",
  storageBucket: "cercatuyo-app.firebasestorage.app",
  messagingSenderId: "322098672107",
  appId: "1:322098672107:web:a8dd31e5b6caa7c03b69ae"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
