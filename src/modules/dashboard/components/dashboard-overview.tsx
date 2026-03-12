import Link from "next/link";
import { ArrowRight, BookOpen, Clapperboard, Sparkles, TimerReset } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { SimpleColumnChart } from "@/components/shared/simple-column-chart";
import { SimpleDonutChart } from "@/components/shared/simple-donut-chart";
import { TimelineFeed } from "@/components/shared/timeline-feed";
import { Badge } from "@/components/ui/badge";
import type { DashboardAnalyticsData, DashboardStat, QueueItem, TimelineEvent } from "@/lib/types/items";

const queueBadgeVariant = {
  book: "warm",
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

const statIcons = [BookOpen, Clapperboard, Sparkles] as const;

interface DashboardOverviewProps {
  stats: DashboardStat[];
  focusItems: QueueItem[];
  recentMoments: TimelineEvent[];
  analytics: DashboardAnalyticsData;
}

function DashboardStatCard({ label, value, detail, index }: DashboardStat & { index: number }) {
  const Icon = statIcons[index] ?? Sparkles;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="rounded-full border border-border bg-background/80 p-2 text-muted-foreground">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}

export function DashboardOverview({ stats, focusItems, recentMoments, analytics }: DashboardOverviewProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="把当前推进的内容和关键分析收进同一个首页"
        description="首页只保留最重要的四块内容：关键统计、当前在读与在看、年度分析，以及最近时间线。"
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <DashboardStatCard key={stat.label} {...stat} index={index} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="当前在读 / 在看" description="只展示正在推进中的书籍和影视条目。">
          {focusItems.length ? (
            <div className="space-y-3">
              {focusItems.map((item) => (
                <Link
                  key={item.id}
                  href={queueDetailHref[item.type](item.id)}
                  className="block rounded-lg border border-border bg-background/70 p-4 transition-colors hover:bg-accent/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <Badge variant={queueBadgeVariant[item.type]} className="text-xs">
                          {queueTypeLabel[item.type]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{item.meta}</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                    </div>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background/70 p-6 text-sm leading-6 text-muted-foreground">
              目前没有处于进行中的阅读或观影条目。
            </div>
          )}
        </SectionCard>

        <SectionCard title="最近时间线" description="按实际发生时间倒序展示最近记录。">
          {recentMoments.length ? (
            <TimelineFeed events={recentMoments} />
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background/70 p-6 text-sm leading-6 text-muted-foreground">
              还没有可展示的时间线记录。
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title={`${analytics.year} 年度分析`} description="聚合年度总数、类型分布和评分分布。">
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-background/70 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-border bg-background p-2 text-muted-foreground">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">年度总数</p>
                  <p className="text-3xl font-semibold text-foreground">{analytics.annualTotal}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                统计口径统一使用条目的主时间字段，避免首页和分析区出现两套不同结果。
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <BookOpen className="size-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">类型分布</h3>
                </div>
                <SimpleDonutChart
                  items={analytics.typeDistribution}
                  centerLabel="年度记录"
                  centerValue={String(analytics.annualTotal)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Clapperboard className="size-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">评分分布</h3>
                </div>
                <SimpleDonutChart
                  items={analytics.ratingDistribution}
                  centerLabel="评分样本"
                  centerValue={String(analytics.annualTotal)}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="月度趋势" description="查看今年每个月新增的记录节奏。">
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <TimerReset className="size-4" />
                <span>按活动时间归入月份，书籍和影视优先使用完成时间，旅行优先使用出发日期。</span>
              </div>
            </div>
            <SimpleColumnChart items={analytics.monthlyTrend} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
