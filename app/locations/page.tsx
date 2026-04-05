export const dynamic = "force-dynamic";

import { getLocations } from "@/lib/firestore";

export default async function LocationsPage() {
  const locations = await getLocations();

  return (
    <main className="page-shell space-y-5">
      <section className="editorial-panel p-5 sm:p-6">
        <p className="section-kicker">Location Directory</p>
        <h1 className="mt-3 text-5xl font-semibold text-[color:var(--ink)]">Locations</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Keep the places your kegs move between visible for staff, dispatch, and head office.
        </p>
      </section>

      <ul className="stagger-list grid gap-4 md:grid-cols-2">
        {locations.map((location) => (
          <li key={location.id} className="editorial-panel card-hover p-5">
            <p className="section-kicker">{location.type}</p>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">{location.name}</p>
            <p className="mt-3 text-sm text-slate-600">Available as a current or intended destination throughout the movement workflow.</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
