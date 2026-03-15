import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface RpcProjectRow {
  id: string;
  type: "book" | "screen" | "travel" | "application";
  status: string;
  title: string;
  slug: string;
  summary: string | null;
  rating: string | number | null;
  priority: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: string | null;
  pageCount: number | null;
  currentPage: number | null;
  screenFormat: string | null;
  director: string | null;
  platform: string | null;
  releaseYear: number | null;
  country: string | null;
  city: string | null;
  travelStage: string | null;
  startDate: string | null;
  endDate: string | null;
  company: string | null;
  role: string | null;
  applicationSource: string | null;
  applicationStage: string | null;
  applicationResult: string | null;
  appliedAt: string | null;
  interviewAt: string | null;
  tagNames: string[];
}

export interface RpcProjectTag {
  id: string;
  name: string;
  color: string;
}

export interface RpcProjectNote {
  id: string;
  title: string | null;
  body: string;
  type: string;
  sourceUrl: string | null;
  pinned: boolean;
  recordedAt: string;
}

export interface RpcProjectPhoto {
  id: string;
  publicUrl: string | null;
  storageBucket: string;
  storagePath: string;
  caption: string | null;
  altText: string | null;
  kind: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface RpcProjectDetailPayload {
  project: RpcProjectRow;
  tags: RpcProjectTag[];
  notes: RpcProjectNote[];
  photos: RpcProjectPhoto[];
}

export interface RpcSettingsSnapshot {
  status: "live" | "unavailable";
  message: string;
  projects: Array<{
    id: string;
    title: string;
    type: "book" | "screen" | "travel" | "application";
    status: string;
    updatedAt: string;
  }>;
  notes: Array<{
    id: string;
    projectTitle: string;
    noteType: string;
    noteTitle: string;
    recordedAt: string;
  }>;
  tags: Array<{
    id: string;
    name: string;
    usageCount: number;
  }>;
}

export interface RpcNotificationFeed {
  unreadCount: number;
  canManage: boolean;
  items: Array<{
    key: string;
    kind: "book_stale" | "screen_stale" | "travel_upcoming";
    sourceType: "book" | "screen" | "travel";
    title: string;
    description: string;
    href: string;
    meta: string;
    status: "active" | "read" | "processed";
    statusLabel: string;
    triggeredAtLabel: string;
  }>;
}

export interface RpcDeleteProjectResult {
  projectId: string;
}

export interface RpcPhotoMutationResult {
  projectId: string;
  projectType: "book" | "screen" | "travel" | "application";
  photoId?: string;
  storageBucket?: string;
  storagePath?: string;
}

function getRpcErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const rpcError = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };

    const parts = [
      typeof rpcError.message === "string" && rpcError.message ? rpcError.message : null,
      typeof rpcError.details === "string" && rpcError.details ? `details=${rpcError.details}` : null,
      typeof rpcError.hint === "string" && rpcError.hint ? `hint=${rpcError.hint}` : null,
      typeof rpcError.code === "string" && rpcError.code ? `code=${rpcError.code}` : null
    ].filter(Boolean);

    if (parts.length) {
      return parts.join("; ");
    }
  }

  return "Unknown Supabase RPC error";
}

async function getServerClient(client?: SupabaseClient) {
  return client ?? createSupabaseServerClient();
}

async function callRpc<T>(functionName: string, args?: Record<string, unknown>, client?: SupabaseClient) {
  const supabase = await getServerClient(client);
  const { data, error } = await supabase.rpc(functionName, args);

  if (error) {
    throw new Error(`${functionName}: ${getRpcErrorMessage(error)}`);
  }

  return data as T;
}

export async function getDashboardProjectRows(client?: SupabaseClient) {
  return callRpc<RpcProjectRow[]>("app_dashboard_snapshot", undefined, client);
}

export async function getProjectRowsByKind(kind: "book" | "movie" | "travel" | "application", client?: SupabaseClient) {
  return callRpc<RpcProjectRow[]>("app_project_list", { kind }, client);
}

export async function getProjectDetail(projectId: string, client?: SupabaseClient) {
  return callRpc<RpcProjectDetailPayload | null>("app_project_detail", { project_id: projectId }, client);
}

export async function searchProjects(query: string, limit = 10, client?: SupabaseClient) {
  return callRpc<RpcProjectRow[]>("app_search_projects", { query, result_limit: limit }, client);
}

export async function getNotificationFeed(client?: SupabaseClient) {
  return callRpc<RpcNotificationFeed>("app_notification_feed", undefined, client);
}

export async function getSettingsSnapshot(client?: SupabaseClient) {
  return callRpc<RpcSettingsSnapshot>("app_settings_snapshot", undefined, client);
}

export async function upsertBook(
  payload: {
    projectId?: string;
    title: string;
    author: string;
    status: string;
    rating: string;
    startedAt: string;
    completedAt: string;
    summary: string;
    tags: string[];
    slug?: string;
  },
  client?: SupabaseClient
) {
  return callRpc<RpcDeleteProjectResult>("app_upsert_book", { payload }, client);
}

export async function upsertMovie(
  payload: {
    projectId?: string;
    title: string;
    director: string;
    releaseYear: string;
    platform: string;
    status: string;
    rating: string;
    note: string;
    tags: string[];
    slug?: string;
  },
  client?: SupabaseClient
) {
  return callRpc<RpcDeleteProjectResult>("app_upsert_movie", { payload }, client);
}

export async function upsertTravel(
  payload: {
    projectId?: string;
    placeName: string;
    country: string;
    city: string;
    status: string;
    travelDate: string;
    description: string;
    slug?: string;
  },
  client?: SupabaseClient
) {
  return callRpc<RpcDeleteProjectResult>("app_upsert_travel", { payload }, client);
}

export async function upsertApplication(
  payload: {
    projectId?: string;
    company: string;
    role: string;
    source: string;
    stage: string;
    result: string;
    appliedAt: string;
    interviewAt: string;
    notes: string;
    slug?: string;
  },
  client?: SupabaseClient
) {
  return callRpc<RpcDeleteProjectResult>("app_upsert_application", { payload }, client);
}

export async function deleteOwnedProject(projectId: string, client?: SupabaseClient) {
  return callRpc<RpcDeleteProjectResult>("app_delete_project", { project_id: projectId }, client);
}

export async function setNotificationStatus(
  notificationKey: string,
  status: "active" | "read" | "processed",
  client?: SupabaseClient
) {
  return callRpc<{ notificationKey: string; status: string }>(
    "app_set_notification_status",
    { notification_key: notificationKey, status },
    client
  );
}

export async function createPhotoRecord(
  payload: {
    projectId: string;
    storageBucket?: string;
    storagePath: string;
    publicUrl?: string | null;
    contentType: string;
  },
  client?: SupabaseClient
) {
  return callRpc<RpcPhotoMutationResult>("app_create_photo_record", { payload }, client);
}

export async function deletePhotoRecord(photoId: string, client?: SupabaseClient) {
  return callRpc<RpcPhotoMutationResult>("app_delete_photo", { photo_id: photoId }, client);
}

export const activeStorageBucket = env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
