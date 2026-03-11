import { settingsPanels } from "@/lib/db/mock-data";
import { hasDatabaseUrl, hasSupabaseConfig } from "@/lib/env";

export async function getSettingsPageData() {
  return {
    envStatus: [
      {
        key: "DATABASE_URL",
        configured: hasDatabaseUrl,
        hint: "Required for Drizzle + Supabase Postgres reads and writes."
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_URL",
        configured: hasSupabaseConfig,
        hint: "Used with the anon key for client-safe Supabase features."
      }
    ],
    panels: settingsPanels
  };
}

