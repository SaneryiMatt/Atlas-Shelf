import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env, hasSupabaseConfig } from "@/lib/env";

export const mediaStorageBucket = env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;

export function buildStorageObjectPath(userId: string, filename: string) {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  return `${userId}/${Date.now()}-${sanitizedFilename}`;
}

export function getStoragePublicUrl(path: string) {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${mediaStorageBucket}/${path}`;
}

export async function uploadUserAsset(input: {
  userId: string;
  filename: string;
  file: ArrayBuffer;
  contentType: string;
}) {
  const supabase = createSupabaseAdminClient();
  const path = buildStorageObjectPath(input.userId, input.filename);
  const { error } = await supabase.storage
    .from(mediaStorageBucket)
    .upload(path, input.file, {
      contentType: input.contentType,
      upsert: false
    });

  if (error) {
    throw error;
  }

  return {
    path,
    publicUrl: getStoragePublicUrl(path)
  };
}