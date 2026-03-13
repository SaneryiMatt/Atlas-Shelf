import Link from "next/link";
import { ArrowRight, BookOpen, Clapperboard, MapPin, Clock } from "lucide-react";

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

const statIcons = [BookOpen, Clapperboard, MapPin, Clock] as const;

interface DashboardOverviewProps {
  stats: DashboardStat[];
  focusItems: QueueItem[];
  recentMoments: TimelineEvent[];
  analytics: DashboardAnalyticsData;
}

function StatCard({ label, value, index }: DashboardStat & { index: number }) {
  const Icon = statIcons[index] ?? Clock;

  return (
    <div className="flex items-center gap-4 border-r border-border/30 px-6 last:border-r-0">
      <div className="flex size-10 items-center justify-center rounded-full border border-border/50">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function DashboardOverview({ stats, focusItems, recentMoments, analytics }: DashboardOverviewProps) {
  // 限制时间线最多显示5条
  const limitedMoments = recentMoments.slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* 简洁标题 */}
      <header className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{analytics.year} 年度概览</h1>
      </header>

      {/* 图表区域 */}
      <section className="mb-10 grid gap-6 lg:grid-cols-3">
        {/* 类型分布 */}
        <div className="rounded-lg border border-border/40 bg-card/20 p-5">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">类型分布</h3>
          <SimpleDonutChart
            items={analytics.typeDistribution}
            centerLabel="类型"
            centerValue={String(analytics.typeDistribution.length)}
          />
        </div>

        {/* 评分分布 */}
        <div className="rounded-lg border border-border/40 bg-card/20 p-5">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">评分分布</h3>
          <SimpleDonutChart
            items={analytics.ratingDistribution}
            centerLabel="记录"
            centerValue={String(analytics.annualTotal)}
          />
        </div>

        {/* 月度趋势 */}
        <div className="rounded-lg border border-border/40 bg-card/20 p-5">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">月度趋势</h3>
          <SimpleColumnChart items={analytics.monthlyTrend} />
        </div>
      </section>

      {/* 主内容区 - 两栏布局 */}
      <div className="grid gap-10 lg:grid-cols-5">
        {/* 左侧：进行中 */}
        <section className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">进行中</h2>
            <span className="text-sm text-muted-foreground">{focusItems.length} 项</span>
          </div>
          
          {focusItems.length ? (
            <div className="space-y-3">
              {focusItems.map((item) => (
                <Link
                  key={item.id}
                  href={queueDetailHref[item.type](item.id)}
                  className="group flex items-center justify-between rounded-lg border border-border/30 bg-card/20 p-4 transition-colors hover:border-border/60 hover:bg-card/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{item.title}</span>
                      <Badge variant={queueBadgeVariant[item.type]} className="text-xs">
                        {queueTypeLabel[item.type]}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{item.meta}</p>
                  </div>
                  <ArrowRight className="ml-4 size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/40 py-12 text-center">
              <p className="text-sm text-muted-foreground">暂无进行中的项目</p>
            </div>
          )}
        </section>

        {/* 右侧：时间线 */}
        <section className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">最近动态</h2>
            <Link 
              href="/timeline" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              查看全部
            </Link>
          </div>
          
          {limitedMoments.length ? (
            <TimelineFeed events={limitedMoments} />
          ) : (
            <div className="rounded-lg border border-dashed border-border/40 py-12 text-center">
              <p className="text-sm text-muted-foreground">暂无动态</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
