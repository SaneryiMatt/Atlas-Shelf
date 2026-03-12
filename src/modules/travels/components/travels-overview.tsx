import { MapPinned } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import type { DashboardStat, TravelOverviewItem } from "@/lib/types/items";

interface TravelsOverviewProps {
  stats: DashboardStat[];
  activeTrips: TravelOverviewItem[];
  archive: TravelOverviewItem[];
}

export function TravelsOverview({ stats, activeTrips, archive }: TravelsOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="旅行模块"
        title="从灵感到回忆，把旅行信息放在一条清晰链路里。"
        description="旅行条目与书籍、影视一样被视为一等对象，灵感、规划与回顾都可以放进同一个产品。"
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="进行中的行程" description="展示已计划、已预订和早期构想中的旅行，并保留足够细节。">
          <div className="space-y-4">
            {activeTrips.map((trip) => (
              <div key={trip.id} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{trip.title}</h3>
                  <Badge variant="success">{trip.stage}</Badge>
                  <span className="text-sm text-muted-foreground">{trip.country}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{trip.summary}</p>
                <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
                  <span>{trip.window}</span>
                  <span>{trip.budget}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {trip.highlights.map((highlight) => (
                    <Badge key={highlight} variant="secondary">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="已完成归档" description="保留过去的旅行，作为可复用的回忆和下次规划素材。">
          <div className="space-y-4">
            {archive.map((trip) => (
              <div key={trip.id} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{trip.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{trip.country} · {trip.window}</p>
                  </div>
                  <Badge variant="outline">{trip.stage}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{trip.summary}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard title="旅行专属数据模型" description="用详情表承载地点元数据，同时继续复用共享项目表的横向能力。">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            <MapPinned className="mb-3 size-5 text-primary" />
            国家、城市、区域、时间范围、预算和亮点都保存在 `travel_details`，不会泄露到其他内容类型。
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            时间线、笔记、标签和照片仍然可以通过共享 `projects` 表统一查询旅行条目。
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            `src/modules/travels/travel-form-schema.ts` 已为后续新增和编辑表单准备好校验能力。
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

