export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { CustomerRequestActions } from "@/components/CustomerRequestActions";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { getFreshnessMeta } from "@/lib/freshness";
import { getKegById } from "@/lib/firestore";

export default async function PublicKegPage({ params }: { params: Promise<{ kegId: string }> }) {
  const { kegId } = await params;
  const keg = await getKegById(kegId);

  if (!keg) {
    notFound();
  }

  const productName = keg.productName ?? keg.beerName ?? keg.product ?? "Product not set";
  const freshness = getFreshnessMeta(keg.bestBefore ?? keg.bestBeforeDate);

  return (
    <main className="page-shell mx-auto max-w-2xl space-y-5">
      <section className="editorial-panel editorial-panel--dark grain-overlay overflow-hidden p-6 sm:p-7">
        <p className="eyebrow text-amber-100/80">Customer Keg Scan</p>
        <h1 className="mt-3 text-5xl font-semibold text-white">{keg.name ?? keg.kegId ?? keg.id}</h1>
        <p className="mt-3 text-base leading-7 text-slate-100/84">
          View the current keg freshness and send a one-tap request back to the brewery.
        </p>
      </section>

      <section className="editorial-panel space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Current Product</p>
            <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{productName}</h2>
          </div>
          <FreshnessBadge bestBefore={keg.bestBefore ?? keg.bestBeforeDate} />
        </div>

        <div className={`rounded-[22px] border p-4 ${freshness.accentClassName}`}>
          <p className="section-kicker">Freshness Status</p>
          <p className="mt-2 text-2xl font-semibold">{freshness.label}</p>
          <p className="mt-2 text-sm leading-6">
            Filled {keg.filledAt ?? keg.packagingDate ?? "not recorded"}.
            Best before {keg.bestBefore ?? keg.bestBeforeDate ?? "not set"}.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.58)] p-4">
            <p className="section-kicker">Location</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.currentLocation}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.58)] p-4">
            <p className="section-kicker">Batch</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.batchNumber ?? keg.batch ?? "Not set"}</p>
          </div>
        </div>
      </section>

      <section className="editorial-panel space-y-4 p-5 sm:p-6">
        <div>
          <p className="section-kicker">Need Something?</p>
          <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">Request an action from the brewery</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Tap once to send a request for this keg.</p>
        </div>
        <CustomerRequestActions kegId={keg.id} />
      </section>
    </main>
  );
}
