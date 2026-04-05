export const dynamic = "force-dynamic";

import { KegCard } from "@/components/KegCard";
import { getKegs } from "@/lib/firestore";

export default async function KegsPage() {
  const kegs = await getKegs();

  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-bold">Kegs</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {kegs.map((keg) => (
          <KegCard key={keg.id} keg={keg} />
        ))}
      </div>
    </main>
  );
}
