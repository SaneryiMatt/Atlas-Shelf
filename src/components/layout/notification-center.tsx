"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, CircleDot } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationCenterData, NotificationItem, NotificationStatus } from "@/lib/types/items";
import { markNotificationProcessedAction, markNotificationReadAction } from "@/modules/notifications/actions";

interface NotificationCenterProps {
  data: NotificationCenterData;
}

type NotificationAction = (formData: FormData) => Promise<void>;

const sourceTypeLabels = {
  book: "书籍",
  screen: "影视",
  travel: "旅行"
} as const;

function getSourceVariant(sourceType: NotificationItem["sourceType"]) {
  if (sourceType === "travel") {
    return "success" as const;
  }

  if (sourceType === "screen") {
    return "secondary" as const;
  }

  return "default" as const;
}

function getStatusVariant(status: NotificationStatus) {
  if (status === "active") {
    return "warm" as const;
  }

  if (status === "processed") {
    return "secondary" as const;
  }

  return "outline" as const;
}

function NotificationActionButton({
  action,
  label,
  notificationKey,
  variant = "ghost"
}: {
  action: NotificationAction;
  label: string;
  notificationKey: string;
  variant?: "ghost" | "outline";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="notificationKey" value={notificationKey} />
      <Button type="submit" variant={variant} size="sm">
        {label}
      </Button>
    </form>
  );
}

export function NotificationCenter({ data }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative"
      >
        <Bell className="size-5" />
        <span className="sr-only">通知</span>
        {data.unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-semibold leading-5 text-black">
            {data.unreadCount > 99 ? "99+" : data.unreadCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div
          className={cn(
            "absolute right-0 top-full z-40 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl",
            "ring-1 ring-white/[0.05]"
          )}
        >
          <div className="border-b border-border/40 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">通知中心</p>
                <p className="text-xs text-muted-foreground">
                  {data.unreadCount > 0 ? `还有 ${data.unreadCount} 条提醒待处理` : "最近通知都已处理完毕"}
                </p>
              </div>
              <Badge variant={data.unreadCount > 0 ? "warm" : "outline"} className="gap-1.5">
                <CircleDot className="size-3" />
                {data.unreadCount}
              </Badge>
            </div>
          </div>

          <div className="max-h-[28rem] overflow-y-auto p-3">
            {!data.canManage && data.items.length ? (
              <div className="mb-3 rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
                当前为预览通知。数据库迁移完成后，支持标记已读和已处理。
              </div>
            ) : null}

            {data.items.length ? (
              <div className="space-y-3">
                {data.items.map((item) => (
                  <div key={item.key} className="rounded-xl border border-border/40 bg-background/40 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getSourceVariant(item.sourceType)}>{sourceTypeLabels[item.sourceType]}</Badge>
                      <Badge variant={getStatusVariant(item.status)}>{item.statusLabel}</Badge>
                    </div>

                    <div className="mt-3 space-y-1">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.meta}</span>
                      <span>·</span>
                      <span>{item.triggeredAtLabel}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={item.href} onClick={() => setOpen(false)}>
                          去查看
                        </Link>
                      </Button>

                      {data.canManage && item.status === "active" ? (
                        <NotificationActionButton
                          action={markNotificationReadAction}
                          label="标为已读"
                          notificationKey={item.key}
                        />
                      ) : null}

                      {data.canManage && item.status !== "processed" ? (
                        <NotificationActionButton
                          action={markNotificationProcessedAction}
                          label={item.status === "active" ? "已处理" : "完成处理"}
                          notificationKey={item.key}
                          variant="outline"
                        />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-background/30 px-6 py-10 text-center">
                <CheckCheck className="size-6 text-muted-foreground/60" />
                <p className="mt-3 text-sm font-medium text-foreground">暂无通知</p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  当前没有需要提醒的书籍、影视或旅行计划。
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
