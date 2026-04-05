"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { enableDemoMode } from "@/lib/demo-mode";

export default function WelcomePage() {
  const router = useRouter();

  function onTryDemo() {
    // TEMPORARY: prototype-only demo entry point that bypasses Firebase login.
    enableDemoMode();
    router.push("/dashboard");
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
        <p className="mt-2 text-center text-sm text-slate-100">Preview the workflow instantly or sign in with a staff account.</p>

        <div className="mt-7 w-full space-y-3 rounded-2xl border border-white/25 bg-white/10 p-5 backdrop-blur-sm">
          <button
            type="button"
            onClick={onTryDemo}
            className="min-h-12 w-full rounded-lg bg-[#131E29] font-semibold text-white"
          >
            Try Demo
          </button>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="min-h-12 w-full rounded-lg border border-white/40 bg-white/5 font-semibold text-white hover:bg-white/10"
          >
            Login
          </button>
        </div>
      </section>
    </main>
  );
}
