import {
  env,
  hasDatabaseUrl,
  hasSupabaseConfig,
  hasSupabaseServiceRole
} from "@/lib/env";
import { settingsPanels } from "@/lib/db/mock-data";

export async function getSettingsPageData() {
  return {
    envStatus: [
      {
        key: "DATABASE_URL",
        configured: hasDatabaseUrl,
        hint: "Used by Drizzle to connect directly to Supabase Postgres."
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_URL",
        configured: Boolean(env.NEXT_PUBLIC_SUPABASE_URL),
        hint: "Required for browser and server Supabase clients."
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        configured: Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        hint: "Used for public auth and storage operations scoped by Supabase policies."
      },
      {
        key: "SUPABASE_SERVICE_ROLE_KEY",
        configured: hasSupabaseServiceRole,
        hint: "Needed only for server-side admin work such as privileged storage operations."
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET",
        configured: Boolean(env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET),
        hint: "Default bucket name used by the storage helper layer."
      }
    ],
    panels: settingsPanels,
    supabaseReady: hasSupabaseConfig
  };
}