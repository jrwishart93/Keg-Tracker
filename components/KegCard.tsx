import Link from "next/link";
import type { Keg } from "@/types/keg";
import { StatusBadge } from "@/components/StatusBadge";

export function KegCard({ keg }: { keg: Keg }) {
  return (
    <Link href={`/kegs/${keg.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Keg #{keg.kegId ?? keg.id}</h3>
        <StatusBadge status={keg.currentStatus} />
      </div>
      <p className="mt-2 text-sm text-slate-600">QR: {keg.qrCode}</p>
      <p className="text-sm text-slate-600">Location: {keg.currentLocation}</p>
    </Link>
  );
}
