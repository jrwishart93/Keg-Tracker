"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const profile = await loginWithEmail(email, password);
      if (!profile) {
        setError("No staff profile found for this account.");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Login failed. Check credentials and try again.");
    }
  }

  return (
    <main className="mx-auto mt-10 max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Keg Tracker Login</h1>
      <p className="mt-2 text-sm text-slate-600">Sign in with your staff account.</p>
      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Email</span>
          <input
            required
            type="email"
            className="min-h-11 w-full rounded-lg border border-slate-300 px-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Password</span>
          <input
            required
            type="password"
            className="min-h-11 w-full rounded-lg border border-slate-300 px-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button type="submit" className="min-h-11 w-full rounded-lg bg-slate-900 font-semibold text-white">
          Sign in
        </button>
      </form>
    </main>
  );
}
