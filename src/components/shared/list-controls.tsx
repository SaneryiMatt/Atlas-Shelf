import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, SlidersHorizontal, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ModuleListSort, PaginationInfo } from "@/lib/types/items";

interface ListControlsProps {
  basePath: string;
  currentSort: ModuleListSort;
  pagination: PaginationInfo;
  itemUnit: string;
  sortOptions?: ModuleListSort[];
}

const sortLabels: Record<ModuleListSort, string> = {
  updated: "时间",
  rating: "评分",
  applied: "投递"
};

const sortIcons = {
  updated: Clock,
  rating: Star,
  applied: CalendarDays
} as const;

function buildHref(basePath: string, sort: ModuleListSort, page: number) {
  const params = new URLSearchParams({
    sort,
    page: String(page)
  });

  return `${basePath}?${params.toString()}`;
}

export function ListControls({
  basePath,
  currentSort,
  pagination,
  itemUnit,
  sortOptions = ["updated", "rating"]
}: ListControlsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <SlidersHorizontal className="size-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          共 {pagination.totalItems} {itemUnit}，第 {pagination.page} / {pagination.totalPages} 页
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {sortOptions.map((sortOption) => {
            const Icon = sortIcons[sortOption];

            return (
              <Button key={sortOption} variant={currentSort === sortOption ? "secondary" : "ghost"} size="sm" asChild>
                <Link href={buildHref(basePath, sortOption, 1)}>
                  <Icon className="size-3.5" />
                  {sortLabels[sortOption]}
                </Link>
              </Button>
            );
          })}
        </div>

        <div className="mx-1 h-4 w-px bg-border" />

        <div className="flex gap-1">
          {pagination.hasPreviousPage ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href={buildHref(basePath, currentSort, pagination.page - 1)}>
                <ChevronLeft className="size-4" />
                上一页
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" disabled>
              <ChevronLeft className="size-4" />
              上一页
            </Button>
          )}

          {pagination.hasNextPage ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href={buildHref(basePath, currentSort, pagination.page + 1)}>
                下一页
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" disabled>
              下一页
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
