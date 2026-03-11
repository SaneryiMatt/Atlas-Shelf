import { getDashboardPageData } from "@/lib/db/queries/dashboard";
import { DashboardOverview } from "@/modules/dashboard/components/dashboard-overview";

export default async function DashboardPage() {
  const data = await getDashboardPageData();

  return <DashboardOverview {...data} />;
}

