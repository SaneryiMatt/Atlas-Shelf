import { BarChart3, Lightbulb } from "lucide-react";

import { BarList } from "@/components/shared/bar-list";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalyticsMetric, CategoryBreakdown } from "@/lib/types/items";

interface AnalyticsOverviewProps {
  metrics: AnalyticsMetric[];
  byType: CategoryBreakdown[];
  byRegion: CategoryBreakdown[];
  insights: string[];
}

export function AnalyticsOverview({ metrics, byType, byRegion, insights }: AnalyticsOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Analytics module"
        title="Patterns that help you keep the system intentional."
        description="Analytics focus on clarity rather than vanity metrics, surfacing only the signals that improve future choices."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-white/40 bg-white/80">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-semibold text-foreground">{metric.value}</p>
              <p className="text-sm leading-6 text-muted-foreground">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="By content type" description="How consistently each module converts intention into completion.">
          <BarList items={byType} />
        </SectionCard>
        <SectionCard title="By destination cluster" description="Where travel attention is currently concentrated.">
          <BarList items={byRegion} />
        </SectionCard>
      </section>

      <SectionCard title="Interpretation notes" description="Keep insight readable and actionable.">
        <div className="grid gap-4 md:grid-cols-3">
          {insights.map((insight) => (
            <div key={insight} className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
              <Lightbulb className="mb-3 size-5 text-primary" />
              {insight}
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-3xl border border-dashed border-border bg-background/60 p-5 text-sm leading-6 text-muted-foreground">
          <BarChart3 className="mb-3 size-5 text-primary" />
          The analytics route already depends on a dedicated query layer, which keeps future live rollups and cached views out of the page component.
        </div>
      </SectionCard>
    </div>
  );
}

