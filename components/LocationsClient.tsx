"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getLocations } from "@/lib/firestore";
import type { Location } from "@/types/location";

const DEMO_LOCATIONS: Location[] = [
  { id: "brewery", name: "Brewery", type: "brewery", active: true },
  { id: "b-social-tap-room", name: "b.social / Tap Room", type: "venue", active: true },
];

export function LocationsClient() {
  const {
    state: { user, loading },
  } = useAuth();
  const [locations, setLocations] = useState<Location[]>(DEMO_LOCATIONS);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadLocations() {
      if (loading) {
        return;
      }

      if (!user || user.role === "demo") {
        if (!cancelled) {
          setLocations(DEMO_LOCATIONS);
          setError("");
          setLoadingLocations(false);
        }
        return;
      }

      setLoadingLocations(true);
      setError("");

      try {
        const loadedLocations = await getLocations();
        if (!cancelled) {
          setLocations(loadedLocations);
        }
      } catch (loadError) {
        if (!cancelled) {
          setLocations(DEMO_LOCATIONS);
          setError(loadError instanceof Error ? loadError.message : "Could not load saved locations.");
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
      {!loading && (!user || user.role === "demo") ? (
        <section className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-4 text-sm text-slate-700">
          Demo mode shows the default brewery location set. Sign in with a staff account to load the live directory from Firestore.
        </section>
      ) : null}

      {error ? (
        <section className="rounded-[22px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Live locations could not be loaded. Showing fallback locations instead.
        </section>
      ) : null}

      {loadingLocations ? (
        <div className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-8 text-sm text-slate-500">Loading locations...</div>
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
