export const dynamic = "force-dynamic";

import Link from "next/link";
import { KegCard } from "@/components/KegCard";
import { getKegs } from "@/lib/firestore";

export default async function KegsPage() {
  const kegs = await getKegs();
  const activeKegs = [...kegs].sort((left, right) => (right.lastUpdatedAt ?? "").localeCompare(left.lastUpdatedAt ?? ""));

  return (
    <main className="page-shell space-y-5">
      <section className="editorial-panel overflow-hidden p-5 sm:p-6">
        <div>
          <p className="section-kicker">Fleet Overview</p>
          <h1 className="mt-3 text-5xl font-semibold text-[color:var(--ink)]">Active Kegs</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Allocate a funny keg identity, print the QR sticker, and keep current and intended locations attached to that keg.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/kegs/new"
            className="glow-button inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#17212a,#324452)] px-5 font-semibold text-white"
          >
            Allocate Keg
          </Link>
          <div className="badge-chip inline-flex min-h-12 items-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ink)]">
            {activeKegs.length} active records
          </div>
        </div>
      </section>
      <div className="stagger-list grid gap-4 md:grid-cols-2">
        {activeKegs.map((keg) => (
          <KegCard key={keg.id} keg={keg} />
        ))}
      </div>
    </main>
  );
}
