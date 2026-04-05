export const dynamic = "force-dynamic";

import { getLocations } from "@/lib/firestore";

export default async function LocationsPage() {
  const locations = await getLocations();

  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-bold">Locations</h1>
      <ul className="space-y-2">
        {locations.map((location) => (
          <li key={location.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="font-semibold">{location.name}</p>
            <p className="text-sm text-slate-600">{location.type}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
