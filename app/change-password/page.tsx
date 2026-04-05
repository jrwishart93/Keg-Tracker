import Link from "next/link";

export default function ChangePasswordPage() {
  return (
    <main className="mx-auto max-w-md space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-[#131E29]">Password Change</h1>
        <p className="mt-2 text-sm text-slate-600">
          Password reset is no longer part of the main sign-in flow. Use your chosen sign-in provider from the login screen.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-700">
          If you need to update an email/password account, do it through Firebase Authentication account recovery or the provider you used to sign in.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/login" className="inline-flex min-h-12 items-center rounded-lg bg-[#131E29] px-5 font-semibold text-white">
            Back To Login
          </Link>
          <Link href="/dashboard" className="inline-flex min-h-12 items-center rounded-lg border border-slate-300 px-5 font-semibold text-slate-700">
            Go To Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
