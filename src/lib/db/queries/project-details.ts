import { formatRatingLabel, formatUpdatedAtLabel } from "@/lib/module-list";
import { getProjectDetail } from "@/lib/supabase/app-data";
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

function formatDateLabel(value: string | null | undefined) {
  if (!value) {
    return "未填写";
  }

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00.000Z`) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "未填写";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatDateInput(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : value.slice(0, 10);
}

async function buildProjectRelations(projectId: string, projectTitle: string) {
  const payload = await getProjectDetail(projectId);

  if (!payload) {
    return null;
  }

  const photoUrls = await Promise.all(
    payload.photos.map(async (photo) => {
      if (!photo.storagePath) {
        return photo.publicUrl;
      }

      try {
        return await createSignedStorageUrl({
          bucket: photo.storageBucket,
          path: photo.storagePath
        });
      } catch {
        return null;
      }
    })
  );

  return {
    project: payload.project,
    tags: payload.tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color
    })),
    notes: payload.notes.map((note) => ({
      id: note.id,
      title: note.title?.trim() || "未命名笔记",
      body: note.body,
      typeLabel: noteTypeLabels[note.type] ?? note.type,
      recordedAtLabel: formatDateLabel(note.recordedAt),
      sourceUrl: note.sourceUrl,
      pinned: note.pinned
    })),
    photos: payload.photos.map((photo, index) => ({
      id: photo.id,
      url: photoUrls[index] ?? null,
      caption: photo.caption,
      altText: photo.altText?.trim() || photo.caption?.trim() || `${projectTitle} 图片`,
      kindLabel: photoKindLabels[photo.kind] ?? photo.kind,
      createdAtLabel: formatDateLabel(photo.createdAt),
      isPrimary: photo.isPrimary,
      storageLabel: `${photo.storageBucket}/${photo.storagePath}`
    }))
  };
}

export async function getBookDetailPageData(id: string): Promise<BookDetailPagePayload | null> {
  const relations = await buildProjectRelations(id, "书籍");

  if (!relations || relations.project.type !== "book") {
    return null;
  }

  const book = relations.project;

  return {
    detail: {
      id: book.id,
      title: book.title,
      statusLabel: bookStatusLabels[book.status as keyof typeof bookStatusLabels] ?? book.status,
      ratingLabel: formatRatingLabel(book.rating),
      summary: book.summary,
      updatedAtLabel: formatUpdatedAtLabel(book.updatedAt),
      fields: [
        { label: "作者", value: book.author ?? "未填写" },
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
      author: book.author ?? "",
      status: book.status as BookDetailPagePayload["editor"]["status"],
      rating: book.rating ? Number(book.rating).toFixed(1) : "",
      startedAt: formatDateInput(book.startedAt),
      completedAt: formatDateInput(book.completedAt),
      summary: book.summary ?? "",
      tags: relations.tags.map((tag) => tag.name).join(", ")
    }
  };
}

export async function getMovieDetailPageData(id: string): Promise<MovieDetailPagePayload | null> {
  const relations = await buildProjectRelations(id, "电影");

  if (!relations || relations.project.type !== "screen") {
    return null;
  }

  const movie = relations.project;

  return {
    detail: {
      id: movie.id,
      title: movie.title,
      statusLabel: movieStatusLabels[movie.status as keyof typeof movieStatusLabels] ?? movie.status,
      ratingLabel: formatRatingLabel(movie.rating),
      summary: movie.summary,
      updatedAtLabel: formatUpdatedAtLabel(movie.updatedAt),
      fields: [
        { label: "导演", value: movie.director?.trim() || "未填写" },
        { label: "上映年份", value: movie.releaseYear ? String(movie.releaseYear) : "未填写" },
        { label: "观看平台", value: movie.platform?.trim() || "未填写" },
        { label: "片型", value: movie.screenFormat === "movie" ? "电影" : movie.screenFormat ?? "影视" }
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
      status: movie.status as MovieDetailPagePayload["editor"]["status"],
      rating: movie.rating ? Number(movie.rating).toFixed(1) : "",
      note: movie.summary ?? "",
      tags: relations.tags.map((tag) => tag.name).join(", ")
    }
  };
}

export async function getTravelDetailPageData(id: string): Promise<TravelDetailPagePayload | null> {
  const relations = await buildProjectRelations(id, "旅行");

  if (!relations || relations.project.type !== "travel") {
    return null;
  }

  const trip = relations.project;
  const travelDate =
    trip.startDate && trip.endDate && trip.startDate !== trip.endDate
      ? `${formatDateLabel(trip.startDate)} - ${formatDateLabel(trip.endDate)}`
      : formatDateLabel(trip.startDate);

  return {
    detail: {
      id: trip.id,
      title: trip.title,
      statusLabel: travelStageLabels[trip.travelStage ?? ""] ?? trip.travelStage ?? "未填写",
      ratingLabel: formatRatingLabel(trip.rating),
      summary: trip.summary,
      updatedAtLabel: formatUpdatedAtLabel(trip.updatedAt),
      fields: [
        { label: "国家或地区", value: trip.country ?? "未填写" },
        { label: "城市", value: trip.city?.trim() || "未填写" },
        { label: "旅行日期", value: travelDate },
        { label: "阶段", value: travelStageLabels[trip.travelStage ?? ""] ?? trip.travelStage ?? "未填写" }
      ],
      tags: relations.tags,
      notes: relations.notes,
      photos: relations.photos,
      canManage: true
    },
    editor: {
      placeName: trip.title,
      country: trip.country ?? "",
      city: trip.city ?? "",
      status: mapTravelStageToEditorStatus(trip.travelStage ?? "planning"),
      travelDate: formatDateInput(trip.startDate),
      description: trip.summary ?? ""
    }
  };
}