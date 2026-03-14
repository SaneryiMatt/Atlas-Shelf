import { and, asc, desc, eq } from "drizzle-orm";

import { db, databaseAvailable } from "@/lib/db/client";
import { activeTrips, bookBacklog, currentBooks, currentScreens, screenBacklog, travelArchive } from "@/lib/db/mock-data";
import {
  bookDetails,
  projectNotes,
  projectPhotos,
  projectTags,
  projects,
  screenDetails,
  tags,
  travelDetails
} from "@/lib/db/schema";
import { formatRatingLabel, formatUpdatedAtLabel } from "@/lib/module-list";
import { createSignedStorageUrl } from "@/lib/supabase/storage";
import type {
  BookDetailPagePayload,
  MovieDetailPagePayload,
  TravelDetailPagePayload
} from "@/lib/types/items";
import { bookStatusLabels } from "@/modules/books/book-form-schema";
import { movieStatusLabels } from "@/modules/movies/screen-form-schema";

const noteTypeLabels: Record<string, string> = {
  general: "通用",
  progress: "进度",
  quote: "摘录",
  review: "评价",
  planning: "规划",
  memory: "回忆"
};

const photoKindLabels: Record<string, string> = {
  cover: "封面",
  gallery: "图片",
  reference: "参考图"
};

const travelStageLabels: Record<string, string> = {
  idea: "灵感",
  planning: "规划中",
  booked: "已预订",
  visited: "已到访"
};

function mapTravelStageToEditorStatus(stage: string): "planned" | "in_progress" | "completed" {
  if (stage === "visited") {
    return "completed";
  }

  if (stage === "booked") {
    return "in_progress";
  }

  return "planned";
}

function formatDateLabel(value: Date | string | null | undefined) {
  if (!value) {
    return "未填写";
  }

  const date =
    typeof value === "string"
      ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : value)
      : value;

  if (Number.isNaN(date.getTime())) {
    return "未填写";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatDateInput(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
  }

  return value.toISOString().slice(0, 10);
}


async function getProjectRelations(projectId: string, projectTitle: string) {
  if (!db) {
    return {
      tags: [],
      notes: [],
      photos: []
    };
  }

  const [tagRows, noteRows, photoRows] = await Promise.all([
    db
      .select({
        id: tags.id,
        name: tags.name,
        color: tags.color
      })
      .from(projectTags)
      .innerJoin(tags, eq(projectTags.tagId, tags.id))
      .where(eq(projectTags.projectId, projectId))
      .orderBy(asc(tags.name)),
    db
      .select({
        id: projectNotes.id,
        title: projectNotes.title,
        body: projectNotes.body,
        type: projectNotes.type,
        sourceUrl: projectNotes.sourceUrl,
        pinned: projectNotes.pinned,
        recordedAt: projectNotes.recordedAt
      })
      .from(projectNotes)
      .where(eq(projectNotes.projectId, projectId))
      .orderBy(desc(projectNotes.pinned), asc(projectNotes.sortOrder), desc(projectNotes.recordedAt)),
    db
      .select({
        id: projectPhotos.id,
        publicUrl: projectPhotos.publicUrl,
        storageBucket: projectPhotos.storageBucket,
        storagePath: projectPhotos.storagePath,
        caption: projectPhotos.caption,
        altText: projectPhotos.altText,
        kind: projectPhotos.kind,
        isPrimary: projectPhotos.isPrimary,
        createdAt: projectPhotos.createdAt
      })
      .from(projectPhotos)
      .where(eq(projectPhotos.projectId, projectId))
      .orderBy(desc(projectPhotos.isPrimary), asc(projectPhotos.sortOrder), desc(projectPhotos.createdAt))
  ]);

  const photoUrls = await Promise.all(
    photoRows.map(async (photo) => {
      if (!photo.storagePath) {
        return photo.publicUrl;
      }

      try {
        return await createSignedStorageUrl({
          bucket: photo.storageBucket,
          path: photo.storagePath
        });
      } catch {
        return photo.publicUrl;
      }
    })
  );

  return {
    tags: tagRows.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color
    })),
    notes: noteRows.map((note) => ({
      id: note.id,
      title: note.title?.trim() || "未命名笔记",
      body: note.body,
      typeLabel: noteTypeLabels[note.type] ?? note.type,
      recordedAtLabel: formatDateLabel(note.recordedAt),
      sourceUrl: note.sourceUrl,
      pinned: note.pinned
    })),
    photos: photoRows.map((photo, index) => ({
      id: photo.id,
      url: photoUrls[index] ?? photo.publicUrl,
      caption: photo.caption,
      altText: photo.altText?.trim() || photo.caption?.trim() || `${projectTitle} 图片`,
      kindLabel: photoKindLabels[photo.kind] ?? photo.kind,
      createdAtLabel: formatDateLabel(photo.createdAt),
      isPrimary: photo.isPrimary,
      storageLabel: `${photo.storageBucket}/${photo.storagePath}`
    }))
  };
}

