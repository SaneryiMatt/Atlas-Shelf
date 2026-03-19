import type { ModuleListSort, PaginationInfo } from "@/lib/types/items";

export const MODULE_LIST_PAGE_SIZE = 6;

export const discreteRatingValues = ["1", "2", "3", "4", "5"] as const;
export const discreteRatingOptions: Array<{ value: (typeof discreteRatingValues)[number]; label: string }> =
  discreteRatingValues.map((value) => ({
    value,
    label: value
  }));

export function isDiscreteRatingValue(value: string): value is (typeof discreteRatingValues)[number] {
  return discreteRatingValues.includes(value as (typeof discreteRatingValues)[number]);
}

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

function normalizeDiscreteRating(rating: string | number | null | undefined) {
  if (rating === null || rating === undefined || rating === "") {
    return null;
  }

  const resolvedRating = Number(rating);

  if (Number.isNaN(resolvedRating)) {
    return null;
  }

  const roundedRating = Math.round(resolvedRating);

  if (roundedRating <= 0) {
    return 1;
  }

  return Math.min(5, roundedRating);
}

export function formatRatingLabel(rating: string | number | null) {
  const normalizedRating = normalizeDiscreteRating(rating);

  if (normalizedRating === null) {
    return "未评分";
  }

  return String(normalizedRating);
}

export function formatRatingInputValue(rating: string | number | null | undefined) {
  const normalizedRating = normalizeDiscreteRating(rating);

  if (normalizedRating === null) {
    return "";
  }

  return String(normalizedRating);
}
