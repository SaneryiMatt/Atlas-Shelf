import Link from "next/link";
import { ArrowRight, BookOpen, Clapperboard, Compass } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { TimelineFeed } from "@/components/shared/timeline-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DashboardStat, QueueItem, TimelineEvent } from "@/lib/types/items";

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

export function DashboardOverview({ stats, focusItems, recentMoments }: DashboardOverviewProps) {
  const summaryStats = summaryCardCopy.map((copy, index) => ({
    label: copy.label,
    value: stats[index]?.value ?? "0",
    detail: copy.detail,
    trend: stats[index]?.trend ?? "steady"
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="首页"
        title="把最近想看、在读和想去的地方放在一起"
        description="今天从一本书、一部电影或一次旅行开始，所有记录都会在这里汇总。"
        actions={
          <>
            <Button asChild className="gap-2">
              <Link href="/books">
                去记录书籍
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/travels">
                查看旅行清单
                <Compass className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {summaryStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <SectionCard title="快捷入口" description="从这里继续浏览最常用的内容区。">
        <div className="grid gap-4 md:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-3xl border border-border/60 bg-background/70 p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background/90"
              >
                <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground transition group-hover:text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                  进入
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </SectionCard>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="正在进行" description="继续推进最近最重要的内容，不必在多个地方来回切换。">
          <div className="space-y-4">
            {focusItems.map((item) => (
              <Link
                key={item.id}
                href={queueDetailHref[item.type](item.id)}
                className="block rounded-3xl border border-border/60 bg-background/70 p-5 transition hover:border-primary/40 hover:bg-background/90"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <Badge variant={queueBadgeVariant[item.type]}>{item.status}</Badge>
                  <Badge variant="secondary">{queueTypeLabel[item.type]}</Badge>
                  <span className="text-sm text-muted-foreground">{item.meta}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                {item.tags.length ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 text-sm font-medium text-primary">
                  去查看{queueTypeLabel[item.type]}
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="最近动态" description="回看最近记录，方便继续上次停下来的地方。">
          <TimelineFeed events={recentMoments} />
        </SectionCard>
      </section>
    </div>
  );
}
