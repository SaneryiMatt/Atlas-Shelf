import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, Minus, BookOpen, Star, Clock } from "lucide-react";

import { AddBookDialog } from "@/modules/books/components/add-book-dialog";
import { ListControls } from "@/components/shared/list-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BookListItem, DashboardStat, ModuleListSort, PaginationInfo } from "@/lib/types/items";

interface BooksOverviewProps {
  stats: DashboardStat[];
  notes: string[];
  items: BookListItem[];
  sort: ModuleListSort;
  pagination: PaginationInfo;
  canCreateBooks: boolean;
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

export function BooksOverview({ stats, items, sort, pagination, canCreateBooks }: BooksOverviewProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-foreground">用卡片列表统一管理阅读记录</h2>
          <p className="mt-1 text-sm text-muted-foreground">支持按更新时间和评分排序，通过分页控制单页密度</p>
        </div>
        <AddBookDialog disabled={!canCreateBooks} />
      </div>

      {/* 统计卡片 */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      {/* 书籍列表 */}
      <SectionCard title="书籍列表" description="每张卡片都可以直接进入详情页，查看标签、笔记、评分和图片">
        <div className="space-y-4">
          <ListControls basePath="/books" currentSort={sort} pagination={pagination} itemUnit="本书" />

          {items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="group flex flex-col rounded-xl border border-border bg-background p-4 transition-all hover:border-foreground/20 hover:bg-accent/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-foreground">{book.title}</h3>
                    <Badge className="text-xs">{book.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{book.summary}</p>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="size-3" />
                      {book.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-3" />
                      {book.progress}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {book.updatedAtLabel}
                    </span>
                  </div>

                  {book.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {book.tags.slice(0, 3).map((tag) => (
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
              当前页没有书籍数据，可以切换排序、翻页，或直接新增一本书
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
