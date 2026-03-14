import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireUser, toAppUserSummary } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return <AppShell user={toAppUserSummary(user)}>{children}</AppShell>;
}
