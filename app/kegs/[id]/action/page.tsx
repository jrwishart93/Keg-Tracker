"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/ActionForm";
import { createMovement, getLocations, getProducts, seedCoreData, updateKeg } from "@/lib/firestore";
import type { KegStatus } from "@/types/keg";
import type { MovementAction } from "@/types/movement";

const actions: MovementAction[] = ["fill", "deliver", "return", "empty", "maintenance", "lost"];

const actionToStatus: Record<MovementAction, KegStatus> = {
  fill: "filled",
  deliver: "delivered",
  return: "returned",
  empty: "empty",
  maintenance: "maintenance",
  lost: "lost",
};

const actionLabels: Record<MovementAction, string> = {
  fill: "Fill",
  deliver: "Deliver",
  return: "Return",
  empty: "Empty",
  maintenance: "Maintenance",
  lost: "Lost",
};

export default function KegActionPage({ params }: { params: { id: string } }) {
  const [selectedAction, setSelectedAction] = useState<MovementAction>("fill");
  const [loading, setLoading] = useState(false);
  const [locationNames, setLocationNames] = useState<string[]>(["Brewery", "b.social / Tap Room"]);
  const [products, setProducts] = useState<{ id: string; name: string; abv: number }[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadReferenceData() {
      await seedCoreData();
      const [locations, loadedProducts] = await Promise.all([getLocations(), getProducts()]);
      if (locations.length > 0) {
        setLocationNames(Array.from(new Set(locations.map((location) => location.name))));
      }
      setProducts(loadedProducts);
    }

    void loadReferenceData();
  }, []);

  const selectedActionLabel = useMemo(() => actionLabels[selectedAction], [selectedAction]);

  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-bold text-[#131E29]">Scan Keg</h1>
      <label className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="mb-2 block text-xs font-semibold tracking-[0.12em] text-slate-500">SCAN TYPE</span>
        <select
          value={selectedAction}
          onChange={(event) => setSelectedAction(event.target.value as MovementAction)}
          className="min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3"
        >
          {actions.map((action) => (
            <option key={action} value={action}>
              {actionLabels[action]}
            </option>
          ))}
        </select>
      </label>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <ActionForm
          key={selectedAction}
          actionType={selectedAction}
          locations={locationNames}
          products={products}
          onSubmit={async (fields) => {
            setLoading(true);

            const now = new Date().toISOString();
            await updateKeg(params.id, {
              kegId: params.id,
              currentStatus: actionToStatus[selectedAction],
              currentLocation: fields.currentLocation ?? fields.lastKnownLocation ?? "Brewery",
              product: fields.product,
              batch: fields.batch,
              beerName: fields.beerName,
              abv: fields.abv ? Number(fields.abv) : undefined,
              packagingDate: fields.packagingDate,
              bestBeforeDate: fields.bestBeforeDate,
              lastUpdatedAt: now,
            });

            await createMovement({
              kegId: params.id,
              scanType: selectedAction,
              fromLocation: fields.currentLocation,
              toLocation: fields.nextLocation,
              product: fields.product,
              batch: fields.batch,
              timestamp: now,
              notes: JSON.stringify({ ...fields, scanType: selectedActionLabel }),
              updatedBy: "current-user",
            });

            router.push(`/kegs/${params.id}`);
          }}
        />
      </section>
      {loading && <p className="text-sm text-slate-500">Saving...</p>}
    </main>
  );
}
