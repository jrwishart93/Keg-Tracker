import { getFreshnessMeta } from "@/lib/freshness";

export function FreshnessBadge({ bestBefore }: { bestBefore?: string | null }) {
  const freshness = getFreshnessMeta(bestBefore);

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${freshness.accentClassName}`}>
      {freshness.label}
    </span>
  );
}
