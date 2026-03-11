import { Clapperboard, MonitorPlay } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import type { DashboardStat, ScreenOverviewItem } from "@/lib/types/items";

interface MoviesOverviewProps {
  stats: DashboardStat[];
  currentScreens: ScreenOverviewItem[];
  backlog: ScreenOverviewItem[];
}

export function MoviesOverview({ stats, currentScreens, backlog }: MoviesOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Movies module"
        title="Films, series, and anime under one screen-aware workflow."
        description="The screen module keeps long-form shows and short one-off films in the same system without flattening their differences."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Active watchlist" description="What is being watched now or queued next.">
          <div className="space-y-4">
            {currentScreens.map((screen) => (
              <div key={screen.id} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{screen.title}</h3>
                  <Badge>{screen.status}</Badge>
                  <span className="text-sm text-muted-foreground">{screen.format}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{screen.summary}</p>
                <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
                  <span>{screen.director}</span>
                  <span>{screen.platform}</span>
                  <span>{screen.runtime}</span>
                  <span>Rating {screen.rating}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {screen.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Queue design" description="Saved picks with a clearer reason for being kept around.">
          <div className="space-y-4">
            {backlog.map((screen) => (
              <div key={screen.id} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{screen.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{screen.format} ? {screen.platform}</p>
                  </div>
                  <Badge variant="outline">{screen.status}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{screen.summary}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-3xl border border-dashed border-border bg-background/60 p-5 text-sm leading-6 text-muted-foreground">
            <Clapperboard className="mb-3 size-5 text-primary" />
            The file src/modules/movies/screen-form-schema.ts is positioned to power future create and edit flows with strict validation.
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Why screens get their own detail table" description="Movies, series, anime, and documentaries need flexible but typed metadata.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            <MonitorPlay className="mb-3 size-5 text-primary" />
            Runtime, seasons, episodes, platform, and format stay specific to screen media without bloating the shared item core.
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            Status values remain shared so analytics can compare progress across books, screens, and travel plans.
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            The watchlist UI can become richer later with filters, release views, and mood tags without needing an architectural rewrite.
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

