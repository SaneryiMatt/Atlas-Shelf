import Link from "next/link";
import { ArrowRight, MonitorPlay } from "lucide-react";

import { AddMovieDialog } from "@/modules/movies/components/add-movie-dialog";
import { ListControls } from "@/components/shared/list-controls";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import type { DashboardStat, ModuleListSort, PaginationInfo, ScreenListItem } from "@/lib/types/items";

interface MoviesOverviewProps {
  stats: DashboardStat[];
  items: ScreenListItem[];
  sort: ModuleListSort;
  pagination: PaginationInfo;
  canCreateMovies: boolean;
}

export function MoviesOverview({ stats, items, sort, pagination, canCreateMovies }: MoviesOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="影视模块"
        title="用卡片列表统一管理影视记录"
        description="列表页支持按更新时间和评分排序，并保持与新增模态框一致的交互节奏。"
        actions={<AddMovieDialog disabled={!canCreateMovies} />}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <SectionCard title="影视列表" description="卡片聚合导演、平台、评分和更新时间，点击后进入详情页查看笔记与图片。">
        <div className="space-y-6">
          <ListControls basePath="/movies" currentSort={sort} pagination={pagination} itemUnit="部作品" />

          {items.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  className="group rounded-3xl border border-border/60 bg-background/70 p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background/90"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground transition group-hover:text-primary">{movie.title}</h3>
                    <Badge>{movie.status}</Badge>
                    <Badge variant="secondary">{movie.format}</Badge>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{movie.summary}</p>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                    <p>导演：{movie.director}</p>
                    <p>平台：{movie.platform}</p>
                    <p>{movie.runtime}</p>
                    <p>评分：{movie.rating}</p>
                    <p>最近更新：{movie.updatedAtLabel}</p>
                  </div>
                  {movie.tags.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {movie.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
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
              当前页没有影视数据，可以切换排序、翻页，或直接新增一部作品。
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="为什么使用独立详情表" description="列表页保持轻量，详情页再补充标签、笔记和图片等扩展信息。">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            <MonitorPlay className="mb-3 size-5 text-primary" />
            影视列表使用卡片式布局，但底层仍然依赖 `screen_details`，不会把类型专属字段挤进共享主表。
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            排序和分页都在服务端查询层完成，页面只负责渲染结果，详情页也沿用这个模式。
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            `src/modules/movies/actions.ts` 负责新增写入，`src/lib/db/queries/movies.ts` 负责列表读取，
            `src/lib/db/queries/project-details.ts` 负责详情聚合。
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
