import { CheckCircle2, CircleDashed, DatabaseZap, WandSparkles } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import type { SettingsPanel } from "@/lib/types/items";

interface SettingsOverviewProps {
  envStatus: Array<{
    key: string;
    configured: boolean;
    hint: string;
  }>;
  panels: SettingsPanel[];
}

export function SettingsOverview({ envStatus, panels }: SettingsOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings module"
        title="Data, integration, and AI hooks kept modular."
        description="Settings are framed around operational readiness so the app can graduate from mock data to production services cleanly."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Environment readiness" description="Service wiring can happen without reworking the page tree.">
          <div className="space-y-4">
            {envStatus.map((entry) => (
              <div key={entry.key} className="flex items-start justify-between gap-4 rounded-3xl border border-border/60 bg-background/70 p-5">
                <div>
                  <p className="font-medium text-foreground">{entry.key}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.hint}</p>
                </div>
                <Badge variant={entry.configured ? "success" : "outline"} className="gap-2">
                  {entry.configured ? <CheckCircle2 className="size-3.5" /> : <CircleDashed className="size-3.5" />}
                  {entry.configured ? "Configured" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Operational panels" description="The project is organized to keep infrastructure decisions localized.">
          <div className="space-y-4">
            {panels.map((panel) => (
              <div key={panel.title} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{panel.title}</h3>
                  <Badge variant="secondary">{panel.status}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{panel.description}</p>
                <p className="mt-3 text-sm leading-6 text-foreground">{panel.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Production handoff posture" description="The remaining work is mostly service wiring and CRUD flow implementation.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            <DatabaseZap className="mb-3 size-5 text-primary" />
            Query modules already isolate page data requirements from storage mechanics.
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            <WandSparkles className="mb-3 size-5 text-primary" />
            AI-ready fields can be stored explicitly without embedding model assumptions into page components.
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            Validation schemas live beside their modules, so forms can grow locally without central sprawl.
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

