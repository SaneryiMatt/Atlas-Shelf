"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigation, productBadge, productTagline, workspaceHighlights } from "@/config/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const BadgeIcon = productBadge.icon;

  return (
    <aside className="flex h-full flex-col gap-6 rounded-[2rem] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(244,242,235,0.88))] p-6 shadow-soft">
      <div className="space-y-4">
        <Badge variant="warm" className="w-fit gap-2">
          <BadgeIcon className="size-3.5" />
          {productBadge.label}
        </Badge>
        <div className="space-y-2">
          <Link href="/" className="font-serif text-3xl text-foreground">
            Atlas Shelf
          </Link>
          <p className="text-sm leading-6 text-muted-foreground">{productTagline}</p>
        </div>
      </div>

      <nav className="grid gap-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group rounded-2xl border px-4 py-3 transition-colors",
                isActive
                  ? "border-primary/20 bg-primary/10"
                  : "border-transparent bg-transparent hover:border-border hover:bg-background/70"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-2xl",
                    isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
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
        <p className="text-sm font-medium text-foreground">架构约束</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          {workspaceHighlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

