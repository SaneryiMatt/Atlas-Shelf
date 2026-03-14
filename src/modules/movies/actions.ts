"use server";

import { createHash, randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { deleteOwnedProject, upsertMovie } from "@/lib/supabase/app-data";
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
  revalidatePath("/", "layout");
}

export async function createMovieAction(
  _previousState: CreateMovieFormState,
  formData: FormData
): Promise<CreateMovieFormState> {
  await requireUser();

  const parsed = getValidatedMovieValues(formData);

  if (!parsed.success) {
    return getMovieFieldErrors(parsed);
  }

  const values = parsed.data;

  try {
    const result = await upsertMovie({
      title: values.title,
      director: values.director,
      releaseYear: values.releaseYear,
      platform: values.platform,
      status: values.status,
      rating: values.rating,
      note: values.note,
      tags: splitMovieTags(values.tags),
      slug: buildProjectSlug(values.title, values.director)
    });

    revalidateMoviePaths(result.projectId);
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

  try {
    await upsertMovie({
      projectId,
      title: values.title,
      director: values.director,
      releaseYear: values.releaseYear,
      platform: values.platform,
      status: values.status,
      rating: values.rating,
      note: values.note,
      tags: splitMovieTags(values.tags)
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

  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    return {
      status: "error",
      message: "缺少影视标识，无法删除。"
    };
  }

  try {
    await deleteOwnedProject(projectId);
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