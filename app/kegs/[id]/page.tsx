export const dynamic = "force-dynamic";

import { KegDetailPageClient } from "@/components/KegDetailPageClient";

export default async function KegDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KegDetailPageClient kegId={id} />;
}
