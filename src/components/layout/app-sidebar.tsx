"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { useState } from "react";

import { primaryNavigation, productName, productTagline } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { SettingsModal } from "@/components/settings/settings-modal";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      {/* Logo 区域 */}
      <div className="space-y-1">
        <Link href="/" className="text-xl font-semibold text-foreground" onClick={onNavigate}>
          {productName}
        </Link>
        <p className="text-xs text-muted-foreground">{productTagline}</p>
      </div>

      {/* 主导航 */}
      <nav className="mt-5 flex flex-col gap-1">
        {primaryNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* 底部设置按钮 */}
      <div className="mt-auto pt-4">
        <div className="h-px bg-border/60 mb-4" />
        <button
          onClick={() => setSettingsOpen(true)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <Settings className="size-4" />
          设置
        </button>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="sticky top-0 flex h-screen flex-col gap-3 bg-background p-4">
      <SidebarContent />
    </aside>
  );
}
