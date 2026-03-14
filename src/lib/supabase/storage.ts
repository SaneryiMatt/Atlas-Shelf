import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env, hasSupabaseConfig } from "@/lib/env";

export const mediaStorageBucket = env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;

export function buildStorageObjectPath(userId: string, filename: string) {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  return `${userId}/${Date.now()}-${sanitizedFilename}`;
}

export async function createSignedStorageUrl(input: {
  path: string;
  bucket?: string;
  expiresIn?: number;
}) {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(input.bucket ?? mediaStorageBucket)
    .createSignedUrl(input.path, input.expiresIn ?? 60 * 60 * 24);

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
  const supabase = await createSupabaseServerClient();
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
    publicUrl: null
  };
}

export async function removeStoredAsset(path: string, bucket = mediaStorageBucket) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw error;
  }
}