export const dynamic = "force-dynamic";

import { PublicKegClient } from "@/components/PublicKegClient";

export default async function PublicKegPage({ params }: { params: Promise<{ kegId: string }> }) {
  const { kegId } = await params;
  return <PublicKegClient kegId={kegId} />;
}
