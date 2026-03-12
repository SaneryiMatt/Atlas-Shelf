import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { analyticsFeatureEnabled } from "@/config/features";
import { getAnalyticsPageData } from "@/lib/db/queries/analytics";
import { AnalyticsOverview } from "@/modules/analytics/components/analytics-overview";

export const metadata: Metadata = {
  title: "分析"
};

export default async function AnalyticsPage() {
  if (!analyticsFeatureEnabled) {
    notFound();
  }

  const data = await getAnalyticsPageData();

  return <AnalyticsOverview {...data} />;
}
