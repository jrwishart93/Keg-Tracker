export const dynamic = "force-dynamic";

import { DashboardClient } from "@/components/DashboardClient";

type DashboardSearchParams = {
  customer?: string;
  product?: string;
  location?: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const filters = await searchParams;
  return <DashboardClient filters={filters} />;
}
