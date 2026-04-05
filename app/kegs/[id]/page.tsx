export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { KegDetailClient } from "@/components/KegDetailClient";
import { getKegById } from "@/lib/firestore";

export default async function KegDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const keg = await getKegById(id);
  if (!keg) notFound();

  return <KegDetailClient keg={keg} />;
}
