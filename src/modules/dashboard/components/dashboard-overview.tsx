import Link from "next/link";
import { ArrowRight, BookOpen, Clapperboard, MapPin, Sparkles, TrendingUp, Calendar, Activity } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
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

const statIcons = [BookOpen, Clapperboard, MapPin, Sparkles] as const;
const statColors = ["#3b82f6", "#a855f7", "#10b981", "#f59e0b"] as const;

interface DashboardOverviewProps {
  stats: DashboardStat[];
  focusItems: QueueItem[];
  recentMoments: TimelineEvent[];
  analytics: DashboardAnalyticsData;
}

function DashboardStatCard({ label, value, detail, index }: DashboardStat & { index: number }) {
  const Icon = statIcons[index] ?? Sparkles;
  const color = statColors[index] ?? "#f59e0b";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card/80">
      <div 
        className="absolute -right-8 -top-8 size-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: color }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div 
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="size-5" style={{ color }} />
          </div>
          <TrendingUp className="size-4 text-muted-foreground/50" />
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground/80">{detail}</p>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }: { icon: typeof BookOpen; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-border/50 pb-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/50">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div>
        <h2 className="font-semibold text-foreground">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground/80">{description}</p>
      </div>
    </div>
  );
}

export function DashboardOverview({ stats, focusItems, recentMoments, analytics }: DashboardOverviewProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-1">
      <PageHeader
        eyebrow="Dashboard"
        title="把当前推进的内容和关键分析收进同一个首页"
        description="首页只保留最重要的四块内容：关键统计、当前在读与在看、年度分析，以及最近时间线。"
      />

      {/* 统计卡片 */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <DashboardStatCard key={stat.label} {...stat} index={index} />
        ))}
      </section>

      {/* 年度数据分析 - 饼状图区域 */}
      <section className="rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm">
        <SectionHeader 
          icon={Activity} 
          title={`${analytics.year} 年度数据分析`} 
          description="可视化展示年度记录的类型分布与评分分布"
        />
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* 年度总览 */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/30 bg-background/50 p-6">
            <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <Sparkles className="size-7 text-blue-400" />
            </div>
            <p className="mt-4 text-5xl font-bold tracking-tight text-foreground">{analytics.annualTotal}</p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">年度总记录</p>
            <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground/70">
              统计口径统一使用条目的主时间字段
            </p>
          </div>

          {/* 类型分布饼图 */}
          <div className="rounded-xl border border-border/30 bg-background/50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="size-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-foreground">类型分布</h3>
            </div>
            <SimpleDonutChart
              items={analytics.typeDistribution}
              centerLabel="类型"
              centerValue={String(analytics.typeDistribution.length)}
            />
          </div>

          {/* 评分分布饼图 */}
          <div className="rounded-xl border border-border/30 bg-background/50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Clapperboard className="size-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-foreground">评分分布</h3>
            </div>
            <SimpleDonutChart
              items={analytics.ratingDistribution}
              centerLabel="样本"
              centerValue={String(analytics.annualTotal)}
            />
          </div>
        </div>
      </section>

      {/* 月度趋势图 */}
      <section className="rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm">
        <SectionHeader 
          icon={Calendar} 
          title="月度趋势" 
          description="查看今年每个月新增的记录节奏，按活动时间归入月份"
        />
        <div className="mt-6">
          <SimpleColumnChart items={analytics.monthlyTrend} />
        </div>
      </section>

      {/* 底部两栏：当前在读/在看 + 时间线 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 当前在读/在看 */}
        <section className="rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm">
          <SectionHeader 
            icon={BookOpen} 
            title="当前在读 / 在看" 
            description="正在推进中的书籍和影视条目"
          />
          <div className="mt-5">
            {focusItems.length ? (
              <div className="space-y-3">
                {focusItems.map((item) => (
                  <Link
                    key={item.id}
                    href={queueDetailHref[item.type](item.id)}
                    className="group block rounded-xl border border-border/30 bg-background/50 p-4 transition-all duration-200 hover:border-border hover:bg-background/80"
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
                        <p className="mt-2 text-sm text-muted-foreground/80">{item.meta}</p>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground/70">{item.summary}</p>
                      </div>
                      <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-background/30 py-12 text-center">
                <BookOpen className="size-8 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground/70">目前没有处于进行中的阅读或观影条目</p>
              </div>
            )}
          </div>
        </section>

        {/* 最近时间线 */}
        <section className="rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm">
          <SectionHeader 
            icon={Activity} 
            title="最近时间线" 
            description="按实际发生时间倒序展示最近记录"
          />
          <div className="mt-5">
            {recentMoments.length ? (
              <TimelineFeed events={recentMoments} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-background/30 py-12 text-center">
                <Activity className="size-8 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground/70">还没有可展示的时间线记录</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
