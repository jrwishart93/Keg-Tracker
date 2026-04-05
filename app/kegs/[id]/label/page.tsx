export const dynamic = "force-dynamic";

import { KegLabelClient } from "@/components/KegLabelClient";

export default async function KegLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KegLabelClient kegId={id} />;
}
