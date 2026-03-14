import "dotenv/config";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const defaultBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "media-assets";
const dryRun = process.argv.includes("--dry-run");

if (!databaseUrl || !supabaseUrl || !serviceRoleKey) {
  throw new Error("DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const sql = postgres(databaseUrl, { prepare: false });
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

function buildTargetPath(userId, sourcePath) {
  const segments = sourcePath.split("/").filter(Boolean);
  const filename = segments[segments.length - 1] || `${Date.now()}-asset`;
  return `${userId}/${filename}`;
}

async function main() {
  const rows = await sql`
    select
      project_photos.id,
      project_photos.storage_bucket as "storageBucket",
      project_photos.storage_path as "storagePath",
      projects.user_id::text as "userId"
    from project_photos
    inner join projects on projects.id = project_photos.project_id
    where split_part(project_photos.storage_path, '/', 1) <> projects.user_id::text
  `;

  if (!rows.length) {
    console.log("No storage paths need rehoming.");
    return;
  }

  console.log(`${dryRun ? "[dry-run] " : ""}Found ${rows.length} photo records to rehome.`);

  for (const row of rows) {
    const bucket = row.storageBucket || defaultBucket;
    const targetPath = buildTargetPath(row.userId, row.storagePath);

    if (dryRun) {
      console.log(JSON.stringify({ id: row.id, bucket, from: row.storagePath, to: targetPath }, null, 2));
      continue;
    }

    const { error: moveError } = await supabase.storage.from(bucket).move(row.storagePath, targetPath);

    if (moveError) {
      throw moveError;
    }

    await sql`
      update project_photos
      set storage_path = ${targetPath},
          public_url = null
      where id = ${row.id}
    `;

    console.log(`Rehomed ${row.id}: ${row.storagePath} -> ${targetPath}`);
  }
}

try {
  await main();
} finally {
  await sql.end({ timeout: 5 });
}