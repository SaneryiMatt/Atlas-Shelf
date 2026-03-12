import { desc, eq } from "drizzle-orm";

import { db, databaseAvailable } from "@/lib/db/client";
import { bookDetails, projects, screenDetails, travelDetails } from "@/lib/db/schema";
import type { ChartDatum, DashboardAnalyticsData, DashboardStat, QueueItem, TimelineEvent } from "@/lib/types/items";

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
  startDate: string | Date | null;
  author: string | null;
  pageCount: number | null;
  screenFormat: "movie" | "series" | "anime" | "documentary" | null;
  director: string | null;
  platform: string | null;
  country: string | null;
  city: string | null;
};

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
  anime: "动漫",
  documentary: "纪录片"
} as const;

const mockEntries: DashboardEntry[] = [
  {
    id: "mock-book-1",
    type: "book",
    title: "The Creative Act",
    status: "in_progress",
    summary: "继续沉淀创作和审美相关的摘录，保持低速但稳定的阅读节奏。",
    rating: 4.6,
    updatedAt: new Date("2026-03-10T08:00:00.000Z"),
    createdAt: new Date("2026-02-01T08:00:00.000Z"),
    startedAt: new Date("2026-02-05T08:00:00.000Z"),
    completedAt: null,
    startDate: null,
    author: "Rick Rubin",
    pageCount: 432,
    screenFormat: null,
    director: null,
    platform: null,
    country: null,
    city: null
  },
  {
    id: "mock-screen-1",
    type: "screen",
    title: "葬送的芙莉莲",
    status: "in_progress",
    summary: "适合作为长期连载项目慢慢看，也适合补充分集笔记。",
    rating: 4.9,
    updatedAt: new Date("2026-03-08T08:00:00.000Z"),
    createdAt: new Date("2026-01-12T08:00:00.000Z"),
    startedAt: new Date("2026-01-15T08:00:00.000Z"),
    completedAt: null,
    startDate: null,
    author: null,
    pageCount: null,
    screenFormat: "anime",
    director: "斋藤圭一郎",
    platform: "Crunchyroll",
    country: null,
    city: null
  },
  {
    id: "mock-book-2",
    type: "book",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    status: "completed",
    summary: "一段关于关系、创作和时间的阅读记录，已经补完简短笔记。",
    rating: 4.4,
    updatedAt: new Date("2026-03-02T08:00:00.000Z"),
    createdAt: new Date("2026-01-03T08:00:00.000Z"),
    startedAt: new Date("2026-01-08T08:00:00.000Z"),
    completedAt: new Date("2026-02-26T08:00:00.000Z"),
    startDate: null,
    author: "Gabrielle Zevin",
    pageCount: 416,
    screenFormat: null,
    director: null,
    platform: null,
    country: null,
    city: null
  },
  {
    id: "mock-screen-2",
    type: "screen",
    title: "Perfect Days",
    status: "completed",
    summary: "看完后记录了关于节奏感和留白的感受。",
    rating: 4.8,
    updatedAt: new Date("2026-02-20T08:00:00.000Z"),
    createdAt: new Date("2026-02-10T08:00:00.000Z"),
    startedAt: new Date("2026-02-11T08:00:00.000Z"),
    completedAt: new Date("2026-02-18T08:00:00.000Z"),
    startDate: null,
    author: null,
    pageCount: null,
    screenFormat: "movie",
    director: "Wim Wenders",
    platform: "影院待看",
    country: null,
    city: null
  },
  {
    id: "mock-travel-1",
    type: "travel",
    title: "里斯本轻冬之行",
    status: "planned",
    summary: "住宿和基本路线已定，接下来只补充城市步行节点。",
    rating: 4.7,
    updatedAt: new Date("2026-02-16T08:00:00.000Z"),
    createdAt: new Date("2026-01-20T08:00:00.000Z"),
    startedAt: null,
    completedAt: null,
    startDate: "2026-02-14",
    author: null,
    pageCount: null,
    screenFormat: null,
    director: null,
    platform: null,
    country: "葡萄牙",
    city: "里斯本"
  },
  {
    id: "mock-travel-2",
    type: "travel",
    title: "京都秋日重访",
    status: "wishlist",
    summary: "先整理喜欢的街区和季节节点，暂时不急着订具体行程。",
    rating: null,
    updatedAt: new Date("2026-01-25T08:00:00.000Z"),
    createdAt: new Date("2026-01-10T08:00:00.000Z"),
    startedAt: null,
    completedAt: null,
    startDate: "2026-11-18",
    author: null,
    pageCount: null,
    screenFormat: null,
    director: null,
    platform: null,
    country: "日本",
    city: "京都"
  }
];

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
    "4.5+": 0,
    "4.0-4.4": 0,
    "3.0-3.9": 0,
    "3.0以下": 0,
    未评分: 0
  };

  for (const entry of entries) {
    if (entry.rating === null || entry.rating === undefined || entry.rating === "") {
      buckets["未评分"] += 1;
      continue;
    }

    const rating = Number(entry.rating);

    if (Number.isNaN(rating)) {
      buckets["未评分"] += 1;
      continue;
    }

    if (rating >= 4.5) {
      buckets["4.5+"] += 1;
    } else if (rating >= 4.0) {
      buckets["4.0-4.4"] += 1;
    } else if (rating >= 3.0) {
      buckets["3.0-3.9"] += 1;
    } else {
      buckets["3.0以下"] += 1;
    }
  }

  return [
    buildDistributionItem("4.5+", buckets["4.5+"], total, chartAccents.ratingA),
    buildDistributionItem("4.0-4.4", buckets["4.0-4.4"], total, chartAccents.ratingB),
    buildDistributionItem("3.0-3.9", buckets["3.0-3.9"], total, chartAccents.ratingC),
    buildDistributionItem("3.0以下", buckets["3.0以下"], total, chartAccents.ratingD),
    buildDistributionItem("未评分", buckets["未评分"], total, chartAccents.ratingUnrated)
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
      detail: "正在观看中的电影、剧集或动漫数量。",
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

function buildMockDashboardPageData() {
  return buildDashboardPageData(mockEntries);
}

export async function getDashboardPageData() {
  if (databaseAvailable && db) {
    try {
      const rows = await db
        .select({
          id: projects.id,
          type: projects.type,
          title: projects.title,
          status: projects.status,
          summary: projects.summary,
          rating: projects.rating,
          updatedAt: projects.updatedAt,
          createdAt: projects.createdAt,
          startedAt: projects.startedAt,
          completedAt: projects.completedAt,
          author: bookDetails.author,
          pageCount: bookDetails.pageCount,
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

      return buildDashboardPageData(
        rows.map((row) => ({
          id: row.id,
          type: row.type,
          title: row.title,
          status: row.status,
          summary: row.summary,
          rating: row.rating,
          updatedAt: row.updatedAt,
          createdAt: row.createdAt,
          startedAt: row.startedAt,
          completedAt: row.completedAt,
          startDate: row.startDate,
          author: row.author,
          pageCount: row.pageCount,
          screenFormat: row.screenFormat,
          director: row.director,
          platform: row.platform,
          country: row.country,
          city: row.city
        }))
      );
    } catch {
      return buildMockDashboardPageData();
    }
  }

  return buildMockDashboardPageData();
}
