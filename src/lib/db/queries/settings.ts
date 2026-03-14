import { settingsPanels } from "@/lib/db/mock-data";
import { env, hasDatabaseUrl, hasSupabaseConfig, hasSupabaseServiceRole } from "@/lib/env";
import { getSettingsSnapshot } from "@/lib/supabase/app-data";

function formatTimestamp(date: string | null) {
  if (!date) {
    return "未知";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
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

  try {
    const snapshot = await getSettingsSnapshot();
    databasePreview = {
      status: snapshot.status,
      message: snapshot.message,
      projects: snapshot.projects.map((project) => ({
        id: project.id,
        title: project.title,
        type: project.type,
        status: project.status,
        updatedAtLabel: formatTimestamp(project.updatedAt)
      })),
      notes: snapshot.notes.map((note) => ({
        id: note.id,
        projectTitle: note.projectTitle,
        noteType: note.noteType,
        noteTitle: note.noteTitle,
        recordedAtLabel: formatTimestamp(note.recordedAt)
      })),
      tags: snapshot.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        usageCount: Number(tag.usageCount)
      }))
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    databasePreview = {
      status: "unavailable",
      message: `当前账号的数据预览不可用：${message}`,
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
        hint: "仅用于 Drizzle migration、回填脚本和受控后台任务。"
      },
      {
        key: "LEGACY_OWNER_USER_ID",
        configured: Boolean(env.LEGACY_OWNER_USER_ID),
        hint: "运行强隔离迁移时，用来承接历史数据归属的 Supabase user.id。"
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_URL",
        configured: Boolean(env.NEXT_PUBLIC_SUPABASE_URL),
        hint: "浏览器端和服务端 Supabase 客户端都依赖此配置。"
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        configured: Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        hint: "运行时所有 RLS 查询、RPC 和私有存储访问都依赖此配置。"
      },
      {
        key: "SUPABASE_SERVICE_ROLE_KEY",
        configured: hasSupabaseServiceRole,
        hint: "仅保留给一次性媒体迁移和管理员运维脚本。"
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET",
        configured: Boolean(env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET),
        hint: "当前项目的私有媒体 bucket 名称。"
      }
    ],
    panels: settingsPanels,
    supabaseReady: hasSupabaseConfig,
    databasePreview
  };
}