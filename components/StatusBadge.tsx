import { AlertTriangle, Beer, CircleOff, Droplets, RotateCcw, Settings2, Truck } from "lucide-react";
import type { KegStatus } from "@/types/keg";

const statusClasses: Record<KegStatus, string> = {
  filled: "border-emerald-300/60 bg-emerald-100/80 text-emerald-900",
  delivered: "border-sky-300/60 bg-sky-100/80 text-sky-900",
  returned: "border-lime-300/60 bg-lime-100/80 text-lime-900",
  empty: "border-amber-300/60 bg-amber-100/80 text-amber-900",
  washed: "border-cyan-300/60 bg-cyan-100/80 text-cyan-900",
  maintenance: "border-stone-300/60 bg-stone-200/75 text-stone-900",
  lost: "border-rose-300/60 bg-rose-100/80 text-rose-900",
};

const statusIcons: Record<KegStatus, typeof Beer> = {
  filled: Beer,
  delivered: Truck,
  returned: RotateCcw,
  empty: CircleOff,
  washed: Droplets,
  maintenance: Settings2,
  lost: AlertTriangle,
};

export function StatusBadge({ status }: { status: KegStatus }) {
  const Icon = statusIcons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${statusClasses[status]}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
      {status}
    </span>
  );
}
