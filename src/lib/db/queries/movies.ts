import { buildPagination, formatRatingLabel, formatUpdatedAtLabel, MODULE_LIST_PAGE_SIZE, parseModuleListParams } from "@/lib/module-list";
import { getProjectRowsByKind, type RpcProjectRow } from "@/lib/supabase/app-data";
import type { ScreenListItem } from "@/lib/types/items";
import { movieStatusLabels } from "@/modules/movies/screen-form-schema";

function sortMovieRows(rows: RpcProjectRow[], sort: "updated" | "rating") {
  if (sort === "rating") {
    return [...rows].sort((left, right) => {
      const leftRating = left.rating === null || left.rating === "" ? -1 : Number(left.rating);
      const rightRating = right.rating === null || right.rating === "" ? -1 : Number(right.rating);
      return rightRating - leftRating || new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
  }

  return [...rows].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

function toMovieListItem(row: RpcProjectRow): ScreenListItem {
  return {
    id: row.id,
    title: row.title,
    format: row.screenFormat === "movie" ? "电影" : row.screenFormat ?? "影视",
    director: row.director?.trim() || "导演未填写",
    platform: row.platform?.trim() || "平台未填写",
    status: movieStatusLabels[row.status as keyof typeof movieStatusLabels] ?? row.status,
    runtime: row.releaseYear ? `${row.releaseYear} 年上映` : "上映年份未填写",
    rating: formatRatingLabel(row.rating),
    summary: row.summary ?? "还没有填写备注。",
    tags: row.tagNames ?? [],
    updatedAtLabel: formatUpdatedAtLabel(row.updatedAt)
  };
}

function isThisYear(dateValue: string | null) {
  if (!dateValue) {
    return false;
  }

  const date = new Date(dateValue);
  const now = new Date();
  return !Number.isNaN(date.getTime()) && date.getUTCFullYear() === now.getUTCFullYear();
}

function buildEmptyMoviesPageData(sort: "updated" | "rating", page: number) {
  const pagination = buildPagination(0, page, MODULE_LIST_PAGE_SIZE);

  return {
    stats: [
      {
        label: "当前在看",
        value: "0",
        detail: "统计状态为“在看”和“已暂停”的电影数量。",
        trend: "steady" as const
      },
      {
        label: `${new Date().getUTCFullYear()} 年已看完`,
        value: "0",
        detail: "根据 completedAt 统计本年度已完成的观影记录。",
        trend: "steady" as const
      },
      {
        label: "带笔记影片",
        value: "0",
        detail: "当前账号下已生成“创建时备注”的电影数量。",
        trend: "steady" as const
      }
    ],
    items: [] as ScreenListItem[],
    sort,
    pagination,
    canCreateMovies: true
  };
}

export async function getMoviesPageData(searchParams?: { page?: string; sort?: string }) {
  const { page, sort } = parseModuleListParams(searchParams);

  try {
    const rows = await getProjectRowsByKind("movie");
    const sortedRows = sortMovieRows(rows, sort);
    const pagination = buildPagination(sortedRows.length, page, MODULE_LIST_PAGE_SIZE);
    const offset = (pagination.page - 1) * pagination.perPage;
    const visibleRows = sortedRows.slice(offset, offset + pagination.perPage);

    return {
      stats: [
        {
          label: "当前在看",
          value: String(rows.filter((row) => ["in_progress", "paused"].includes(row.status)).length),
          detail: "统计状态为“在看”和“已暂停”的电影数量。",
          trend: "steady" as const
        },
        {
          label: `${new Date().getUTCFullYear()} 年已看完`,
          value: String(rows.filter((row) => row.status === "completed" && isThisYear(row.completedAt)).length),
          detail: "根据 completedAt 统计本年度已完成的观影记录。",
          trend: "up" as const
        },
        {
          label: "带笔记影片",
          value: String(rows.filter((row) => Boolean(row.summary?.trim())).length),
          detail: "当前账号下已生成“创建时备注”的电影数量。",
          trend: "up" as const
        }
      ],
      items: visibleRows.map(toMovieListItem),
      sort,
      pagination,
      canCreateMovies: true
    };
  } catch {
    return buildEmptyMoviesPageData(sort, page);
  }
}