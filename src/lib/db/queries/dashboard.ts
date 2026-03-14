import { getDashboardProjectRows, type RpcProjectRow } from "@/lib/supabase/app-data";
import type { ChartDatum, DashboardAnalyticsData, DashboardStat, QueueItem, TimelineEvent } from "@/lib/types/items";

const chartAccents = {
  book: "#c59d5f",
  screen: "#5f897d",
  travel: "#7c9470",
  ratingA: "#d8a14d",
  ratingB: "#bc7f4c",
  ratingC: "#8a8f66",
  ratingD: "#6f7f92",
  ratingUnrated: "#525866",
  trend: "#8b735b"
} as const;

const bookStatusLabels = {
  wishlist: "想读",
  planned: "计划中",
  in_progress: "在读",
  completed: "已读完",
  paused: "已暂停"
} as const;

const screenStatusLabels = {
  wishlist: "想看",
  planned: "计划中",
  in_progress: "在看",
  completed: "已看完",
  paused: "已暂停"
} as const;

const screenFormatLabels = {
  movie: "电影",
  series: "剧集",
  anime: "动画",
  documentary: "纪录片"
} as const;

type DashboardEntry = {
  id: string;
  type: "book" | "screen" | "travel";
  title: string;
  status: string;
  summary: string | null;
  rating: string | number | null;
  updatedAt: Date | null;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  startDate: string | null;
  author: string | null;
  pageCount: number | null;
  screenFormat: "movie" | "series" | "anime" | "documentary" | null;
  director: string | null;
  platform: string | null;
  country: string | null;
  city: string | null;
};

function toDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toEntry(row: RpcProjectRow): DashboardEntry {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    status: row.status,
    summary: row.summary,
    rating: row.rating,
    updatedAt: toDate(row.updatedAt),
    createdAt: toDate(row.createdAt) ?? new Date(),
    startedAt: toDate(row.startedAt),
    completedAt: toDate(row.completedAt),
    startDate: row.startDate,
    author: row.author,
    pageCount: row.pageCount,
    screenFormat: (row.screenFormat as DashboardEntry["screenFormat"]) ?? null,
    director: row.director,
    platform: row.platform,
    country: row.country,
    city: row.city
  };
}

