"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db, databaseAvailable } from "@/lib/db/client";
import { projects, bookDetails, screenDetails, travelDetails, tags, projectTags } from "@/lib/db/schema";

export interface ExportDataResult {
  status: "success" | "error";
  data?: {
    books: BookExportItem[];
    movies: MovieExportItem[];
    travels: TravelExportItem[];
    exportedAt: string;
    version: string;
  };
  message?: string;
}

export interface ImportDataResult {
  status: "success" | "error";
  message: string;
  imported?: {
    books: number;
    movies: number;
    travels: number;
  };
}

export interface ClearDataResult {
  status: "success" | "error";
  message: string;
}

interface BookExportItem {
  title: string;
  author: string;
  status: string;
  rating: string | null;
  summary: string | null;
  startedAt: string | null;
  completedAt: string | null;
  tags: string[];
  createdAt: string;
}

interface MovieExportItem {
  title: string;
  director: string | null;
  releaseYear: number | null;
  platform: string | null;
  status: string;
  rating: string | null;
  note: string | null;
  tags: string[];
  createdAt: string;
}

interface TravelExportItem {
  placeName: string;
  country: string;
  city: string | null;
  status: string;
  stage: string;
  travelDate: string | null;
  description: string | null;
  createdAt: string;
}

export async function exportAllData(): Promise<ExportDataResult> {
  if (!databaseAvailable || !db) {
    return {
      status: "error",
      message: "数据库当前不可用，无法导出数据。"
    };
  }

  try {
    // 获取所有书籍
    const booksData = await db
      .select({
        id: projects.id,
        title: projects.title,
        status: projects.status,
        rating: projects.rating,
        summary: projects.summary,
        startedAt: projects.startedAt,
        completedAt: projects.completedAt,
        createdAt: projects.createdAt,
        author: bookDetails.author
      })
      .from(projects)
      .leftJoin(bookDetails, eq(projects.id, bookDetails.projectId))
      .where(eq(projects.type, "book"));

    // 获取所有影视
    const moviesData = await db
      .select({
        id: projects.id,
        title: projects.title,
        status: projects.status,
        rating: projects.rating,
        summary: projects.summary,
        createdAt: projects.createdAt,
        director: screenDetails.director,
        releaseYear: screenDetails.releaseYear,
        platform: screenDetails.platform
      })
      .from(projects)
      .leftJoin(screenDetails, eq(projects.id, screenDetails.projectId))
      .where(eq(projects.type, "screen"));

    // 获取所有旅行
    const travelsData = await db
      .select({
        id: projects.id,
        title: projects.title,
        status: projects.status,
        summary: projects.summary,
        startedAt: projects.startedAt,
        createdAt: projects.createdAt,
        country: travelDetails.country,
        city: travelDetails.city,
        stage: travelDetails.stage,
        startDate: travelDetails.startDate
      })
      .from(projects)
      .leftJoin(travelDetails, eq(projects.id, travelDetails.projectId))
      .where(eq(projects.type, "travel"));

    // 获取所有项目的标签
    const projectIds = [
      ...booksData.map(b => b.id),
      ...moviesData.map(m => m.id),
      ...travelsData.map(t => t.id)
    ];

    const projectTagsData = projectIds.length > 0 
      ? await db
          .select({
            projectId: projectTags.projectId,
            tagName: tags.name
          })
          .from(projectTags)
          .innerJoin(tags, eq(projectTags.tagId, tags.id))
          .where(inArray(projectTags.projectId, projectIds))
      : [];

    const tagsByProject = new Map<string, string[]>();
    for (const pt of projectTagsData) {
      const existing = tagsByProject.get(pt.projectId) || [];
      existing.push(pt.tagName);
      tagsByProject.set(pt.projectId, existing);
    }

    const books: BookExportItem[] = booksData.map(book => ({
      title: book.title,
      author: book.author || "",
      status: book.status,
      rating: book.rating,
      summary: book.summary,
      startedAt: book.startedAt?.toISOString() || null,
      completedAt: book.completedAt?.toISOString() || null,
      tags: tagsByProject.get(book.id) || [],
      createdAt: book.createdAt.toISOString()
    }));

    const movies: MovieExportItem[] = moviesData.map(movie => ({
      title: movie.title,
      director: movie.director,
      releaseYear: movie.releaseYear,
      platform: movie.platform,
      status: movie.status,
      rating: movie.rating,
      note: movie.summary,
      tags: tagsByProject.get(movie.id) || [],
      createdAt: movie.createdAt.toISOString()
    }));

    const travels: TravelExportItem[] = travelsData.map(travel => ({
      placeName: travel.title,
      country: travel.country || "",
      city: travel.city,
      status: travel.status,
      stage: travel.stage || "idea",
      travelDate: travel.startDate || null,
      description: travel.summary,
      createdAt: travel.createdAt.toISOString()
    }));

    return {
      status: "success",
      data: {
        books,
        movies,
        travels,
        exportedAt: new Date().toISOString(),
        version: "1.0.0"
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return {
      status: "error",
      message: `导出数据失败：${message}`
    };
  }
}

export async function clearAllData(): Promise<ClearDataResult> {
  if (!databaseAvailable || !db) {
    return {
      status: "error",
      message: "数据库当前不可用，无法清空数据。"
    };
  }

  try {
    // 删除所有项目 (由于级联删除，相关的详情、标签关联、笔记会自动删除)
    await db.delete(projects);
    
    // 删除孤立的标签
    await db.delete(tags);

    revalidatePath("/");
    revalidatePath("/books");
    revalidatePath("/movies");
    revalidatePath("/travels");
    revalidatePath("/settings");

    return {
      status: "success",
      message: "所有数据已清空。"
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return {
      status: "error",
      message: `清空数据失败：${message}`
    };
  }
}

// 验证导入数据的格式
export function validateImportData(data: unknown): { valid: boolean; message: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, message: "无效的数据格式" };
  }

  const obj = data as Record<string, unknown>;

  if (!obj.version || typeof obj.version !== "string") {
    return { valid: false, message: "缺少版本信息" };
  }

  if (!Array.isArray(obj.books)) {
    return { valid: false, message: "书籍数据格式无效" };
  }

  if (!Array.isArray(obj.movies)) {
    return { valid: false, message: "影视数据格式无效" };
  }

  if (!Array.isArray(obj.travels)) {
    return { valid: false, message: "旅行数据格式无效" };
  }

  // 验证书籍数据
  for (const book of obj.books) {
    if (typeof book !== "object" || !book) {
      return { valid: false, message: "书籍数据包含无效项" };
    }
    const b = book as Record<string, unknown>;
    if (!b.title || typeof b.title !== "string") {
      return { valid: false, message: "书籍缺少标题" };
    }
    if (!b.author || typeof b.author !== "string") {
      return { valid: false, message: "书籍缺少作者" };
    }
  }

  // 验证影视数据
  for (const movie of obj.movies) {
    if (typeof movie !== "object" || !movie) {
      return { valid: false, message: "影视数据包含无效项" };
    }
    const m = movie as Record<string, unknown>;
    if (!m.title || typeof m.title !== "string") {
      return { valid: false, message: "影视缺少标题" };
    }
  }

  // 验证旅行数据
  for (const travel of obj.travels) {
    if (typeof travel !== "object" || !travel) {
      return { valid: false, message: "旅行数据包含无效项" };
    }
    const t = travel as Record<string, unknown>;
    if (!t.placeName || typeof t.placeName !== "string") {
      return { valid: false, message: "旅行缺少地点名称" };
    }
    if (!t.country || typeof t.country !== "string") {
      return { valid: false, message: "旅行缺少国家/地区" };
    }
  }

  return { valid: true, message: "数据格式有效" };
}
