"use server";

import { createHash, randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { db, databaseAvailable } from "@/lib/db/client";
import { syncManagedNote } from "@/lib/db/project-write-utils";
import { projects, travelDetails } from "@/lib/db/schema";
import { travelFormSchema } from "@/modules/travels/travel-form-schema";

export interface CreateTravelFormState {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<
    Record<"placeName" | "country" | "city" | "travelDate" | "description" | "latitude" | "longitude", string>
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

function deriveStage(travelDate: string) {
  const today = new Date().toISOString().slice(0, 10);

  return travelDate <= today ? "visited" : "planning";
}

function getValidatedTravelValues(formData: FormData) {
  return travelFormSchema.safeParse({
    placeName: String(formData.get("placeName") ?? ""),
    country: String(formData.get("country") ?? ""),
    city: String(formData.get("city") ?? ""),
    travelDate: String(formData.get("travelDate") ?? ""),
    description: String(formData.get("description") ?? ""),
    latitude: String(formData.get("latitude") ?? ""),
    longitude: String(formData.get("longitude") ?? "")
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
      travelDate: flattened.travelDate?.[0],
      description: flattened.description?.[0],
      latitude: flattened.latitude?.[0],
      longitude: flattened.longitude?.[0]
    }
  };
}

function revalidateTravelPaths(projectId: string) {
  revalidatePath("/travels");
  revalidatePath(`/travels/${projectId}`);
  revalidatePath("/settings");
}

export async function createTravelAction(
  _previousState: CreateTravelFormState,
  formData: FormData
): Promise<CreateTravelFormState> {
  await requireUser();

  if (!databaseAvailable || !db) {
    return {
      status: "error",
      message: "数据库当前不可用，无法保存旅行地点。",
      fieldErrors: {}
    };
  }

  const parsed = getValidatedTravelValues(formData);

  if (!parsed.success) {
    return getTravelFieldErrors(parsed);
  }

  const values = parsed.data;
  const stage = deriveStage(values.travelDate);
  const latitude = values.latitude ? Number(values.latitude).toFixed(6) : null;
  const longitude = values.longitude ? Number(values.longitude).toFixed(6) : null;

  try {
    const projectId = await db.transaction(async (tx) => {
      const [project] = await tx
        .insert(projects)
        .values({
          type: "travel",
          status: stage === "visited" ? "completed" : "planned",
          title: values.placeName,
          slug: buildProjectSlug(values.placeName, values.city, values.travelDate),
          summary: values.description,
          startedAt: new Date(`${values.travelDate}T00:00:00.000Z`),
          completedAt: stage === "visited" ? new Date(`${values.travelDate}T00:00:00.000Z`) : null
        })
        .returning({ id: projects.id });

      await tx.insert(travelDetails).values({
        projectId: project.id,
        city: values.city,
        country: values.country,
        stage,
        startDate: values.travelDate,
        latitude,
        longitude,
        highlights: []
      });

      await syncManagedNote(tx, {
        projectId: project.id,
        title: "创建时描述",
        type: stage === "visited" ? "memory" : "planning",
        body: values.description
      });

      return project.id;
    });

    revalidateTravelPaths(projectId);
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

  if (!databaseAvailable || !db) {
    return {
      status: "error",
      message: "数据库当前不可用，无法更新旅行地点。",
      fieldErrors: {}
    };
  }

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
  const stage = deriveStage(values.travelDate);
  const latitude = values.latitude ? Number(values.latitude).toFixed(6) : null;
  const longitude = values.longitude ? Number(values.longitude).toFixed(6) : null;
  const startedAt = new Date(`${values.travelDate}T00:00:00.000Z`);

  try {
    await db.transaction(async (tx) => {
      const [project] = await tx
        .update(projects)
        .set({
          status: stage === "visited" ? "completed" : "planned",
          title: values.placeName,
          summary: values.description,
          startedAt,
          completedAt: stage === "visited" ? startedAt : null,
          updatedAt: new Date()
        })
        .where(and(eq(projects.id, projectId), eq(projects.type, "travel")))
        .returning({ id: projects.id });

      if (!project) {
        throw new Error("未找到对应的旅行地点记录");
      }

      const [detail] = await tx
        .update(travelDetails)
        .set({
          city: values.city,
          country: values.country,
          stage,
          startDate: values.travelDate,
          endDate: values.travelDate,
          latitude,
          longitude
        })
        .where(eq(travelDetails.projectId, projectId))
        .returning({ projectId: travelDetails.projectId });

      if (!detail) {
        throw new Error("旅行详情记录不存在");
      }

      await syncManagedNote(tx, {
        projectId,
        title: "创建时描述",
        type: stage === "visited" ? "memory" : "planning",
        body: values.description
      });
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

  if (!databaseAvailable || !db) {
    return {
      status: "error",
      message: "数据库当前不可用，无法删除旅行地点。"
    };
  }

  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    return {
      status: "error",
      message: "缺少旅行地点标识，无法删除。"
    };
  }

  try {
    const [deletedProject] = await db
      .delete(projects)
      .where(and(eq(projects.id, projectId), eq(projects.type, "travel")))
      .returning({ id: projects.id });

    if (!deletedProject) {
      return {
        status: "error",
        message: "未找到对应的旅行地点记录。"
      };
    }

    revalidateTravelPaths(projectId);

    return {
      status: "success",
      message: "旅行地点已删除。"
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `删除旅行地点失败：${message}`
    };
  }
}
