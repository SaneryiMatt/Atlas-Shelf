import { TimerReset } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { TimelineFeed } from "@/components/shared/timeline-feed";
import type { TimelineEvent } from "@/lib/types/items";

export function TimelineOverview({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Timeline module"
        title="One chronological view across books, screens, and trips."
        description="The timeline is intentionally powered by the shared item layer so the product can tell a single story about your attention over time."
      />

      <SectionCard title="Recent activity stream" description="Unified events from every module, ready for filters and saved views later.">
        <TimelineFeed events={events} />
      </SectionCard>

      <SectionCard title="Why this matters" description="Cross-module chronology becomes much easier when each module shares a consistent core model.">
        <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
          <TimerReset className="mb-3 size-5 text-primary" />
          The route is thin, the feed component is shared, and the eventual database query can compose milestone events without duplicating UI or page logic.
        </div>
      </SectionCard>
    </div>
  );
}

