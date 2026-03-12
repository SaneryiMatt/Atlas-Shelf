import type { Metadata } from "next";

import { getGlobalSearchData } from "@/lib/db/queries/search";
import { SearchOverview } from "@/modules/search/components/search-overview";

export const metadata: Metadata = {
  title: "全局搜索"
};

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const data = await getGlobalSearchData(params.q);

  return <SearchOverview {...data} />;
}
