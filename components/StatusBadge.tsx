import type { KegStatus } from "@/types/keg";

const statusClasses: Record<KegStatus, string> = {
  filled: "bg-emerald-100 text-emerald-800",
  delivered: "bg-slate-100 text-slate-800",
  returned: "bg-green-100 text-green-800",
  empty: "bg-amber-100 text-amber-800",
  maintenance: "bg-zinc-200 text-zinc-800",
  lost: "bg-rose-100 text-rose-800",
};

export function StatusBadge({ status }: { status: KegStatus }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusClasses[status]}`}>{status}</span>;
}
