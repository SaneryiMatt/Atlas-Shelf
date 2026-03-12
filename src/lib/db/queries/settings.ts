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
    return "未知";
  }

  return new Intl.DateTimeFormat("zh-CN", {
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
        message: "正在直接读取 projects、project_notes 和 tags。",
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
      const message = error instanceof Error ? error.message : "未知数据库错误";

      databasePreview = {
        status: "unavailable",
        message: `数据库预览不可用：${message}`,
        projects: [],
        notes: [],
        tags: []
      };
    }
  } else {
    databasePreview = {
      status: "unavailable",
      message: "在 DATABASE_URL 可访问之前，数据库预览不可用。",
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
        hint: "供 Drizzle 直接连接 Supabase Postgres。"
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_URL",
        configured: Boolean(env.NEXT_PUBLIC_SUPABASE_URL),
        hint: "浏览器端和服务端 Supabase 客户端都需要此配置。"
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        configured: Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        hint: "用于受 Supabase 策略约束的公开认证与存储操作。"
      },
      {
        key: "SUPABASE_SERVICE_ROLE_KEY",
        configured: hasSupabaseServiceRole,
        hint: "仅在服务端管理员操作中使用，例如特权存储操作。"
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET",
        configured: Boolean(env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET),
        hint: "存储辅助层默认使用的 bucket 名称。"
      }
    ],
    panels: settingsPanels,
    supabaseReady: hasSupabaseConfig,
    databasePreview
  };
}
