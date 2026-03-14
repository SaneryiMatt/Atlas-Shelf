import { z } from "zod";

function normalizeMetadataTimeout(value: unknown) {
  if (value === undefined || value === null) {
    return 6000;
  }

  const normalizedValue = String(value).trim();

  if (!normalizedValue) {
    return 6000;
  }

  return Number(normalizedValue);
}

const envSchema = z
  .object({
    DATABASE_URL: z.string().url().optional(),
    LEGACY_OWNER_USER_ID: z.string().uuid().optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET: z.string().min(1).default("media-assets"),
    OPENROUTER_API_KEY: z.string().min(1).optional(),
    OPENROUTER_MODEL: z.string().min(1).default("deepseek/deepseek-chat"),
    OPENROUTER_METADATA_MODEL: z.string().min(1).optional(),
    OPENROUTER_METADATA_TIMEOUT_MS: z.preprocess(
      normalizeMetadataTimeout,
      z.number().int().nonnegative().default(6000)
    ),
    OPENROUTER_METADATA_MAX_TOKENS: z.coerce.number().int().positive().default(256)
  })
  .strict();

const parsedEnv = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  LEGACY_OWNER_USER_ID: process.env.LEGACY_OWNER_USER_ID,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
  OPENROUTER_METADATA_MODEL: process.env.OPENROUTER_METADATA_MODEL,
  OPENROUTER_METADATA_TIMEOUT_MS: process.env.OPENROUTER_METADATA_TIMEOUT_MS,
  OPENROUTER_METADATA_MAX_TOKENS: process.env.OPENROUTER_METADATA_MAX_TOKENS
});

export const env = {
  ...parsedEnv,
  OPENROUTER_METADATA_MODEL: parsedEnv.OPENROUTER_METADATA_MODEL ?? parsedEnv.OPENROUTER_MODEL
};

export const openRouterMetadataConfig = {
  model: env.OPENROUTER_METADATA_MODEL,
  timeoutMs: env.OPENROUTER_METADATA_TIMEOUT_MS,
  maxTokens: env.OPENROUTER_METADATA_MAX_TOKENS
} as const;

export const hasDatabaseUrl = Boolean(env.DATABASE_URL);
export const hasSupabaseConfig = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
export const hasSupabaseServiceRole = Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
export const hasOpenRouterApiKey = Boolean(env.OPENROUTER_API_KEY);
