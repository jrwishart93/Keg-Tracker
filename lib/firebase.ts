import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const fallbackFirebaseConfig = {
  apiKey: "AIzaSyD9-zJ3t7zzzM2k8erIuez_ZFB24BXRDo0",
  authDomain: "keg-tracker-635ce.firebaseapp.com",
  databaseURL: "https://keg-tracker-635ce-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "keg-tracker-635ce",
  storageBucket: "keg-tracker-635ce.firebasestorage.app",
  messagingSenderId: "94819354072",
  appId: "1:94819354072:web:99bc7c6dc8e6212e455ead",
  measurementId: "G-4MXK8TFKBV",
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? fallbackFirebaseConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? fallbackFirebaseConfig.authDomain,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? fallbackFirebaseConfig.databaseURL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? fallbackFirebaseConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? fallbackFirebaseConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? fallbackFirebaseConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? fallbackFirebaseConfig.appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? fallbackFirebaseConfig.measurementId,
};

const isAlreadyInitialized = getApps().length > 0;

export const app: FirebaseApp = isAlreadyInitialized ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const supported = await isSupported();
  if (!supported) {
    return null;
  }

  return getAnalytics(app);
}

if (typeof window !== "undefined") {
  console.log(`[Firebase] Initialized app for project: ${app.options.projectId ?? "unknown"}`);
}
