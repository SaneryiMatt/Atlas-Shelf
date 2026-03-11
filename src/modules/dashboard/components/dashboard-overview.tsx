import Link from "next/link";
import { ArrowRight, Compass, Plus, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { TimelineFeed } from "@/components/shared/timeline-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DashboardStat, QueueItem, TimelineEvent } from "@/lib/types/items";

const queueBadgeVariant = {
  book: "default",
  screen: "outline",
  travel: "success"
} as const;

interface DashboardOverviewProps {
  stats: DashboardStat[];
  focusItems: QueueItem[];
  recentMoments: TimelineEvent[];
}

export function DashboardOverview({ stats, focusItems, recentMoments }: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Unified command center"
        title="Your stories, screens, and journeys in one place."
        description="A calm production-grade foundation for tracking what you are reading, watching, and planning without scattering state across separate tools."
        actions={
          <>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add item
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/travels">
                <Compass className="size-4" />
                Plan next trip
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Current focus queue"
          description="Small, intentional queues prevent backlog anxiety and keep next actions clear."
        >
          <div className="space-y-4">
            {focusItems.map((item) => (
              <div key={item.id} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <Badge variant={queueBadgeVariant[item.type]}>{item.status}</Badge>
                  <span className="text-sm text-muted-foreground">{item.meta}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Recent moments"
          description="A combined timeline makes it easier to notice how your attention shifts across media and travel."
        >
          <TimelineFeed events={recentMoments} />
        </SectionCard>
      </section>

      <SectionCard
        title="Why this structure scales"
        description="The application is organized so new content types can plug into the same shared foundation."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-background/70 p-5">
            <Sparkles className="size-5 text-primary" />
            <p className="mt-4 font-medium text-foreground">Shared item lifecycle</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Books, screens, and travels share a consistent status model while preserving type-specific metadata.</p>
          </div>
          <div className="rounded-3xl bg-background/70 p-5">
            <ArrowRight className="size-5 text-primary" />
            <p className="mt-4 font-medium text-foreground">Thin route layer</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">App Router pages stay small because queries and render logic are grouped by module.</p>
          </div>
          <div className="rounded-3xl bg-background/70 p-5">
            <Compass className="size-5 text-primary" />
            <p className="mt-4 font-medium text-foreground">Future-friendly expansion</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Games, podcasts, exhibitions, and courses can be added without reworking the layout system.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

