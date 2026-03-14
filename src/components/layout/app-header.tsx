"use client";

import { useState } from "react";
import { Bell, Menu, Search, Settings } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { SidebarContent } from "@/components/layout/app-sidebar";
import { NavSearch } from "@/components/shared/nav-search";
import { SettingsModal } from "@/components/settings/settings-modal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { AppUserSummary } from "@/lib/auth";

interface AppHeaderProps {
  user: AppUserSummary;
}

export function AppHeader({ user }: AppHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between border-b border-border px-4 lg:px-6">
        <div className="flex items-center">
          <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden">
                <Menu className="size-5" />
                <span className="sr-only">打开导航</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="left-0 top-0 h-screen w-[280px] max-w-[280px] translate-x-0 translate-y-0 rounded-none border-l-0 border-t-0 border-b-0 p-4 data-[state=open]:slide-in-from-left">
              <DialogHeader className="sr-only">
                <DialogTitle>导航菜单</DialogTitle>
              </DialogHeader>
              <div className="flex h-full flex-col">
                <SidebarContent user={user} onNavigate={() => setDrawerOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2">
          <NavSearch className="hidden md:block md:w-72 lg:w-80" />

          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="size-5" />
            <span className="sr-only">搜索</span>
          </Button>

          <Button variant="ghost" size="icon">
            <Bell className="size-5" />
            <span className="sr-only">通知</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} className="hidden xl:flex">
            <Settings className="size-5" />
            <span className="sr-only">设置</span>
          </Button>

          <div className="flex items-center gap-2 border-l border-border pl-2">
            <span className="hidden text-sm text-muted-foreground lg:inline-block">
              {user.email ?? user.displayName}
            </span>
            <SignOutButton />
          </div>
        </div>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} user={user} />
    </header>
  );
}
