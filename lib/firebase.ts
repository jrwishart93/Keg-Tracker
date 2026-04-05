import { getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
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

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = typeof window !== "undefined" ? getAuth(app) : null;

export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  const supported = await isSupported();
  return supported ? getAnalytics(app) : null;
}
