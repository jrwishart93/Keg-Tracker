import Image from "next/image";
import type { Movement } from "@/types/movement";

export function MovementLog({ movements }: { movements: Movement[] }) {
  if (movements.length === 0) {
    return (
      <div className="editorial-panel relative overflow-hidden p-3">
        <div className="relative h-40 w-full overflow-hidden rounded-lg">
          <Image
            src="https://beffect.nz/cdn/shop/files/201116_MCH0001-2-3-scaled.webp?v=1668481791&width=535"
            alt="No activity yet"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,29,37,0.18),rgba(20,29,37,0.72))]" />
          <p className="absolute bottom-3 left-3 text-sm font-semibold text-white">Ready to scan kegs.</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="stagger-list space-y-3">
      {movements.map((movement) => (
        <li key={movement.id} className="editorial-panel card-hover p-4 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="section-kicker">Movement</p>
              <p className="mt-2 text-xl font-semibold capitalize text-[color:var(--ink)]">{movement.scanType}</p>
            </div>
            <span className="badge-chip px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ink)]">
              {movement.timestamp ? new Date(movement.timestamp).toLocaleDateString() : "Recorded"}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="section-kicker">Keg</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{movement.kegId}</p>
            </div>
            <div>
              <p className="section-kicker">By</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{movement.updatedBy}</p>
            </div>
            <div>
              <p className="section-kicker">Route</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {movement.fromLocation ?? "Unknown"} to {movement.toLocation ?? "Current location"}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
