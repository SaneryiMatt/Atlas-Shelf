import Link from "next/link";
import { ArrowRight, BookMarked, LibraryBig } from "lucide-react";

import { AddBookDialog } from "@/modules/books/components/add-book-dialog";
import { ListControls } from "@/components/shared/list-controls";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import type { BookListItem, DashboardStat, ModuleListSort, PaginationInfo } from "@/lib/types/items";

interface BooksOverviewProps {
  stats: DashboardStat[];
  notes: string[];
  items: BookListItem[];
  sort: ModuleListSort;
  pagination: PaginationInfo;
  canCreateBooks: boolean;
}

export function BooksOverview({ stats, notes, items, sort, pagination, canCreateBooks }: BooksOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="书籍模块"
        title="用卡片列表统一管理阅读记录"
        description="列表页支持按更新时间和评分排序，并通过分页控制单页密度。"
        actions={<AddBookDialog disabled={!canCreateBooks} />}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <SectionCard title="书籍列表" description="每张卡片都可以直接进入详情页，查看标签、笔记、评分和图片。">
        <div className="space-y-6">
          <ListControls basePath="/books" currentSort={sort} pagination={pagination} itemUnit="本书" />

          {items.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="group rounded-3xl border border-border/60 bg-background/70 p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background/90"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground transition group-hover:text-primary">{book.title}</h3>
                    <Badge>{book.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{book.author}</p>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{book.summary}</p>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                    <p>评分：{book.rating}</p>
                    <p>进度：{book.progress}</p>
                    <p>{book.pages ? `页数：${book.pages} 页` : "页数：未填写"}</p>
                    <p>最近更新：{book.updatedAtLabel}</p>
                  </div>
                  {book.tags.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {book.tags.map((tag) => (
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
              当前页没有书籍数据，可以切换排序、翻页，或直接新增一本书。
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="校验与笔记策略" description="表单校验和查询逻辑保持分层，便于后续继续扩展详情与编辑流程。">
        <div className="grid gap-4 md:grid-cols-3">
          {notes.map((note) => (
            <div key={note} className="rounded-3xl bg-background/70 p-5">
              <LibraryBig className="size-5 text-primary" />
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-3xl border border-dashed border-border bg-background/60 p-5 text-sm leading-6 text-muted-foreground">
          <BookMarked className="mb-3 size-5 text-primary" />
          `src/modules/books/book-form-schema.ts` 负责新增表单校验，`src/lib/db/queries/books.ts` 负责列表排序和分页读取，
          `src/lib/db/queries/project-details.ts` 负责详情页聚合查询。
        </div>
      </SectionCard>
    </div>
  );
}
