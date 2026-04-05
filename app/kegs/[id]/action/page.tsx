"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/ActionForm";
import { useAuth } from "@/context/auth-context";
import { getKegById, getLocations, getProducts, recordKegScanEvent, seedCoreData } from "@/lib/firestore";
import { KEG_SCAN_LABELS, KEG_SCAN_TYPES } from "@/types/keg-event";
import type { KegScanType } from "@/types/keg-event";
import type { Keg } from "@/types/keg";

export default function KegActionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedAction, setSelectedAction] = useState<KegScanType>("CHECK_IN");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [keg, setKeg] = useState<Keg | null>(null);
  const [locationNames, setLocationNames] = useState<string[]>(["Brewery", "b.social / Tap Room"]);
  const [products, setProducts] = useState<{ id: string; name: string; abv: number }[]>([]);
  const {
    state: { user, loading: authLoading },
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadReferenceData() {
      setLoadingData(true);
      setError("");

      try {
        await seedCoreData();
      } catch {
        // Intentionally swallowed — staff users lack write access to locations/products.
      }

      try {
        const [locations, loadedProducts, loadedKeg] = await Promise.all([getLocations(), getProducts(), getKegById(id)]);

        if (cancelled) {
          return;
        }

        if (!loadedKeg) {
          setError("Keg not found.");
          setKeg(null);
          return;
        }

        if (locations.length > 0) {
          setLocationNames(Array.from(new Set(locations.map((location) => location.name))));
        }

        setProducts(loadedProducts);
        setKeg(loadedKeg);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load keg action data.");
          setKeg(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    }

    void loadReferenceData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const selectedActionLabel = useMemo(() => KEG_SCAN_LABELS[selectedAction], [selectedAction]);

  return (
    <main className="page-shell space-y-5">
      <section className="editorial-panel p-5 sm:p-6">
        <p className="section-kicker">Scan Action</p>
        <h1 className="mt-3 text-5xl font-semibold text-[color:var(--ink)]">Record Keg Event</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Choose one of the supported scan types and save it directly onto this keg&apos;s live record and audit history.
        </p>
      </section>

      {keg ? (
        <section className="editorial-panel p-5 sm:p-6">
          <p className="section-kicker">Selected Keg</p>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <div>
              <p className="section-kicker">Keg</p>
              <p className="mt-2 text-xl font-semibold text-[color:var(--ink)]">{keg.kegId ?? keg.id}</p>
            </div>
            <div>
              <p className="section-kicker">Current Status</p>
              <p className="mt-2 text-sm font-medium text-slate-800">{keg.currentStatus}</p>
            </div>
            <div>
              <p className="section-kicker">Current Location</p>
              <p className="mt-2 text-sm font-medium text-slate-800">{keg.currentLocation ?? "Unknown"}</p>
            </div>
          </div>
        </section>
      ) : null}

      <label className="editorial-panel block p-5">
        <span className="section-kicker">Scan Type</span>
        <select
          value={selectedAction}
          onChange={(event) => setSelectedAction(event.target.value as KegScanType)}
          className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4"
          disabled={loadingData || Boolean(error)}
        >
          {KEG_SCAN_TYPES.map((action) => (
            <option key={action} value={action}>
              {KEG_SCAN_LABELS[action]}
            </option>
          ))}
        </select>
      </label>

      {error ? <p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      {loadingData ? (
        <section className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-6 text-sm text-slate-500">Loading keg and scan controls...</section>
      ) : !keg ? null : authLoading ? (
        <section className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-6 text-sm text-slate-500">Restoring staff access...</section>
      ) : !user ? (
        <section className="rounded-[22px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Sign in to save scan actions for this keg.
        </section>
      ) : (
        <section className="editorial-panel p-5 sm:p-6">
          <div className="mb-5">
            <p className="section-kicker">Event Details</p>
            <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{selectedActionLabel}</h2>
          </div>
          <ActionForm
            key={selectedAction}
            scanType={selectedAction}
            keg={keg}
            locations={locationNames}
            products={products}
            onSubmit={async (fields) => {
              setLoading(true);
              setError("");

              try {
                await recordKegScanEvent({
                  kegId: id,
                  scanType: selectedAction,
                  userId: user.uid,
                  userName: user.displayName ?? user.email,
                  notes: fields.notes ?? null,
                  formData: fields,
                });
                router.push(`/kegs/${id}`);
              } catch (saveError) {
                setError(saveError instanceof Error ? saveError.message : "Could not save keg event.");
              } finally {
                setLoading(false);
              }
            }}
          />
          {loading ? <p className="mt-4 text-sm text-slate-500">Saving {selectedActionLabel.toLowerCase()}...</p> : null}
        </section>
      )}
    </main>
  );
}
