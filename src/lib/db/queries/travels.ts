import { activeTrips, travelArchive, travelStats } from "@/lib/db/mock-data";
import { databaseAvailable } from "@/lib/db/client";

export async function getTravelsPageData() {
  if (databaseAvailable) {
    // TODO: Hydrate from travel_details joined to items once the project is connected to Postgres.
  }

  return {
    stats: travelStats,
    activeTrips,
    archive: travelArchive
  };
}

