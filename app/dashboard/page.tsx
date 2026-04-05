export const dynamic = "force-dynamic";

import Image from "next/image";
import { AlertTriangle, Beer, CircleOff, RotateCcw, Settings2, Truck } from "lucide-react";
import { getKegs, getRecentMovements } from "@/lib/firestore";
import { MovementLog } from "@/components/MovementLog";
import { FirebaseConnectionTestButton } from "@/components/FirebaseConnectionTestButton";

export default async function DashboardPage() {
  const [kegs, movements] = await Promise.all([getKegs(), getRecentMovements()]);

  const counts = {
    total: kegs.length,
    filled: kegs.filter((keg) => keg.currentStatus === "filled").length,
    delivered: kegs.filter((keg) => keg.currentStatus === "delivered").length,
    returned: kegs.filter((keg) => keg.currentStatus === "returned").length,
    empty: kegs.filter((keg) => keg.currentStatus === "empty").length,
    maintenance: kegs.filter((keg) => keg.currentStatus === "maintenance").length,
    lost: kegs.filter((keg) => keg.currentStatus === "lost").length,
  };

  const statIcons = {
    total: Beer,
    filled: Beer,
    delivered: Truck,
    returned: RotateCcw,
    empty: CircleOff,
    maintenance: Settings2,
    lost: AlertTriangle,
  };

  return (
    <main className="page-shell space-y-6">
      <section className="editorial-panel editorial-panel--dark grain-overlay overflow-hidden p-6 sm:p-7">
        <p className="eyebrow text-amber-100/80">Operations Overview</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="display-title text-5xl sm:text-6xl">Live keg visibility across brewery, route, and venue.</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-100/82 sm:text-base">
              Monitor fleet status, scan activity, and operational bottlenecks from one dashboard built for both the floor and the office.
            </p>
          </div>
          <div className="badge-chip inline-flex w-fit px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-50">
            {counts.total} kegs in system
          </div>
        </div>
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
              <p className="mt-3 text-sm text-slate-600">Updated from current keg statuses and recent scan activity.</p>
            </div>
          );
        })}
      </section>

      <section className="editorial-panel p-5 sm:p-6">
        <p className="section-kicker">System Health</p>
        <h2 className="mt-3 text-3xl font-semibold text-[color:var(--ink)]">Firebase connection check</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Use this temporary control to confirm live Firestore access while the prototype is being refined.</p>
        <FirebaseConnectionTestButton />
      </section>

      <section className="space-y-4">
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
      </section>
    </main>
  );
}
