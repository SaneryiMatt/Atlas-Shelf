import { MapPinned } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import type { DashboardStat, TravelOverviewItem } from "@/lib/types/items";

interface TravelsOverviewProps {
  stats: DashboardStat[];
  activeTrips: TravelOverviewItem[];
  archive: TravelOverviewItem[];
}

export function TravelsOverview({ stats, activeTrips, archive }: TravelsOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Travels module"
        title="From early ideas to visited memories, without losing the thread."
        description="Travel entries are treated like first-class items so inspiration, planning, and recall can all live in the same product."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Trips in motion" description="Planned, booked, and early-stage trips with enough detail to maintain momentum.">
          <div className="space-y-4">
            {activeTrips.map((trip) => (
              <div key={trip.id} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{trip.title}</h3>
                  <Badge variant="success">{trip.stage}</Badge>
                  <span className="text-sm text-muted-foreground">{trip.country}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{trip.summary}</p>
                <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
                  <span>{trip.window}</span>
                  <span>{trip.budget}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {trip.highlights.map((highlight) => (
                    <Badge key={highlight} variant="secondary">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Visited archive" description="Past trips worth preserving as reusable memory and planning material.">
          <div className="space-y-4">
            {archive.map((trip) => (
              <div key={trip.id} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{trip.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{trip.country} ? {trip.window}</p>
                  </div>
                  <Badge variant="outline">{trip.stage}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{trip.summary}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Travel-specific data model" description="A detail table keeps place metadata clean while the shared project table powers cross-product views.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            <MapPinned className="mb-3 size-5 text-primary" />
            Country, city, region, date range, budget, and highlights live in travel_details without leaking into other content types.
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            Shared timeline, notes, tags, and photos can still query travels through the common projects table.
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            The file src/modules/travels/travel-form-schema.ts is ready for validated create and edit flows when forms are added.
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

