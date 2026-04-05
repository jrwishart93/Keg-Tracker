"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { QRCodePreview } from "@/components/QRCodePreview";
import { buildQrCodeValue } from "@/lib/keg-names";
import { createKeg, getAvailableKegNames, getKegNameSummary, getLocations, getProducts, seedCoreData, seedDefaultKegNames } from "@/lib/firestore";
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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
    async function loadReferenceData() {
      setLoading(true);
      setError("");

      try {
        await seedCoreData();
        await seedDefaultKegNames();

        const [loadedNames, loadedLocations, loadedProducts, summary] = await Promise.all([
          getAvailableKegNames(),
          getLocations(),
          getProducts(),
          getKegNameSummary(),
        ]);

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
  }, []);

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
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading keg setup…</div>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#131E29]">Allocate a New Keg</h2>
            <p className="mt-1 text-sm text-slate-600">
              Pick an unused keg identity from the shared name pool, add any setup details you know now, then generate the QR sticker.
            </p>
          </div>
          <Link href="/settings/keg-names" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">
            Manage Names
          </Link>
        </div>

        <section className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total names</p>
            <p className="mt-1 text-2xl font-bold text-[#131E29]">{nameSummary.total}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Assigned</p>
            <p className="mt-1 text-2xl font-bold text-[#131E29]">{nameSummary.assigned}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Available</p>
            <p className="mt-1 text-2xl font-bold text-[#131E29]">{nameSummary.available}</p>
          </div>
        </section>

        {noNamesAvailable ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            The keg name pool is empty. Add more names in <Link href="/settings/keg-names" className="font-semibold underline">Keg Name Settings</Link> before creating a new keg.
          </div>
        ) : (
          <>
            <label className="block">
              <span className="block text-xs font-semibold tracking-[0.12em] text-slate-500">SEARCH NAME LIST</span>
              <input
                className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-900"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search available keg names"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-semibold tracking-[0.12em] text-slate-500">KEG NAME / IDENTITY</span>
              <div className="mt-1 flex gap-2">
                <select
                  className="min-h-12 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-900"
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
                  className="min-h-12 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700"
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
          <span className="block text-xs font-semibold tracking-[0.12em] text-slate-500">WHAT&apos;S IN THE KEG?</span>
          <select
            className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-900"
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
          <span className="block text-xs font-semibold tracking-[0.12em] text-slate-500">CURRENT LOCATION</span>
          <input
            list="allocation-locations"
            className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-900"
            value={form.currentLocation}
            onChange={(event) => updateField("currentLocation", event.target.value)}
            placeholder="Brewery"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-semibold tracking-[0.12em] text-slate-500">INTENDED LOCATION</span>
          <input
            list="allocation-locations"
            className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-900"
            value={form.intendedLocation}
            onChange={(event) => updateField("intendedLocation", event.target.value)}
            placeholder="Tap room, storage, supplier, bar, another brewery…"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="block text-xs font-semibold tracking-[0.12em] text-slate-500">BEER NAME</span>
            <input
              className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-900"
              value={form.beerName}
              onChange={(event) => updateField("beerName", event.target.value)}
              placeholder="Optional"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold tracking-[0.12em] text-slate-500">BATCH</span>
            <input
              className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-900"
              value={form.batch}
              onChange={(event) => updateField("batch", event.target.value)}
              placeholder="Optional"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="block text-xs font-semibold tracking-[0.12em] text-slate-500">ABV</span>
            <input
              className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-900"
              value={form.abv}
              onChange={(event) => updateField("abv", event.target.value)}
              placeholder="Optional"
              inputMode="decimal"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold tracking-[0.12em] text-slate-500">PACKAGING DATE</span>
            <input
              type="date"
              className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-900"
              value={form.packagingDate}
              onChange={(event) => updateField("packagingDate", event.target.value)}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold tracking-[0.12em] text-slate-500">BEST BEFORE</span>
            <input
              type="date"
              className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-900"
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

        {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={saving || !form.kegId || noNamesAvailable || filteredNames.length === 0}
          className="min-h-12 w-full rounded-xl bg-[#131E29] px-4 font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Allocating Keg…" : "Generate QR And Add Keg"}
        </button>
      </form>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.12em] text-slate-500">STICKER PREVIEW</p>
          <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
            <QRCodePreview value={qrValue} size={220} className="rounded-xl bg-white p-3" />
            <p className="mt-4 text-xl font-bold text-[#131E29]">{form.kegId || "No Name Available"}</p>
            <p className="mt-1 text-xs tracking-[0.12em] text-slate-500">{qrValue}</p>
          </div>
        </section>

        {createdKeg ? (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm print:hidden">
            <p className="text-xs font-semibold tracking-[0.12em] text-emerald-800">ALLOCATED</p>
            <p className="mt-2 text-lg font-bold text-[#131E29]">{createdKeg.kegId}</p>
            <p className="mt-1 text-sm text-slate-700">The keg is now active and ready for a printed QR sticker.</p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={`/kegs/${createdKeg.id}/label`}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#131E29] px-4 font-semibold text-white"
              >
                Open Sticker
              </Link>
              <Link
                href={`/kegs/${createdKeg.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 font-semibold text-slate-700"
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
