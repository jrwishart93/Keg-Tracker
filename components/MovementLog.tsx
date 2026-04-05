import Image from "next/image";
import type { Movement } from "@/types/movement";

export function MovementLog({ movements }: { movements: Movement[] }) {
  if (movements.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3">
        <div className="relative h-40 w-full overflow-hidden rounded-lg">
          <Image
            src="https://beffect.nz/cdn/shop/files/201116_MCH0001-2-3-scaled.webp?v=1668481791&width=535"
            alt="No activity yet"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#131E29]/50" />
          <p className="absolute bottom-3 left-3 text-sm font-semibold text-white">Ready to scan kegs.</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {movements.map((movement) => (
        <li key={movement.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
          <p className="font-semibold capitalize text-[#131E29]">{movement.scanType}</p>
          <p className="text-slate-700">Keg: {movement.kegId}</p>
          <p className="text-slate-700">By: {movement.updatedBy}</p>
        </li>
      ))}
    </ul>
  );
}
