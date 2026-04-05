"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KegDetailClient } from "@/components/KegDetailClient";
import { getKegById } from "@/lib/firestore";
import type { Keg } from "@/types/keg";

export function KegDetailPageClient({ kegId }: { kegId: string }) {
  const [keg, setKeg] = useState<Keg | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadKeg() {
      setLoading(true);
      setError("");

      try {
        const loadedKeg = await getKegById(kegId);
        if (!cancelled) {
          setKeg(loadedKeg);
        }
      } catch (loadError) {
        if (!cancelled) {
          setKeg(null);
          setError(loadError instanceof Error ? loadError.message : "Could not load keg record.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadKeg();

    return () => {
      cancelled = true;
    };
  }, [kegId]);

  if (loading) {
    return (
      <main className="page-shell space-y-5">
        <section className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-8 text-sm text-slate-500">Loading keg record...</section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell space-y-5">
        <section className="rounded-[22px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Could not load keg data.
        </section>
      </main>
    );
  }

  if (!keg) {
    return (
      <main className="page-shell space-y-5">
        <section className="editorial-panel p-5 sm:p-6">
          <p className="section-kicker">Keg Record</p>
          <h1 className="mt-3 text-4xl font-semibold text-[color:var(--ink)]">Keg not found</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">This keg record could not be found.</p>
          <Link href="/kegs" className="glow-button mt-5 inline-flex min-h-12 items-center rounded-full bg-[linear-gradient(135deg,#17212a,#324452)] px-5 font-semibold text-white">
            Back to Kegs
          </Link>
        </section>
      </main>
    );
  }

  return <KegDetailClient keg={keg} />;
}
