import { currentScreens, screenBacklog, screenStats } from "@/lib/db/mock-data";
import { databaseAvailable } from "@/lib/db/client";

export async function getMoviesPageData() {
  if (databaseAvailable) {
    // TODO: Hydrate from screen_details joined to items once the project is connected to Postgres.
  }

  return {
    stats: screenStats,
    currentScreens,
    backlog: screenBacklog
  };
}

