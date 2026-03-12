import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, Minus, Star, Clock, Monitor, User } from "lucide-react";

import { AddMovieDialog } from "@/modules/movies/components/add-movie-dialog";
import { ListControls } from "@/components/shared/list-controls";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DashboardStat, ModuleListSort, PaginationInfo, ScreenListItem } from "@/lib/types/items";

interface MoviesOverviewProps {
  stats: DashboardStat[];
  items: ScreenListItem[];
  sort: ModuleListSort;
  pagination: PaginationInfo;
  canCreateMovies: boolean;
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

export function MoviesOverview({ stats, items, sort, pagination, canCreateMovies }: MoviesOverviewProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-foreground">用卡片列表统一管理影视记录</h2>
          <p className="mt-1 text-sm text-muted-foreground">支持按更新时间和评分排序，保持与新增模态框一致的交互节奏</p>
        </div>
        <AddMovieDialog disabled={!canCreateMovies} />
      </div>

      {/* 统计卡片 */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      {/* 影视列表 */}
      <SectionCard title="影视列表" description="卡片聚合导演、平台、评分和更新时间，点击后进入详情页查看笔记与图片">
        <div className="space-y-4">
          <ListControls basePath="/movies" currentSort={sort} pagination={pagination} itemUnit="部作品" />

          {items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  className="group flex flex-col rounded-xl border border-border bg-background p-4 transition-all hover:border-foreground/20 hover:bg-accent/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-foreground">{movie.title}</h3>
                    <Badge className="text-xs">{movie.status}</Badge>
                    <Badge variant="secondary" className="text-xs">{movie.format}</Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{movie.summary}</p>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="size-3" />
                      {movie.director}
                    </span>
                    <span className="flex items-center gap-1">
                      <Monitor className="size-3" />
                      {movie.platform}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="size-3" />
                      {movie.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {movie.updatedAtLabel}
                    </span>
                  </div>

                  {movie.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {movie.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
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
              当前页没有影视数据，可以切换排序、翻页，或直接新增一部作品
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
