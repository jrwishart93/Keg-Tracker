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
    return <div className="editorial-panel p-6 text-sm text-slate-500">Loading keg names…</div>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form className="editorial-panel space-y-4 p-5 sm:p-6" onSubmit={handleSubmit}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-kicker">Pool Management</p>
            <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">Keg Name Settings</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Add one or many keg names to the shared pool. Use one name per line and duplicates will be skipped automatically.
            </p>
          </div>
          <Link href="/kegs/new" className="inline-flex min-h-11 items-center rounded-full border border-black/10 bg-[rgba(255,255,255,0.55)] px-4 text-sm font-semibold text-slate-700">
            Back To Allocation
          </Link>
        </div>

        <section className="grid gap-3 rounded-[22px] bg-[rgba(255,255,255,0.55)] p-4 sm:grid-cols-3">
          <div>
            <p className="section-kicker">Total names</p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{summary.total}</p>
          </div>
          <div>
            <p className="section-kicker">Assigned</p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{summary.assigned}</p>
          </div>
          <div>
            <p className="section-kicker">Available</p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{summary.available}</p>
          </div>
        </section>

        <label className="block">
          <span className="section-kicker">Add New Keg Names</span>
          <textarea
            rows={12}
            className="field-shell mt-2 w-full rounded-[20px] px-4 py-4 text-slate-900"
            value={rawNames}
            onChange={(event) => setRawNames(event.target.value)}
            placeholder={"Example:\nBrewster One\nKeglight Express\nOtago Orbit"}
            required
          />
        </label>

        {message ? <p className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</p> : null}
        {error ? <p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

        <button type="submit" disabled={saving} className="glow-button min-h-13 w-full rounded-full bg-[linear-gradient(135deg,#17212a,#324452)] px-4 font-semibold text-white disabled:opacity-60">
          {saving ? "Adding Names…" : "Add Names To Pool"}
        </button>
      </form>

      <aside className="editorial-panel p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold text-[color:var(--ink)]">Available Names</h3>
            <p className="mt-1 text-sm text-slate-600">Preview of the current unassigned pool.</p>
          </div>
          <span className="badge-chip px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
            {availableNames.length} open
          </span>
        </div>
        <div className="mt-4 max-h-[28rem] overflow-y-auto rounded-[22px] bg-[rgba(255,255,255,0.55)] p-3">
          <ul className="stagger-list space-y-2">
            {availableNames.slice(0, 80).map((entry) => (
              <li key={entry.id} className="rounded-[16px] bg-[rgba(255,255,255,0.8)] px-3 py-3 text-sm text-slate-800 shadow-[0_8px_16px_rgba(0,0,0,0.04)]">
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
