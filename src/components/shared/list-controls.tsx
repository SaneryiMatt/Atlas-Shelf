import Link from "next/link";
import { ArrowDownWideNarrow, ChevronLeft, ChevronRight, Clock3, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ModuleListSort, PaginationInfo } from "@/lib/types/items";

interface ListControlsProps {
  basePath: string;
  currentSort: ModuleListSort;
  pagination: PaginationInfo;
  itemUnit: string;
}

function buildHref(basePath: string, sort: ModuleListSort, page: number) {
  const params = new URLSearchParams({
    sort,
    page: String(page)
  });

  return `${basePath}?${params.toString()}`;
}

export function ListControls({ basePath, currentSort, pagination, itemUnit }: ListControlsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ArrowDownWideNarrow className="size-4" />
          <span>排序与分页</span>
        </div>
        <p className="text-sm text-muted-foreground">
          共 {pagination.totalItems} {itemUnit}，第 {pagination.page} / {pagination.totalPages} 页
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:items-end">
        <div className="flex flex-wrap gap-2">
          <Button variant={currentSort === "updated" ? "default" : "outline"} size="sm" asChild>
            <Link href={buildHref(basePath, "updated", 1)}>
              <Clock3 className="size-4" />
              按更新时间
            </Link>
          </Button>
          <Button variant={currentSort === "rating" ? "default" : "outline"} size="sm" asChild>
            <Link href={buildHref(basePath, "rating", 1)}>
              <Star className="size-4" />
              按评分
            </Link>
          </Button>
        </div>

        <div className="flex gap-2">
          {pagination.hasPreviousPage ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildHref(basePath, currentSort, pagination.page - 1)}>
                <ChevronLeft className="size-4" />
                上一页
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="size-4" />
              上一页
            </Button>
          )}

          {pagination.hasNextPage ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildHref(basePath, currentSort, pagination.page + 1)}>
                下一页
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              下一页
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
