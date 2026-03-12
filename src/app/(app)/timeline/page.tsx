import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { timelineFeatureEnabled } from "@/config/features";
import { getTimelinePageData } from "@/lib/db/queries/timeline";
import { TimelineOverview } from "@/modules/timeline/components/timeline-overview";

export const metadata: Metadata = {
  title: "时间线"
};

export default async function TimelinePage() {
  if (!timelineFeatureEnabled) {
    notFound();
  }

  const data = await getTimelinePageData();

  return <TimelineOverview {...data} />;
}
