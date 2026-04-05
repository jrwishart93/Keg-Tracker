export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { MovementLog } from "@/components/MovementLog";
import { StatusBadge } from "@/components/StatusBadge";
import { getKegById, getMovementsByKeg } from "@/lib/firestore";

export default async function KegDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const keg = await getKegById(id);
  if (!keg) notFound();

  const movements = await getMovementsByKeg(id);

  return (
    <main className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Keg #{keg.id}</h1>
        <StatusBadge status={keg.status} />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p>Current location: {keg.locationId}</p>
        <p>Current product: {keg.productId ?? "n/a"}</p>
        <p>Last updated: {keg.updatedAt ?? "n/a"}</p>
      </div>
      <Link href={`/kegs/${keg.id}/action`} className="inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-4 text-white">
        Update this keg
      </Link>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Movement history</h2>
        <MovementLog movements={movements} />
      </section>
    </main>
  );
}
