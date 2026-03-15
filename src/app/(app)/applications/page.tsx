import type { Metadata } from "next";

import { getApplicationsPageData } from "@/lib/db/queries/applications";
import { ApplicationsOverview } from "@/modules/applications/components/applications-overview";

export const metadata: Metadata = {
  title: "投递"
};

export default async function ApplicationsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const data = await getApplicationsPageData(params);

  return <ApplicationsOverview {...data} />;
}
