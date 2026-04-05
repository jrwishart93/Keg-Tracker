"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function FirebaseConnectionTestButton() {
  const [isWriting, setIsWriting] = useState(false);

  async function handleConnectionTest() {
    setIsWriting(true);

    try {
      const docRef = await addDoc(collection(db, "test"), {
        message: "connection working",
        createdAt: serverTimestamp(),
      });
      console.log("[Firestore] Test write succeeded:", docRef.id);
    } catch (error) {
      console.error("[Firestore] Test write failed:", error);
    } finally {
      setIsWriting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleConnectionTest}
      disabled={isWriting}
      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isWriting ? "Testing Firestore..." : "Test Firestore Connection"}
    </button>
  );
}
