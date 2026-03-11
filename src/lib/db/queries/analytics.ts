import {
  analyticsByRegion,
  analyticsByType,
  analyticsInsights,
  analyticsMetrics
} from "@/lib/db/mock-data";
import { databaseAvailable } from "@/lib/db/client";

export async function getAnalyticsPageData() {
  if (databaseAvailable) {
    // TODO: Replace with aggregated rollups and materialized analytics views when live data is available.
  }

  return {
    metrics: analyticsMetrics,
    byType: analyticsByType,
    byRegion: analyticsByRegion,
    insights: analyticsInsights
  };
}

