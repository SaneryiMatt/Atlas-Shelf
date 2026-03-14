import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import type { AppUserSummary } from "@/lib/auth";

interface AppShellProps {
  children: ReactNode;
  user: AppUserSummary;
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-64 shrink-0 border-r border-border xl:block">
        <AppSidebar user={user} />
      </div>

      <div className="flex flex-1 flex-col">
        <AppHeader user={user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
