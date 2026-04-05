import type { Movement } from "@/types/movement";

export function MovementLog({ movements }: { movements: Movement[] }) {
  return (
    <ul className="space-y-2">
      {movements.map((movement) => (
        <li key={movement.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
          <p className="font-semibold capitalize">{movement.scanType}</p>
          <p className="text-slate-600">Keg: {movement.kegId}</p>
          <p className="text-slate-600">By: {movement.updatedBy}</p>
        </li>
      ))}
    </ul>
  );
}
