import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireUser, toAppUserSummary } from "@/lib/auth";
import { getNotificationCenterData } from "@/lib/db/queries/notifications";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const notificationCenter = await getNotificationCenterData();

  return (
    <AppShell user={toAppUserSummary(user)} notificationCenter={notificationCenter}>
      {children}
    </AppShell>
  );
}