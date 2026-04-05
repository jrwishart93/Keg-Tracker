export const dynamic = "force-dynamic";

import { getKegs, getRecentMovements } from "@/lib/firestore";
import { MovementLog } from "@/components/MovementLog";

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

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(counts).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">{key}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        ))}
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent movements</h2>
        <MovementLog movements={movements} />
      </section>
    </main>
  );
}
