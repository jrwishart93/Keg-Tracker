export const dynamic = "force-dynamic";

import { DashboardClient } from "@/components/DashboardClient";
import { getKegs } from "@/lib/firestore";

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
  const [filters, kegs] = await Promise.all([searchParams, getKegs()]);
  return <DashboardClient initialKegs={kegs} filters={filters} />;
}