function buildMockBookPayload(id: string): BookDetailPagePayload | null {
  const book = [...currentBooks, ...bookBacklog].find((item) => item.id === id);

  if (!book) {
    return null;
  }

  return {
    detail: {
      id: book.id,
      title: book.title,
      statusLabel: book.status,
      ratingLabel: book.rating,
      summary: book.summary,
      updatedAtLabel: "示例数据",
      fields: [
        { label: "作者", value: book.author },
        { label: "阅读进度", value: book.progress },
        { label: "页数", value: book.pages ? `${book.pages} 页` : "未填写" },
        { label: "时间信息", value: "示例数据未记录开始和结束日期" }
      ],
      tags: book.tags.map((tag, index) => ({
        id: `${book.id}-tag-${index}`,
        name: tag,
        color: "stone"
      })),
      notes: [
        {
          id: `${book.id}-note`,
          title: "概览",
          body: book.summary,
          typeLabel: "示例",
          recordedAtLabel: "示例数据",
          sourceUrl: null,
          pinned: true
        }
      ],
      photos: [],
      canManage: false
    },
    editor: {
      title: book.title,
      author: book.author,
      status: "planned",
      rating: book.rating,
      startedAt: "",
      completedAt: "",
      summary: book.summary,
      tags: book.tags.join(", ")
    }
  };
}

function buildMockMoviePayload(id: string): MovieDetailPagePayload | null {
  const movie = [...currentScreens, ...screenBacklog].find((item) => item.id === id);

  if (!movie) {
    return null;
  }

  return {
    detail: {
      id: movie.id,
      title: movie.title,
      statusLabel: movie.status,
      ratingLabel: movie.rating,
      summary: movie.summary,
      updatedAtLabel: "示例数据",
      fields: [
        { label: "导演", value: movie.director },
        { label: "观看平台", value: movie.platform },
        { label: "片型", value: movie.format },
        { label: "时间信息", value: movie.runtime }
      ],
      tags: movie.tags.map((tag, index) => ({
        id: `${movie.id}-tag-${index}`,
        name: tag,
        color: "stone"
      })),
      notes: [
        {
          id: `${movie.id}-note`,
          title: "概览",
          body: movie.summary,
          typeLabel: "示例",
          recordedAtLabel: "示例数据",
          sourceUrl: null,
          pinned: true
        }
      ],
      photos: [],
      canManage: false
    },
    editor: {
      title: movie.title,
      director: movie.director,
      releaseYear: "",
      platform: movie.platform,
      status: "planned",
      rating: movie.rating,
      note: movie.summary,
      tags: movie.tags.join(", ")
    }
  };
}

function buildMockTravelPayload(id: string): TravelDetailPagePayload | null {
  const trip = [...activeTrips, ...travelArchive].find((item) => item.id === id);

  if (!trip) {
    return null;
  }

  return {
    detail: {
      id: trip.id,
      title: trip.title,
      statusLabel: trip.stage,
      ratingLabel: "未评分",
      summary: trip.summary,
      updatedAtLabel: "示例数据",
      fields: [
        { label: "目的地", value: trip.country },
        { label: "行程时间", value: trip.window },
        { label: "阶段", value: trip.stage },
        { label: "补充信息", value: trip.budget }
      ],
      tags: [],
      notes: [
        {
          id: `${trip.id}-note`,
          title: "地点描述",
          body: trip.summary,
          typeLabel: "示例",
          recordedAtLabel: "示例数据",
          sourceUrl: null,
          pinned: true
        }
      ],
      photos: [],
      canManage: false
    },
    editor: {
      placeName: trip.title,
      country: trip.country,
      city: "",
      status: "planned",
      travelDate: "",
      description: trip.summary
    }
  };
}

export async function getBookDetailPageData(id: string): Promise<BookDetailPagePayload | null> {
  if (databaseAvailable && db) {
    try {
      const [book] = await db
        .select({
          id: projects.id,
          title: projects.title,
          status: projects.status,
          summary: projects.summary,
          rating: projects.rating,
          startedAt: projects.startedAt,
          completedAt: projects.completedAt,
          updatedAt: projects.updatedAt,
          author: bookDetails.author,
          pageCount: bookDetails.pageCount
        })
        .from(projects)
        .innerJoin(bookDetails, eq(bookDetails.projectId, projects.id))
        .where(and(eq(projects.id, id), eq(projects.type, "book")))
        .limit(1);

      if (!book) {
        return null;
      }

      const relations = await getProjectRelations(book.id, book.title);

      return {
        detail: {
          id: book.id,
          title: book.title,
          statusLabel: bookStatusLabels[book.status],
          ratingLabel: formatRatingLabel(book.rating),
          summary: book.summary,
          updatedAtLabel: formatUpdatedAtLabel(book.updatedAt),
          fields: [
            { label: "作者", value: book.author },
            { label: "页数", value: book.pageCount ? `${book.pageCount} 页` : "未填写" },
            { label: "开始日期", value: formatDateLabel(book.startedAt) },
            { label: "结束日期", value: formatDateLabel(book.completedAt) }
          ],
          tags: relations.tags,
          notes: relations.notes,
          photos: relations.photos,
          canManage: true
        },
        editor: {
          title: book.title,
          author: book.author,
          status: book.status,
          rating: book.rating ? Number(book.rating).toFixed(1) : "",
          startedAt: formatDateInput(book.startedAt),
          completedAt: formatDateInput(book.completedAt),
          summary: book.summary ?? "",
          tags: relations.tags.map((tag) => tag.name).join(", ")
        }
      };
    } catch {
      return buildMockBookPayload(id);
    }
  }

  return buildMockBookPayload(id);
}

