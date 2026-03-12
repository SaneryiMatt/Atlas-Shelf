import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

import { db, databaseAvailable } from "@/lib/db/client";
import {
  activeTrips,
  bookBacklog,
  currentBooks,
  currentScreens,
  screenBacklog,
  travelArchive
} from "@/lib/db/mock-data";
import { bookDetails, projectTags, projects, screenDetails, tags, travelDetails } from "@/lib/db/schema";
import { formatRatingLabel, formatUpdatedAtLabel } from "@/lib/module-list";
import type { SearchPageData, SearchResultGroup, SearchResultItem, SearchResultKind } from "@/lib/types/items";
import { bookStatusLabels } from "@/modules/books/book-form-schema";
import { movieStatusLabels } from "@/modules/movies/screen-form-schema";

const groupMeta: Record<SearchResultKind, { title: string; description: string }> = {
  book: {
    title: "书籍",
    description: "搜索书名、作者、摘要和标签。"
  },
  movie: {
    title: "影视",
    description: "搜索片名、导演、平台、摘要和标签。"
  },
  travel: {
    title: "旅行",
    description: "搜索地点、城市、国家、描述和标签。"
  }
};

const travelStageLabels: Record<string, string> = {
  idea: "灵感",
  planning: "规划中",
  booked: "已预订",
  visited: "已到访"
};

function normalizeQuery(query: string | undefined) {
  return query?.trim() ?? "";
}

function buildSearchPattern(query: string) {
  return `%${query}%`;
}

function buildEmptySearchData(query: string): SearchPageData {
  return {
    query,
    totalCount: 0,
    groups: (Object.entries(groupMeta) as Array<[SearchResultKind, (typeof groupMeta)[SearchResultKind]]>).map(([key, meta]) => ({
      key,
      title: meta.title,
      description: meta.description,
      items: []
    }))
  };
}

function buildTagLookupRows<T extends { id: string }>(items: T[]) {
  return items.map((item) => item.id);
}

async function loadTagsByProjectIds(projectIds: string[]) {
  if (!db || !projectIds.length) {
    return new Map<string, string[]>();
  }

  const rows = await db
    .select({
      projectId: projectTags.projectId,
      tagName: tags.name
    })
    .from(projectTags)
    .innerJoin(tags, eq(projectTags.tagId, tags.id))
    .where(inArray(projectTags.projectId, projectIds))
    .orderBy(asc(tags.name));

  const tagMap = new Map<string, string[]>();

  for (const row of rows) {
    const values = tagMap.get(row.projectId) ?? [];
    values.push(row.tagName);
    tagMap.set(row.projectId, values);
  }

  return tagMap;
}

function buildTagSearchCondition(pattern: string) {
  return sql<boolean>`exists (
    select 1
    from ${projectTags}
    inner join ${tags} on ${projectTags.tagId} = ${tags.id}
    where ${projectTags.projectId} = ${projects.id}
      and ${tags.name} ilike ${pattern}
  )`;
}

function buildMockSearchData(query: string): SearchPageData {
  const normalized = query.toLowerCase();

  const bookItems: SearchResultItem[] = [...currentBooks, ...bookBacklog]
    .filter((item) =>
      [item.title, item.author, item.summary, ...item.tags].some((value) => value.toLowerCase().includes(normalized))
    )
    .map((item) => ({
      id: item.id,
      kind: "book",
      title: item.title,
      href: `/books/${item.id}`,
      summary: item.summary,
      meta: item.author,
      statusLabel: item.status,
      ratingLabel: item.rating,
      updatedAtLabel: "示例数据",
      tags: item.tags
    }));

  const movieItems: SearchResultItem[] = [...currentScreens, ...screenBacklog]
    .filter((item) =>
      [item.title, item.director, item.platform, item.summary, ...item.tags].some((value) => value.toLowerCase().includes(normalized))
    )
    .map((item) => ({
      id: item.id,
      kind: "movie",
      title: item.title,
      href: `/movies/${item.id}`,
      summary: item.summary,
      meta: `${item.director} · ${item.platform}`,
      statusLabel: item.status,
      ratingLabel: item.rating,
      updatedAtLabel: "示例数据",
      tags: item.tags
    }));

  const travelItems: SearchResultItem[] = [...activeTrips, ...travelArchive]
    .filter((item) => [item.title, item.country, item.summary, ...item.highlights].some((value) => value.toLowerCase().includes(normalized)))
    .map((item) => ({
      id: item.id,
      kind: "travel",
      title: item.title,
      href: `/travels/${item.id}`,
      summary: item.summary,
      meta: item.country,
      statusLabel: item.stage,
      ratingLabel: "未评分",
      updatedAtLabel: "示例数据",
      tags: item.highlights
    }));

  const groups: SearchResultGroup[] = [
    {
      key: "book",
      title: groupMeta.book.title,
      description: groupMeta.book.description,
      items: bookItems
    },
    {
      key: "movie",
      title: groupMeta.movie.title,
      description: groupMeta.movie.description,
      items: movieItems
    },
    {
      key: "travel",
      title: groupMeta.travel.title,
      description: groupMeta.travel.description,
      items: travelItems
    }
  ];

  return {
    query,
    totalCount: groups.reduce((sum, group) => sum + group.items.length, 0),
    groups
  };
}

