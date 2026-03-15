import { bookNotes } from "@/lib/db/mock-data";
import {
  buildPagination,
  formatRatingLabel,
  formatUpdatedAtLabel,
  MODULE_LIST_PAGE_SIZE,
  parseModuleListParams
} from "@/lib/module-list";
import { getProjectRowsByKind, type RpcProjectRow } from "@/lib/supabase/app-data";
import type { BookListItem } from "@/lib/types/items";
import { bookStatusLabels } from "@/modules/books/book-form-schema";

function formatBookProgress(status: keyof typeof bookStatusLabels) {
  switch (status) {
    case "completed":
      return "100%";
    case "in_progress":
      return "进行中";
    case "paused":
      return "已暂停";
    case "planned":
      return "待开始";
    case "wishlist":
    default:
      return "想读";
  }
}

function sortBookRows(rows: RpcProjectRow[], sort: "updated" | "rating") {
  if (sort === "rating") {
    return [...rows].sort((left, right) => {
      const leftRating = left.rating === null || left.rating === "" ? -1 : Number(left.rating);
      const rightRating = right.rating === null || right.rating === "" ? -1 : Number(right.rating);
      return rightRating - leftRating || new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
  }

  return [...rows].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

function toBookListItem(row: RpcProjectRow): BookListItem {
  return {
    id: row.id,
    title: row.title,
    author: row.author ?? "作者未填写",
    status: bookStatusLabels[row.status as keyof typeof bookStatusLabels] ?? row.status,
    progress: formatBookProgress(row.status as keyof typeof bookStatusLabels),
    pages: row.pageCount ?? null,
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

function buildEmptyBooksPageData(sort: "updated" | "rating", page: number) {
  const pagination = buildPagination(0, page, MODULE_LIST_PAGE_SIZE);

  return {
    stats: [
      {
        label: "当前在读",
        value: "0",
        detail: "统计状态为在读和已暂停的书籍数量。",
        trend: "steady" as const
      },
      {
        label: `${new Date().getUTCFullYear()} 年已读完`,
        value: "0",
        detail: "根据 completedAt 统计本年度已完成的阅读记录。",
        trend: "steady" as const
      },
      {
        label: "带笔记书目",
        value: "0",
        detail: "当前账号下已经填写备注的书籍数量。",
        trend: "steady" as const
      }
    ],
    notes: bookNotes,
    items: [] as BookListItem[],
    sort,
    pagination,
    canCreateBooks: true
  };
}

export async function getBooksPageData(searchParams?: { page?: string; sort?: string }) {
  const { page, sort } = parseModuleListParams(searchParams);
  const resolvedSort = sort as "updated" | "rating";

  try {
    const rows = await getProjectRowsByKind("book");
    const sortedRows = sortBookRows(rows, resolvedSort);
    const pagination = buildPagination(sortedRows.length, page, MODULE_LIST_PAGE_SIZE);
    const offset = (pagination.page - 1) * pagination.perPage;
    const visibleRows = sortedRows.slice(offset, offset + pagination.perPage);

    return {
      stats: [
        {
          label: "当前在读",
          value: String(rows.filter((row) => ["in_progress", "paused"].includes(row.status)).length),
          detail: "统计状态为在读和已暂停的书籍数量。",
          trend: "steady" as const
        },
        {
          label: `${new Date().getUTCFullYear()} 年已读完`,
          value: String(rows.filter((row) => row.status === "completed" && isThisYear(row.completedAt)).length),
          detail: "根据 completedAt 统计本年度已完成的阅读记录。",
          trend: "up" as const
        },
        {
          label: "带笔记书目",
          value: String(rows.filter((row) => Boolean(row.summary?.trim())).length),
          detail: "当前账号下已经填写备注的书籍数量。",
          trend: "up" as const
        }
      ],
      notes: bookNotes,
      items: visibleRows.map(toBookListItem),
      sort: resolvedSort,
      pagination,
      canCreateBooks: true
    };
  } catch {
    return buildEmptyBooksPageData(resolvedSort, page);
  }
}
