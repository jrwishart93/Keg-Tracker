export const dynamic = "force-dynamic";

import { LocationsClient } from "@/components/LocationsClient";

export default function LocationsPage() {
  return (
    <main className="page-shell space-y-5">
      <section className="editorial-panel p-5 sm:p-6">
        <p className="section-kicker">Location Directory</p>
        <h1 className="mt-3 text-5xl font-semibold text-[color:var(--ink)]">Locations</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Keep the places your kegs move between visible for staff, dispatch, and head office.
        </p>
      </section>

      <LocationsClient />
    </main>
  );
}
