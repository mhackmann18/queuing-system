// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';

const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_PROJECT_NUMBER
} = import.meta.env;

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: 'queuing-system-f6b29.firebaseapp.com',
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: 'queuing-system-f6b29.appspot.com',
  messagingSenderId: VITE_FIREBASE_PROJECT_NUMBER,
  appId: VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
