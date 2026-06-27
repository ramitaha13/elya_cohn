// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // ← הוספה

const firebaseConfig = {
  apiKey: "AIzaSyDLMQ1wh_hjvBn_Gi9FMLFrvt1FvaKGpXY",
  authDomain: "elya-43bfb.firebaseapp.com",
  projectId: "elya-43bfb",
  storageBucket: "elya-43bfb.firebasestorage.app",
  messagingSenderId: "149112125882",
  appId: "1:149112125882:web:992db0a19e89f516528583",
  measurementId: "G-N1L90PGZXL",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // ← הוספה

export { app, analytics, db }; // ← חשוב לייצא את db
