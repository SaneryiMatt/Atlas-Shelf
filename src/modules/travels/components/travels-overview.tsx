import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp, Minus, Star, Clock, Calendar } from "lucide-react";

import { AddTravelDialog } from "@/modules/travels/components/add-travel-dialog";
import { ListControls } from "@/components/shared/list-controls";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DashboardStat, ModuleListSort, PaginationInfo, TravelListItem } from "@/lib/types/items";

interface TravelsOverviewProps {
  stats: DashboardStat[];
  items: TravelListItem[];
  sort: ModuleListSort;
  pagination: PaginationInfo;
  canCreateTravels: boolean;
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
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function TravelsOverview({ stats, items, sort, pagination, canCreateTravels }: TravelsOverviewProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-foreground">用列表页集中管理旅行地点</h2>
          <p className="mt-1 text-sm text-muted-foreground">卡片布局适合浏览地点、旅行日期和补充说明，支持按更新时间和评分排序</p>
        </div>
        <AddTravelDialog disabled={!canCreateTravels} />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <SectionCard title="地点列表" description="每个地点都是一张可点击卡片，进入详情页后可查看笔记、图片和补充信息">
        <div className="space-y-4">
          <ListControls basePath="/travels" currentSort={sort} pagination={pagination} itemUnit="个地点" />

          {items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/travels/${trip.id}`}
                  className="group flex flex-col rounded-xl border border-border bg-background p-4 transition-all hover:border-foreground/20 hover:bg-accent/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-foreground">{trip.title}</h3>
                    <Badge variant={trip.stage === "已到访" ? "outline" : "success"} className="text-xs">
                      {trip.stage}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{trip.country}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{trip.summary}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {trip.window}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="size-3" />
                      {trip.ratingLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {trip.updatedAtLabel}
                    </span>
                  </div>

                  {trip.highlights.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {trip.highlights.slice(0, 3).map((highlight) => (
                        <Badge key={highlight} variant="outline" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex items-center pt-4 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                    查看详情
                    <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
              当前页没有地点数据，可以切换排序、翻页，或直接新增一个旅行地点。
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
