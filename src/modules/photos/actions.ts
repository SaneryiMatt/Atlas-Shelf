"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { db, databaseAvailable } from "@/lib/db/client";
import { projectPhotos, projects } from "@/lib/db/schema";
import { hasSupabaseConfig, hasSupabaseServiceRole } from "@/lib/env";
import { mediaStorageBucket, removeStoredAsset, uploadUserAsset } from "@/lib/supabase/storage";
import {
  acceptedPhotoMimeTypes,
  maxPhotoUploadSizeInBytes,
  photoUploadSchema
} from "@/modules/photos/photo-form-schema";

type PhotoFieldName = "file";

export interface UploadPhotoFormState {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<PhotoFieldName, string>>;
}

export interface DeletePhotoState {
  status: "idle" | "success" | "error";
  message: string | null;
}

function getValidatedPhotoValues() {
  return photoUploadSchema.safeParse({});
}

function getPhotoFieldErrors(fileError?: string): UploadPhotoFormState {
  return {
    status: "error",
    message: "请先修正表单中的问题。",
    fieldErrors: {
      file: fileError ?? undefined
    }
  };
}

function resolvePhotoContentType(file: File) {
  const fileType = file.type.toLowerCase();

  if (acceptedPhotoMimeTypes.includes(fileType as (typeof acceptedPhotoMimeTypes)[number])) {
    return fileType;
  }

  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (lowerName.endsWith(".png")) {
    return "image/png";
  }

  if (lowerName.endsWith(".webp")) {
    return "image/webp";
  }

  if (lowerName.endsWith(".gif")) {
    return "image/gif";
  }

  return null;
}

function getValidatedPhotoFile(fileEntry: FormDataEntryValue | null) {
  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    return {
      error: "请选择一张图片。"
    };
  }

  if (fileEntry.size > maxPhotoUploadSizeInBytes) {
    return {
      error: "图片大小不能超过 10 MB。"
    };
  }

  const contentType = resolvePhotoContentType(fileEntry);

  if (!contentType) {
    return {
      error: "仅支持 JPG、PNG、WebP 或 GIF 图片。"
    };
  }

  return {
    file: fileEntry,
    contentType
  };
}

function revalidateProjectPhotoPaths(projectType: "book" | "screen" | "travel", projectId: string) {
  if (projectType === "book") {
    revalidatePath("/books");
    revalidatePath(`/books/${projectId}`);
    return;
  }

  if (projectType === "screen") {
    revalidatePath("/movies");
    revalidatePath(`/movies/${projectId}`);
    return;
  }

  revalidatePath("/travels");
  revalidatePath(`/travels/${projectId}`);
}

