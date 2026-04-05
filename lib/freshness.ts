export type FreshnessStatus = "fresh" | "near-expiry" | "expired" | "unknown";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function parseBestBefore(bestBefore?: string | null) {
  if (!bestBefore) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(bestBefore)) {
    return new Date(`${bestBefore}T23:59:59.999`);
  }

  const parsed = new Date(bestBefore);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getFreshnessStatus(bestBefore?: string | null, now = new Date()): FreshnessStatus {
  const parsedBestBefore = parseBestBefore(bestBefore);
  if (!parsedBestBefore) {
    return "unknown";
  }

  const remainingMs = parsedBestBefore.getTime() - now.getTime();

  if (remainingMs < 0) {
    return "expired";
  }

  if (remainingMs <= THREE_DAYS_MS) {
    return "near-expiry";
  }

  return "fresh";
}

export function getFreshnessMeta(bestBefore?: string | null, now = new Date()) {
  const status = getFreshnessStatus(bestBefore, now);

  switch (status) {
    case "fresh":
      return {
        status,
        label: "Fresh",
        accentClassName: "border-emerald-200 bg-emerald-50 text-emerald-800",
      };
    case "near-expiry":
      return {
        status,
        label: "Near expiry",
        accentClassName: "border-amber-200 bg-amber-50 text-amber-800",
      };
    case "expired":
      return {
        status,
        label: "Expired",
        accentClassName: "border-rose-200 bg-rose-50 text-rose-800",
      };
    default:
      return {
        status,
        label: "Not set",
        accentClassName: "border-slate-200 bg-slate-50 text-slate-700",
      };
  }
}
