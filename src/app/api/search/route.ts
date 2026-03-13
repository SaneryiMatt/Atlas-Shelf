import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db, databaseAvailable } from "@/lib/db/client";
import {
  activeTrips,
  bookBacklog,
  currentBooks,
  currentScreens,
  screenBacklog,
  travelArchive
} from "@/lib/db/mock-data";
import { bookDetails, projects, screenDetails, travelDetails } from "@/lib/db/schema";

interface QuickSearchResult {
  id: string;
  kind: "book" | "movie" | "travel";
  title: string;
  href: string;
  meta: string;
}

function buildMockResults(query: string, limit: number): QuickSearchResult[] {
  const normalized = query.toLowerCase();
  const results: QuickSearchResult[] = [];

  // 搜索书籍
  for (const item of [...currentBooks, ...bookBacklog]) {
    if (
      item.title.toLowerCase().includes(normalized) ||
      item.author.toLowerCase().includes(normalized)
    ) {
      results.push({
        id: item.id,
        kind: "book",
        title: item.title,
        href: `/books/${item.id}`,
        meta: item.author
      });
    }
    if (results.length >= limit) break;
  }

  // 搜索影视
  if (results.length < limit) {
    for (const item of [...currentScreens, ...screenBacklog]) {
      if (
        item.title.toLowerCase().includes(normalized) ||
        item.director.toLowerCase().includes(normalized)
      ) {
        results.push({
          id: item.id,
          kind: "movie",
          title: item.title,
          href: `/movies/${item.id}`,
          meta: item.director
        });
      }
      if (results.length >= limit) break;
    }
  }

  // 搜索旅行
  if (results.length < limit) {
    for (const item of [...activeTrips, ...travelArchive]) {
      if (
        item.title.toLowerCase().includes(normalized) ||
        item.country.toLowerCase().includes(normalized)
      ) {
        results.push({
          id: item.id,
          kind: "travel",
          title: item.title,
          href: `/travels/${item.id}`,
          meta: item.country
        });
      }
      if (results.length >= limit) break;
    }
  }

  return results.slice(0, limit);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(Number(searchParams.get("limit")) || 5, 10);

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  if (databaseAvailable && db) {
    try {
      const pattern = `%${query}%`;

      const [bookRows, movieRows, travelRows] = await Promise.all([
        db
          .select({
            id: projects.id,
            title: projects.title,
            author: bookDetails.author
          })
          .from(projects)
          .innerJoin(bookDetails, eq(bookDetails.projectId, projects.id))
          .where(
            and(
              eq(projects.type, "book"),
              or(ilike(projects.title, pattern), ilike(bookDetails.author, pattern))
            )
          )
          .orderBy(desc(projects.updatedAt))
          .limit(limit),
        db
          .select({
            id: projects.id,
            title: projects.title,
            director: screenDetails.director
          })
          .from(projects)
          .innerJoin(screenDetails, eq(screenDetails.projectId, projects.id))
          .where(
            and(
              eq(projects.type, "screen"),
              or(ilike(projects.title, pattern), ilike(screenDetails.director, pattern))
            )
          )
          .orderBy(desc(projects.updatedAt))
          .limit(limit),
        db
          .select({
            id: projects.id,
            title: projects.title,
            country: travelDetails.country
          })
          .from(projects)
          .innerJoin(travelDetails, eq(travelDetails.projectId, projects.id))
          .where(
            and(
              eq(projects.type, "travel"),
              or(
                ilike(projects.title, pattern),
                ilike(travelDetails.country, pattern),
                ilike(travelDetails.city, pattern)
              )
            )
          )
          .orderBy(desc(projects.updatedAt))
          .limit(limit)
      ]);

      const results: QuickSearchResult[] = [
        ...bookRows.map((row) => ({
          id: row.id,
          kind: "book" as const,
          title: row.title,
          href: `/books/${row.id}`,
          meta: row.author
        })),
        ...movieRows.map((row) => ({
          id: row.id,
          kind: "movie" as const,
          title: row.title,
          href: `/movies/${row.id}`,
          meta: row.director ?? ""
        })),
        ...travelRows.map((row) => ({
          id: row.id,
          kind: "travel" as const,
          title: row.title,
          href: `/travels/${row.id}`,
          meta: row.country
        }))
      ].slice(0, limit);

      return NextResponse.json({ results });
    } catch {
      return NextResponse.json({ results: buildMockResults(query, limit) });
    }
  }

  return NextResponse.json({ results: buildMockResults(query, limit) });
}
