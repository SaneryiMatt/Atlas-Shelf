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
        eyebrow="Books module"
        title="Reading, notes, and backlog without the clutter."
        description="The books module is ready for structured capture around progress, highlights, and future AI-assisted synthesis."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Current reading stack" description="Active titles with progress and reusable context.">
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
                  <span>Progress {book.progress}</span>
                  <span>{book.pages} pages</span>
                  <span>Rating {book.rating}</span>
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

        <SectionCard title="Next up" description="Priority titles worth protecting space for.">
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

      <SectionCard title="Validation and note strategy" description="Feature-local schemas keep book workflows typed and maintainable.">
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
          The file src/modules/books/book-form-schema.ts is ready to back create and edit flows using Zod-driven validation.
        </div>
      </SectionCard>
    </div>
  );
}

