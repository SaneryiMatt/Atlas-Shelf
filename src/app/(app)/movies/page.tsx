import type { Metadata } from "next";

import { getMoviesPageData } from "@/lib/db/queries/movies";
import { MoviesOverview } from "@/modules/movies/components/movies-overview";

export const metadata: Metadata = {
  title: "影视"
};

export default async function MoviesPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const data = await getMoviesPageData(params);

  return <MoviesOverview {...data} />;
}
