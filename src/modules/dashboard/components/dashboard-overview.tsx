import Link from "next/link";
import { ArrowRight, Compass, Plus, Sparkles } from "lucide-react";

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

interface DashboardOverviewProps {
  stats: DashboardStat[];
  focusItems: QueueItem[];
  recentMoments: TimelineEvent[];
}

export function DashboardOverview({ stats, focusItems, recentMoments }: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="统一控制台"
        title="把书、影视与旅程放在一个地方管理。"
        description="一个克制、可生产部署的追踪系统基础，让阅读、观影与旅行规划不再分散在多个工具里。"
        actions={
          <>
            <Button className="gap-2">
              <Plus className="size-4" />
              添加项目
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/travels">
                <Compass className="size-4" />
                规划下一次旅行
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="当前关注队列"
          description="控制队列规模，可以减少积压焦虑，让下一步始终明确。"
        >
          <div className="space-y-4">
            {focusItems.map((item) => (
              <div key={item.id} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <Badge variant={queueBadgeVariant[item.type]}>{item.status}</Badge>
                  <span className="text-sm text-muted-foreground">{item.meta}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="最近动态"
          description="把不同模块放进同一条时间线，更容易看清你的注意力如何变化。"
        >
          <TimelineFeed events={recentMoments} />
        </SectionCard>
      </section>

      <SectionCard
        title="为什么这个结构可扩展"
        description="应用按共享基础能力组织，新内容类型可以继续接入而不需要重构。"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-background/70 p-5">
            <Sparkles className="size-5 text-primary" />
            <p className="mt-4 font-medium text-foreground">统一生命周期</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">书籍、影视和旅行共享一致的状态模型，同时保留各自的专属元数据。</p>
          </div>
          <div className="rounded-3xl bg-background/70 p-5">
            <ArrowRight className="size-5 text-primary" />
            <p className="mt-4 font-medium text-foreground">轻量路由层</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">App Router 页面保持精简，查询与渲染逻辑按模块分组管理。</p>
          </div>
          <div className="rounded-3xl bg-background/70 p-5">
            <Compass className="size-5 text-primary" />
            <p className="mt-4 font-medium text-foreground">面向未来扩展</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">后续新增游戏、播客、展览或课程时，不需要重做整个布局系统。</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

