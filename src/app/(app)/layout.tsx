import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
// import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // 临时注释掉认证，方便前端开发
  // const user = await requireUser();

  return <AppShell userEmail={"开发模式"}>{children}</AppShell>;
}
