import { NextRequest, NextResponse } from "next/server";

import { searchProjects } from "@/lib/supabase/app-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface QuickSearchResult {
  id: string;
  kind: "book" | "movie" | "travel" | "application";
  title: string;
  href: string;
  meta: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(Number(searchParams.get("limit")) || 5, 10);

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ results: [] }, { status: 401 });
    }

    const rows = await searchProjects(query, limit, supabase);
    const results: QuickSearchResult[] = rows.slice(0, limit).map((row) => ({
      id: row.id,
      kind: row.type === "screen" ? "movie" : row.type,
      title: row.title,
      href:
        row.type === "book"
          ? `/books/${row.id}`
          : row.type === "screen"
            ? `/movies/${row.id}`
            : row.type === "travel"
              ? `/travels/${row.id}`
              : `/applications/${row.id}`,
      meta:
        row.type === "book"
          ? row.author ?? ""
          : row.type === "screen"
            ? row.director ?? ""
            : row.type === "travel"
              ? row.country ?? ""
              : [row.company, row.role, row.applicationSource].filter(Boolean).join(" · ")
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
