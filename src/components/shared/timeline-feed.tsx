import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/types/items";

const kindColors = {
  book: "#3b82f6",
  screen: "#a855f7",
  travel: "#10b981",
  application: "#f97316"
};

export function TimelineFeed({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-1">
      {events.map((event, index) => {
        const dotColor = kindColors[event.kind as keyof typeof kindColors] ?? "#6b7280";

        const content = (
          <div className="group rounded-xl border border-border/30 bg-background/50 p-4 transition-all duration-200 hover:border-border hover:bg-background/80">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium text-foreground">{event.title}</h3>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  event.kind === "travel" && "border-emerald-500/30 text-emerald-400",
                  event.kind === "screen" && "border-purple-500/30 text-purple-400",
                  event.kind === "book" && "border-blue-500/30 text-blue-400",
                  event.kind === "application" && "border-orange-500/30 text-orange-400"
                )}
              >
                {event.badge}
              </Badge>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground/70">{event.date}</p>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground/80">{event.description}</p>
          </div>
        );

        return (
          <div key={event.id} className="relative pl-6">
            <div className="absolute left-0 top-0 flex h-full flex-col items-center">
              <span className="mt-5 size-2.5 rounded-full ring-4 ring-background" style={{ backgroundColor: dotColor }} />
              {index < events.length - 1 ? <span className="mt-1 h-full w-px bg-gradient-to-b from-border/50 to-transparent" /> : null}
            </div>

            {event.href ? (
              <Link href={event.href} className="block">
                {content}
              </Link>
            ) : (
              content
            )}
          </div>
        );
      })}
    </div>
  );
}
