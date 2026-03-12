import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
// 暂时注释掉认证，方便前端开发
// import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // 暂时跳过认证检查
  // const user = await requireUser();
  const mockUserEmail = "dev@example.com"; // 模拟用户邮箱

  return <AppShell userEmail={mockUserEmail}>{children}</AppShell>;
}
