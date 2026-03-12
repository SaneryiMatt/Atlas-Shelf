import { BookMarked, LibraryBig } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import type { BookOverviewItem, DashboardStat } from "@/lib/types/items";

interface BooksOverviewProps {
  stats: DashboardStat[];
  currentBooks: BookOverviewItem[];
  backlog: BookOverviewItem[];
  notes: string[];
}

export function BooksOverview({ stats, currentBooks, backlog, notes }: BooksOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="书籍模块"
        title="把阅读、笔记和待读清单整理得更清楚。"
        description="书籍模块已经具备围绕进度、摘录和后续 AI 总结的结构化记录能力。"
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="当前在读" description="围绕阅读进度与可复用上下文组织当前书单。">
          <div className="space-y-4">
            {currentBooks.map((book) => (
              <div key={book.id} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{book.title}</h3>
                  <Badge>{book.status}</Badge>
                  <span className="text-sm text-muted-foreground">{book.author}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{book.summary}</p>
                <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
                  <span>进度 {book.progress}</span>
                  <span>{book.pages} 页</span>
                  <span>评分 {book.rating}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {book.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="下一本" description="优先级较高、值得预留时间的书。">
          <div className="space-y-4">
            {backlog.map((book) => (
              <div key={book.id} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{book.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
                  </div>
                  <Badge variant="outline">{book.status}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{book.summary}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard title="校验与笔记策略" description="模块内就近维护 schema，让书籍流程保持类型清晰且易于维护。">
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
          `src/modules/books/book-form-schema.ts` 已经可以作为新增和编辑表单的 Zod 校验基础。
        </div>
      </SectionCard>
    </div>
  );
}

