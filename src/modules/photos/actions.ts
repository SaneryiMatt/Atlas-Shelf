"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createPhotoRecord, deletePhotoRecord } from "@/lib/supabase/app-data";
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
      error: "仅支持 JPG、PNG、WebP 和 GIF 图片。"
    };
  }

  return {
    file: fileEntry,
    contentType
  };
}

function revalidateProjectPhotoPaths(projectType: "book" | "screen" | "travel" | "application", projectId: string) {
  if (projectType === "book") {
    revalidatePath("/books");
    revalidatePath(`/books/${projectId}`);
    revalidatePath("/settings");
    revalidatePath("/", "layout");
    return;
  }

  if (projectType === "screen") {
    revalidatePath("/movies");
    revalidatePath(`/movies/${projectId}`);
    revalidatePath("/settings");
    revalidatePath("/", "layout");
    return;
  }

  if (projectType === "travel") {
    revalidatePath("/travels");
    revalidatePath(`/travels/${projectId}`);
    revalidatePath("/settings");
    revalidatePath("/", "layout");
    return;
  }

  revalidatePath("/applications");
  revalidatePath(`/applications/${projectId}`);
  revalidatePath("/settings");
  revalidatePath("/", "layout");
}

export async function uploadProjectPhotoAction(
  _previousState: UploadPhotoFormState,
  formData: FormData
): Promise<UploadPhotoFormState> {
  const user = await requireUser();

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

  const photoFile = validatedFile.file;
  const contentType = validatedFile.contentType;
  const fileBuffer = await photoFile.arrayBuffer();
  let uploadedAsset: { path: string; publicUrl: string | null } | null = null;

  try {
    uploadedAsset = await uploadUserAsset({
      userId: user.id,
      filename: photoFile.name,
      file: fileBuffer,
      contentType
    });

    const result = await createPhotoRecord({
      projectId,
      storageBucket: mediaStorageBucket,
      storagePath: uploadedAsset.path,
      publicUrl: uploadedAsset.publicUrl,
      contentType
    });

    revalidateProjectPhotoPaths(result.projectType, result.projectId);
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

  const photoId = String(formData.get("photoId") ?? "");

  if (!photoId) {
    return {
      status: "error",
      message: "缺少图片标识，无法删除。"
    };
  }

  try {
    const deletedPhoto = await deletePhotoRecord(photoId);

    if (deletedPhoto.storagePath) {
      try {
        await removeStoredAsset(deletedPhoto.storagePath, deletedPhoto.storageBucket ?? mediaStorageBucket);
      } catch {
        // Database state has already been updated. Ignore storage cleanup failures.
      }
    }

    revalidateProjectPhotoPaths(deletedPhoto.projectType, deletedPhoto.projectId);
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
