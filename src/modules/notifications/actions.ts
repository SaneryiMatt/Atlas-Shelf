"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { setNotificationStatus } from "@/lib/supabase/app-data";
import type { NotificationStatus } from "@/lib/types/items";

async function persistNotificationStatus(notificationKey: string, status: NotificationStatus) {
  const normalizedKey = notificationKey.trim();

  if (!normalizedKey) {
    return;
  }

  await requireUser();
  await setNotificationStatus(normalizedKey, status);
  revalidatePath("/", "layout");
}

export async function markNotificationReadAction(formData: FormData) {
  await persistNotificationStatus(String(formData.get("notificationKey") ?? ""), "read");
}

export async function markNotificationProcessedAction(formData: FormData) {
  await persistNotificationStatus(String(formData.get("notificationKey") ?? ""), "processed");
}