"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KegCard } from "@/components/KegCard";
import { getKegs } from "@/lib/firestore";
import type { Keg } from "@/types/keg";

export function KegsClient() {
  const [kegs, setKegs] = useState<Keg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadKegs() {
      setLoading(true);
      setError("");

      try {
        const loadedKegs = await getKegs();
        if (!cancelled) {
          setKegs(loadedKegs);
        }
      } catch (loadError) {
        if (!cancelled) {
          setKegs([]);
          setError(loadError instanceof Error ? loadError.message : "Could not load keg records.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadKegs();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeKegs = [...kegs].sort((left, right) => (right.updatedAt ?? right.lastUpdatedAt ?? "").localeCompare(left.updatedAt ?? left.lastUpdatedAt ?? ""));

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

      {error ? (
        <section className="rounded-[22px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Could not load keg records.
        </section>
      ) : null}

      {loading ? (
        <div className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-8 text-sm text-slate-500">Loading keg records...</div>
      ) : (
        <div className="stagger-list grid gap-4 md:grid-cols-2">
          {activeKegs.map((keg) => (
            <KegCard key={keg.id} keg={keg} />
          ))}
        </div>
      )}
    </main>
  );
}
