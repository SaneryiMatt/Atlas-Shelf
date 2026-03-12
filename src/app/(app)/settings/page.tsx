import type { Metadata } from "next";

import { getSettingsPageData } from "@/lib/db/queries/settings";
import { SettingsOverview } from "@/modules/settings/components/settings-overview";

export const metadata: Metadata = {
  title: "设置"
};

export default async function SettingsPage() {
  const data = await getSettingsPageData();

  return <SettingsOverview {...data} />;
}

