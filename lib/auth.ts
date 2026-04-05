import {
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { disableDemoMode } from "@/lib/demo-mode";
import { getUserById, updateUserLastLogin, upsertUserProfile } from "@/lib/firestore";
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
}

function clearSessionCookies() {
  clearCookie("kt_session");
  clearCookie("kt_role");
}

function getFallbackDisplayName(user: User, preferredDisplayName?: string) {
  if (preferredDisplayName?.trim()) {
    return preferredDisplayName.trim();
  }

  if (user.displayName?.trim()) {
    return user.displayName.trim();
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "Staff User";
}

async function bootstrapProfile(user: User, preferredDisplayName?: string): Promise<AppUser> {
  let profile = await getUserById(user.uid);
  const displayName = getFallbackDisplayName(user, preferredDisplayName);

  if (!profile) {
    await upsertUserProfile(user.uid, {
      email: user.email ?? "",
      displayName,
      role: "staff",
      requiresPasswordChange: false,
    });
    profile = await getUserById(user.uid);
  }

  if (!profile) {
    throw new Error("No staff profile found for this account.");
  }

  disableDemoMode();
  await updateUserLastLogin(user.uid);
  const updatedProfile = { ...profile, lastLoginAt: new Date().toISOString() };
  setSessionCookies(updatedProfile);
  return updatedProfile;
}

export async function loginWithEmail(email: string, password: string): Promise<AppUser | null> {
  const result = await signInWithEmailAndPassword(requireAuth(), email, password);
  return bootstrapProfile(result.user);
}

export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<AppUser> {
  const result = await createUserWithEmailAndPassword(requireAuth(), email, password);

  if (displayName?.trim()) {
    await updateProfile(result.user, { displayName: displayName.trim() });
  }

  return bootstrapProfile(result.user, displayName);
}

export async function signInWithGoogle(): Promise<AppUser> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(requireAuth(), provider);
  return bootstrapProfile(result.user);
}

export async function signInWithApple(): Promise<AppUser> {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  const result = await signInWithPopup(requireAuth(), provider);
  return bootstrapProfile(result.user);
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

    try {
      const profile = await bootstrapProfile(firebaseUser);
      callback(profile);
    } catch {
      clearSessionCookies();
      callback(null);
    }
  });
}

export function hasRoleAccess(role: UserRole | undefined, requiredRoles: UserRole[]) {
  return Boolean(role && requiredRoles.includes(role));
}
