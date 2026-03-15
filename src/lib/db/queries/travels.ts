import {
  buildPagination,
  formatRatingLabel,
  formatUpdatedAtLabel,
  MODULE_LIST_PAGE_SIZE,
  parseModuleListParams
} from "@/lib/module-list";
import { getProjectRowsByKind, type RpcProjectRow } from "@/lib/supabase/app-data";
import type { TravelListItem } from "@/lib/types/items";

const travelStageLabels = {
  idea: "灵感",
  planning: "规划中",
  booked: "已预订",
  visited: "已到访"
} as const;

function formatTravelDate(date: string | null) {
  if (!date) {
    return "日期未填写";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function sortTravelRows(rows: RpcProjectRow[], sort: "updated" | "rating") {
  if (sort === "rating") {
    return [...rows].sort((left, right) => {
      const leftRating = left.rating === null || left.rating === "" ? -1 : Number(left.rating);
      const rightRating = right.rating === null || right.rating === "" ? -1 : Number(right.rating);
      return rightRating - leftRating || new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
  }

  return [...rows].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

function toTravelListItem(row: RpcProjectRow): TravelListItem {
  return {
    id: row.id,
    title: row.title,
    country: row.city ? `${row.country ?? ""} / ${row.city}` : row.country ?? "未填写",
    window: formatTravelDate(row.startDate),
    stage: travelStageLabels[row.travelStage as keyof typeof travelStageLabels] ?? row.travelStage ?? "未填写",
    budget: row.travelStage === "visited" ? "地点记录" : "待成行程",
    summary: row.summary ?? "还没有填写地点描述。",
    highlights: row.city?.trim() ? [row.city.trim()] : [],
    ratingLabel: formatRatingLabel(row.rating),
    updatedAtLabel: formatUpdatedAtLabel(row.updatedAt)
  };
}

function buildEmptyTravelsPageData(sort: "updated" | "rating", page: number) {
  const pagination = buildPagination(0, page, MODULE_LIST_PAGE_SIZE);

  return {
    stats: [
      {
        label: "待出发地点",
        value: "0",
        detail: "处于灵感、规划中或已预订阶段的地点数量。",
        trend: "steady" as const
      },
      {
        label: "已到访地点",
        value: "0",
        detail: "已经完成旅行并归档的地点数量。",
        trend: "steady" as const
      },
      {
        label: "旅行地点总数",
        value: "0",
        detail: "当前账号下已创建的旅行地点记录总数。",
        trend: "steady" as const
      }
    ],
    items: [] as TravelListItem[],
    sort,
    pagination,
    canCreateTravels: true
  };
}

export async function getTravelsPageData(searchParams?: { page?: string; sort?: string }) {
  const { page, sort } = parseModuleListParams(searchParams);
  const resolvedSort = sort as "updated" | "rating";

  try {
    const rows = await getProjectRowsByKind("travel");
    const sortedRows = sortTravelRows(rows, resolvedSort);
    const pagination = buildPagination(sortedRows.length, page, MODULE_LIST_PAGE_SIZE);
    const offset = (pagination.page - 1) * pagination.perPage;
    const visibleRows = sortedRows.slice(offset, offset + pagination.perPage);

    return {
      stats: [
        {
          label: "待出发地点",
          value: String(rows.filter((row) => ["idea", "planning", "booked"].includes(row.travelStage ?? "")).length),
          detail: "处于灵感、规划中或已预订阶段的地点数量。",
          trend: "steady" as const
        },
        {
          label: "已到访地点",
          value: String(rows.filter((row) => row.travelStage === "visited").length),
          detail: "已经完成旅行并归档的地点数量。",
          trend: "up" as const
        },
        {
          label: "旅行地点总数",
          value: String(rows.length),
          detail: "当前账号下已创建的旅行地点记录总数。",
          trend: "up" as const
        }
      ],
      items: visibleRows.map(toTravelListItem),
      sort: resolvedSort,
      pagination,
      canCreateTravels: true
    };
  } catch {
    return buildEmptyTravelsPageData(resolvedSort, page);
  }
}
