import type { Metadata } from "next";

import { getTimelinePageData } from "@/lib/db/queries/timeline";
import { TimelineOverview } from "@/modules/timeline/components/timeline-overview";

export const metadata: Metadata = {
  title: "Timeline"
};

export default async function TimelinePage() {
  const data = await getTimelinePageData();

  return <TimelineOverview {...data} />;
}

