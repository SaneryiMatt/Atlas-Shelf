import { dashboardFocusItems, dashboardRecentMoments, dashboardStats } from "@/lib/db/mock-data";
import { databaseAvailable } from "@/lib/db/client";

export async function getDashboardPageData() {
  if (databaseAvailable) {
    // TODO: Replace with live aggregate queries once authentication and tenancy are configured.
  }

  return {
    stats: dashboardStats,
    focusItems: dashboardFocusItems,
    recentMoments: dashboardRecentMoments
  };
}

