"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/ActionForm";
import { useAuth } from "@/context/auth-context";
import { createMovement, getKegById, getLocations, getProducts, seedCoreData, updateKeg } from "@/lib/firestore";
import type { Keg } from "@/types/keg";
import type { KegStatus } from "@/types/keg";
import type { StaffMovementAction } from "@/types/movement";

const actions: StaffMovementAction[] = ["wash", "fill", "deliver", "return", "empty", "maintenance", "lost"];

const actionToStatus: Record<StaffMovementAction, KegStatus> = {
  wash: "washed",
  fill: "filled",
  deliver: "delivered",
  return: "returned",
  empty: "empty",
  maintenance: "maintenance",
  lost: "lost",
};

const actionLabels: Record<StaffMovementAction, string> = {
  wash: "Wash",
  fill: "Fill",
  deliver: "Deliver",
  return: "Return",
  empty: "Empty",
  maintenance: "Maintenance",
  lost: "Lost",
};

export default function KegActionPage({ params }: { params: { id: string } }) {
  const [selectedAction, setSelectedAction] = useState<StaffMovementAction>("fill");
  const [loading, setLoading] = useState(false);
  const [keg, setKeg] = useState<Keg | null>(null);
  const [locationNames, setLocationNames] = useState<string[]>(["Brewery", "b.social / Tap Room"]);
  const [products, setProducts] = useState<{ id: string; name: string; abv: number }[]>([]);
  const {
    state: { user },
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function loadReferenceData() {
      await seedCoreData();
      const [locations, loadedProducts, loadedKeg] = await Promise.all([getLocations(), getProducts(), getKegById(params.id)]);
      if (locations.length > 0) {
        setLocationNames(Array.from(new Set(locations.map((location) => location.name))));
      }
      setProducts(loadedProducts);
      setKeg(loadedKeg);
    }

    void loadReferenceData();
  }, [params.id]);

  const selectedActionLabel = useMemo(() => actionLabels[selectedAction], [selectedAction]);

  function getNextCurrentLocation(fields: Record<string, string>) {
    if (selectedAction === "deliver" || selectedAction === "return") {
      return fields.nextLocation ?? fields.currentLocation ?? keg?.currentLocation ?? "Brewery";
    }

    return fields.currentLocation ?? fields.lastKnownLocation ?? keg?.currentLocation ?? "Brewery";
  }

  function getNextIntendedLocation(fields: Record<string, string>) {
    if (selectedAction === "deliver" || selectedAction === "return") {
      return fields.nextLocation ?? keg?.intendedLocation;
    }

    return keg?.intendedLocation;
  }

  function buildKegPatch(fields: Record<string, string>, now: string): Record<string, unknown> {
    if (selectedAction === "wash") {
      return {
        currentLocation: getNextCurrentLocation(fields),
        currentStatus: "washed",
        status: "washed",
        washedAt: now,
        filledAt: null,
        bestBefore: null,
        productName: null,
        batchNumber: null,
        assignedCustomerId: null,
        product: null,
        beerName: null,
        batch: null,
        packagingDate: null,
        bestBeforeDate: null,
        lastUpdatedAt: now,
        lastUpdated: now,
      };
    }

    if (selectedAction === "fill") {
      const productName = fields.product || fields.beerName || keg?.productName || keg?.product;
      const batchNumber = fields.batch || keg?.batchNumber || keg?.batch;
      const bestBefore = fields.bestBeforeDate || keg?.bestBefore || keg?.bestBeforeDate;

      return {
        currentLocation: getNextCurrentLocation(fields),
        intendedLocation: getNextIntendedLocation(fields),
        currentStatus: "filled",
        status: "filled",
        filledAt: now,
        bestBefore: bestBefore || null,
        productName: productName || null,
        batchNumber: batchNumber || null,
        product: productName,
        beerName: productName,
        batch: batchNumber,
        abv: fields.abv ? Number(fields.abv) : keg?.abv,
        packagingDate: fields.packagingDate || now,
        bestBeforeDate: bestBefore,
        lastUpdatedAt: now,
        lastUpdated: now,
      };
    }

    if (selectedAction === "deliver") {
      return {
        currentLocation: getNextCurrentLocation(fields),
        intendedLocation: getNextIntendedLocation(fields),
        currentStatus: "delivered",
        status: "delivered",
        assignedCustomerId: fields.customerName || keg?.assignedCustomerId || null,
        productName: keg?.productName ?? keg?.product ?? null,
        batchNumber: keg?.batchNumber ?? keg?.batch ?? null,
        lastUpdatedAt: now,
        lastUpdated: now,
      };
    }

    if (selectedAction === "return") {
      return {
        currentLocation: getNextCurrentLocation(fields),
        intendedLocation: getNextIntendedLocation(fields),
        currentStatus: "returned",
        status: "returned",
        assignedCustomerId: null,
        lastUpdatedAt: now,
        lastUpdated: now,
      };
    }

    return {
      currentLocation: getNextCurrentLocation(fields),
      intendedLocation: getNextIntendedLocation(fields),
      currentStatus: actionToStatus[selectedAction],
      status: actionToStatus[selectedAction],
      productName: keg?.productName ?? keg?.product ?? null,
      batchNumber: keg?.batchNumber ?? keg?.batch ?? null,
      product: fields.product ?? keg?.product,
      batch: fields.batch ?? keg?.batch,
      beerName: fields.beerName ?? keg?.beerName,
      abv: fields.abv ? Number(fields.abv) : keg?.abv,
      packagingDate: fields.packagingDate ?? keg?.packagingDate,
      bestBeforeDate: fields.bestBeforeDate ?? keg?.bestBeforeDate,
      bestBefore: fields.bestBeforeDate ?? keg?.bestBefore ?? keg?.bestBeforeDate ?? null,
      lastUpdatedAt: now,
      lastUpdated: now,
    };
  }

  return (
    <main className="page-shell space-y-5">
      <section className="editorial-panel p-5 sm:p-6">
        <p className="section-kicker">Scan Action</p>
        <h1 className="mt-3 text-5xl font-semibold text-[color:var(--ink)]">Update Keg</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">Choose the movement type, capture the key details, and save the keg’s next operational state.</p>
      </section>
      <label className="editorial-panel block p-5">
        <span className="section-kicker">Scan Type</span>
        <select
          value={selectedAction}
          onChange={(event) => setSelectedAction(event.target.value as StaffMovementAction)}
          className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4"
        >
          {actions.map((action) => (
            <option key={action} value={action}>
              {actionLabels[action]}
            </option>
          ))}
        </select>
      </label>
      <section className="editorial-panel p-5 sm:p-6">
        <ActionForm
          key={selectedAction}
          actionType={selectedAction}
          locations={locationNames}
          products={products}
          onSubmit={async (fields) => {
            setLoading(true);

            const now = new Date().toISOString();
            await updateKeg(params.id, buildKegPatch(fields, now));

            await createMovement({
              kegId: keg?.kegId ?? params.id,
              scanType: selectedAction,
              type: selectedAction === "deliver" ? "delivery" : selectedAction,
              fromLocation: fields.currentLocation,
              toLocation: fields.nextLocation,
              product: fields.product ?? fields.beerName ?? keg?.productName ?? keg?.product,
              batch: fields.batch,
              timestamp: now,
              userId: user?.uid ?? "current-user",
              notes: JSON.stringify({ ...fields, scanType: selectedActionLabel }),
              updatedBy: user?.displayName ?? user?.email ?? "current-user",
            });

            router.push(`/kegs/${params.id}`);
          }}
        />
      </section>
      {loading && <p className="text-sm text-slate-500">Saving...</p>}
    </main>
  );
}
