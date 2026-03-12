"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { primaryNavigation, productName, productTagline, quickAccessLinks } from "@/config/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  return (
    <>
      <div className="space-y-3">
        <Badge variant="warm" className="w-fit">
          记录日常
        </Badge>
        <div className="space-y-2">
          <Link href="/" className="font-serif text-3xl text-foreground" onClick={onNavigate}>
            {productName}
          </Link>
          <p className="text-sm leading-6 text-muted-foreground">{productTagline}</p>
        </div>
      </div>

      <nav className="grid gap-2">
        {primaryNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group rounded-2xl border px-4 py-3 transition-colors",
                active
                  ? "border-primary/20 bg-primary/10"
                  : "border-transparent bg-transparent hover:border-border hover:bg-background/70"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-2xl",
                    active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs leading-5 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-border/60 bg-background/70 p-5">
        <p className="text-sm font-medium text-foreground">快捷入口</p>
        <div className="mt-4 grid gap-2">
          {quickAccessLinks.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function AppSidebar() {
  return (
    <aside className="flex h-full flex-col gap-6 rounded-[2rem] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(244,242,235,0.88))] p-6 shadow-soft">
      <SidebarContent />
    </aside>
  );
}
