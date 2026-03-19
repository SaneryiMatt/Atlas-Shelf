import { formatRatingLabel, formatUpdatedAtLabel } from "@/lib/module-list";
import { searchProjects } from "@/lib/supabase/app-data";
import type { SearchPageData, SearchResultGroup, SearchResultItem, SearchResultKind } from "@/lib/types/items";
import {
  applicationResultLabels,
  applicationStageLabels
} from "@/modules/applications/application-form-schema";
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
  },
  application: {
    title: "投递",
    description: "搜索公司、岗位、来源和备注。"
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

function toResultItem(row: Awaited<ReturnType<typeof searchProjects>>[number]): SearchResultItem {
  if (row.type === "book") {
    return {
      id: row.id,
      kind: "book",
      title: row.title,
      href: `/books/${row.id}`,
      summary: row.summary ?? "暂无摘要。",
      meta: row.author ?? "作者未填写",
      statusLabel: bookStatusLabels[row.status as keyof typeof bookStatusLabels] ?? row.status,
      metricLabel: "评分",
      metricValue: formatRatingLabel(row.rating),
      updatedAtLabel: formatUpdatedAtLabel(row.updatedAt),
      tags: row.tagNames ?? []
    };
  }

  if (row.type === "screen") {
    return {
      id: row.id,
      kind: "movie",
      title: row.title,
      href: `/movies/${row.id}`,
      summary: row.summary ?? "暂无摘要。",
      meta: [row.director?.trim() || "导演未填写", row.platform?.trim() || "平台未填写"].join(" · "),
      statusLabel: movieStatusLabels[row.status as keyof typeof movieStatusLabels] ?? row.status,
      metricLabel: "评分",
      metricValue: formatRatingLabel(row.rating),
      updatedAtLabel: formatUpdatedAtLabel(row.updatedAt),
      tags: row.tagNames ?? []
    };
  }

  if (row.type === "travel") {
    return {
      id: row.id,
      kind: "travel",
      title: row.title,
      href: `/travels/${row.id}`,
      summary: row.summary ?? "暂无描述。",
      meta: row.city?.trim() ? `${row.country} · ${row.city}` : row.country ?? "目的地未填写",
      statusLabel: travelStageLabels[row.travelStage ?? ""] ?? row.travelStage ?? "未填写",
      metricLabel: "评分",
      metricValue: formatRatingLabel(row.rating),
      updatedAtLabel: formatUpdatedAtLabel(row.updatedAt),
      tags: row.tagNames ?? []
    };
  }

  return {
    id: row.id,
    kind: "application",
    title: row.title,
    href: `/applications/${row.id}`,
    summary: row.summary ?? "暂无备注。",
    meta: [row.company, row.role, row.applicationSource].filter(Boolean).join(" · ") || "投递信息未完整填写",
    statusLabel: applicationStageLabels[row.applicationStage as keyof typeof applicationStageLabels] ?? row.applicationStage ?? "未填写",
    metricLabel: "结果",
    metricValue: applicationResultLabels[row.applicationResult as keyof typeof applicationResultLabels] ?? row.applicationResult ?? "待定",
    updatedAtLabel: formatUpdatedAtLabel(row.updatedAt),
    tags: row.tagNames ?? []
  };
}

export async function getGlobalSearchData(query: string | undefined): Promise<SearchPageData> {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return buildEmptySearchData("");
  }

  try {
    const rows = await searchProjects(normalizedQuery, 50);
    const groupedItems = rows.map(toResultItem).reduce<Record<SearchResultKind, SearchResultItem[]>>(
      (accumulator, item) => {
        accumulator[item.kind].push(item);
        return accumulator;
      },
      {
        book: [],
        movie: [],
        travel: [],
        application: []
      }
    );

    const groups: SearchResultGroup[] = [
      { key: "book", title: groupMeta.book.title, description: groupMeta.book.description, items: groupedItems.book },
      { key: "movie", title: groupMeta.movie.title, description: groupMeta.movie.description, items: groupedItems.movie },
      { key: "travel", title: groupMeta.travel.title, description: groupMeta.travel.description, items: groupedItems.travel },
      {
        key: "application",
        title: groupMeta.application.title,
        description: groupMeta.application.description,
        items: groupedItems.application
      }
    ];

    return {
      query: normalizedQuery,
      totalCount: groups.reduce((sum, group) => sum + group.items.length, 0),
      groups
    };
  } catch {
    return buildEmptySearchData(normalizedQuery);
  }
}
