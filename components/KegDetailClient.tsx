"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { KegEventLog } from "@/components/KegEventLog";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/context/auth-context";
import { getKegEvents } from "@/lib/firestore";
import type { Keg } from "@/types/keg";
import type { KegEvent } from "@/types/keg-event";

export function KegDetailClient({ keg }: { keg: Keg }) {
  const {
    state: { user, loading },
  } = useAuth();
  const [events, setEvents] = useState<KegEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const showInternalData = Boolean(user && user.role !== "demo");

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      if (loading) {
        return;
      }

      if (!showInternalData) {
        if (!cancelled) {
          setEvents([]);
          setHistoryError("");
          setLoadingEvents(false);
        }
        return;
      }

      setLoadingEvents(true);
      setHistoryError("");

      try {
        const loadedEvents = await getKegEvents(keg.id);
        if (!cancelled) {
          setEvents(loadedEvents);
        }
      } catch (error) {
        if (!cancelled) {
          setEvents([]);
          setHistoryError(error instanceof Error ? error.message : "Could not load event history.");
        }
      } finally {
        if (!cancelled) {
          setLoadingEvents(false);
        }
      }
    }

    void loadEvents();

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
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.currentLocation ?? "Unknown"}</p>
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
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Return Location</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.returnLocation ?? "Not set"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Serial Number</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.serialNumber ?? "Not set"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Asset Number</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.assetNumber ?? "Not set"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Date of Manufacture</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.dateOfManufacture ?? "Not set"}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Owner</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.ownerName ?? "Not set"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Lease Holder</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.leaseName ?? "Not set"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Maintenance</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.inMaintenance ? "In maintenance" : "No"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Lost</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.isLost ? "Marked lost" : "No"}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">QR Payload</p>
            <p className="mt-2 break-all text-sm leading-6 text-slate-700">{keg.qrCode}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Last Updated</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{keg.updatedAt ?? keg.lastUpdated ?? keg.lastUpdatedAt ?? "n/a"}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Washed At</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{keg.lastWashAt ?? keg.washedAt ?? "Not recorded"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Filled At</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{keg.lastFillAt ?? keg.filledAt ?? "Not recorded"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Best Before</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{keg.bestBefore ?? keg.bestBeforeDate ?? "Not set"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Checked In</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{keg.checkedInAt ?? "Not recorded"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Checked Out</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{keg.checkedOutAt ?? "Not recorded"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Ready for Pickup</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{keg.readyForPickupAt ?? "Not recorded"}</p>
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

      {loading ? (
        <section className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-4 text-sm text-slate-500">
          Restoring staff access...
        </section>
      ) : !showInternalData ? (
        <section className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-4 text-sm text-slate-700">
          Demo mode shows the keg record only. Sign in with a staff account to update scan events and view the keg audit trail.
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <p className="section-kicker">History</p>
          <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">Event history</h2>
        </div>
        {historyError ? (
          <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Event history could not be loaded from Firestore.
          </div>
        ) : null}
        {loading ? (
          <div className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-8 text-sm text-slate-500">Restoring history access...</div>
        ) : loadingEvents && showInternalData ? (
          <div className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-8 text-sm text-slate-500">Loading keg events...</div>
        ) : showInternalData ? (
          <KegEventLog events={events} />
        ) : (
          <div className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-8 text-sm text-slate-500">Sign in with a staff account to view the keg audit trail.</div>
        )}
      </section>
    </main>
  );
}