export async function getMovieDetailPageData(id: string): Promise<MovieDetailPagePayload | null> {
  if (databaseAvailable && db) {
    try {
      const [movie] = await db
        .select({
          id: projects.id,
          title: projects.title,
          status: projects.status,
          summary: projects.summary,
          rating: projects.rating,
          updatedAt: projects.updatedAt,
          director: screenDetails.director,
          releaseYear: screenDetails.releaseYear,
          platform: screenDetails.platform
        })
        .from(projects)
        .innerJoin(screenDetails, eq(screenDetails.projectId, projects.id))
        .where(and(eq(projects.id, id), eq(projects.type, "screen"), eq(screenDetails.format, "movie")))
        .limit(1);

      if (!movie) {
        return null;
      }

      const relations = await getProjectRelations(movie.id, movie.title);

      return {
        detail: {
          id: movie.id,
          title: movie.title,
          statusLabel: movieStatusLabels[movie.status],
          ratingLabel: formatRatingLabel(movie.rating),
          summary: movie.summary,
          updatedAtLabel: formatUpdatedAtLabel(movie.updatedAt),
          fields: [
            { label: "导演", value: movie.director?.trim() || "未填写" },
            { label: "上映年份", value: movie.releaseYear ? String(movie.releaseYear) : "未填写" },
            { label: "观看平台", value: movie.platform?.trim() || "未填写" },
            { label: "片型", value: "电影" }
          ],
          tags: relations.tags,
          notes: relations.notes,
          photos: relations.photos,
          canManage: true
        },
        editor: {
          title: movie.title,
          director: movie.director ?? "",
          releaseYear: movie.releaseYear ? String(movie.releaseYear) : "",
          platform: movie.platform ?? "",
          status: movie.status,
          rating: movie.rating ? Number(movie.rating).toFixed(1) : "",
          note: movie.summary ?? "",
          tags: relations.tags.map((tag) => tag.name).join(", ")
        }
      };
    } catch {
      return buildMockMoviePayload(id);
    }
  }

  return buildMockMoviePayload(id);
}

export async function getTravelDetailPageData(id: string): Promise<TravelDetailPagePayload | null> {
  if (databaseAvailable && db) {
    try {
      const [trip] = await db
        .select({
          id: projects.id,
          title: projects.title,
          summary: projects.summary,
          rating: projects.rating,
          updatedAt: projects.updatedAt,
          country: travelDetails.country,
          city: travelDetails.city,
          stage: travelDetails.stage,
          startDate: travelDetails.startDate,
          endDate: travelDetails.endDate
        })
        .from(projects)
        .innerJoin(travelDetails, eq(travelDetails.projectId, projects.id))
        .where(and(eq(projects.id, id), eq(projects.type, "travel")))
        .limit(1);

      if (!trip) {
        return null;
      }

      const relations = await getProjectRelations(trip.id, trip.title);
      const travelDate =
        trip.startDate && trip.endDate && trip.startDate !== trip.endDate
          ? `${formatDateLabel(trip.startDate)} - ${formatDateLabel(trip.endDate)}`
          : formatDateLabel(trip.startDate);

      return {
        detail: {
          id: trip.id,
          title: trip.title,
          statusLabel: travelStageLabels[trip.stage] ?? trip.stage,
          ratingLabel: formatRatingLabel(trip.rating),
          summary: trip.summary,
          updatedAtLabel: formatUpdatedAtLabel(trip.updatedAt),
          fields: [
            { label: "国家或地区", value: trip.country },
            { label: "城市", value: trip.city?.trim() || "未填写" },
            { label: "旅行日期", value: travelDate },
            { label: "阶段", value: travelStageLabels[trip.stage] ?? trip.stage }
          ],
          tags: relations.tags,
          notes: relations.notes,
          photos: relations.photos,
          canManage: true
        },
        editor: {
          placeName: trip.title,
          country: trip.country,
          city: trip.city ?? "",
          status: mapTravelStageToEditorStatus(trip.stage),
          travelDate: formatDateInput(trip.startDate),
          description: trip.summary ?? ""
        }
      };
    } catch {
      return buildMockTravelPayload(id);
    }
  }

  return buildMockTravelPayload(id);
}