function parseDateLike(value: Date | string | null | undefined) {
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

function getActivityDate(entry: DashboardEntry) {
  if (entry.type === "travel") {
    return parseDateLike(entry.startDate) ?? entry.updatedAt ?? entry.createdAt;
  }

  return entry.completedAt ?? entry.startedAt ?? entry.updatedAt ?? entry.createdAt;
}

function formatPercent(count: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${Math.round((count / total) * 100)}%`;
}

function buildDistributionItem(label: string, count: number, total: number, accent: string): ChartDatum {
  return {
    label,
    value: count,
    displayValue: `${count} 条 · ${formatPercent(count, total)}`,
    accent
  };
}

function buildMonthlyTrend(year: number, entries: DashboardEntry[]) {
  const counts = Array.from({ length: 12 }, () => 0);

  for (const entry of entries) {
    const activityDate = getActivityDate(entry);

    if (activityDate.getUTCFullYear() !== year) {
      continue;
    }

    counts[activityDate.getUTCMonth()] += 1;
  }

  return counts.map<ChartDatum>((count, index) => ({
    label: `${index + 1}月`,
    value: count,
    displayValue: String(count),
    accent: chartAccents.trend
  }));
}

function buildRatingDistribution(entries: DashboardEntry[], total: number) {
  const buckets = {
    high: 0,
    mediumHigh: 0,
    medium: 0,
    low: 0,
    unrated: 0
  };

  for (const entry of entries) {
    if (entry.rating === null || entry.rating === undefined || entry.rating === "") {
      buckets.unrated += 1;
      continue;
    }

    const rating = Number(entry.rating);

    if (Number.isNaN(rating)) {
      buckets.unrated += 1;
      continue;
    }

    if (rating >= 4.5) {
      buckets.high += 1;
    } else if (rating >= 4.0) {
      buckets.mediumHigh += 1;
    } else if (rating >= 3.0) {
      buckets.medium += 1;
    } else {
      buckets.low += 1;
    }
  }

  return [
    buildDistributionItem("4.5+", buckets.high, total, chartAccents.ratingA),
    buildDistributionItem("4.0-4.4", buckets.mediumHigh, total, chartAccents.ratingB),
    buildDistributionItem("3.0-3.9", buckets.medium, total, chartAccents.ratingC),
    buildDistributionItem("3.0 以下", buckets.low, total, chartAccents.ratingD),
    buildDistributionItem("未评分", buckets.unrated, total, chartAccents.ratingUnrated)
  ];
}

function buildAnalytics(year: number, entries: DashboardEntry[]): DashboardAnalyticsData {
  const annualEntries = entries.filter((entry) => getActivityDate(entry).getUTCFullYear() === year);
  const annualTotal = annualEntries.length;

  return {
    year,
    annualTotal,
    typeDistribution: [
      buildDistributionItem(
        "书籍",
        annualEntries.filter((entry) => entry.type === "book").length,
        annualTotal,
        chartAccents.book
      ),
      buildDistributionItem(
        "影视",
        annualEntries.filter((entry) => entry.type === "screen").length,
        annualTotal,
        chartAccents.screen
      ),
      buildDistributionItem(
        "旅行",
        annualEntries.filter((entry) => entry.type === "travel").length,
        annualTotal,
        chartAccents.travel
      )
    ],
    ratingDistribution: buildRatingDistribution(annualEntries, annualTotal),
    monthlyTrend: buildMonthlyTrend(year, annualEntries)
  };
}

function buildFocusItem(entry: DashboardEntry): QueueItem {
  if (entry.type === "book") {
    return {
      id: entry.id,
      title: entry.title,
      type: "book",
      status: bookStatusLabels[entry.status as keyof typeof bookStatusLabels] ?? entry.status,
      meta: [entry.author, entry.pageCount ? `${entry.pageCount} 页` : null].filter(Boolean).join(" · ") || "继续阅读中",
      summary: entry.summary?.trim() || "继续记录你的阅读想法、摘录和进度。",
      tags: []
    };
  }

  return {
    id: entry.id,
    title: entry.title,
    type: "screen",
    status: screenStatusLabels[entry.status as keyof typeof screenStatusLabels] ?? entry.status,
    meta:
      [
        entry.screenFormat ? screenFormatLabels[entry.screenFormat] : "影视",
        entry.director,
        entry.platform
      ]
        .filter(Boolean)
        .join(" · ") || "继续观看中",
    summary: entry.summary?.trim() || "继续补充观影记录、平台信息和短评。",
    tags: []
  };
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function buildRecentMoment(entry: DashboardEntry): TimelineEvent {
  const activityDate = getActivityDate(entry);

  if (entry.type === "book") {
    return {
      id: entry.id,
      title: entry.title,
      date: formatDateLabel(activityDate),
      kind: "book",
      badge: "书籍",
      description: entry.summary?.trim() || `作者：${entry.author ?? "未知作者"}`,
      href: `/books/${entry.id}`
    };
  }

  if (entry.type === "screen") {
    return {
      id: entry.id,
      title: entry.title,
      date: formatDateLabel(activityDate),
      kind: "screen",
      badge: entry.screenFormat ? screenFormatLabels[entry.screenFormat] : "影视",
      description:
        entry.summary?.trim() ||
        [entry.director, entry.platform].filter(Boolean).join(" · ") ||
        "补充了新的影视记录。",
      href: `/movies/${entry.id}`
    };
  }

  return {
    id: entry.id,
    title: entry.title,
    date: formatDateLabel(activityDate),
    kind: "travel",
    badge: "旅行",
    description:
      entry.summary?.trim() || [entry.country, entry.city].filter(Boolean).join(" · ") || "更新了旅行计划。",
    href: `/travels/${entry.id}`
  };
}

function buildStats(readingCount: number, watchingCount: number, annualTotal: number): DashboardStat[] {
  return [
    {
      label: "当前在读",
      value: String(readingCount),
      detail: "正在推进中的书籍条目数量。",
      trend: "steady"
    },
    {
      label: "当前在看",
      value: String(watchingCount),
      detail: "正在观看中的电影、剧集或动画数量。",
      trend: "steady"
    },
    {
      label: "年度总数",
      value: String(annualTotal),
      detail: "按条目主时间统计到今年的记录总数。",
      trend: annualTotal > 0 ? "up" : "steady"
    }
  ];
}

function buildDashboardPageData(entries: DashboardEntry[]) {
  const year = new Date().getUTCFullYear();
  const readingEntries = entries.filter((entry) => entry.type === "book" && entry.status === "in_progress");
  const watchingEntries = entries.filter((entry) => entry.type === "screen" && entry.status === "in_progress");
  const analytics = buildAnalytics(year, entries);

  return {
    stats: buildStats(readingEntries.length, watchingEntries.length, analytics.annualTotal),
    focusItems: [...readingEntries, ...watchingEntries]
      .sort((left, right) => (right.updatedAt ?? right.createdAt).getTime() - (left.updatedAt ?? left.createdAt).getTime())
      .slice(0, 6)
      .map(buildFocusItem),
    recentMoments: [...entries]
      .sort((left, right) => getActivityDate(right).getTime() - getActivityDate(left).getTime())
      .slice(0, 6)
      .map(buildRecentMoment),
    analytics
  };
}

function buildEmptyDashboardPageData() {
  return buildDashboardPageData([]);
}

export async function getDashboardPageData() {
  try {
    const rows = await getDashboardProjectRows();
    return buildDashboardPageData(rows.map(toEntry));
  } catch {
    return buildEmptyDashboardPageData();
  }
}