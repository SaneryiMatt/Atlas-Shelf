import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env, hasSupabaseConfig, hasSupabaseServiceRole } from "@/lib/env";

export const mediaStorageBucket = env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;

export function buildStorageObjectPath(userId: string, filename: string) {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  return `${userId}/${Date.now()}-${sanitizedFilename}`;
}

export function getStoragePublicUrl(path: string, bucket = mediaStorageBucket) {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export async function createSignedStorageUrl(input: {
  path: string;
  bucket?: string;
  expiresIn?: number;
}) {
  const bucket = input.bucket ?? mediaStorageBucket;

  if (!hasSupabaseServiceRole) {
    return getStoragePublicUrl(input.path, bucket);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(input.path, input.expiresIn ?? 60 * 60 * 24);

  if (error) {
    throw error;
  }

  return data.signedUrl;
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

export async function removeStoredAsset(path: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(mediaStorageBucket).remove([path]);

  if (error) {
    throw error;
  }
}
