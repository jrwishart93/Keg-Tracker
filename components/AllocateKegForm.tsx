"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { QRCodePreview } from "@/components/QRCodePreview";
import { buildQrCodeValue, isValidQrCodeValue } from "@/lib/keg-names";
import { createKeg, getAvailableKegNames, getKegNameSummary, getLocations, getProducts, seedCoreData, seedDefaultKegNames } from "@/lib/firestore";
import { useAuth } from "@/context/auth-context";
import type { Keg } from "@/types/keg";
import type { KegNameEntry } from "@/types/keg-name";

type CreatedKegSummary = Keg;

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function plusDays(dateString: string, days: number) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export function AllocateKegForm() {
  const { state: { user, loading: authLoading } } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [availableNames, setAvailableNames] = useState<KegNameEntry[]>([]);
  const [locations, setLocations] = useState<string[]>(["Brewery", "b.social / Tap Room"]);
  const [products, setProducts] = useState<{ id: string; name: string; abv: number }[]>([]);
  const [createdKeg, setCreatedKeg] = useState<CreatedKegSummary | null>(null);
  const [nameSummary, setNameSummary] = useState({ total: 0, assigned: 0, available: 0 });
  const [form, setForm] = useState({
    kegId: "",
    product: "",
    beerName: "",
    currentLocation: "Brewery",
    intendedLocation: "",
    batch: "",
    abv: "",
    packagingDate: todayDate(),
    bestBeforeDate: plusDays(todayDate(), 90),
  });

  const filteredNames = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return availableNames;
    return availableNames.filter((entry) => entry.name.toLowerCase().includes(term));
  }, [availableNames, searchTerm]);

  useEffect(() => {
    // Wait for Firebase Auth to restore its session before making authenticated
    // Firestore reads. Without this guard, all reads fail with permission-denied
    // on a fresh page load because Auth is async.
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadReferenceData() {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      // Non-critical: seeds products + locations. Staff users get permission-denied on
      // the locations write — expected and safe to swallow.
      try {
        await seedCoreData();
      } catch {
        // Intentionally swallowed.
      }

      try {
        // Critical: ensure name pool exists before reading it.
        await seedDefaultKegNames();

        // Critical reads — failures here are genuine blockers.
        const [loadedNames, summary] = await Promise.all([
          getAvailableKegNames(),
          getKegNameSummary(),
        ]);

        // Non-critical reads — degrade gracefully on failure.
        const [locationsResult, productsResult] = await Promise.allSettled([
          getLocations(),
          getProducts(),
        ]);

        const loadedLocations =
          locationsResult.status === "fulfilled" ? locationsResult.value : [];
        const loadedProducts =
          productsResult.status === "fulfilled" ? productsResult.value : [];

        setAvailableNames(loadedNames);
        setNameSummary(summary);
        setProducts(loadedProducts);

        if (loadedLocations.length > 0) {
          setLocations(Array.from(new Set(loadedLocations.map((location) => location.name))));
        }

        setForm((current) => ({
          ...current,
          kegId: current.kegId || loadedNames[0]?.name || "",
        }));
      } catch {
        setError("Could not load keg setup data.");
      } finally {
        setLoading(false);
      }
    }

    void loadReferenceData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  useEffect(() => {
    if (!form.kegId && filteredNames[0]) {
      setForm((current) => ({ ...current, kegId: filteredNames[0]?.name ?? "" }));
      return;
    }

    if (form.kegId && filteredNames.length > 0 && !filteredNames.some((entry) => entry.name === form.kegId)) {
      setForm((current) => ({ ...current, kegId: filteredNames[0]?.name ?? "" }));
    }
  }, [filteredNames, form.kegId]);

  const qrValue = buildQrCodeValue(form.kegId || "new-keg");
  const noNamesAvailable = availableNames.length === 0;
  const qrReady = isValidQrCodeValue(qrValue);

  function updateField(key: keyof typeof form, value: string) {
    if (key === "product") {
      const selectedProduct = products.find((product) => product.name === value);
      setForm((current) => ({
        ...current,
        product: value,
        beerName: selectedProduct ? selectedProduct.name : current.beerName,
        abv: selectedProduct ? selectedProduct.abv.toString() : current.abv,
      }));
      return;
    }

    if (key === "packagingDate") {
      setForm((current) => ({
        ...current,
        packagingDate: value,
        bestBeforeDate: value ? plusDays(value, 90) : current.bestBeforeDate,
      }));
      return;
    }

    setForm((current) => ({ ...current, [key]: value }));
  }

  async function refreshReferenceData() {
    const [loadedNames, summary] = await Promise.all([getAvailableKegNames(), getKegNameSummary()]);
    setAvailableNames(loadedNames);
    setNameSummary(summary);
    setSearchTerm("");
    setForm((current) => ({
      ...current,
      kegId: loadedNames[0]?.name ?? "",
    }));
  }

  function selectRandomName() {
    if (availableNames.length < 2) return;

    const alternatives = availableNames.filter((entry) => entry.name !== form.kegId);
    const source = alternatives.length > 0 ? alternatives : availableNames;
    const randomIndex = Math.floor(Math.random() * source.length);
    updateField("kegId", source[randomIndex]?.name ?? form.kegId);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const created = await createKeg({
        kegId: form.kegId,
        currentLocation: form.currentLocation,
        intendedLocation: form.intendedLocation,
        product: form.product || undefined,
        beerName: form.beerName || undefined,
        batch: form.batch || undefined,
        abv: form.abv ? Number(form.abv) : undefined,
        packagingDate: form.packagingDate || undefined,
        bestBeforeDate: form.bestBeforeDate || undefined,
      });

      setCreatedKeg(created);
      await refreshReferenceData();
      setSuccessMessage(`Allocated ${created.kegId} and saved its QR payload.`);
      setForm((current) => ({
        ...current,
        product: "",
        beerName: "",
        intendedLocation: "",
        batch: "",
        abv: "",
        packagingDate: todayDate(),
        bestBeforeDate: plusDays(todayDate(), 90),
        currentLocation: "Brewery",
      }));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Could not allocate keg.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="editorial-panel p-6 text-sm text-slate-500">Loading keg setup…</div>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <form className="editorial-panel space-y-4 p-5 sm:p-6" onSubmit={handleSubmit}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-kicker">New Identity</p>
            <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">Allocate a New Keg</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Pick an unused keg identity from the shared name pool, add any setup details you know now, then generate the QR sticker.
            </p>
          </div>
          <Link href="/settings/keg-names" className="inline-flex min-h-11 items-center rounded-full border border-black/10 bg-[rgba(255,255,255,0.55)] px-4 text-sm font-semibold text-slate-700">
            Manage Names
          </Link>
        </div>

        <section className="grid gap-3 rounded-[22px] bg-[rgba(255,255,255,0.55)] p-4 sm:grid-cols-3">
          <div>
            <p className="section-kicker">Total names</p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{nameSummary.total}</p>
          </div>
          <div>
            <p className="section-kicker">Assigned</p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{nameSummary.assigned}</p>
          </div>
          <div>
            <p className="section-kicker">Available</p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{nameSummary.available}</p>
          </div>
        </section>

        {noNamesAvailable ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            The keg name pool is empty. Add more names in <Link href="/settings/keg-names" className="font-semibold underline">Keg Name Settings</Link> before creating a new keg.
          </div>
        ) : (
          <>
            <label className="block">
              <span className="section-kicker">Search Name List</span>
              <input
                className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4 text-slate-900"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search available keg names"
              />
            </label>

            <label className="block">
              <span className="section-kicker">Keg Name / Identity</span>
              <div className="mt-2 flex gap-2">
                <select
                  className="field-shell min-h-12 flex-1 rounded-[18px] px-4 text-slate-900"
                  value={form.kegId}
                  onChange={(event) => updateField("kegId", event.target.value)}
                  required
                >
                  {filteredNames.map((entry) => (
                    <option key={entry.id} value={entry.name}>
                      {entry.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={selectRandomName}
                  className="min-h-12 rounded-full border border-black/10 bg-[rgba(255,255,255,0.6)] px-4 text-sm font-semibold text-slate-700"
                  disabled={availableNames.length < 2}
                >
                  Regenerate
                </button>
              </div>
              {filteredNames.length === 0 ? <p className="mt-2 text-sm text-amber-700">No available names match your search.</p> : null}
            </label>
          </>
        )}

        <label className="block">
          <span className="section-kicker">What&apos;s In The Keg?</span>
          <select
            className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4 text-slate-900"
            value={form.product}
            onChange={(event) => updateField("product", event.target.value)}
          >
            <option value="">Leave empty for now</option>
            {products.map((product) => (
              <option key={product.id} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="section-kicker">Current Location</span>
          <input
            list="allocation-locations"
            className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4 text-slate-900"
            value={form.currentLocation}
            onChange={(event) => updateField("currentLocation", event.target.value)}
            placeholder="Brewery"
          />
        </label>

        <label className="block">
          <span className="section-kicker">Intended Location</span>
          <input
            list="allocation-locations"
            className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4 text-slate-900"
            value={form.intendedLocation}
            onChange={(event) => updateField("intendedLocation", event.target.value)}
            placeholder="Tap room, storage, supplier, bar, another brewery…"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="section-kicker">Beer Name</span>
            <input
              className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4 text-slate-900"
              value={form.beerName}
              onChange={(event) => updateField("beerName", event.target.value)}
              placeholder="Optional"
            />
          </label>
          <label className="block">
            <span className="section-kicker">Batch</span>
            <input
              className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4 text-slate-900"
              value={form.batch}
              onChange={(event) => updateField("batch", event.target.value)}
              placeholder="Optional"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="section-kicker">ABV</span>
            <input
              className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4 text-slate-900"
              value={form.abv}
              onChange={(event) => updateField("abv", event.target.value)}
              placeholder="Optional"
              inputMode="decimal"
            />
          </label>
          <label className="block">
            <span className="section-kicker">Packaging Date</span>
            <input
              type="date"
              className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4 text-slate-900"
              value={form.packagingDate}
              onChange={(event) => updateField("packagingDate", event.target.value)}
            />
          </label>
          <label className="block">
            <span className="section-kicker">Best Before</span>
            <input
              type="date"
              className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4 text-slate-900"
              value={form.bestBeforeDate}
              onChange={(event) => updateField("bestBeforeDate", event.target.value)}
            />
          </label>
        </div>

        <datalist id="allocation-locations">
          {locations.map((location) => (
            <option key={location} value={location} />
          ))}
        </datalist>

        {error ? <p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

        {successMessage ? <p className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{successMessage}</p> : null}
        <button
          type="submit"
          disabled={saving || !form.kegId || noNamesAvailable || filteredNames.length === 0 || !qrReady}
          className="glow-button min-h-13 w-full rounded-full bg-[linear-gradient(135deg,#17212a,#324452)] px-4 font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Allocating Keg…" : "Generate QR And Add Keg"}
        </button>
      </form>

      <aside className="space-y-4">
        <section className="editorial-panel p-5">
          <p className="section-kicker">Sticker Preview</p>
          <div className="mt-4 flex flex-col items-center rounded-[24px] border border-dashed border-black/10 bg-[rgba(255,255,255,0.6)] p-4 text-center">
            {qrReady ? (
              <QRCodePreview value={qrValue} size={220} className="rounded-xl bg-white p-3" />
            ) : (
              <div className="flex h-[220px] w-[220px] items-center justify-center rounded-xl border border-dashed border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">
                QR code unavailable for this keg name.
              </div>
            )}
            <p className="mt-4 text-2xl font-semibold text-[color:var(--ink)]">{form.kegId || "No Name Available"}</p>
            <p className="mt-1 break-all text-xs tracking-[0.12em] text-slate-500">{qrValue}</p>
          </div>
        </section>

        {createdKeg ? (
          <section className="editorial-panel border-emerald-200 bg-[rgba(236,253,245,0.9)] p-5 print:hidden">
            <p className="section-kicker text-emerald-800">Allocated</p>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">{createdKeg.kegId}</p>
            <p className="mt-1 text-sm text-slate-700">The keg is now active and ready for a printed QR sticker.</p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={`/kegs/${createdKeg.id}/label`}
                className="glow-button inline-flex min-h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#17212a,#324452)] px-4 font-semibold text-white"
              >
                Open Sticker
              </Link>
              <Link
                href={`/kegs/${createdKeg.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 bg-[rgba(255,255,255,0.6)] px-4 font-semibold text-slate-700"
              >
                View Keg Record
              </Link>
            </div>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
