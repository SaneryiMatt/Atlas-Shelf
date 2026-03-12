import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";

import { AddTravelDialog } from "@/modules/travels/components/add-travel-dialog";
import { ListControls } from "@/components/shared/list-controls";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import type { DashboardStat, ModuleListSort, PaginationInfo, TravelListItem } from "@/lib/types/items";

interface TravelsOverviewProps {
  stats: DashboardStat[];
  items: TravelListItem[];
  sort: ModuleListSort;
  pagination: PaginationInfo;
  canCreateTravels: boolean;
}

export function TravelsOverview({ stats, items, sort, pagination, canCreateTravels }: TravelsOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="旅行模块"
        title="用列表页集中管理旅行地点"
        description="卡片布局适合浏览地点、旅行日期、坐标和最近更新，同时支持按更新时间和评分排序。"
        actions={<AddTravelDialog disabled={!canCreateTravels} />}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <SectionCard title="地点列表" description="每个地点都是一张可点击卡片，进入详情页后可查看笔记、图片和补充信息。">
        <div className="space-y-6">
          <ListControls basePath="/travels" currentSort={sort} pagination={pagination} itemUnit="个地点" />

          {items.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/travels/${trip.id}`}
                  className="group rounded-3xl border border-border/60 bg-background/70 p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background/90"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground transition group-hover:text-primary">{trip.title}</h3>
                    <Badge variant={trip.stage === "已到访" ? "outline" : "success"}>{trip.stage}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{trip.country}</p>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{trip.summary}</p>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                    <p>旅行日期：{trip.window}</p>
                    <p>评分：{trip.ratingLabel}</p>
                    <p>最近更新：{trip.updatedAtLabel}</p>
                  </div>
                  {trip.highlights.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {trip.highlights.map((highlight) => (
                        <Badge key={highlight} variant="secondary">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-primary">
                    查看详情
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-background/60 p-6 text-sm leading-6 text-muted-foreground">
              当前页没有地点数据，可以切换排序、翻页，或直接新增一个旅行地点。
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="旅行专属数据模型" description="地点坐标、阶段和日期保留在详情表里，列表页只展示概览。">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            <MapPinned className="mb-3 size-5 text-primary" />
            地点列表展示的是国家、城市、旅行日期和坐标，底层字段仍然存放在 `travel_details`。
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            排序和分页都在查询层完成，后续继续加筛选时可以沿用同样模式。
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            `src/modules/travels/actions.ts` 负责新增地点写入，`src/lib/db/queries/travels.ts` 负责列表读取，
            `src/lib/db/queries/project-details.ts` 负责详情聚合。
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
