import { timelineEvents } from "@/lib/db/mock-data";
import { databaseAvailable } from "@/lib/db/client";

export async function getTimelinePageData() {
  if (databaseAvailable) {
    // TODO: Compose a unified chronological query across media and travel milestones.
  }

  return {
    events: timelineEvents
  };
}

