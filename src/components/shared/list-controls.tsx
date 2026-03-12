import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Star, SlidersHorizontal } from "lucide-react";

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
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <SlidersHorizontal className="size-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          共 {pagination.totalItems} {itemUnit}，第 {pagination.page} / {pagination.totalPages} 页
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* 排序按钮 */}
        <div className="flex gap-1">
          <Button variant={currentSort === "updated" ? "secondary" : "ghost"} size="sm" asChild>
            <Link href={buildHref(basePath, "updated", 1)}>
              <Clock className="size-3.5" />
              时间
            </Link>
          </Button>
          <Button variant={currentSort === "rating" ? "secondary" : "ghost"} size="sm" asChild>
            <Link href={buildHref(basePath, "rating", 1)}>
              <Star className="size-3.5" />
              评分
            </Link>
          </Button>
        </div>

        {/* 分隔线 */}
        <div className="mx-1 h-4 w-px bg-border" />

        {/* 分页按钮 */}
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
