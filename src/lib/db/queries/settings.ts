import { count, desc, eq, sql } from "drizzle-orm";

import { db, databaseAvailable } from "@/lib/db/client";
import { projectNotes, projectTags, projects, tags } from "@/lib/db/schema";
import {
  env,
  hasDatabaseUrl,
  hasSupabaseConfig,
  hasSupabaseServiceRole
} from "@/lib/env";
import { settingsPanels } from "@/lib/db/mock-data";

function formatTimestamp(date: Date | null) {
  if (!date) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export async function getSettingsPageData() {
  let databasePreview:
    | {
        status: "live" | "unavailable";
        message: string;
        projects: Array<{
          id: string;
          title: string;
          type: "book" | "screen" | "travel";
          status: string;
          updatedAtLabel: string;
        }>;
        notes: Array<{
          id: string;
          projectTitle: string;
          noteType: string;
          noteTitle: string;
          recordedAtLabel: string;
        }>;
        tags: Array<{
          id: string;
          name: string;
          usageCount: number;
        }>;
      }
    | null = null;

  if (databaseAvailable && db) {
    try {
      const [projectRows, noteRows, tagRows] = await Promise.all([
        db
          .select({
            id: projects.id,
            title: projects.title,
            type: projects.type,
            status: projects.status,
            updatedAt: projects.updatedAt
          })
          .from(projects)
          .orderBy(desc(projects.updatedAt))
          .limit(6),
        db
          .select({
            id: projectNotes.id,
            projectTitle: projects.title,
            noteType: projectNotes.type,
            noteTitle: sql<string>`coalesce(${projectNotes.title}, left(${projectNotes.body}, 48))`,
            recordedAt: projectNotes.recordedAt
          })
          .from(projectNotes)
          .innerJoin(projects, eq(projectNotes.projectId, projects.id))
          .orderBy(desc(projectNotes.recordedAt))
          .limit(6),
        db
          .select({
            id: tags.id,
            name: tags.name,
            usageCount: count(projectTags.tagId)
          })
          .from(tags)
          .leftJoin(projectTags, eq(projectTags.tagId, tags.id))
          .groupBy(tags.id, tags.name)
          .orderBy(desc(count(projectTags.tagId)), tags.name)
          .limit(8)
      ]);

      databasePreview = {
        status: "live",
        message: "Reading directly from projects, project_notes, and tags.",
        projects: projectRows.map((project) => ({
          id: project.id,
          title: project.title,
          type: project.type,
          status: project.status,
          updatedAtLabel: formatTimestamp(project.updatedAt)
        })),
        notes: noteRows.map((note) => ({
          id: note.id,
          projectTitle: note.projectTitle,
          noteType: note.noteType,
          noteTitle: note.noteTitle,
          recordedAtLabel: formatTimestamp(note.recordedAt)
        })),
        tags: tagRows.map((tag) => ({
          id: tag.id,
          name: tag.name,
          usageCount: Number(tag.usageCount)
        }))
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown database error";

      databasePreview = {
        status: "unavailable",
        message: `Database preview unavailable: ${message}`,
        projects: [],
        notes: [],
        tags: []
      };
    }
  } else {
    databasePreview = {
      status: "unavailable",
      message: "Database preview unavailable until DATABASE_URL is reachable.",
      projects: [],
      notes: [],
      tags: []
    };
  }

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
    supabaseReady: hasSupabaseConfig,
    databasePreview
  };
}
