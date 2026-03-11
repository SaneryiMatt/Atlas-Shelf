import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/types/items";

export function TimelineFeed({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-5">
      {events.map((event, index) => (
        <div key={event.id} className="relative pl-8">
          <div className="absolute left-0 top-1 flex flex-col items-center">
            <span className="size-3 rounded-full bg-primary" />
            {index < events.length - 1 ? <span className="mt-2 h-16 w-px bg-border" /> : null}
          </div>
          <div className="space-y-2 rounded-3xl border border-border/60 bg-background/70 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
              <Badge variant="outline" className={cn(event.kind === "travel" ? "text-teal-700" : "")}>{event.badge}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{event.date}</p>
            <p className="text-sm leading-6 text-muted-foreground">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

