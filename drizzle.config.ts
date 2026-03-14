import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

function buildMigrationDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/vibe";
  const url = new URL(databaseUrl);
  if (process.env.LEGACY_OWNER_USER_ID) {
    url.searchParams.set("app.settings.legacy_owner_user_id", process.env.LEGACY_OWNER_USER_ID);
  }

  url.searchParams.set(
    "app.settings.media_bucket",
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "media-assets"
  );

  return url.toString();
}

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: buildMigrationDatabaseUrl()
  }
});
