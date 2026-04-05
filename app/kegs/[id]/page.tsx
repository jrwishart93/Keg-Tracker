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
        <h1 className="text-3xl font-bold text-[#131E29]">{keg.kegId ?? keg.id}</h1>
        <StatusBadge status={keg.currentStatus} />
      </div>
      <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Current location:</span> {keg.currentLocation}</p>
        <p><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Intended location:</span> {keg.intendedLocation ?? "Not set"}</p>
        <p><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Current product:</span> {keg.product ?? "n/a"}</p>
        <p><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">QR code:</span> {keg.qrCode}</p>
        <p><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Last updated:</span> {keg.lastUpdatedAt ?? "n/a"}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href={`/kegs/${keg.id}/action`} className="inline-flex min-h-12 items-center rounded-lg bg-[#131E29] px-5 font-semibold text-white">
          Update this keg
        </Link>
        <Link href={`/kegs/${keg.id}/label`} className="inline-flex min-h-12 items-center rounded-lg border border-slate-300 px-5 font-semibold text-slate-700">
          Print sticker
        </Link>
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Movement history</h2>
        <MovementLog movements={movements} />
      </section>
    </main>
  );
}
