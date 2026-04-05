"use client";

import { useEffect, useState } from "react";
import { CustomerRequestActions } from "@/components/CustomerRequestActions";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { getFreshnessMeta } from "@/lib/freshness";
import { getKegById } from "@/lib/firestore";
import type { Keg } from "@/types/keg";

export function PublicKegClient({ kegId }: { kegId: string }) {
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
          setError(loadError instanceof Error ? loadError.message : "Could not load keg details.");
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
    return <main className="page-shell mx-auto max-w-2xl space-y-5"><section className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-8 text-sm text-slate-500">Loading keg details...</section></main>;
  }

  if (error || !keg) {
    return (
      <main className="page-shell mx-auto max-w-2xl space-y-5">
        <section className="rounded-[22px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Keg details could not be loaded right now.
        </section>
      </main>
    );
  }

  const productName = keg.productName ?? keg.beerName ?? keg.product ?? "Product not set";
  const freshness = getFreshnessMeta(keg.bestBefore ?? keg.bestBeforeDate);

  return (
    <main className="page-shell mx-auto max-w-2xl space-y-5">
      <section className="editorial-panel editorial-panel--dark grain-overlay overflow-hidden p-6 sm:p-7">
        <p className="eyebrow text-amber-100/80">Customer Keg Scan</p>
        <h1 className="mt-3 text-5xl font-semibold text-white">{keg.name ?? keg.kegId ?? keg.id}</h1>
        <p className="mt-3 text-base leading-7 text-slate-100/84">
          View the current keg freshness and send a one-tap request back to the brewery.
        </p>
      </section>

      <section className="editorial-panel space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Current Product</p>
            <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{productName}</h2>
          </div>
          <FreshnessBadge bestBefore={keg.bestBefore ?? keg.bestBeforeDate} />
        </div>

        <div className={`rounded-[22px] border p-4 ${freshness.accentClassName}`}>
          <p className="section-kicker">Freshness Status</p>
          <p className="mt-2 text-2xl font-semibold">{freshness.label}</p>
          <p className="mt-2 text-sm leading-6">
            Filled {keg.filledAt ?? keg.packagingDate ?? "not recorded"}.
            Best before {keg.bestBefore ?? keg.bestBeforeDate ?? "not set"}.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.58)] p-4">
            <p className="section-kicker">Location</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.currentLocation ?? "Unknown"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.58)] p-4">
            <p className="section-kicker">Batch</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.batchNumber ?? keg.batch ?? "Not set"}</p>
          </div>
        </div>
      </section>

      <section className="editorial-panel space-y-4 p-5 sm:p-6">
        <div>
          <p className="section-kicker">Need Something?</p>
          <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">Request an action from the brewery</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Tap once to send a request for this keg.</p>
        </div>
        <CustomerRequestActions kegId={keg.id} />
      </section>
    </main>
  );
}
