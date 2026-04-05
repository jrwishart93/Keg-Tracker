"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { deliverKegLifecycle, fillKegLifecycle, getProducts, markKegWashed, seedCoreData } from "@/lib/firestore";
import type { Keg } from "@/types/keg";

function defaultBestBefore() {
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);
  return nextMonth.toISOString().split("T")[0];
}

export function KegLifecyclePanel({ keg }: { keg: Keg }) {
  const router = useRouter();
  const {
    state: { user },
  } = useAuth();
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [fillForm, setFillForm] = useState({
    productName: keg.productName ?? keg.beerName ?? keg.product ?? "",
    batchNumber: keg.batchNumber ?? keg.batch ?? "",
    bestBefore: keg.bestBefore ?? keg.bestBeforeDate ?? defaultBestBefore(),
  });
  const [deliveryForm, setDeliveryForm] = useState({
    customerName: keg.assignedCustomerId ?? "",
    location: keg.currentLocation ?? "",
  });
  const [busyAction, setBusyAction] = useState<"wash" | "fill" | "deliver" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        await seedCoreData();
      } catch {
        // Intentionally swallowed — staff users lack write access to locations/products.
      }
      try {
        const loadedProducts = await getProducts();
        setProducts(loadedProducts);
      } catch {
        // Products unavailable — dropdown will be empty.
      }
    }

    void loadProducts();
  }, []);

  const actorId = user?.uid ?? "authenticated-user";
  const actorName = user?.displayName ?? user?.email ?? "Staff user";

  async function runAction(action: "wash" | "fill" | "deliver", callback: () => Promise<void>, successMessage: string) {
    setBusyAction(action);
    setMessage("");
    setError("");

    try {
      await callback();
      setMessage(successMessage);
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not update keg lifecycle.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className="editorial-panel space-y-5 p-5 sm:p-6">
      <div>
        <p className="section-kicker">Lifecycle Controls</p>
        <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">Wash, fill, and deliver this keg</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">These actions update lifecycle timestamps, freshness data, and movement history.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-[24px] bg-[rgba(255,255,255,0.58)] p-4">
          <p className="section-kicker">Wash</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">Mark the keg as cleaned and ready for the next fill cycle.</p>
          <button
            type="button"
            onClick={() =>
              void runAction(
                "wash",
                () => markKegWashed({ kegDocId: keg.id, userId: actorId, updatedBy: actorName }),
                "Keg marked as washed.",
              )
            }
            disabled={busyAction !== null}
            className="mt-4 min-h-12 w-full rounded-full border border-cyan-200 bg-cyan-50 px-4 font-semibold text-cyan-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === "wash" ? "Updating..." : "Mark as Washed"}
          </button>
        </article>

        <article className="rounded-[24px] bg-[rgba(255,255,255,0.58)] p-4">
          <p className="section-kicker">Fill Keg</p>
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="section-kicker">Product Name</span>
              <input
                list="lifecycle-products"
                value={fillForm.productName}
                onChange={(event) => setFillForm((current) => ({ ...current, productName: event.target.value }))}
                className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4"
                placeholder="IPA, Lager, Pilsner..."
              />
            </label>
            <label className="block">
              <span className="section-kicker">Batch Number</span>
              <input
                value={fillForm.batchNumber}
                onChange={(event) => setFillForm((current) => ({ ...current, batchNumber: event.target.value }))}
                className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4"
                placeholder="Optional"
              />
            </label>
            <label className="block">
              <span className="section-kicker">Best Before</span>
              <input
                type="date"
                value={fillForm.bestBefore}
                onChange={(event) => setFillForm((current) => ({ ...current, bestBefore: event.target.value }))}
                className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4"
              />
            </label>
            <button
              type="button"
              onClick={() =>
                void runAction(
                  "fill",
                  () =>
                    fillKegLifecycle({
                      kegDocId: keg.id,
                      productName: fillForm.productName,
                      batchNumber: fillForm.batchNumber,
                      bestBefore: fillForm.bestBefore,
                      userId: actorId,
                      updatedBy: actorName,
                    }),
                  "Keg filled and freshness data saved.",
                )
              }
              disabled={busyAction !== null}
              className="glow-button min-h-12 w-full rounded-full bg-[linear-gradient(135deg,#17212a,#324452)] px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busyAction === "fill" ? "Saving fill..." : "Fill Keg"}
            </button>
          </div>
          <datalist id="lifecycle-products">
            {products.map((product) => (
              <option key={product.id} value={product.name} />
            ))}
          </datalist>
        </article>

        <article className="rounded-[24px] bg-[rgba(255,255,255,0.58)] p-4">
          <p className="section-kicker">Deliver Keg</p>
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="section-kicker">Customer</span>
              <input
                value={deliveryForm.customerName}
                onChange={(event) => setDeliveryForm((current) => ({ ...current, customerName: event.target.value }))}
                className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4"
                placeholder="Venue or customer name"
              />
            </label>
            <label className="block">
              <span className="section-kicker">Location</span>
              <input
                value={deliveryForm.location}
                onChange={(event) => setDeliveryForm((current) => ({ ...current, location: event.target.value }))}
                className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4"
                placeholder="Tap room, bar, warehouse..."
              />
            </label>
            <button
              type="button"
              onClick={() =>
                void runAction(
                  "deliver",
                  () =>
                    deliverKegLifecycle({
                      kegDocId: keg.id,
                      customerName: deliveryForm.customerName,
                      location: deliveryForm.location,
                      userId: actorId,
                      updatedBy: actorName,
                    }),
                  "Keg delivered and assigned.",
                )
              }
              disabled={busyAction !== null}
              className="min-h-12 w-full rounded-full border border-black/10 bg-[rgba(255,255,255,0.7)] px-4 font-semibold text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busyAction === "deliver" ? "Saving delivery..." : "Deliver Keg"}
            </button>
          </div>
        </article>
      </div>

      {message ? <p className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
    </section>
  );
}
