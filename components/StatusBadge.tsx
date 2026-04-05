import { AlertTriangle, Beer, CircleOff, Droplets, Package2, RotateCcw, Settings2, Truck } from "lucide-react";

type StatusMeta = {
  className: string;
  icon: typeof Beer;
};

const STATUS_META: Record<string, StatusMeta> = {
  Available: {
    className: "border-lime-300/60 bg-lime-100/80 text-lime-900",
    icon: RotateCcw,
  },
  "Checked In": {
    className: "border-lime-300/60 bg-lime-100/80 text-lime-900",
    icon: RotateCcw,
  },
  "Checked Out": {
    className: "border-sky-300/60 bg-sky-100/80 text-sky-900",
    icon: Truck,
  },
  Delivered: {
    className: "border-sky-300/60 bg-sky-100/80 text-sky-900",
    icon: Truck,
  },
  Empty: {
    className: "border-amber-300/60 bg-amber-100/80 text-amber-900",
    icon: CircleOff,
  },
  Filled: {
    className: "border-emerald-300/60 bg-emerald-100/80 text-emerald-900",
    icon: Beer,
  },
  "In Maintenance": {
    className: "border-stone-300/60 bg-stone-200/75 text-stone-900",
    icon: Settings2,
  },
  Lost: {
    className: "border-rose-300/60 bg-rose-100/80 text-rose-900",
    icon: AlertTriangle,
  },
  Palletized: {
    className: "border-violet-300/60 bg-violet-100/80 text-violet-900",
    icon: Package2,
  },
  "Ready for Pickup": {
    className: "border-indigo-300/60 bg-indigo-100/80 text-indigo-900",
    icon: Package2,
  },
  Returned: {
    className: "border-lime-300/60 bg-lime-100/80 text-lime-900",
    icon: RotateCcw,
  },
  Washed: {
    className: "border-cyan-300/60 bg-cyan-100/80 text-cyan-900",
    icon: Droplets,
  },
};

export function StatusBadge({ status }: { status?: string | null }) {
  const label = status?.trim() || "Unknown";
  const meta = STATUS_META[label] ?? {
    className: "border-slate-300/60 bg-slate-100/80 text-slate-900",
    icon: Beer,
  };
  const Icon = meta.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${meta.className}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
      {label}
    </span>
  );
}
