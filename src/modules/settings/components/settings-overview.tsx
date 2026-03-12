import { CheckCircle2, CircleDashed, DatabaseZap, WandSparkles } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import type {
  ProjectNotePreview,
  ProjectPreview,
  ProjectTagPreview,
  SettingsPanel
} from "@/lib/types/items";

interface SettingsOverviewProps {
  envStatus: Array<{
    key: string;
    configured: boolean;
    hint: string;
  }>;
  panels: SettingsPanel[];
  databasePreview: {
    status: "live" | "unavailable";
    message: string;
    projects: ProjectPreview[];
    notes: ProjectNotePreview[];
    tags: ProjectTagPreview[];
  } | null;
}

export function SettingsOverview({ envStatus, panels, databasePreview }: SettingsOverviewProps) {
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

      <SectionCard
        title="Database preview"
        description="A live read from projects, project_notes, and tags. This verifies the query layer against the new schema."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={databasePreview?.status === "live" ? "success" : "outline"}>
            {databasePreview?.status === "live" ? "Live data" : "Unavailable"}
          </Badge>
          <p className="text-sm leading-6 text-muted-foreground">
            {databasePreview?.message ?? "No database preview status available."}
          </p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="space-y-3 rounded-3xl border border-border/60 bg-background/70 p-5">
            <p className="font-medium text-foreground">Recent projects</p>
            <div className="space-y-3">
              {databasePreview?.projects.length ? (
                databasePreview.projects.map((project) => (
                  <div key={project.id} className="rounded-2xl border border-border/50 bg-background/80 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{project.title}</p>
                      <Badge variant="secondary">{project.type}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {project.status} - Updated {project.updatedAtLabel}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">No live project rows are available yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-border/60 bg-background/70 p-5">
            <p className="font-medium text-foreground">Recent notes</p>
            <div className="space-y-3">
              {databasePreview?.notes.length ? (
                databasePreview.notes.map((note) => (
                  <div key={note.id} className="rounded-2xl border border-border/50 bg-background/80 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{note.noteTitle}</p>
                      <Badge variant="outline">{note.noteType}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {note.projectTitle} - {note.recordedAtLabel}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">No live note rows are available yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-border/60 bg-background/70 p-5">
            <p className="font-medium text-foreground">Popular tags</p>
            <div className="space-y-3">
              {databasePreview?.tags.length ? (
                databasePreview.tags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/80 px-4 py-3">
                    <p className="font-medium text-foreground">{tag.name}</p>
                    <Badge variant="secondary">{tag.usageCount}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">No live tag rows are available yet.</p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

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

