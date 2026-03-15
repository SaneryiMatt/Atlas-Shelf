import type { ModuleListSort, PaginationInfo } from "@/lib/types/items";

export const MODULE_LIST_PAGE_SIZE = 6;

export function parseModuleListParams(
  searchParams?: { page?: string; sort?: string },
  options: {
    allowedSorts?: readonly ModuleListSort[];
    defaultSort?: ModuleListSort;
  } = {}
) {
  const allowedSorts = options.allowedSorts ?? (["updated", "rating"] as const);
  const requestedSort = searchParams?.sort as ModuleListSort | undefined;
  const fallbackSort =
    options.defaultSort && allowedSorts.includes(options.defaultSort)
      ? options.defaultSort
      : (allowedSorts[0] ?? "updated");
  const sort = requestedSort && allowedSorts.includes(requestedSort) ? requestedSort : fallbackSort;
  const parsedPage = Number(searchParams?.page);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;

  return { page, sort };
}

function toDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function buildPagination(totalItems: number, page: number, perPage = MODULE_LIST_PAGE_SIZE): PaginationInfo {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(page, totalPages);

  return {
    page: currentPage,
    perPage,
    totalItems,
    totalPages,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages
  };
}

export function formatUpdatedAtLabel(date: Date | string | null) {
  const resolvedDate = toDate(date);

  if (!resolvedDate) {
    return "更新时间未知";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(resolvedDate);
}

export function formatRatingLabel(rating: string | number | null) {
  if (rating === null || rating === undefined || rating === "") {
    return "未评分";
  }

  return Number(rating).toFixed(1);
}
