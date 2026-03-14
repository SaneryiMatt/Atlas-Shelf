import {
  analyticsByRegion,
  analyticsByType,
  analyticsInsights,
  analyticsMetrics
} from "@/lib/db/mock-data";

export async function getAnalyticsPageData() {
  return {
    metrics: analyticsMetrics,
    byType: analyticsByType,
    byRegion: analyticsByRegion,
    insights: analyticsInsights
  };
}