export async function getGlobalSearchData(query: string | undefined): Promise<SearchPageData> {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return buildEmptySearchData("");
  }

  if (databaseAvailable && db) {
    try {
      const pattern = buildSearchPattern(normalizedQuery);
      const tagSearch = buildTagSearchCondition(pattern);

      const [bookRows, movieRows, travelRows] = await Promise.all([
        db
          .select({
            id: projects.id,
            title: projects.title,
            summary: projects.summary,
            status: projects.status,
            rating: projects.rating,
            updatedAt: projects.updatedAt,
            author: bookDetails.author
          })
          .from(projects)
          .innerJoin(bookDetails, eq(bookDetails.projectId, projects.id))
          .where(
            and(
              eq(projects.type, "book"),
              or(ilike(projects.title, pattern), ilike(projects.summary, pattern), ilike(bookDetails.author, pattern), tagSearch)
            )
          )
          .orderBy(desc(projects.updatedAt)),
        db
          .select({
            id: projects.id,
            title: projects.title,
            summary: projects.summary,
            status: projects.status,
            rating: projects.rating,
            updatedAt: projects.updatedAt,
            director: screenDetails.director,
            platform: screenDetails.platform
          })
          .from(projects)
          .innerJoin(screenDetails, eq(screenDetails.projectId, projects.id))
          .where(
            and(
              eq(projects.type, "screen"),
              eq(screenDetails.format, "movie"),
              or(
                ilike(projects.title, pattern),
                ilike(projects.summary, pattern),
                ilike(screenDetails.director, pattern),
                ilike(screenDetails.platform, pattern),
                tagSearch
              )
            )
          )
          .orderBy(desc(projects.updatedAt)),
        db
          .select({
            id: projects.id,
            title: projects.title,
            summary: projects.summary,
            rating: projects.rating,
            updatedAt: projects.updatedAt,
            country: travelDetails.country,
            city: travelDetails.city,
            stage: travelDetails.stage
          })
          .from(projects)
          .innerJoin(travelDetails, eq(travelDetails.projectId, projects.id))
          .where(
            and(
              eq(projects.type, "travel"),
              or(
                ilike(projects.title, pattern),
                ilike(projects.summary, pattern),
                ilike(travelDetails.country, pattern),
                ilike(travelDetails.city, pattern),
                tagSearch
              )
            )
          )
          .orderBy(desc(projects.updatedAt))
      ]);

      const tagMap = await loadTagsByProjectIds([
        ...buildTagLookupRows(bookRows),
        ...buildTagLookupRows(movieRows),
        ...buildTagLookupRows(travelRows)
      ]);

      const groups: SearchResultGroup[] = [
        {
          key: "book",
          title: groupMeta.book.title,
          description: groupMeta.book.description,
          items: bookRows.map((item) => ({
            id: item.id,
            kind: "book",
            title: item.title,
            href: `/books/${item.id}`,
            summary: item.summary ?? "暂无摘要。",
            meta: item.author,
            statusLabel: bookStatusLabels[item.status],
            ratingLabel: formatRatingLabel(item.rating),
            updatedAtLabel: formatUpdatedAtLabel(item.updatedAt),
            tags: tagMap.get(item.id) ?? []
          }))
        },
        {
          key: "movie",
          title: groupMeta.movie.title,
          description: groupMeta.movie.description,
          items: movieRows.map((item) => ({
            id: item.id,
            kind: "movie",
            title: item.title,
            href: `/movies/${item.id}`,
            summary: item.summary ?? "暂无摘要。",
            meta: `${item.director?.trim() || "导演未填写"} · ${item.platform?.trim() || "平台未填写"}`,
            statusLabel: movieStatusLabels[item.status],
            ratingLabel: formatRatingLabel(item.rating),
            updatedAtLabel: formatUpdatedAtLabel(item.updatedAt),
            tags: tagMap.get(item.id) ?? []
          }))
        },
        {
          key: "travel",
          title: groupMeta.travel.title,
          description: groupMeta.travel.description,
          items: travelRows.map((item) => ({
            id: item.id,
            kind: "travel",
            title: item.title,
            href: `/travels/${item.id}`,
            summary: item.summary ?? "暂无描述。",
            meta: item.city?.trim() ? `${item.country} · ${item.city}` : item.country,
            statusLabel: travelStageLabels[item.stage] ?? item.stage,
            ratingLabel: formatRatingLabel(item.rating),
            updatedAtLabel: formatUpdatedAtLabel(item.updatedAt),
            tags: tagMap.get(item.id) ?? []
          }))
        }
      ];

      return {
        query: normalizedQuery,
        totalCount: groups.reduce((sum, group) => sum + group.items.length, 0),
        groups
      };
    } catch {
      return buildMockSearchData(normalizedQuery);
    }
  }

  return buildMockSearchData(normalizedQuery);
}
