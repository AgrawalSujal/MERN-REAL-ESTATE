// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-real-estates.firebaseapp.com",
  projectId: "mern-real-estates",
  storageBucket: "mern-real-estates.appspot.com",
  messagingSenderId: "41458622354",
  appId: "1:41458622354:web:58d6efffa2272caaddab4b",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
