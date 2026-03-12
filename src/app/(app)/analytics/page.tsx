import type { Metadata } from "next";

import { getAnalyticsPageData } from "@/lib/db/queries/analytics";
import { AnalyticsOverview } from "@/modules/analytics/components/analytics-overview";

export const metadata: Metadata = {
  title: "分析"
};

export default async function AnalyticsPage() {
  const data = await getAnalyticsPageData();

  return <AnalyticsOverview {...data} />;
}

