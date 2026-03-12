import { and, asc, count, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";

import { db, databaseAvailable } from "@/lib/db/client";
import { bookBacklog, bookNotes, booksStats, currentBooks } from "@/lib/db/mock-data";
import { bookDetails, projectNotes, projectTags, projects, tags } from "@/lib/db/schema";
import { buildPagination, formatRatingLabel, formatUpdatedAtLabel, MODULE_LIST_PAGE_SIZE, parseModuleListParams } from "@/lib/module-list";
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

function buildBookListFromMock(sort: "updated" | "rating", page: number) {
  const items: BookListItem[] = [...currentBooks, ...bookBacklog].map((book, index) => ({
    ...book,
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

export async function getBooksPageData(searchParams?: { page?: string; sort?: string }) {
  const { page, sort } = parseModuleListParams(searchParams);

  if (databaseAvailable && db) {
    try {
      const now = new Date();
      const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const startOfNextYear = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));

      const [readingNowResult, completedThisYearResult, annotatedBooksResult, totalCountResult] = await Promise.all([
        db
          .select({ count: count() })
          .from(projects)
          .where(and(eq(projects.type, "book"), inArray(projects.status, ["in_progress", "paused"]))),
        db
          .select({ count: count() })
          .from(projects)
          .where(
            and(
              eq(projects.type, "book"),
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
          .where(eq(projects.type, "book")),
        db
          .select({ count: count() })
          .from(projects)
          .where(eq(projects.type, "book"))
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

      const bookRows = await db
        .select({
          id: projects.id,
          title: projects.title,
          status: projects.status,
          summary: projects.summary,
          rating: projects.rating,
          author: bookDetails.author,
          pageCount: bookDetails.pageCount,
          updatedAt: projects.updatedAt
        })
        .from(projects)
        .innerJoin(bookDetails, eq(bookDetails.projectId, projects.id))
        .where(eq(projects.type, "book"))
        .orderBy(...orderBy)
        .limit(pagination.perPage)
        .offset(offset);

      const bookIds = bookRows.map((book) => book.id);
      const tagRows =
        bookIds.length > 0
          ? await db
              .select({
                projectId: projectTags.projectId,
                tagName: tags.name
              })
              .from(projectTags)
              .innerJoin(tags, eq(projectTags.tagId, tags.id))
              .where(inArray(projectTags.projectId, bookIds))
          : [];

      const tagsByProject = new Map<string, string[]>();

      for (const row of tagRows) {
        const currentTags = tagsByProject.get(row.projectId) ?? [];
        currentTags.push(row.tagName);
        tagsByProject.set(row.projectId, currentTags);
      }

      const items: BookListItem[] = bookRows.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        status: bookStatusLabels[book.status],
        progress: formatBookProgress(book.status),
        pages: book.pageCount ?? null,
        rating: formatRatingLabel(book.rating),
        summary: book.summary ?? "还没有填写备注。",
        tags: tagsByProject.get(book.id) ?? [],
        updatedAtLabel: formatUpdatedAtLabel(book.updatedAt)
      }));

      return {
        stats: [
          {
            label: "当前在读",
            value: String(readingNowResult[0]?.count ?? 0),
            detail: "统计状态为“在读”和“已暂停”的书籍数量。",
            trend: "steady" as const
          },
          {
            label: `${now.getUTCFullYear()} 年已读完`,
            value: String(completedThisYearResult[0]?.count ?? 0),
            detail: "根据 completed_at 统计本年度已完成的阅读记录。",
            trend: "up" as const
          },
          {
            label: "带笔记书目",
            value: String(Number(annotatedBooksResult[0]?.count ?? 0)),
            detail: "至少存在一条 project_notes 记录的书籍数量。",
            trend: "up" as const
          }
        ],
        notes: bookNotes,
        items,
        sort,
        pagination,
        canCreateBooks: true
      };
    } catch {
      // Fall back to mock data if the database query fails so the page still renders.
    }
  }

  const mockList = buildBookListFromMock(sort, page);

  return {
    stats: booksStats,
    notes: bookNotes,
    items: mockList.items,
    sort,
    pagination: mockList.pagination,
    canCreateBooks: Boolean(databaseAvailable)
  };
}
