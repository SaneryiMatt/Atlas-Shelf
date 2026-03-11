import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-page-glow px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1480px] gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <AppSidebar />
        <div className="space-y-6">
          <AppHeader />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}

