#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

function initAdminApp() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountPath) {
    const serviceAccountRaw = readFileSync(resolve(serviceAccountPath), "utf8");
    const serviceAccount = JSON.parse(serviceAccountRaw);
    return initializeApp({ credential: cert(serviceAccount) });
  }

  return initializeApp({ credential: applicationDefault() });
}

initAdminApp();

const auth = getAuth();
const db = getFirestore();

const demoUsers = [
  {
    email: "admin@beffect.local",
    password: "Admin1234!",
    displayName: "Admin User",
    role: "admin",
    requiresPasswordChange: false,
  },
  {
    email: "ahughes@beffect.local",
    password: "Password123!",
    displayName: "Ash Hughes",
    role: "staff",
    requiresPasswordChange: true,
  },
  {
    email: "dev@beffect.local",
    password: "Password123!",
    displayName: "Devuser",
    role: "developer",
    requiresPasswordChange: true,
  },
];

async function createOrUpdateAuthUser(user) {
  try {
    const existing = await auth.getUserByEmail(user.email);
    const updated = await auth.updateUser(existing.uid, {
      displayName: user.displayName,
      password: user.password,
    });
    return updated;
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
      });
    }
    throw error;
  }
}

async function seedDemoUsers() {
  for (const user of demoUsers) {
    const authUser = await createOrUpdateAuthUser(user);

    await db.collection("users").doc(authUser.uid).set(
      {
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        requiresPasswordChange: user.requiresPasswordChange,
        createdAt: FieldValue.serverTimestamp(),
        lastLoginAt: null,
      },
      { merge: true },
    );

    console.log(`Seeded ${user.email} (${authUser.uid})`);
  }

  console.log("Demo users seeded successfully.");
}

seedDemoUsers().catch((error) => {
  console.error("Failed to seed demo users:", error);
  process.exit(1);
});
