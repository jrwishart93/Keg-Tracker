import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserById } from "@/lib/firestore";
import type { AppUser } from "@/types/user";

function requireAuth() {
  if (!auth) {
    throw new Error("Firebase auth is only available in the browser.");
  }
  return auth;
}

export async function loginWithEmail(email: string, password: string): Promise<AppUser | null> {
  const result = await signInWithEmailAndPassword(requireAuth(), email, password);
  document.cookie = "kt_session=1; path=/; max-age=86400";
  return getUserById(result.user.uid);
}

export async function logout() {
  await signOut(requireAuth());
  document.cookie = "kt_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function watchAuthState(callback: (user: AppUser | null) => void) {
  return onAuthStateChanged(requireAuth(), async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    callback(await getUserById(firebaseUser.uid));
  });
}
