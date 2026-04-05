"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { completePasswordChange } from "@/lib/auth";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password should be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await completePasswordChange(currentPassword, newPassword);
      router.push("/dashboard");
    } catch {
      setError("Password update failed. Please verify your current password and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-[#131E29]">Change Password</h1>
        <p className="mt-2 text-sm text-slate-600">For security, please update your temporary password before entering the app.</p>
      </div>

      <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold tracking-[0.12em] text-slate-600">CURRENT PASSWORD</span>
          <input
            required
            type="password"
            className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold tracking-[0.12em] text-slate-600">NEW PASSWORD</span>
          <input
            required
            type="password"
            className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold tracking-[0.12em] text-slate-600">CONFIRM NEW PASSWORD</span>
          <input
            required
            type="password"
            className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </label>

        {error && <p className="text-sm text-rose-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="min-h-12 w-full rounded-lg bg-[#131E29] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-75"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </main>
  );
}
