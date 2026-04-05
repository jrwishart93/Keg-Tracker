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
    <main className="page-shell space-y-5">
      <section className="editorial-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-kicker">Keg Record</p>
            <h1 className="mt-3 text-5xl font-semibold text-[color:var(--ink)]">{keg.kegId ?? keg.id}</h1>
          </div>
          <StatusBadge status={keg.currentStatus} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Current Location</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.currentLocation}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Intended Location</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.intendedLocation ?? "Not set"}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Current Product</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{keg.product ?? "n/a"}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">QR Payload</p>
            <p className="mt-2 break-all text-sm leading-6 text-slate-700">{keg.qrCode}</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="section-kicker">Last Updated</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{keg.lastUpdatedAt ?? "n/a"}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href={`/kegs/${keg.id}/action`} className="glow-button inline-flex min-h-12 items-center rounded-full bg-[linear-gradient(135deg,#17212a,#324452)] px-5 font-semibold text-white">
          Update this keg
        </Link>
        <Link href={`/kegs/${keg.id}/label`} className="inline-flex min-h-12 items-center rounded-full border border-black/10 bg-[rgba(255,255,255,0.7)] px-5 font-semibold text-slate-700">
          Print sticker
        </Link>
      </div>

      <section className="space-y-4">
        <div>
          <p className="section-kicker">History</p>
          <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">Movement history</h2>
        </div>
        <MovementLog movements={movements} />
      </section>
    </main>
  );
}
