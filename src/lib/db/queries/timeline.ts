import { getDashboardProjectRows, type RpcProjectRow } from "@/lib/supabase/app-data";
import type { TimelineEvent, TimelineMonthGroup, TimelinePageData } from "@/lib/types/items";

const screenFormatLabels = {
  movie: "电影",
  series: "剧集",
  anime: "动画",
  documentary: "纪录片"
} as const;

function toTimelineDate(value: string | null | undefined) {
  if (!value) {
    return null;
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

function buildTimelineGroups(entries: Array<{ event: TimelineEvent; occurredAt: Date }>): TimelinePageData {
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

function rowToTimelineEntry(row: RpcProjectRow) {
  const occurredAt =
    row.type === "travel"
      ? toTimelineDate(row.startDate) ?? toTimelineDate(row.updatedAt) ?? toTimelineDate(row.createdAt)
      : row.type === "application"
        ? toTimelineDate(row.appliedAt) ?? toTimelineDate(row.updatedAt) ?? toTimelineDate(row.createdAt)
        : toTimelineDate(row.completedAt) ?? toTimelineDate(row.startedAt) ?? toTimelineDate(row.updatedAt) ?? toTimelineDate(row.createdAt);

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
    const formatLabel = row.screenFormat ? screenFormatLabels[row.screenFormat as keyof typeof screenFormatLabels] ?? row.screenFormat : "影视";
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

  if (row.type === "travel") {
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
  }

  return {
    occurredAt,
    event: {
      id: row.id,
      title: row.title,
      date: formatTimelineDateLabel(occurredAt),
      kind: "application" as const,
      badge: "投递",
      description: row.summary?.trim() || [row.company, row.role, row.applicationSource].filter(Boolean).join(" · ") || "投递记录",
      href: `/applications/${row.id}`
    }
  };
}

export async function getTimelinePageData(): Promise<TimelinePageData> {
  try {
    const rows = await getDashboardProjectRows();
    const entries = rows
      .map(rowToTimelineEntry)
      .filter((entry): entry is NonNullable<ReturnType<typeof rowToTimelineEntry>> => entry !== null)
      .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());

    return buildTimelineGroups(entries);
  } catch {
    return {
      totalCount: 0,
      groups: []
    };
  }
}