export async function uploadProjectPhotoAction(
  _previousState: UploadPhotoFormState,
  formData: FormData
): Promise<UploadPhotoFormState> {
  const user = await requireUser();

  if (!databaseAvailable || !db) {
    return {
      status: "error",
      message: "数据库当前不可用，无法上传图片。",
      fieldErrors: {}
    };
  }

  if (!hasSupabaseConfig || !hasSupabaseServiceRole) {
    return {
      status: "error",
      message: "Supabase Storage 尚未配置完整，无法上传图片。",
      fieldErrors: {}
    };
  }

  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    return {
      status: "error",
      message: "缺少条目标识，无法上传图片。",
      fieldErrors: {}
    };
  }

  const parsed = getValidatedPhotoValues();
  const validatedFile = getValidatedPhotoFile(formData.get("file"));

  if (!parsed.success || "error" in validatedFile) {
    return getPhotoFieldErrors("error" in validatedFile ? validatedFile.error : undefined);
  }

  const [project] = await db
    .select({
      id: projects.id,
      type: projects.type
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return {
      status: "error",
      message: "未找到对应的条目记录。",
      fieldErrors: {}
    };
  }

  const photoFile = validatedFile.file;
  const contentType = validatedFile.contentType;
  const fileBuffer = await photoFile.arrayBuffer();
  let uploadedAsset: { path: string; publicUrl: string } | null = null;

  try {
    uploadedAsset = await uploadUserAsset({
      userId: user.id,
      filename: photoFile.name,
      file: fileBuffer,
      contentType
    });

    if (!uploadedAsset) {
      throw new Error("图片上传失败。");
    }

    const asset = uploadedAsset;

    await db.transaction(async (tx) => {
      const [latestPhoto] = await tx
        .select({
          sortOrder: projectPhotos.sortOrder
        })
        .from(projectPhotos)
        .where(eq(projectPhotos.projectId, projectId))
        .orderBy(desc(projectPhotos.sortOrder), desc(projectPhotos.createdAt))
        .limit(1);

      await tx.insert(projectPhotos).values({
        projectId,
        kind: "gallery",
        storageBucket: mediaStorageBucket,
        storagePath: asset.path,
        publicUrl: asset.publicUrl,
        caption: null,
        altText: null,
        mimeType: contentType,
        sortOrder: (latestPhoto?.sortOrder ?? -1) + 1,
        isPrimary: false
      });

      const [updatedProject] = await tx
        .update(projects)
        .set({
          updatedAt: new Date()
        })
        .where(eq(projects.id, projectId))
        .returning({
          id: projects.id
        });

      if (!updatedProject) {
        throw new Error("未找到对应的条目记录。");
      }
    });

    revalidateProjectPhotoPaths(project.type, projectId);
  } catch (error) {
    if (uploadedAsset) {
      try {
        await removeStoredAsset(uploadedAsset.path);
      } catch {
        // Ignore cleanup failures and preserve the original error.
      }
    }

    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `上传图片失败：${message}`,
      fieldErrors: {}
    };
  }

  return {
    status: "success",
    message: "图片已上传，详情页会立即显示最新内容。",
    fieldErrors: {}
  };
}

export async function deleteProjectPhotoAction(
  _previousState: DeletePhotoState,
  formData: FormData
): Promise<DeletePhotoState> {
  await requireUser();

  if (!databaseAvailable || !db) {
    return {
      status: "error",
      message: "数据库当前不可用，无法删除图片。"
    };
  }

  const photoId = String(formData.get("photoId") ?? "");

  if (!photoId) {
    return {
      status: "error",
      message: "缺少图片标识，无法删除。"
    };
  }

  const [existingPhoto] = await db
    .select({
      id: projectPhotos.id,
      projectId: projectPhotos.projectId,
      storageBucket: projectPhotos.storageBucket,
      storagePath: projectPhotos.storagePath,
      projectType: projects.type
    })
    .from(projectPhotos)
    .innerJoin(projects, eq(projects.id, projectPhotos.projectId))
    .where(eq(projectPhotos.id, photoId))
    .limit(1);

  if (!existingPhoto) {
    return {
      status: "error",
      message: "未找到对应的图片记录。"
    };
  }

  try {
    await db.transaction(async (tx) => {
      const [deletedPhoto] = await tx
        .delete(projectPhotos)
        .where(eq(projectPhotos.id, photoId))
        .returning({
          id: projectPhotos.id
        });

      if (!deletedPhoto) {
        throw new Error("未找到对应的图片记录。");
      }

      await tx
        .update(projects)
        .set({
          updatedAt: new Date()
        })
        .where(eq(projects.id, existingPhoto.projectId));
    });

    if (existingPhoto.storagePath) {
      try {
        await removeStoredAsset(existingPhoto.storagePath, existingPhoto.storageBucket);
      } catch {
        // Database state has already been updated. Ignore storage cleanup failures.
      }
    }

    revalidateProjectPhotoPaths(existingPhoto.projectType, existingPhoto.projectId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `删除图片失败：${message}`
    };
  }

  return {
    status: "success",
    message: "图片已删除。"
  };
}
