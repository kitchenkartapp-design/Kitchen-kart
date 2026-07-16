import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - Update with your credentials
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDemoKey',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'kitchen-kart-demo.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'kitchen-kart-demo',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'kitchen-kart-demo.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.FIREBASE_APP_ID || '1:123456789:web:demo',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-DEMO',
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

export default firebaseApp;
