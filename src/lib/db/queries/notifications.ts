import { getNotificationFeed } from "@/lib/supabase/app-data";
import type { NotificationCenterData } from "@/lib/types/items";

function buildEmptyNotificationCenterData(): NotificationCenterData {
  return {
    unreadCount: 0,
    items: [],
    canManage: false
  };
}

export async function getNotificationCenterData(): Promise<NotificationCenterData> {
  try {
    return await getNotificationFeed();
  } catch {
    return buildEmptyNotificationCenterData();
  }
}