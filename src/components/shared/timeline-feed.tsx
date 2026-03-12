import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/types/items";

export function TimelineFeed({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-3">
      {events.map((event, index) => (
        <div key={event.id} className="relative pl-6">
          <div className="absolute left-0 top-2 flex flex-col items-center">
            <span className="size-2 rounded-full bg-foreground/60" />
            {index < events.length - 1 ? <span className="mt-1 h-full w-px bg-border" /> : null}
          </div>
          {event.href ? (
            <Link href={event.href} className="block rounded-lg border border-border bg-background p-3 transition-colors hover:bg-accent/30">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium text-foreground">{event.title}</h3>
                <Badge variant="outline" className={cn(event.kind === "travel" ? "text-teal-400" : "")}>
                  {event.badge}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{event.date}</p>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
            </Link>
          ) : (
            <div className="rounded-lg border border-border bg-background p-3 transition-colors hover:bg-accent/30">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium text-foreground">{event.title}</h3>
                <Badge variant="outline" className={cn(event.kind === "travel" ? "text-teal-400" : "")}>
                  {event.badge}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{event.date}</p>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

