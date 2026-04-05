"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addKegNames, getAvailableKegNames, getKegNameSummary, seedDefaultKegNames } from "@/lib/firestore";
import type { KegNameEntry } from "@/types/keg-name";

export function KegNameSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [rawNames, setRawNames] = useState("");
  const [summary, setSummary] = useState({ total: 0, assigned: 0, available: 0 });
  const [availableNames, setAvailableNames] = useState<KegNameEntry[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        await seedDefaultKegNames();
        const [loadedSummary, loadedNames] = await Promise.all([getKegNameSummary(), getAvailableKegNames()]);
        setSummary(loadedSummary);
        setAvailableNames(loadedNames);
      } catch {
        setError("Could not load keg name settings.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  async function refreshData() {
    const [loadedSummary, loadedNames] = await Promise.all([getKegNameSummary(), getAvailableKegNames()]);
    setSummary(loadedSummary);
    setAvailableNames(loadedNames);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const result = await addKegNames(rawNames);
      await refreshData();
      setRawNames("");
      setMessage(`Added ${result.added} new name${result.added === 1 ? "" : "s"} and skipped ${result.skipped}.`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Could not add keg names.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading keg names…</div>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#131E29]">Keg Name Settings</h2>
            <p className="mt-1 text-sm text-slate-600">
              Add one or many keg names to the shared pool. Use one name per line and duplicates will be skipped automatically.
            </p>
          </div>
          <Link href="/kegs/new" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">
            Back To Allocation
          </Link>
        </div>

        <section className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total names</p>
            <p className="mt-1 text-2xl font-bold text-[#131E29]">{summary.total}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Assigned</p>
            <p className="mt-1 text-2xl font-bold text-[#131E29]">{summary.assigned}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Available</p>
            <p className="mt-1 text-2xl font-bold text-[#131E29]">{summary.available}</p>
          </div>
        </section>

        <label className="block">
          <span className="block text-xs font-semibold tracking-[0.12em] text-slate-500">ADD NEW KEG NAMES</span>
          <textarea
            rows={12}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-3 text-slate-900"
            value={rawNames}
            onChange={(event) => setRawNames(event.target.value)}
            placeholder={"Example:\nBrewster One\nKeglight Express\nOtago Orbit"}
            required
          />
        </label>

        {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

        <button type="submit" disabled={saving} className="min-h-12 w-full rounded-xl bg-[#131E29] px-4 font-semibold text-white disabled:opacity-60">
          {saving ? "Adding Names…" : "Add Names To Pool"}
        </button>
      </form>

      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[#131E29]">Available Names</h3>
            <p className="mt-1 text-sm text-slate-600">Preview of the current unassigned pool.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
            {availableNames.length} open
          </span>
        </div>
        <div className="mt-4 max-h-[28rem] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
          <ul className="space-y-2">
            {availableNames.slice(0, 80).map((entry) => (
              <li key={entry.id} className="rounded-lg bg-white px-3 py-2 text-sm text-slate-800 shadow-sm">
                {entry.name}
              </li>
            ))}
          </ul>
          {availableNames.length > 80 ? (
            <p className="mt-3 text-xs text-slate-500">Showing the first 80 available names.</p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
