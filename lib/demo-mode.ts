import type { AppUser } from "@/types/user";

export const DEMO_MODE_STORAGE_KEY = "demoMode";
const DEMO_MODE_COOKIE = "kt_demo";

// Temporary prototype identity used when demo mode bypasses Firebase auth.
export const DEMO_USER: AppUser = {
  uid: "demo-user",
  email: "demo@keg-tracker.local",
  displayName: "Demo User",
  role: "demo",
  requiresPasswordChange: false,
};

function setCookie(name: string, value: string, maxAgeSeconds = 86400) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

export function isDemoModeEnabled(): boolean {
  if (!canUseBrowserStorage()) return false;
  return window.localStorage.getItem(DEMO_MODE_STORAGE_KEY) === "true";
}

// TEMPORARY: demo-mode shortcut for prototype previews. Remove once sign-in-only access is enforced.
export function enableDemoMode() {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, "true");
  setCookie(DEMO_MODE_COOKIE, "1");
}

// TEMPORARY: called during logout or when auth session changes to keep demo bypass isolated.
export function disableDemoMode() {
  if (canUseBrowserStorage()) {
    window.localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
  }
  clearCookie(DEMO_MODE_COOKIE);
}
