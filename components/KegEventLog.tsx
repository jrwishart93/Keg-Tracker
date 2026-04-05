import Image from "next/image";
import type { KegEvent } from "@/types/keg-event";

function formatTimestamp(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function stringMetadata(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function summarizeMetadata(event: KegEvent) {
  const metadata = event.metadata;

  switch (event.type) {
    case "CHANGE_RETURN_LOCATION": {
      const previous = stringMetadata(metadata, "previousReturnLocation") ?? "Not set";
      const next = stringMetadata(metadata, "newReturnLocation") ?? "Not set";
      return `${previous} -> ${next}`;
    }
    case "CHANGE_SERIAL_NUMBER": {
      const previous = stringMetadata(metadata, "previousSerialNumber") ?? "Not set";
      const next = stringMetadata(metadata, "newSerialNumber") ?? "Not set";
      return `${previous} -> ${next}`;
    }
    case "CHANGE_ASSET_NUMBER": {
      const previous = stringMetadata(metadata, "previousAssetNumber") ?? "Not set";
      const next = stringMetadata(metadata, "newAssetNumber") ?? "Not set";
      return `${previous} -> ${next}`;
    }
    case "CHANGE_OF_OWNER": {
      const previous = stringMetadata(metadata, "previousOwnerName") ?? "Not set";
      const next = stringMetadata(metadata, "newOwnerName") ?? "Not set";
      return `${previous} -> ${next}`;
    }
    case "CHANGE_OF_LEASE": {
      const previous = stringMetadata(metadata, "previousLeaseName") ?? "Not set";
      const next = stringMetadata(metadata, "newLeaseName") ?? "Not set";
      return `${previous} -> ${next}`;
    }
    case "CHANGE_DATE_OF_MANUFACTURE": {
      const previous = stringMetadata(metadata, "previousDateOfManufacture") ?? "Not set";
      const next = stringMetadata(metadata, "newDateOfManufacture") ?? "Not set";
      return `${previous} -> ${next}`;
    }
    case "FILL": {
      const details = [
        stringMetadata(metadata, "productName"),
        stringMetadata(metadata, "batchNumber"),
        stringMetadata(metadata, "bestBeforeDate") ? `Best before ${stringMetadata(metadata, "bestBeforeDate")}` : null,
      ].filter(Boolean);

      return details.join(" | ") || null;
    }
    default: {
      const entries = Object.entries(metadata)
        .map(([key, value]) => {
          if (typeof value !== "string" || value.trim().length === 0) {
            return null;
          }

          return `${key.replace(/([A-Z])/g, " $1").replace(/^./, (match) => match.toUpperCase())}: ${value.trim()}`;
        })
        .filter(Boolean);

      return entries[0] ?? null;
    }
  }
}

export function KegEventLog({ events }: { events: KegEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="editorial-panel relative overflow-hidden p-3">
        <div className="relative h-40 w-full overflow-hidden rounded-lg">
          <Image
            src="https://beffect.nz/cdn/shop/files/201116_MCH0001-2-3-scaled.webp?v=1668481791&width=535"
            alt="No keg history yet"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,29,37,0.18),rgba(20,29,37,0.72))]" />
          <p className="absolute bottom-3 left-3 text-sm font-semibold text-white">No keg events recorded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="stagger-list space-y-3">
      {events.map((event) => {
        const metadataSummary = summarizeMetadata(event);

        return (
          <li key={event.id} className="editorial-panel card-hover p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="section-kicker">Event</p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--ink)]">{event.label}</p>
              </div>
              <span className="badge-chip px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ink)]">
                {formatTimestamp(event.timestamp)}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="section-kicker">By</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{event.userName ?? "Unknown user"}</p>
              </div>
              {metadataSummary ? (
                <div>
                  <p className="section-kicker">Summary</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{metadataSummary}</p>
                </div>
              ) : null}
            </div>
            {event.notes ? <p className="mt-4 text-sm text-slate-600">{event.notes}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
