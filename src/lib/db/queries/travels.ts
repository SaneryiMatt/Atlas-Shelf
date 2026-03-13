import { asc, count, desc, eq, inArray, sql } from "drizzle-orm";

import { db, databaseAvailable } from "@/lib/db/client";
import { activeTrips, travelArchive, travelStats } from "@/lib/db/mock-data";
import {
  buildPagination,
  formatRatingLabel,
  formatUpdatedAtLabel,
  MODULE_LIST_PAGE_SIZE,
  parseModuleListParams
} from "@/lib/module-list";
import { projects, travelDetails } from "@/lib/db/schema";
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

function buildTravelListFromMock(sort: "updated" | "rating", page: number) {
  const items: TravelListItem[] = [...activeTrips, ...travelArchive].map((trip, index) => ({
    ...trip,
    ratingLabel: "未评分",
    updatedAtLabel: `最近更新 ${index + 1}`
  }));

  if (sort === "rating") {
    items.sort(() => 0);
  }

  const pagination = buildPagination(items.length, page, MODULE_LIST_PAGE_SIZE);
  const offset = (pagination.page - 1) * pagination.perPage;

  return {
    items: items.slice(offset, offset + pagination.perPage),
    pagination
  };
}

export async function getTravelsPageData(searchParams?: { page?: string; sort?: string }) {
  const { page, sort } = parseModuleListParams(searchParams);

  if (databaseAvailable && db) {
    try {
      const [activeCountResult, visitedCountResult, totalCountResult] = await Promise.all([
        db
          .select({ count: count() })
          .from(travelDetails)
          .where(inArray(travelDetails.stage, ["idea", "planning", "booked"])),
        db
          .select({ count: count() })
          .from(travelDetails)
          .where(eq(travelDetails.stage, "visited")),
        db
          .select({ count: count() })
          .from(projects)
          .where(eq(projects.type, "travel"))
      ]);

      const pagination = buildPagination(totalCountResult[0]?.count ?? 0, page, MODULE_LIST_PAGE_SIZE);
      const offset = (pagination.page - 1) * pagination.perPage;
      const orderBy =
        sort === "rating"
          ? [
              asc(sql`case when ${projects.rating} is null then 1 else 0 end`),
              desc(projects.rating),
              desc(projects.updatedAt)
            ]
          : [desc(projects.updatedAt)];

      const travelRows = await db
        .select({
          id: projects.id,
          title: projects.title,
          summary: projects.summary,
          rating: projects.rating,
          country: travelDetails.country,
          city: travelDetails.city,
          stage: travelDetails.stage,
          startDate: travelDetails.startDate,
          updatedAt: projects.updatedAt
        })
        .from(projects)
        .innerJoin(travelDetails, eq(travelDetails.projectId, projects.id))
        .where(eq(projects.type, "travel"))
        .orderBy(...orderBy)
        .limit(pagination.perPage)
        .offset(offset);

      const items: TravelListItem[] = travelRows.map((trip) => ({
        id: trip.id,
        title: trip.title,
        country: trip.city ? `${trip.country} / ${trip.city}` : trip.country,
        window: formatTravelDate(trip.startDate),
        stage: travelStageLabels[trip.stage],
        budget: trip.stage === "visited" ? "地点记录" : "待成行",
        summary: trip.summary ?? "还没有填写地点描述。",
        highlights: trip.city?.trim() ? [trip.city.trim()] : [],
        ratingLabel: formatRatingLabel(trip.rating),
        updatedAtLabel: formatUpdatedAtLabel(trip.updatedAt)
      }));

      return {
        stats: [
          {
            label: "待出发地点",
            value: String(activeCountResult[0]?.count ?? 0),
            detail: "处于灵感、规划中或已预订阶段的地点数量。",
            trend: "steady" as const
          },
          {
            label: "已到访地点",
            value: String(visitedCountResult[0]?.count ?? 0),
            detail: "已经完成旅行并归档的地点数量。",
            trend: "up" as const
          },
          {
            label: "旅行地点总数",
            value: String(totalCountResult[0]?.count ?? 0),
            detail: "当前已创建的旅行地点记录总数。",
            trend: "up" as const
          }
        ],
        items,
        sort,
        pagination,
        canCreateTravels: true
      };
    } catch {
      // Fall back to mock data if the database query fails so the page still renders.
    }
  }

  const mockList = buildTravelListFromMock(sort, page);

  return {
    stats: travelStats,
    items: mockList.items,
    sort,
    pagination: mockList.pagination,
    canCreateTravels: Boolean(databaseAvailable)
  };
}
