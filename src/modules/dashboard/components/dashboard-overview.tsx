import Link from "next/link";
import { ArrowRight, BookOpen, Clapperboard, Compass, Minus, TrendingDown, TrendingUp } from "lucide-react";

import { timelineFeatureEnabled } from "@/config/features";
import { TimelineFeed } from "@/components/shared/timeline-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DashboardStat, QueueItem, TimelineEvent } from "@/lib/types/items";
import { cn } from "@/lib/utils";

const queueBadgeVariant = {
  book: "default",
  screen: "outline",
  travel: "success"
} as const;

const queueTypeLabel = {
  book: "书籍",
  screen: "影视",
  travel: "旅行"
} as const;

const queueDetailHref = {
  book: (id: string) => `/books/${id}`,
  screen: (id: string) => `/movies/${id}`,
  travel: (id: string) => `/travels/${id}`
} as const;

const summaryCardCopy = [
  {
    label: "最近在进行",
    detail: "把正在读、在看和准备出发的内容放在一起。"
  },
  {
    label: "最近完成",
    detail: "用更轻的方式回看你最近的节奏。"
  },
  {
    label: "想法清单",
    detail: "把想读、想看、想去的内容继续收拢到同一个地方。"
  }
] as const;

const quickLinks = [
  {
    title: "整理书籍",
    description: "继续记录在读和想读内容。",
    href: "/books",
    icon: BookOpen
  },
  {
    title: "更新影视",
    description: "补上评分、标签和观后感。",
    href: "/movies",
    icon: Clapperboard
  },
  {
    title: "查看旅行",
    description: "整理准备去的地方和最近回忆。",
    href: "/travels",
    icon: Compass
  }
] as const;

interface DashboardOverviewProps {
  stats: DashboardStat[];
  focusItems: QueueItem[];
  recentMoments: TimelineEvent[];
}

function StatCard({ label, value, detail, trend }: { label: string; value: string; detail: string; trend: string }) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground";

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent/30">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <TrendIcon className={cn("size-4", trendColor)} />
      </div>
      <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function DashboardOverview({ stats, focusItems, recentMoments }: DashboardOverviewProps) {
  const summaryStats = summaryCardCopy.map((copy, index) => ({
    label: copy.label,
    value: stats[index]?.value ?? "0",
    detail: copy.detail,
    trend: stats[index]?.trend ?? "steady"
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-foreground">把最近想看、在读和想去的地方放在一起</h2>
          <p className="mt-1 text-sm text-muted-foreground">今天从一本书、一部电影或一次旅行开始。</p>
        </div>
        <div className="flex gap-3">
          <Button asChild size="sm">
            <Link href="/books">
              去记录书籍
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/travels">查看旅行清单</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <SectionCard title="快捷入口" description="从这里继续浏览最常用的内容区">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-4 rounded-lg border border-border bg-background p-4 transition-all hover:border-foreground/20 hover:bg-accent/50"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-foreground">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
              </Link>
            );
          })}
        </div>
      </SectionCard>

      <div className={cn("grid gap-6", timelineFeatureEnabled ? "lg:grid-cols-2" : "lg:grid-cols-1")}>
        <SectionCard title="正在进行" description="继续推进最近最重要的内容">
          <div className="space-y-3">
            {focusItems.map((item) => (
              <Link
                key={item.id}
                href={queueDetailHref[item.type](item.id)}
                className="block rounded-lg border border-border bg-background p-4 transition-all hover:border-foreground/20 hover:bg-accent/50"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <Badge variant={queueBadgeVariant[item.type]} className="text-xs">
                    {item.status}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {queueTypeLabel[item.type]}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
                {item.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        </SectionCard>

        {timelineFeatureEnabled ? (
          <SectionCard title="最近动态" description="回看最近记录">
            <TimelineFeed events={recentMoments} />
          </SectionCard>
        ) : null}
      </div>
    </div>
  );
}
