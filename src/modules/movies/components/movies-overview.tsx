import { Clapperboard, MonitorPlay } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import type { DashboardStat, ScreenOverviewItem } from "@/lib/types/items";

interface MoviesOverviewProps {
  stats: DashboardStat[];
  currentScreens: ScreenOverviewItem[];
  backlog: ScreenOverviewItem[];
}

export function MoviesOverview({ stats, currentScreens, backlog }: MoviesOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="影视模块"
        title="用同一套流程管理电影、剧集和动漫。"
        description="影视模块把长篇剧集和单次观影作品放进同一个系统里，同时保留它们之间的差异。"
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="当前片单" description="正在观看或准备接下来看的内容。">
          <div className="space-y-4">
            {currentScreens.map((screen) => (
              <div key={screen.id} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{screen.title}</h3>
                  <Badge>{screen.status}</Badge>
                  <span className="text-sm text-muted-foreground">{screen.format}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{screen.summary}</p>
                <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
                  <span>{screen.director}</span>
                  <span>{screen.platform}</span>
                  <span>{screen.runtime}</span>
                  <span>评分 {screen.rating}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {screen.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="队列设计" description="为保留在片单里的内容提供更明确的理由。">
          <div className="space-y-4">
            {backlog.map((screen) => (
              <div key={screen.id} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{screen.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{screen.format} · {screen.platform}</p>
                  </div>
                  <Badge variant="outline">{screen.status}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{screen.summary}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-3xl border border-dashed border-border bg-background/60 p-5 text-sm leading-6 text-muted-foreground">
            <Clapperboard className="mb-3 size-5 text-primary" />
            `src/modules/movies/screen-form-schema.ts` 已可支撑后续新增和编辑流程的严格校验。
          </div>
        </SectionCard>
      </section>

      <SectionCard title="为什么影视需要独立详情表" description="电影、剧集、动漫和纪录片都需要灵活但有类型约束的元数据。">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            <MonitorPlay className="mb-3 size-5 text-primary" />
            时长、季数、集数、平台和作品形式都保留在影视详情表里，不会污染共享主表。
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            状态值依然共用，因此分析模块可以横向比较书籍、影视和旅行计划的进展。
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            后续要增加筛选、上映视图或情绪标签时，不需要重做架构。
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

