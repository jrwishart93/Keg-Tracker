"use client";

import Image from "next/image";
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
    <main className="relative -mx-4 -mt-5 min-h-[calc(100vh-4rem)] overflow-hidden md:rounded-2xl">
      <Image
        src="https://beffect.nz/cdn/shop/files/220612-Wanaka-Snow-023.jpg?v=1746667988&width=535"
        alt="Wānaka landscape"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[#131E29]/70" />

      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-5 py-10 text-white">
        <Image
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBoP9lJVpWKRC5cyFiUpJKiDXQlAfNbvUdBuQcybJr3g&s=10"
          alt="b.effect Brewing"
          width={180}
          height={180}
          className="mb-5 rounded-full border border-white/25 bg-white/5 p-2"
        />
        <h1 className="text-center text-3xl font-bold">Keg Tracker</h1>
        <p className="mt-2 text-center text-sm text-slate-100">Sign in to start scanning and updating keg movements.</p>

        <form className="mt-7 w-full space-y-4 rounded-2xl border border-white/25 bg-white/10 p-5 backdrop-blur-sm" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold tracking-[0.12em] text-slate-100">EMAIL</span>
            <input
              required
              type="email"
              className="min-h-12 w-full rounded-lg border border-white/40 bg-white px-3 text-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold tracking-[0.12em] text-slate-100">PASSWORD</span>
            <input
              required
              type="password"
              className="min-h-12 w-full rounded-lg border border-white/40 bg-white px-3 text-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-rose-200">{error}</p>}
          <button type="submit" className="min-h-12 w-full rounded-lg bg-[#131E29] font-semibold text-white">
            Start Shift
          </button>
        </form>
      </section>
    </main>
  );
}
