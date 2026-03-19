"use server";

import { createHash, randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { deleteOwnedProject, upsertApplication } from "@/lib/supabase/app-data";
import { applicationFormSchema } from "@/modules/applications/application-form-schema";

export interface CreateApplicationFormState {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<"company" | "role" | "source" | "stage" | "result" | "appliedAt" | "interviewAt" | "notes", string>>;
}

export interface DeleteApplicationState {
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

  return slug || "application";
}

function buildProjectSlug(company: string, role: string) {
  return `${slugify(company)}-${slugify(role)}-${createHash("sha1")
    .update(`${company}:${role}:${randomUUID()}`)
    .digest("hex")
    .slice(0, 8)}`;
}

function getValidatedApplicationValues(formData: FormData) {
  return applicationFormSchema.safeParse({
    company: String(formData.get("company") ?? ""),
    role: String(formData.get("role") ?? ""),
    source: String(formData.get("source") ?? ""),
    stage: String(formData.get("stage") ?? "applied"),
    result: String(formData.get("result") ?? "pending"),
    appliedAt: String(formData.get("appliedAt") ?? ""),
    interviewAt: String(formData.get("interviewAt") ?? ""),
    notes: String(formData.get("notes") ?? "")
  });
}

function getApplicationFieldErrors(parsed: ReturnType<typeof getValidatedApplicationValues>): CreateApplicationFormState {
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
      company: flattened.company?.[0],
      role: flattened.role?.[0],
      source: flattened.source?.[0],
      stage: flattened.stage?.[0],
      result: flattened.result?.[0],
      appliedAt: flattened.appliedAt?.[0],
      interviewAt: flattened.interviewAt?.[0],
      notes: flattened.notes?.[0]
    }
  };
}

function revalidateApplicationPaths(projectId: string) {
  revalidatePath("/applications");
  revalidatePath(`/applications/${projectId}`);
  revalidatePath("/settings");
  revalidatePath("/timeline");
  revalidatePath("/search");
  revalidatePath("/", "layout");
}

export async function createApplicationAction(
  _previousState: CreateApplicationFormState,
  formData: FormData
): Promise<CreateApplicationFormState> {
  await requireUser();

  const parsed = getValidatedApplicationValues(formData);

  if (!parsed.success) {
    return getApplicationFieldErrors(parsed);
  }

  const values = parsed.data;

  try {
    const result = await upsertApplication({
      company: values.company,
      role: values.role,
      source: values.source,
      stage: values.stage,
      result: values.result,
      appliedAt: values.appliedAt,
      interviewAt: values.interviewAt,
      notes: values.notes,
      slug: buildProjectSlug(values.company, values.role)
    });

    revalidateApplicationPaths(result.projectId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `保存投递记录失败：${message}`,
      fieldErrors: {}
    };
  }

  return {
    status: "success",
    message: "投递记录已保存。",
    fieldErrors: {}
  };
}

export async function updateApplicationAction(
  _previousState: CreateApplicationFormState,
  formData: FormData
): Promise<CreateApplicationFormState> {
  await requireUser();

  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    return {
      status: "error",
      message: "缺少投递记录标识，无法更新。",
      fieldErrors: {}
    };
  }

  const parsed = getValidatedApplicationValues(formData);

  if (!parsed.success) {
    return getApplicationFieldErrors(parsed);
  }

  const values = parsed.data;

  try {
    await upsertApplication({
      projectId,
      company: values.company,
      role: values.role,
      source: values.source,
      stage: values.stage,
      result: values.result,
      appliedAt: values.appliedAt,
      interviewAt: values.interviewAt,
      notes: values.notes
    });

    revalidateApplicationPaths(projectId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `更新投递记录失败：${message}`,
      fieldErrors: {}
    };
  }

  return {
    status: "success",
    message: "投递记录已更新。",
    fieldErrors: {}
  };
}

export async function deleteApplicationAction(
  _previousState: DeleteApplicationState,
  formData: FormData
): Promise<DeleteApplicationState> {
  await requireUser();

  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    return {
      status: "error",
      message: "缺少投递记录标识，无法删除。"
    };
  }

  try {
    await deleteOwnedProject(projectId);
    revalidateApplicationPaths(projectId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      status: "error",
      message: `删除投递记录失败：${message}`
    };
  }

  redirect("/applications");
}
