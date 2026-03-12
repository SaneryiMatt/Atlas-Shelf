"use server";

import { createHash, randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { db, databaseAvailable } from "@/lib/db/client";
import { syncManagedNote, syncProjectTags } from "@/lib/db/project-write-utils";
import { bookDetails, projects } from "@/lib/db/schema";
import type { ItemStatus } from "@/lib/types/items";
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

function parseDate(value: string) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00.000Z`);
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
}

export async function createBookAction(
  _previousState: CreateBookFormState,
  formData: FormData
): Promise<CreateBookFormState> {
  await requireUser();

  if (!databaseAvailable || !db) {
    return {
      status: "error",
      message: "数据库当前不可用，无法保存书籍。",
      fieldErrors: {}
    };
  }

  const parsed = getValidatedBookValues(formData);

  if (!parsed.success) {
    return getBookFieldErrors(parsed);
  }

  const values = parsed.data;
  const normalizedTags = splitBookTags(values.tags);
  const summary = values.summary || null;
  const rating = values.rating ? Number(values.rating).toFixed(1) : null;
  const startedAt = parseDate(values.startedAt);
  const completedAt = parseDate(values.completedAt);
  const status = values.status as ItemStatus;

  try {
    const projectId = await db.transaction(async (tx) => {
      const [project] = await tx
        .insert(projects)
        .values({
          type: "book",
          status,
          title: values.title,
          slug: buildProjectSlug(values.title, values.author),
          summary,
          rating,
          startedAt,
          completedAt
        })
        .returning({ id: projects.id });

      await tx.insert(bookDetails).values({
        projectId: project.id,
        author: values.author
      });

      await syncManagedNote(tx, {
        projectId: project.id,
        title: "创建时备注",
        type: "general",
        body: summary
      });

      await syncProjectTags(tx, project.id, normalizedTags);

      return project.id;
    });

    revalidateBookPaths(projectId);
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

  if (!databaseAvailable || !db) {
    return {
      status: "error",
      message: "数据库当前不可用，无法更新书籍。",
      fieldErrors: {}
    };
  }

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
  const normalizedTags = splitBookTags(values.tags);
  const summary = values.summary || null;
  const rating = values.rating ? Number(values.rating).toFixed(1) : null;
  const startedAt = parseDate(values.startedAt);
  const completedAt = parseDate(values.completedAt);
  const status = values.status as ItemStatus;

  try {
    await db.transaction(async (tx) => {
      const [project] = await tx
        .update(projects)
        .set({
          status,
          title: values.title,
          summary,
          rating,
          startedAt,
          completedAt,
          updatedAt: new Date()
        })
        .where(and(eq(projects.id, projectId), eq(projects.type, "book")))
        .returning({ id: projects.id });

      if (!project) {
        throw new Error("未找到对应的书籍记录");
      }

      const [detail] = await tx
        .update(bookDetails)
        .set({
          author: values.author
        })
        .where(eq(bookDetails.projectId, projectId))
        .returning({ projectId: bookDetails.projectId });

      if (!detail) {
        throw new Error("书籍详情记录不存在");
      }

      await syncManagedNote(tx, {
        projectId,
        title: "创建时备注",
        type: "general",
        body: summary
      });

      await syncProjectTags(tx, projectId, normalizedTags);
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

  if (!databaseAvailable || !db) {
    return {
      status: "error",
      message: "数据库当前不可用，无法删除书籍。"
    };
  }

  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    return {
      status: "error",
      message: "缺少书籍标识，无法删除。"
    };
  }

  try {
    const [deletedProject] = await db
      .delete(projects)
      .where(and(eq(projects.id, projectId), eq(projects.type, "book")))
      .returning({ id: projects.id });

    if (!deletedProject) {
      return {
        status: "error",
        message: "未找到对应的书籍记录。"
      };
    }

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
