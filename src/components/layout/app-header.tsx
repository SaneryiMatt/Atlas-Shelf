"use client";

import { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { getPageHeaderMeta, primaryNavigation } from "@/config/navigation";
import { SidebarContent } from "@/components/layout/app-sidebar";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { NavSearch } from "@/components/shared/nav-search";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AppHeaderProps {
  userEmail: string;
}

export function AppHeader({ userEmail }: AppHeaderProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pageMeta = getPageHeaderMeta(pathname);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* 顶部导航栏 */}
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {/* 移动端菜单按钮 */}
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
                <SidebarContent onNavigate={() => setDrawerOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>

          {/* 桌面端 Tab 导航 */}
          <nav className="hidden items-center gap-1 xl:flex">
            {primaryNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors rounded-md",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.title}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-2">
          {/* 搜索框 */}
          <NavSearch className="hidden md:block" />

          {/* 搜索按钮 (移动端) */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="size-5" />
            <span className="sr-only">搜索</span>
          </Button>

          {/* 通知按钮 */}
          <Button variant="ghost" size="icon">
            <Bell className="size-5" />
            <span className="sr-only">通知</span>
          </Button>

          {/* 用户信息 */}
          <div className="flex items-center gap-2 border-l border-border pl-2">
            <span className="hidden text-sm text-muted-foreground lg:inline-block">
              {userEmail}
            </span>
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* 页面标题区 */}
      <div className="border-t border-border bg-card/50 px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{pageMeta.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{pageMeta.description}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
