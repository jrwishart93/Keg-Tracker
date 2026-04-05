import Link from "next/link";
import type { Keg } from "@/types/keg";
import { StatusBadge } from "@/components/StatusBadge";

export function KegCard({ keg }: { keg: Keg }) {
  const contents = keg.beerName ?? keg.product ?? "Empty / not set";

  return (
    <Link href={`/kegs/${keg.id}`} className="editorial-panel card-hover block p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">Active Keg</p>
          <h3 className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">{keg.kegId ?? keg.id}</h3>
        </div>
        <StatusBadge status={keg.currentStatus} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[20px] bg-[rgba(255,255,255,0.65)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <p className="section-kicker">Contents</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{contents}</p>
        </div>
        <div className="rounded-[20px] bg-[rgba(255,255,255,0.65)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <p className="section-kicker">QR Payload</p>
          <p className="mt-2 break-all text-sm leading-6 text-slate-700">{keg.qrCode}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="section-kicker">Current Location</p>
          <p className="mt-2 text-sm font-medium text-slate-800">{keg.currentLocation}</p>
        </div>
        <div>
          <p className="section-kicker">Intended Location</p>
          <p className="mt-2 text-sm font-medium text-slate-800">{keg.intendedLocation ?? "Not set"}</p>
        </div>
      </div>
    </Link>
  );
}
