import Link from "next/link";
import type { Keg } from "@/types/keg";
import { StatusBadge } from "@/components/StatusBadge";

export function KegCard({ keg }: { keg: Keg }) {
  return (
    <Link href={`/kegs/${keg.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Keg #{keg.kegId ?? keg.id}</h3>
        <StatusBadge status={keg.currentStatus} />
      </div>
      <p className="mt-3 text-xs font-semibold tracking-[0.12em] text-slate-500">QR CODE</p>
      <p className="text-sm text-slate-700">{keg.qrCode}</p>
      <p className="mt-2 text-xs font-semibold tracking-[0.12em] text-slate-500">LOCATION</p>
      <p className="text-sm text-slate-700">{keg.currentLocation}</p>
    </Link>
  );
}
