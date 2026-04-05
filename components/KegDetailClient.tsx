"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { KegLifecyclePanel } from "@/components/KegLifecyclePanel";
import { MovementLog } from "@/components/MovementLog";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/context/auth-context";
import { getMovementsByKeg } from "@/lib/firestore";
import type { Keg } from "@/types/keg";
import type { Movement } from "@/types/movement";

export function KegDetailClient({ keg }: { keg: Keg }) {
  const {
    state: { user, loading },
  } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const showInternalData = Boolean(user && user.role !== "demo");

  useEffect(() => {
    let cancelled = false;

    async function loadMovements() {
      if (loading) {
        return;
      }

      if (!showInternalData) {
        if (!cancelled) {
          setMovements([]);
          setHistoryError("");
          setLoadingMovements(false);
        }
        return;
      }

      setLoadingMovements(true);
      setHistoryError("");

      try {
        const loadedMovements = await getMovementsByKeg(keg.id);
        if (!cancelled) {
          setMovements(loadedMovements);
        }
      } catch (error) {
        if (!cancelled) {
          setMovements([]);
          setHistoryError(error instanceof Error ? error.message : "Could not load movement history.");
        }
      } finally {
        if (!cancelled) {
          setLoadingMovements(false);
        }
      }
    }

    void loadMovements();

    return () => {
      cancelled = true;
    };
  }, [keg.id, loading, showInternalData]);

  return (
    <main className="page-shell space-y-5">
      <section className="editorial-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-kicker">Keg Record</p>
            <h1 className="mt-3 text-5xl font-semibold text-[color:var(--ink)]">{keg.kegId ?? keg.id}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={keg.currentStatus} />
            <FreshnessBadge bestBefore={keg.bestBefore ?? keg.bestBeforeDate} />
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Current Location</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.currentLocation}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Intended Location</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.intendedLocation ?? "Not set"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Current Product</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.productName ?? keg.beerName ?? keg.product ?? "n/a"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Assigned Customer</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.assignedCustomerId ?? "Not assigned"}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">QR Payload</p>
            <p className="mt-2 break-all text-sm leading-6 text-slate-700">{keg.qrCode}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Last Updated</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{keg.lastUpdated ?? keg.lastUpdatedAt ?? "n/a"}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Washed At</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{keg.washedAt ?? "Not recorded"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Filled At</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{keg.filledAt ?? "Not recorded"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Best Before</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{keg.bestBefore ?? keg.bestBeforeDate ?? "Not set"}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href={`/kegs/${keg.id}/action`} className="glow-button inline-flex min-h-12 items-center rounded-full bg-[linear-gradient(135deg,#17212a,#324452)] px-5 font-semibold text-white">
          Update this keg
        </Link>
        <Link href={`/kegs/${keg.id}/label`} className="inline-flex min-h-12 items-center rounded-full border border-black/10 bg-[rgba(255,255,255,0.7)] px-5 font-semibold text-slate-700">
          Print sticker
        </Link>
      </div>

      {!loading && showInternalData ? (
        <KegLifecyclePanel keg={keg} />
      ) : loading ? (
        <section className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-4 text-sm text-slate-500">
          Restoring staff access...
        </section>
      ) : (
        <section className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-4 text-sm text-slate-700">
          Demo mode shows the keg record only. Sign in with a staff account to update lifecycle data and view movement history.
        </section>
      )}

      <section className="space-y-4">
        <div>
          <p className="section-kicker">History</p>
          <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">Movement history</h2>
        </div>
        {historyError ? (
          <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Movement history could not be loaded from Firestore.
          </div>
        ) : null}
        {loading ? (
          <div className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-8 text-sm text-slate-500">Restoring movement access...</div>
        ) : loadingMovements && showInternalData ? (
          <div className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-8 text-sm text-slate-500">Loading movement history...</div>
        ) : (
          <MovementLog movements={movements} />
        )}
      </section>
    </main>
  );
}
