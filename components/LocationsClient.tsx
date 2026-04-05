"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getLocations, seedCoreData } from "@/lib/firestore";
import type { Location } from "@/types/location";

export function LocationsClient() {
  const {
    state: { user, loading },
  } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadLocations() {
      if (loading) {
        return;
      }

      if (!user) {
        if (!cancelled) {
          setLocations([]);
          setError("");
          setLoadingLocations(false);
        }
        return;
      }

      setLoadingLocations(true);
      setError("");

      try {
        await seedCoreData();
        const loadedLocations = await getLocations();
        if (!cancelled) {
          setLocations(loadedLocations);
        }
      } catch (loadError) {
        if (!cancelled) {
          setLocations([]);
          setError(loadError instanceof Error ? loadError.message : "Could not load locations.");
        }
      } finally {
        if (!cancelled) {
          setLoadingLocations(false);
        }
      }
    }

    void loadLocations();

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  return (
    <>
      {error ? (
        <section className="rounded-[22px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Could not load locations.
        </section>
      ) : null}

      {loadingLocations ? (
        <div className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-8 text-sm text-slate-500">Loading locations...</div>
      ) : locations.length === 0 ? (
        <div className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-8 text-sm text-slate-500">No locations are available yet.</div>
      ) : (
        <ul className="stagger-list grid gap-4 md:grid-cols-2">
          {locations.map((location) => (
            <li key={location.id} className="editorial-panel card-hover p-5">
              <p className="section-kicker">{location.type}</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">{location.name}</p>
              <p className="mt-3 text-sm text-slate-600">Available as a current or intended destination throughout the movement workflow.</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
