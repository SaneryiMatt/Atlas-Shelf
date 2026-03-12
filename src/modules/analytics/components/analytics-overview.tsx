import { BarChart3, Lightbulb } from "lucide-react";

import { BarList } from "@/components/shared/bar-list";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalyticsMetric, CategoryBreakdown } from "@/lib/types/items";

interface AnalyticsOverviewProps {
  metrics: AnalyticsMetric[];
  byType: CategoryBreakdown[];
  byRegion: CategoryBreakdown[];
  insights: string[];
}

export function AnalyticsOverview({ metrics, byType, byRegion, insights }: AnalyticsOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="分析模块"
        title="只展示真正有助于决策的模式与趋势。"
        description="分析模块强调清晰而不是虚荣指标，只呈现会影响下一步选择的信号。"
      />

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-white/40 bg-white/80">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-semibold text-foreground">{metric.value}</p>
              <p className="text-sm leading-6 text-muted-foreground">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="按内容类型" description="观察各模块把计划转化为完成的稳定程度。">
          <BarList items={byType} />
        </SectionCard>
        <SectionCard title="按目的地分组" description="查看当前旅行关注点集中在哪些区域。">
          <BarList items={byRegion} />
        </SectionCard>
      </section>

      <SectionCard title="解读说明" description="让洞察保持可读、可用。">
        <div className="grid gap-4 md:grid-cols-3">
          {insights.map((insight) => (
            <div key={insight} className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
              <Lightbulb className="mb-3 size-5 text-primary" />
              {insight}
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-3xl border border-dashed border-border bg-background/60 p-5 text-sm leading-6 text-muted-foreground">
          <BarChart3 className="mb-3 size-5 text-primary" />
          分析页面已经依赖独立查询层，后续接入实时汇总和缓存视图时，不需要把复杂逻辑塞进页面组件。
        </div>
      </SectionCard>
    </div>
  );
}

