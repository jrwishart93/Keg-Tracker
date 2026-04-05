export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Beer, CircleOff, Droplets, RotateCcw, Settings2, Truck } from "lucide-react";
import { MovementLog } from "@/components/MovementLog";
import { FirebaseConnectionTestButton } from "@/components/FirebaseConnectionTestButton";
import { getCustomerRequests, getKegs, getRecentMovements } from "@/lib/firestore";
import { getFreshnessStatus } from "@/lib/freshness";

type DashboardSearchParams = {
  customer?: string;
  product?: string;
  location?: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const [{ customer = "", product = "", location = "" }, kegs, movements, customerRequests] = await Promise.all([
    searchParams,
    getKegs(),
    getRecentMovements(),
    getCustomerRequests(),
  ]);

  const filteredKegs = kegs.filter((keg) => {
    if (customer && (keg.assignedCustomerId ?? "") !== customer) return false;
    if (product && (keg.productName ?? keg.beerName ?? keg.product ?? "") !== product) return false;
    if (location && (keg.currentLocation ?? "") !== location) return false;
    return true;
  });

  const filteredKegIds = new Set(filteredKegs.map((keg) => keg.id));
  const kegById = new Map(filteredKegs.map((keg) => [keg.id, keg]));
  const filteredCustomerRequests = customerRequests.filter((request) => filteredKegIds.has(request.kegId));
  const nearExpiryKegs = filteredKegs.filter((keg) => getFreshnessStatus(keg.bestBefore ?? keg.bestBeforeDate) === "near-expiry");
  const expiredKegs = filteredKegs.filter((keg) => getFreshnessStatus(keg.bestBefore ?? keg.bestBeforeDate) === "expired");
  const pendingCustomerRequests = filteredCustomerRequests.filter((request) => request.status === "pending");

  const counts = {
    total: filteredKegs.length,
    washed: filteredKegs.filter((keg) => keg.currentStatus === "washed").length,
    filled: filteredKegs.filter((keg) => keg.currentStatus === "filled").length,
    delivered: filteredKegs.filter((keg) => keg.currentStatus === "delivered").length,
    returned: filteredKegs.filter((keg) => keg.currentStatus === "returned").length,
    empty: filteredKegs.filter((keg) => keg.currentStatus === "empty").length,
    maintenance: filteredKegs.filter((keg) => keg.currentStatus === "maintenance").length,
    lost: filteredKegs.filter((keg) => keg.currentStatus === "lost").length,
  };

  const statIcons = {
    total: Beer,
    washed: Droplets,
    filled: Beer,
    delivered: Truck,
    returned: RotateCcw,
    empty: CircleOff,
    maintenance: Settings2,
    lost: AlertTriangle,
  };

  const customers = [...new Set(kegs.map((keg) => keg.assignedCustomerId).filter(Boolean))];
  const products = [...new Set(kegs.map((keg) => keg.productName ?? keg.beerName ?? keg.product).filter(Boolean))];
  const locations = [...new Set(kegs.map((keg) => keg.currentLocation).filter(Boolean))];

  return (
    <main className="page-shell space-y-6">
      <section className="editorial-panel editorial-panel--dark grain-overlay overflow-hidden p-6 sm:p-7">
        <p className="eyebrow text-amber-100/80">Operations Overview</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="display-title text-5xl sm:text-6xl">Live keg visibility across brewery, route, and venue.</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-100/82 sm:text-base">
              Monitor lifecycle readiness, freshness risk, customer demand, and operational bottlenecks from one dashboard.
            </p>
          </div>
          <div className="badge-chip inline-flex w-fit px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-50">
            {counts.total} kegs in view
          </div>
        </div>
      </section>

      <section className="editorial-panel p-5 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">Filters</p>
            <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">Customer, product, and location</h2>
          </div>
          <Link href="/dashboard" className="inline-flex min-h-11 items-center rounded-full border border-black/10 bg-[rgba(255,255,255,0.7)] px-4 text-sm font-semibold text-slate-700">
            Clear filters
          </Link>
        </div>
        <form className="mt-5 grid gap-4 md:grid-cols-3" method="get">
          <label className="block">
            <span className="section-kicker">Customer</span>
            <select name="customer" defaultValue={customer} className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4">
              <option value="">All customers</option>
              {customers.map((value) => (
                <option key={value} value={value ?? ""}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="section-kicker">Product</span>
            <select name="product" defaultValue={product} className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4">
              <option value="">All products</option>
              {products.map((value) => (
                <option key={value} value={value ?? ""}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="section-kicker">Location</span>
            <select name="location" defaultValue={location} className="field-shell mt-2 min-h-12 w-full rounded-[18px] px-4">
              <option value="">All locations</option>
              {locations.map((value) => (
                <option key={value} value={value ?? ""}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-3">
            <button type="submit" className="glow-button min-h-12 rounded-full bg-[linear-gradient(135deg,#17212a,#324452)] px-5 font-semibold text-white">
              Apply Filters
            </button>
          </div>
        </form>
      </section>

      <section className="stagger-list grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { key: "Near expiry", value: nearExpiryKegs.length, tone: "border-amber-200 bg-amber-50 text-amber-900" },
          { key: "Expired", value: expiredKegs.length, tone: "border-rose-200 bg-rose-50 text-rose-900" },
          { key: "Active requests", value: pendingCustomerRequests.length, tone: "border-sky-200 bg-sky-50 text-sky-900" },
          { key: "Delivered", value: counts.delivered, tone: "border-emerald-200 bg-emerald-50 text-emerald-900" },
        ].map((card) => (
          <div key={card.key} className={`stats-card card-hover border ${card.tone} p-5`}>
            <p className="section-kicker">{card.key}</p>
            <p className="mt-3 text-5xl font-semibold">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="stagger-list grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(counts).map(([key, value]) => {
          const Icon = statIcons[key as keyof typeof statIcons];
          return (
            <div key={key} className="stats-card card-hover p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="section-kicker">{key}</p>
                <Icon className="h-5 w-5 text-[color:var(--amber)]" strokeWidth={1.8} />
              </div>
              <p className="mt-3 text-5xl font-semibold text-[color:var(--ink)]">{value}</p>
              <p className="mt-3 text-sm text-slate-600">Filtered lifecycle count.</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <div>
            <p className="section-kicker">Activity Feed</p>
            <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">Recent movements</h2>
          </div>
          {movements.length > 0 ? (
            <MovementLog movements={movements} />
          ) : (
            <div className="editorial-panel relative overflow-hidden p-6">
              <div className="relative h-44 w-full overflow-hidden rounded-lg">
                <Image
                  src="https://beffect.nz/cdn/shop/files/201116_MCH0001-2-3-scaled.webp?v=1668481791&width=535"
                  alt="Brewery empty state"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,29,37,0.18),rgba(20,29,37,0.72))]" />
                <p className="absolute bottom-3 left-3 text-sm font-semibold text-white">No activity yet.</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <section className="editorial-panel p-5 sm:p-6">
            <p className="section-kicker">Customer Requests</p>
            <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">Active requests</h2>
            {pendingCustomerRequests.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {pendingCustomerRequests.slice(0, 6).map((request) => {
                  const relatedKeg = kegById.get(request.kegId);
                  const kegLabel = relatedKeg?.name ?? relatedKeg?.kegId ?? request.kegId;

                  return (
                    <li key={request.id} className="rounded-[18px] bg-[rgba(255,255,255,0.58)] p-4">
                      <p className="section-kicker">{request.requestType}</p>
                      <p className="mt-2 text-sm font-medium text-slate-800">{kegLabel}</p>
                      <p className="mt-1 text-xs text-slate-500">{request.createdAt ?? "Pending timestamp"}</p>
                      {request.customerName ? <p className="mt-2 text-xs text-slate-500">From {request.customerName}</p> : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No active customer requests for the current filter set.</p>
            )}
          </section>

          <section className="editorial-panel p-5 sm:p-6">
            <p className="section-kicker">System Health</p>
            <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">Firebase connection check</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Use this temporary control to confirm live Firestore access while the prototype is being refined.
            </p>
            <FirebaseConnectionTestButton />
          </section>
        </div>
      </section>
    </main>
  );
}
