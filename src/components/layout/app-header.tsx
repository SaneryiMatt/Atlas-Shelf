"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { getPageHeaderMeta } from "@/config/navigation";
import { SidebarContent } from "@/components/layout/app-sidebar";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { GlobalSearchForm } from "@/components/shared/global-search-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AppHeaderProps {
  userEmail: string;
}

export function AppHeader({ userEmail }: AppHeaderProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pageMeta = getPageHeaderMeta(pathname);

  return (
    <header className="rounded-[2rem] border border-white/50 bg-white/80 p-5 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="xl:hidden">
                  <Menu className="size-4" />
                  <span className="sr-only">打开导航</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="left-0 top-0 h-screen w-[88vw] max-w-[320px] translate-x-0 translate-y-0 rounded-none rounded-r-[2rem] border-b-0 border-l-0 border-r border-t-0 p-6">
                <DialogHeader className="sr-only">
                  <DialogTitle>导航菜单</DialogTitle>
                </DialogHeader>
                <div className="flex h-full flex-col gap-6">
                  <SidebarContent onNavigate={() => setDrawerOpen(false)} />
                </div>
              </DialogContent>
            </Dialog>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{pageMeta.description}</p>
              <h1 className="font-serif text-3xl text-foreground sm:text-4xl">{pageMeta.title}</h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 xl:flex">
            <Badge variant="secondary" className="max-w-[220px] truncate">
              {userEmail}
            </Badge>
            <SignOutButton />
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-xl">
            <GlobalSearchForm compact />
          </div>

          <div className="flex items-center gap-3 xl:hidden">
            <Badge variant="secondary" className="max-w-[220px] truncate">
              {userEmail}
            </Badge>
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
