import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

interface AppShellProps {
  children: ReactNode;
  userEmail: string;
}

export function AppShell({ children, userEmail }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* 固定侧边栏 */}
      <div className="hidden w-64 shrink-0 border-r border-border xl:block">
        <AppSidebar />
      </div>

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col">
        <AppHeader userEmail={userEmail} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
