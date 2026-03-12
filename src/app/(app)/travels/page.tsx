import type { Metadata } from "next";

import { getTravelsPageData } from "@/lib/db/queries/travels";
import { TravelsOverview } from "@/modules/travels/components/travels-overview";

export const metadata: Metadata = {
  title: "旅行"
};

export default async function TravelsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const data = await getTravelsPageData(params);

  return <TravelsOverview {...data} />;
}
