import type { KegStatus } from "@/types/keg";

const statusClasses: Record<KegStatus, string> = {
  on_site: "bg-emerald-100 text-emerald-700",
  off_site: "bg-sky-100 text-sky-700",
  empty: "bg-amber-100 text-amber-700",
  maintenance: "bg-violet-100 text-violet-700",
  lost: "bg-rose-100 text-rose-700",
  ready_for_pickup: "bg-indigo-100 text-indigo-700",
};

export function StatusBadge({ status }: { status: KegStatus }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusClasses[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
