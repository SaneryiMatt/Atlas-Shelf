"use server";

import { createHash, randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { deleteOwnedProject, upsertTravel } from "@/lib/supabase/app-data";
import { travelFormSchema } from "@/modules/travels/travel-form-schema";

export interface CreateTravelFormState {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<
    Record<"placeName" | "country" | "city" | "status" | "travelDate" | "description", string>
  >;
}

export interface DeleteTravelState {
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

  return slug || "travel";
}

function buildProjectSlug(placeName: string, city: string, travelDate: string) {
  return `${slugify(placeName)}-${createHash("sha1").update(`${placeName}:${city}:${travelDate}:${randomUUID()}`).digest("hex").slice(0, 8)}`;
}

function getValidatedTravelValues(formData: FormData) {
  return travelFormSchema.safeParse({
    placeName: String(formData.get("placeName") ?? ""),
    country: String(formData.get("country") ?? ""),
    city: String(formData.get("city") ?? ""),
    status: String(formData.get("status") ?? "planned"),
    travelDate: String(formData.get("travelDate") ?? ""),
    description: String(formData.get("description") ?? "")
  });
}

function getTravelFieldErrors(parsed: ReturnType<typeof getValidatedTravelValues>): CreateTravelFormState {
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
      placeName: flattened.placeName?.[0],
      country: flattened.country?.[0],
      city: flattened.city?.[0],
      status: flattened.status?.[0],
      travelDate: flattened.travelDate?.[0],
      description: flattened.description?.[0]
    }
  };
}

function revalidateTravelPaths(projectId: string) {
  revalidatePath("/travels");
  revalidatePath(`/travels/${projectId}`);
  revalidatePath("/settings");
  revalidatePath("/", "layout");
}

export async function createTravelAction(
  _previousState: CreateTravelFormState,
  formData: FormData
): Promise<CreateTravelFormState> {
  await requireUser();

  const parsed = getValidatedTravelValues(formData);

  if (!parsed.success) {
    return getTravelFieldErrors(parsed);
  }

  const values = parsed.data;

  try {
    const result = await upsertTravel({
      placeName: values.placeName,
      country: values.country,
      city: values.city,
      status: values.status,
      travelDate: values.travelDate,
      description: values.description,
      slug: buildProjectSlug(values.placeName, values.city, values.travelDate)
    });

    revalidateTravelPaths(result.projectId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `保存旅行地点失败：${message}`,
      fieldErrors: {}
    };
  }

  return {
    status: "success",
    message: "旅行地点已保存。",
    fieldErrors: {}
  };
}

export async function updateTravelAction(
  _previousState: CreateTravelFormState,
  formData: FormData
): Promise<CreateTravelFormState> {
  await requireUser();

  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    return {
      status: "error",
      message: "缺少旅行地点标识，无法更新。",
      fieldErrors: {}
    };
  }

  const parsed = getValidatedTravelValues(formData);

  if (!parsed.success) {
    return getTravelFieldErrors(parsed);
  }

  const values = parsed.data;

  try {
    await upsertTravel({
      projectId,
      placeName: values.placeName,
      country: values.country,
      city: values.city,
      status: values.status,
      travelDate: values.travelDate,
      description: values.description
    });

    revalidateTravelPaths(projectId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `更新旅行地点失败：${message}`,
      fieldErrors: {}
    };
  }

  return {
    status: "success",
    message: "旅行地点已更新。",
    fieldErrors: {}
  };
}

export async function deleteTravelAction(
  _previousState: DeleteTravelState,
  formData: FormData
): Promise<DeleteTravelState> {
  await requireUser();

  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    return {
      status: "error",
      message: "缺少旅行地点标识，无法删除。"
    };
  }

  try {
    await deleteOwnedProject(projectId);
    revalidateTravelPaths(projectId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `删除旅行地点失败：${message}`
    };
  }

  redirect("/travels");
}