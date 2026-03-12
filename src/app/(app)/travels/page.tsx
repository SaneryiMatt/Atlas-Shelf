import type { Metadata } from "next";

import { getTravelsPageData } from "@/lib/db/queries/travels";
import { TravelsOverview } from "@/modules/travels/components/travels-overview";

export const metadata: Metadata = {
  title: "旅行"
};

export default async function TravelsPage() {
  const data = await getTravelsPageData();

  return <TravelsOverview {...data} />;
}

