import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

interface AppShellProps {
  children: ReactNode;
  userEmail: string;
}

export function AppShell({ children, userEmail }: AppShellProps) {
  return (
    <div className="min-h-screen bg-page-glow px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div className="mx-auto grid max-w-[1440px] gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="hidden xl:block">
          <AppSidebar />
        </div>

        <div className="min-w-0 space-y-5">
          <AppHeader userEmail={userEmail} />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
