import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9-zJ3t7zzzM2k8erIuez_ZFB24BXRDo0",
  authDomain: "keg-tracker-635ce.firebaseapp.com",
  projectId: "keg-tracker-635ce",
  storageBucket: "keg-tracker-635ce.firebasestorage.app",
  messagingSenderId: "94819354072",
  appId: "1:94819354072:web:99bc7c6dc8e6212e455ead",
  measurementId: "G-4MXK8TFKBV",
};

const isAlreadyInitialized = getApps().length > 0;

export const app: FirebaseApp = isAlreadyInitialized ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

if (typeof window !== "undefined") {
  console.log(`[Firebase] Initialized app for project: ${app.options.projectId ?? "unknown"}`);
}
