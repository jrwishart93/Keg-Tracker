export const dynamic = "force-dynamic";

import Image from "next/image";
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

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold text-[#131E29]">Operations</h1>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(counts).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{key}</p>
            <p className="text-3xl font-bold text-[#131E29]">{value}</p>
          </div>
        ))}
      </section>
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="mb-2 text-lg font-semibold">Firebase check</h2>
        <p className="mb-3 text-sm text-slate-600">Use this temporary button to verify Firestore write access.</p>
        <FirebaseConnectionTestButton />
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent movements</h2>
        {movements.length > 0 ? (
          <MovementLog movements={movements} />
        ) : (
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6">
            <div className="relative h-44 w-full overflow-hidden rounded-lg">
              <Image
                src="https://beffect.nz/cdn/shop/files/201116_MCH0001-2-3-scaled.webp?v=1668481791&width=535"
                alt="Brewery empty state"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#131E29]/45" />
              <p className="absolute bottom-3 left-3 text-sm font-semibold text-white">No activity yet.</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
