"use server";

import { createHash, randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { db, databaseAvailable } from "@/lib/db/client";
import { syncManagedNote, syncProjectTags } from "@/lib/db/project-write-utils";
import { projects, screenDetails } from "@/lib/db/schema";
import type { ItemStatus } from "@/lib/types/items";
import { movieFormSchema, splitMovieTags } from "@/modules/movies/screen-form-schema";

export interface CreateMovieFormState {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<
    Record<"title" | "director" | "releaseYear" | "platform" | "status" | "rating" | "note" | "tags", string>
  >;
}

export interface DeleteMovieState {
  status: "idle" | "success" | "error";
  message: string | null;
}

function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "movie";
}

function buildProjectSlug(title: string, director: string) {
  return `${slugify(title)}-${createHash("sha1").update(`${title}:${director}:${randomUUID()}`).digest("hex").slice(0, 8)}`;
}

function getValidatedMovieValues(formData: FormData) {
  return movieFormSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    director: String(formData.get("director") ?? ""),
    releaseYear: String(formData.get("releaseYear") ?? ""),
    platform: String(formData.get("platform") ?? ""),
    status: String(formData.get("status") ?? "planned"),
    rating: String(formData.get("rating") ?? ""),
    note: String(formData.get("note") ?? ""),
    tags: String(formData.get("tags") ?? "")
  });
}

function getMovieFieldErrors(parsed: ReturnType<typeof getValidatedMovieValues>): CreateMovieFormState {
  if (parsed.success) {
    return {
      status: "idle",
      message: null,
      fieldErrors: {}
    };
  }

  const flattened = parsed.error.flatten().fieldErrors;

  return {
    status: "error",
    message: "请先修正表单中的问题。",
    fieldErrors: {
      title: flattened.title?.[0],
      director: flattened.director?.[0],
      releaseYear: flattened.releaseYear?.[0],
      platform: flattened.platform?.[0],
      status: flattened.status?.[0],
      rating: flattened.rating?.[0],
      note: flattened.note?.[0],
      tags: flattened.tags?.[0]
    }
  };
}

function revalidateMoviePaths(projectId: string) {
  revalidatePath("/movies");
  revalidatePath(`/movies/${projectId}`);
  revalidatePath("/settings");
}

export async function createMovieAction(
  _previousState: CreateMovieFormState,
  formData: FormData
): Promise<CreateMovieFormState> {
  await requireUser();

  if (!databaseAvailable || !db) {
    return {
      status: "error",
      message: "数据库当前不可用，无法保存影视条目。",
      fieldErrors: {}
    };
  }

  const parsed = getValidatedMovieValues(formData);

  if (!parsed.success) {
    return getMovieFieldErrors(parsed);
  }

  const values = parsed.data;
  const normalizedTags = splitMovieTags(values.tags);
  const note = values.note || null;
  const rating = values.rating ? Number(values.rating).toFixed(1) : null;
  const releaseYear = values.releaseYear ? Number(values.releaseYear) : null;
  const status = values.status as ItemStatus;

  try {
    const projectId = await db.transaction(async (tx) => {
      const [project] = await tx
        .insert(projects)
        .values({
          type: "screen",
          status,
          title: values.title,
          slug: buildProjectSlug(values.title, values.director),
          summary: note,
          rating
        })
        .returning({ id: projects.id });

      await tx.insert(screenDetails).values({
        projectId: project.id,
        format: "movie",
        director: values.director,
        releaseYear,
        platform: values.platform
      });

      await syncManagedNote(tx, {
        projectId: project.id,
        title: "创建时备注",
        type: "general",
        body: note
      });

      await syncProjectTags(tx, project.id, normalizedTags);

      return project.id;
    });

    revalidateMoviePaths(projectId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `保存影视条目失败：${message}`,
      fieldErrors: {}
    };
  }

  return {
    status: "success",
    message: "影视条目已保存。",
    fieldErrors: {}
  };
}

export async function updateMovieAction(
  _previousState: CreateMovieFormState,
  formData: FormData
): Promise<CreateMovieFormState> {
  await requireUser();

  if (!databaseAvailable || !db) {
    return {
      status: "error",
      message: "数据库当前不可用，无法更新影视条目。",
      fieldErrors: {}
    };
  }

  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    return {
      status: "error",
      message: "缺少影视标识，无法更新。",
      fieldErrors: {}
    };
  }

  const parsed = getValidatedMovieValues(formData);

  if (!parsed.success) {
    return getMovieFieldErrors(parsed);
  }

  const values = parsed.data;
  const normalizedTags = splitMovieTags(values.tags);
  const note = values.note || null;
  const rating = values.rating ? Number(values.rating).toFixed(1) : null;
  const releaseYear = values.releaseYear ? Number(values.releaseYear) : null;
  const status = values.status as ItemStatus;

  try {
    await db.transaction(async (tx) => {
      const [project] = await tx
        .update(projects)
        .set({
          status,
          title: values.title,
          summary: note,
          rating,
          updatedAt: new Date()
        })
        .where(and(eq(projects.id, projectId), eq(projects.type, "screen")))
        .returning({ id: projects.id });

      if (!project) {
        throw new Error("未找到对应的影视记录");
      }

      const [detail] = await tx
        .update(screenDetails)
        .set({
          director: values.director,
          releaseYear,
          platform: values.platform
        })
        .where(and(eq(screenDetails.projectId, projectId), eq(screenDetails.format, "movie")))
        .returning({ projectId: screenDetails.projectId });

      if (!detail) {
        throw new Error("影视详情记录不存在");
      }

      await syncManagedNote(tx, {
        projectId,
        title: "创建时备注",
        type: "general",
        body: note
      });

      await syncProjectTags(tx, projectId, normalizedTags);
    });

    revalidateMoviePaths(projectId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `更新影视条目失败：${message}`,
      fieldErrors: {}
    };
  }

  return {
    status: "success",
    message: "影视条目已更新。",
    fieldErrors: {}
  };
}

export async function deleteMovieAction(
  _previousState: DeleteMovieState,
  formData: FormData
): Promise<DeleteMovieState> {
  await requireUser();

  if (!databaseAvailable || !db) {
    return {
      status: "error",
      message: "数据库当前不可用，无法删除影视条目。"
    };
  }

  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    return {
      status: "error",
      message: "缺少影视标识，无法删除。"
    };
  }

  try {
    const [deletedProject] = await db
      .delete(projects)
      .where(and(eq(projects.id, projectId), eq(projects.type, "screen")))
      .returning({ id: projects.id });

    if (!deletedProject) {
      return {
        status: "error",
        message: "未找到对应的影视记录。"
      };
    }

    revalidateMoviePaths(projectId);

    return {
      status: "success",
      message: "影视条目已删除。"
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `删除影视条目失败：${message}`
    };
  }
}
