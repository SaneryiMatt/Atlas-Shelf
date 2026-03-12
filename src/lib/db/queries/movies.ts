import { and, asc, count, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";

import { db, databaseAvailable } from "@/lib/db/client";
import { currentScreens, screenBacklog, screenStats } from "@/lib/db/mock-data";
import { projectNotes, projectTags, projects, screenDetails, tags } from "@/lib/db/schema";
import { buildPagination, formatRatingLabel, formatUpdatedAtLabel, MODULE_LIST_PAGE_SIZE, parseModuleListParams } from "@/lib/module-list";
import type { ScreenListItem } from "@/lib/types/items";
import { movieStatusLabels } from "@/modules/movies/screen-form-schema";

function buildMovieListFromMock(sort: "updated" | "rating", page: number) {
  const items: ScreenListItem[] = [...currentScreens, ...screenBacklog].map((movie, index) => ({
    ...movie,
    updatedAtLabel: `最近更新 ${index + 1}`
  }));

  if (sort === "rating") {
    items.sort((left, right) => Number(right.rating) - Number(left.rating));
  }

  const pagination = buildPagination(items.length, page, MODULE_LIST_PAGE_SIZE);
  const offset = (pagination.page - 1) * pagination.perPage;

  return {
    items: items.slice(offset, offset + pagination.perPage),
    pagination
  };
}

export async function getMoviesPageData(searchParams?: { page?: string; sort?: string }) {
  const { page, sort } = parseModuleListParams(searchParams);

  if (databaseAvailable && db) {
    try {
      const now = new Date();
      const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const startOfNextYear = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));

      const [watchingNowResult, completedThisYearResult, annotatedMoviesResult, totalCountResult] = await Promise.all([
        db
          .select({ count: count() })
          .from(projects)
          .innerJoin(screenDetails, eq(screenDetails.projectId, projects.id))
          .where(and(eq(projects.type, "screen"), eq(screenDetails.format, "movie"), inArray(projects.status, ["in_progress", "paused"]))),
        db
          .select({ count: count() })
          .from(projects)
          .innerJoin(screenDetails, eq(screenDetails.projectId, projects.id))
          .where(
            and(
              eq(projects.type, "screen"),
              eq(screenDetails.format, "movie"),
              eq(projects.status, "completed"),
              gte(projects.completedAt, startOfYear),
              lt(projects.completedAt, startOfNextYear)
            )
          ),
        db
          .select({
            count: sql<number>`count(distinct ${projectNotes.projectId})`
          })
          .from(projectNotes)
          .innerJoin(projects, eq(projectNotes.projectId, projects.id))
          .innerJoin(screenDetails, eq(screenDetails.projectId, projects.id))
          .where(and(eq(projects.type, "screen"), eq(screenDetails.format, "movie"))),
        db
          .select({ count: count() })
          .from(projects)
          .innerJoin(screenDetails, eq(screenDetails.projectId, projects.id))
          .where(and(eq(projects.type, "screen"), eq(screenDetails.format, "movie")))
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

      const movieRows = await db
        .select({
          id: projects.id,
          title: projects.title,
          status: projects.status,
          summary: projects.summary,
          rating: projects.rating,
          director: screenDetails.director,
          platform: screenDetails.platform,
          releaseYear: screenDetails.releaseYear,
          format: screenDetails.format,
          updatedAt: projects.updatedAt
        })
        .from(projects)
        .innerJoin(screenDetails, eq(screenDetails.projectId, projects.id))
        .where(and(eq(projects.type, "screen"), eq(screenDetails.format, "movie")))
        .orderBy(...orderBy)
        .limit(pagination.perPage)
        .offset(offset);

      const movieIds = movieRows.map((movie) => movie.id);
      const tagRows =
        movieIds.length > 0
          ? await db
              .select({
                projectId: projectTags.projectId,
                tagName: tags.name
              })
              .from(projectTags)
              .innerJoin(tags, eq(projectTags.tagId, tags.id))
              .where(inArray(projectTags.projectId, movieIds))
          : [];

      const tagsByProject = new Map<string, string[]>();

      for (const row of tagRows) {
        const currentTags = tagsByProject.get(row.projectId) ?? [];
        currentTags.push(row.tagName);
        tagsByProject.set(row.projectId, currentTags);
      }

      const items: ScreenListItem[] = movieRows.map((movie) => ({
        id: movie.id,
        title: movie.title,
        format: movie.format === "movie" ? "电影" : movie.format,
        director: movie.director ?? "导演未填写",
        platform: movie.platform ?? "平台未填写",
        status: movieStatusLabels[movie.status],
        runtime: movie.releaseYear ? `${movie.releaseYear} 年上映` : "上映年份未填写",
        rating: formatRatingLabel(movie.rating),
        summary: movie.summary ?? "还没有填写备注。",
        tags: tagsByProject.get(movie.id) ?? [],
        updatedAtLabel: formatUpdatedAtLabel(movie.updatedAt)
      }));

      return {
        stats: [
          {
            label: "当前在看",
            value: String(watchingNowResult[0]?.count ?? 0),
            detail: "统计状态为“观看中”和“已暂停”的电影数量。",
            trend: "steady" as const
          },
          {
            label: `${now.getUTCFullYear()} 年已看完`,
            value: String(completedThisYearResult[0]?.count ?? 0),
            detail: "根据 completed_at 统计本年度已完成的观影记录。",
            trend: "up" as const
          },
          {
            label: "带笔记影片",
            value: String(Number(annotatedMoviesResult[0]?.count ?? 0)),
            detail: "至少存在一条 project_notes 记录的电影数量。",
            trend: "up" as const
          }
        ],
        items,
        sort,
        pagination,
        canCreateMovies: true
      };
    } catch {
      // Fall back to mock data if the database query fails so the page still renders.
    }
  }

  const mockList = buildMovieListFromMock(sort, page);

  return {
    stats: screenStats,
    items: mockList.items,
    sort,
    pagination: mockList.pagination,
    canCreateMovies: true
  };
}
