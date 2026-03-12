import { desc, eq } from "drizzle-orm";

import { db, databaseAvailable } from "@/lib/db/client";
import { timelineEvents } from "@/lib/db/mock-data";
import { bookDetails, projects, screenDetails, travelDetails } from "@/lib/db/schema";
import type { TimelineEvent, TimelineMonthGroup, TimelinePageData } from "@/lib/types/items";

const screenFormatLabels = {
  movie: "电影",
  series: "剧集",
  anime: "动漫",
  documentary: "纪录片"
} as const;

type TimelineEntry = {
  event: TimelineEvent;
  occurredAt: Date;
};

function toTimelineDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : value;
  const date = new Date(normalizedValue);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTimelineDateLabel(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatTimelineMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long"
  }).format(date);
}

function buildTimelineGroups(entries: TimelineEntry[]): TimelinePageData {
  const groups = new Map<string, TimelineMonthGroup>();

  for (const entry of entries) {
    const key = `${entry.occurredAt.getUTCFullYear()}-${String(entry.occurredAt.getUTCMonth() + 1).padStart(2, "0")}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: formatTimelineMonthLabel(entry.occurredAt),
        events: []
      });
    }

    groups.get(key)!.events.push(entry.event);
  }

  return {
    totalCount: entries.length,
    groups: Array.from(groups.values())
  };
}

function parseMockTimelineDateLabel(label: string) {
  const parts = label.match(/\d+/g);

  if (!parts || parts.length < 3) {
    return new Date(Date.UTC(1970, 0, 1));
  }

  const [year, month, day] = parts.map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function buildMockTimelinePageData() {
  const entries = [...timelineEvents]
    .map((event) => ({
      event,
      occurredAt: parseMockTimelineDateLabel(event.date)
    }))
    .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());

  return buildTimelineGroups(entries);
}

export async function getTimelinePageData(): Promise<TimelinePageData> {
  if (databaseAvailable && db) {
    try {
      const rows = await db
        .select({
          id: projects.id,
          type: projects.type,
          title: projects.title,
          summary: projects.summary,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          startedAt: projects.startedAt,
          completedAt: projects.completedAt,
          author: bookDetails.author,
          screenFormat: screenDetails.format,
          director: screenDetails.director,
          platform: screenDetails.platform,
          country: travelDetails.country,
          city: travelDetails.city,
          startDate: travelDetails.startDate
        })
        .from(projects)
        .leftJoin(bookDetails, eq(bookDetails.projectId, projects.id))
        .leftJoin(screenDetails, eq(screenDetails.projectId, projects.id))
        .leftJoin(travelDetails, eq(travelDetails.projectId, projects.id))
        .orderBy(desc(projects.updatedAt));

      const entries = rows
        .map<TimelineEntry | null>((row) => {
          const occurredAt =
            row.type === "travel"
              ? toTimelineDate(row.startDate) ?? toTimelineDate(row.updatedAt) ?? toTimelineDate(row.createdAt)
              : toTimelineDate(row.completedAt) ??
                toTimelineDate(row.startedAt) ??
                toTimelineDate(row.updatedAt) ??
                toTimelineDate(row.createdAt);

          if (!occurredAt) {
            return null;
          }

          if (row.type === "book") {
            return {
              occurredAt,
              event: {
                id: row.id,
                title: row.title,
                date: formatTimelineDateLabel(occurredAt),
                kind: "book" as const,
                badge: "书籍",
                description: row.summary?.trim() || `作者：${row.author ?? "未知作者"}`,
                href: `/books/${row.id}`
              }
            };
          }

          if (row.type === "screen") {
            const formatLabel = row.screenFormat ? screenFormatLabels[row.screenFormat] : "影视";
            const fallbackDescription = [formatLabel, row.director || row.platform].filter(Boolean).join(" · ");

            return {
              occurredAt,
              event: {
                id: row.id,
                title: row.title,
                date: formatTimelineDateLabel(occurredAt),
                kind: "screen" as const,
                badge: formatLabel,
                description: row.summary?.trim() || fallbackDescription || "影视记录",
                href: `/movies/${row.id}`
              }
            };
          }

          return {
            occurredAt,
            event: {
              id: row.id,
              title: row.title,
              date: formatTimelineDateLabel(occurredAt),
              kind: "travel" as const,
              badge: "旅行",
              description: row.summary?.trim() || [row.country, row.city].filter(Boolean).join(" · ") || "旅行记录",
              href: `/travels/${row.id}`
            }
          };
        })
        .filter((entry): entry is TimelineEntry => entry !== null)
        .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());

      return buildTimelineGroups(entries);
    } catch {
      return buildMockTimelinePageData();
    }
  }

  return buildMockTimelinePageData();
}
