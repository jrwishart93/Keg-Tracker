"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail, signInWithApple, signInWithGoogle, signUpWithEmail } from "@/lib/auth";
import { useAuth } from "@/context/auth-context";

type AuthMode = "signin" | "signup";

function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Authentication failed. Please try again.";
  }

  if ("code" in error && typeof error.code === "string") {
    switch (error.code) {
      case "auth/account-exists-with-different-credential":
        return "An account already exists with a different sign-in method.";
      case "auth/email-already-in-use":
        return "That email address is already in use.";
      case "auth/invalid-credential":
      case "auth/invalid-email":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Your sign-in details are incorrect.";
      case "auth/popup-closed-by-user":
        return "The sign-in popup was closed before authentication completed.";
      case "auth/popup-blocked":
        return "Your browser blocked the sign-in popup. Allow popups and try again.";
      case "auth/operation-not-allowed":
        return "That sign-in method is not enabled in Firebase Authentication.";
      case "auth/weak-password":
        return "Choose a stronger password with at least 6 characters.";
      default:
        break;
    }
  }

  return error.message || "Authentication failed. Please try again.";
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const router = useRouter();
  const { state: { user, loading: authLoading } } = useAuth();

  // Redirect already-authenticated users away from the login page.
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const requestedMode = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("mode") : null;
    setMode(requestedMode === "signup" ? "signup" : "signin");
    setError(null);
  }, []);

  async function finalizeAuth(action: Promise<unknown>) {
    setError(null);

    try {
      await action;
      router.push("/dashboard");
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setLoadingAction(null);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "signup" && password.length < 6) {
      setError("Use at least 6 characters for the password.");
      return;
    }

    setLoadingAction(mode === "signin" ? "email-signin" : "email-signup");
    await finalizeAuth(mode === "signin" ? loginWithEmail(email, password) : signUpWithEmail(email, password, displayName));
  }

  return (
    <main className="page-shell relative -mx-4 -mt-6 min-h-[calc(100vh-5rem)] overflow-hidden md:-mx-5 md:rounded-[32px]">
      <Image
        src="https://beffect.nz/cdn/shop/files/220612-Wanaka-Snow-023.jpg?v=1746667988&width=535"
        alt="Wānaka landscape"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,26,34,0.92),rgba(26,36,45,0.74),rgba(101,86,58,0.52))]" />
      <div className="grain-overlay absolute inset-0" />

      <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 px-5 py-10 text-white lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="float-in max-w-2xl">
          <p className="eyebrow text-amber-100/78">Staff Sign In</p>
          <h1 className="display-title mt-4 text-5xl text-balance sm:text-7xl">A polished front door for busy brewery operations.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-100/84 sm:text-lg">
            Use email, Google, or Apple to get straight into keg scanning, movement updates, and QR allocation without breaking the shift rhythm.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.08)] p-5">
              <p className="eyebrow text-[10px] text-amber-100/78">Fast Shift Flow</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/84">Mobile-ready access for staff on the floor, in the warehouse, or on delivery.</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.08)] p-5">
              <p className="eyebrow text-[10px] text-amber-100/78">Shared Visibility</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/84">Every account opens the same live workspace for scanning, allocations, and keg operations.</p>
            </div>
          </div>
        </div>

        <div className="float-in editorial-panel border-white/10 bg-[rgba(255,248,239,0.92)] p-5 text-slate-900 shadow-[0_24px_48px_rgba(0,0,0,0.22)] sm:p-7">
          <div className="mb-6 flex items-center gap-4">
            <Image
              src="/logo.jpg"
              alt="b.effect Brewing"
              width={70}
              height={70}
              className="rounded-full border border-black/10 bg-[rgba(255,255,255,0.6)] p-1"
            />
            <div>
              <p className="eyebrow text-[color:var(--amber)]">Keg Tracker Access</p>
              <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{mode === "signin" ? "Welcome back." : "Create your account."}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-full border border-black/10 bg-[rgba(0,0,0,0.04)] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`min-h-12 rounded-full text-sm font-semibold ${mode === "signin" ? "bg-[color:var(--ink)] text-white shadow-[0_12px_22px_rgba(23,33,42,0.2)]" : "text-slate-600"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`min-h-12 rounded-full text-sm font-semibold ${mode === "signup" ? "bg-[color:var(--ink)] text-white shadow-[0_12px_22px_rgba(23,33,42,0.2)]" : "text-slate-600"}`}
            >
              Sign Up
            </button>
          </div>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            {mode === "signup" ? (
              <label className="block">
                <span className="section-kicker">Display Name</span>
                <input
                  type="text"
                  className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4 text-slate-900"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loadingAction !== null}
                  placeholder="Optional"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="section-kicker">Email</span>
              <input
                required
                type="email"
                className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4 text-slate-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loadingAction !== null}
              />
            </label>

            <label className="block">
              <span className="section-kicker">Password</span>
              <input
                required
                type="password"
                className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4 text-slate-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loadingAction !== null}
              />
            </label>

            {error ? <p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

            <button
              type="submit"
              disabled={loadingAction !== null}
              className="glow-button min-h-13 w-full rounded-full bg-[linear-gradient(135deg,#17212a,#324452)] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-75"
            >
              {loadingAction === "email-signin"
                ? "Signing in..."
                : loadingAction === "email-signup"
                  ? "Creating account..."
                  : mode === "signin"
                    ? "Sign In With Email"
                    : "Create Account"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[rgba(0,0,0,0.08)]" />
            <span className="section-kicker text-slate-500">or continue with</span>
            <div className="h-px flex-1 bg-[rgba(0,0,0,0.08)]" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={async () => {
                setLoadingAction("google");
                await finalizeAuth(signInWithGoogle());
              }}
              disabled={loadingAction !== null}
              className="field-shell flex min-h-13 w-full items-center justify-center rounded-full bg-white px-5 font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {loadingAction === "google" ? "Connecting Google..." : `${mode === "signin" ? "Continue" : "Sign Up"} with Google`}
            </button>

            <button
              type="button"
              onClick={async () => {
                setLoadingAction("apple");
                await finalizeAuth(signInWithApple());
              }}
              disabled={loadingAction !== null}
              className="flex min-h-13 w-full items-center justify-center rounded-full bg-black px-5 font-semibold text-white shadow-[0_14px_28px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-75"
            >
              {loadingAction === "apple" ? "Connecting Apple..." : `${mode === "signin" ? "Continue" : "Sign Up"} with Apple`}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
