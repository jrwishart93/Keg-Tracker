export const dynamic = "force-dynamic";

import Link from "next/link";
import { KegCard } from "@/components/KegCard";
import { getKegs } from "@/lib/firestore";

export default async function KegsPage() {
  const kegs = await getKegs();
  const activeKegs = [...kegs].sort((left, right) => (right.lastUpdatedAt ?? "").localeCompare(left.lastUpdatedAt ?? ""));

  return (
    <main className="space-y-4">
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#131E29]">Active Kegs</h1>
          <p className="mt-1 text-sm text-slate-600">
            Allocate a funny keg identity, print the QR sticker, and keep current and intended locations attached to that keg.
          </p>
        </div>
        <Link
          href="/kegs/new"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#131E29] px-5 font-semibold text-white"
        >
          Allocate Keg
        </Link>
      </section>
      <div className="grid gap-3 md:grid-cols-2">
        {activeKegs.map((keg) => (
          <KegCard key={keg.id} keg={keg} />
        ))}
      </div>
    </main>
  );
}
