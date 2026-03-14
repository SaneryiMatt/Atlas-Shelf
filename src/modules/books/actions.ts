"use server";

import { createHash, randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { deleteOwnedProject, upsertBook } from "@/lib/supabase/app-data";
import { bookFormSchema, splitBookTags } from "@/modules/books/book-form-schema";

export interface CreateBookFormState {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<
    Record<"title" | "author" | "status" | "rating" | "startedAt" | "completedAt" | "summary" | "tags", string>
  >;
}

export interface DeleteBookState {
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

  return slug || "book";
}

function buildProjectSlug(title: string, author: string) {
  return `${slugify(title)}-${createHash("sha1").update(`${title}:${author}:${randomUUID()}`).digest("hex").slice(0, 8)}`;
}

function getValidatedBookValues(formData: FormData) {
  return bookFormSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    author: String(formData.get("author") ?? ""),
    status: String(formData.get("status") ?? "planned"),
    rating: String(formData.get("rating") ?? ""),
    startedAt: String(formData.get("startedAt") ?? ""),
    completedAt: String(formData.get("completedAt") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    tags: String(formData.get("tags") ?? "")
  });
}

function getBookFieldErrors(parsed: ReturnType<typeof getValidatedBookValues>): CreateBookFormState {
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
      author: flattened.author?.[0],
      status: flattened.status?.[0],
      rating: flattened.rating?.[0],
      startedAt: flattened.startedAt?.[0],
      completedAt: flattened.completedAt?.[0],
      summary: flattened.summary?.[0],
      tags: flattened.tags?.[0]
    }
  };
}

function revalidateBookPaths(projectId: string) {
  revalidatePath("/books");
  revalidatePath(`/books/${projectId}`);
  revalidatePath("/settings");
  revalidatePath("/", "layout");
}

export async function createBookAction(
  _previousState: CreateBookFormState,
  formData: FormData
): Promise<CreateBookFormState> {
  await requireUser();

  const parsed = getValidatedBookValues(formData);

  if (!parsed.success) {
    return getBookFieldErrors(parsed);
  }

  const values = parsed.data;

  try {
    const result = await upsertBook({
      title: values.title,
      author: values.author,
      status: values.status,
      rating: values.rating,
      startedAt: values.startedAt,
      completedAt: values.completedAt,
      summary: values.summary,
      tags: splitBookTags(values.tags),
      slug: buildProjectSlug(values.title, values.author)
    });

    revalidateBookPaths(result.projectId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `保存书籍失败：${message}`,
      fieldErrors: {}
    };
  }

  return {
    status: "success",
    message: "书籍已保存。",
    fieldErrors: {}
  };
}

export async function updateBookAction(
  _previousState: CreateBookFormState,
  formData: FormData
): Promise<CreateBookFormState> {
  await requireUser();

  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    return {
      status: "error",
      message: "缺少书籍标识，无法更新。",
      fieldErrors: {}
    };
  }

  const parsed = getValidatedBookValues(formData);

  if (!parsed.success) {
    return getBookFieldErrors(parsed);
  }

  const values = parsed.data;

  try {
    await upsertBook({
      projectId,
      title: values.title,
      author: values.author,
      status: values.status,
      rating: values.rating,
      startedAt: values.startedAt,
      completedAt: values.completedAt,
      summary: values.summary,
      tags: splitBookTags(values.tags)
    });

    revalidateBookPaths(projectId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `更新书籍失败：${message}`,
      fieldErrors: {}
    };
  }

  return {
    status: "success",
    message: "书籍已更新。",
    fieldErrors: {}
  };
}

export async function deleteBookAction(
  _previousState: DeleteBookState,
  formData: FormData
): Promise<DeleteBookState> {
  await requireUser();

  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    return {
      status: "error",
      message: "缺少书籍标识，无法删除。"
    };
  }

  try {
    await deleteOwnedProject(projectId);
    revalidateBookPaths(projectId);

    return {
      status: "success",
      message: "书籍已删除。"
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `删除书籍失败：${message}`
    };
  }
}