import type { Metadata } from "next";

import { getMoviesPageData } from "@/lib/db/queries/movies";
import { MoviesOverview } from "@/modules/movies/components/movies-overview";

export const metadata: Metadata = {
  title: "Movies"
};

export default async function MoviesPage() {
  const data = await getMoviesPageData();

  return <MoviesOverview {...data} />;
}

