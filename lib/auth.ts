import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { disableDemoMode } from "@/lib/demo-mode";
import { clearPasswordChangeRequirement, getUserById, updateUserLastLogin } from "@/lib/firestore";
import type { AppUser, UserRole } from "@/types/user";

function requireAuth() {
  if (!auth) {
    throw new Error("Firebase auth is only available in the browser.");
  }
  return auth;
}

function setCookie(name: string, value: string, maxAgeSeconds = 86400) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// Session cookies are used by proxy.ts to gate routes without storing credentials in the client.
function setSessionCookies(profile: AppUser) {
  setCookie("kt_session", "1");
  setCookie("kt_role", profile.role);
  setCookie("kt_requires_password_change", profile.requiresPasswordChange ? "1" : "0");
}

function clearSessionCookies() {
  clearCookie("kt_session");
  clearCookie("kt_role");
  clearCookie("kt_requires_password_change");
}

export async function loginWithEmail(email: string, password: string): Promise<AppUser | null> {
  const result = await signInWithEmailAndPassword(requireAuth(), email, password);
  const profile = await getUserById(result.user.uid);

  if (!profile) {
    clearSessionCookies();
    return null;
  }

  // TEMPORARY demo bypass should not persist once a real auth session starts.
  disableDemoMode();
  await updateUserLastLogin(result.user.uid);
  const updatedProfile = { ...profile, lastLoginAt: new Date().toISOString() };
  setSessionCookies(updatedProfile);
  return updatedProfile;
}

// Change-password flow reauthenticates first, then updates Auth password and Firestore flag.
export async function completePasswordChange(currentPassword: string, newPassword: string) {
  const currentAuth = requireAuth();
  const user = currentAuth.currentUser;

  if (!user || !user.email) {
    throw new Error("No signed-in user available.");
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
  await clearPasswordChangeRequirement(user.uid);
  setCookie("kt_requires_password_change", "0");
}

export async function logout() {
  const currentAuth = requireAuth();

  if (currentAuth.currentUser) {
    await signOut(currentAuth);
  }

  clearSessionCookies();
  disableDemoMode();
}

export function watchAuthState(callback: (user: AppUser | null) => void) {
  return onAuthStateChanged(requireAuth(), async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    const profile = await getUserById(firebaseUser.uid);
    callback(profile);
  });
}

export function hasRoleAccess(role: UserRole | undefined, requiredRoles: UserRole[]) {
  return Boolean(role && requiredRoles.includes(role));
}
