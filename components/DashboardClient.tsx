"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Beer, CircleOff, Droplets, RotateCcw, Settings2, Truck } from "lucide-react";
import { FirebaseConnectionTestButton } from "@/components/FirebaseConnectionTestButton";
import { MovementLog } from "@/components/MovementLog";
import { useAuth } from "@/context/auth-context";
import { getCustomerRequests, getRecentMovements } from "@/lib/firestore";
import { getFreshnessStatus } from "@/lib/freshness";
import type { CustomerRequest } from "@/types/customer-request";
import type { Keg } from "@/types/keg";
import type { Movement } from "@/types/movement";

type DashboardFilters = {
  customer?: string;
  product?: string;
  location?: string;
};

export function DashboardClient({
  initialKegs,
  filters,
}: {
  initialKegs: Keg[];
  filters: DashboardFilters;
}) {
  const {
    state: { user, loading },
  } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [customerRequests, setCustomerRequests] = useState<CustomerRequest[]>([]);
  const [loadingProtectedData, setLoadingProtectedData] = useState(true);
  const [protectedDataError, setProtectedDataError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProtectedData() {
      if (loading) {
        return;
      }

      if (!user || user.role === "demo") {
        if (!cancelled) {
          setMovements([]);
          setCustomerRequests([]);
          setProtectedDataError("");
          setLoadingProtectedData(false);
        }
        return;
      }

      setLoadingProtectedData(true);
      setProtectedDataError("");

      try {
        const [recentMovements, activeCustomerRequests] = await Promise.all([getRecentMovements(), getCustomerRequests()]);
        if (!cancelled) {
          setMovements(recentMovements);
          setCustomerRequests(activeCustomerRequests);
        }
      } catch (error) {
        if (!cancelled) {
          setMovements([]);
          setCustomerRequests([]);
          setProtectedDataError(error instanceof Error ? error.message : "Could not load internal dashboard data.");
        }
      } finally {
        if (!cancelled) {
          setLoadingProtectedData(false);
        }
      }
    }

    void loadProtectedData();

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  const customer = filters.customer ?? "";
  const product = filters.product ?? "";
  const location = filters.location ?? "";
  const filteredKegs = initialKegs.filter((keg) => {
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
  const hasStatus = (keg: Keg, ...statuses: string[]) => statuses.includes(keg.currentStatus);

  const counts = {
    total: filteredKegs.length,
    washed: filteredKegs.filter((keg) => hasStatus(keg, "Washed")).length,
    filled: filteredKegs.filter((keg) => hasStatus(keg, "Filled")).length,
    delivered: filteredKegs.filter((keg) => hasStatus(keg, "Checked Out", "Delivered")).length,
    returned: filteredKegs.filter((keg) => hasStatus(keg, "Checked In", "Returned")).length,
    empty: filteredKegs.filter((keg) => hasStatus(keg, "Empty", "Available")).length,
    maintenance: filteredKegs.filter((keg) => hasStatus(keg, "In Maintenance")).length,
    lost: filteredKegs.filter((keg) => hasStatus(keg, "Lost")).length,
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

  const customers = [...new Set(initialKegs.map((keg) => keg.assignedCustomerId).filter(Boolean))];
  const products = [...new Set(initialKegs.map((keg) => keg.productName ?? keg.beerName ?? keg.product).filter(Boolean))];
  const locations = [...new Set(initialKegs.map((keg) => keg.currentLocation).filter(Boolean))];
  const showInternalData = Boolean(user && user.role !== "demo");

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

      {protectedDataError ? (
        <section className="rounded-[22px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Internal dashboard data could not be loaded from Firestore. Public keg data is still available.
        </section>
      ) : null}

      {!showInternalData && !loading ? (
        <section className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-4 text-sm text-slate-700">
          Demo mode shows public keg data only. Sign in with a staff account to view internal movement history, customer requests, and location records.
        </section>
      ) : null}

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
          {loading ? (
            <div className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-8 text-sm text-slate-500">Restoring staff access...</div>
          ) : loadingProtectedData && showInternalData ? (
            <div className="rounded-[22px] border border-slate-200 bg-white/70 px-5 py-8 text-sm text-slate-500">Loading movement history...</div>
          ) : movements.length > 0 ? (
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
            {loading ? (
              <p className="mt-4 text-sm text-slate-500">Restoring staff access...</p>
            ) : loadingProtectedData && showInternalData ? (
              <p className="mt-4 text-sm text-slate-500">Loading customer requests...</p>
            ) : pendingCustomerRequests.length > 0 ? (
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
