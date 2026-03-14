import { CheckCircle2, CircleDashed, DatabaseZap, ShieldCheck, WandSparkles } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import type {
  ProjectNotePreview,
  ProjectPreview,
  ProjectTagPreview,
  SettingsPanel
} from "@/lib/types/items";

const projectTypeLabels = {
  book: "书籍",
  screen: "影视",
  travel: "旅行"
} as const;

const noteTypeLabels: Record<string, string> = {
  general: "通用",
  progress: "进度",
  quote: "摘录",
  review: "评价",
  planning: "规划",
  memory: "回忆"
};

const projectStatusLabels: Record<string, string> = {
  wishlist: "想加入",
  planned: "计划中",
  in_progress: "进行中",
  completed: "已完成",
  paused: "已暂停"
};

interface SettingsOverviewProps {
  envStatus: Array<{
    key: string;
    configured: boolean;
    hint: string;
  }>;
  panels: SettingsPanel[];
  databasePreview: {
    status: "live" | "unavailable";
    message: string;
    projects: ProjectPreview[];
    notes: ProjectNotePreview[];
    tags: ProjectTagPreview[];
  } | null;
}

export function SettingsOverview({ envStatus, panels, databasePreview }: SettingsOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="设置模块"
        title="把权限边界、运行环境和数据入口收拢到同一处查看"
        description="这里展示当前项目的环境准备度，以及数据库层强隔离改造后的实时数据快照。"
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="环境准备情况" description="确认迁移、RLS 访问链路和管理员脚本是否具备运行条件。">
          <div className="space-y-4">
            {envStatus.map((entry) => (
              <div key={entry.key} className="flex items-start justify-between gap-4 rounded-3xl border border-border/60 bg-background/70 p-5">
                <div>
                  <p className="font-medium text-foreground">{entry.key}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.hint}</p>
                </div>
                <Badge variant={entry.configured ? "success" : "outline"} className="gap-2">
                  {entry.configured ? <CheckCircle2 className="size-3.5" /> : <CircleDashed className="size-3.5" />}
                  {entry.configured ? "已配置" : "待配置"}
                </Badge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="运行面板" description="聚合当前项目的架构状态，便于确认运行时是否仍有绕过 RLS 的旧路径。">
          <div className="space-y-4">
            {panels.map((panel) => (
              <div key={panel.title} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{panel.title}</h3>
                  <Badge variant="secondary">{panel.status}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{panel.description}</p>
                <p className="mt-3 text-sm leading-6 text-foreground">{panel.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="当前账号数据快照"
        description="以下数据通过 Supabase 会话 + RLS RPC 读取，只展示当前登录账号拥有的项目、笔记和标签。"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={databasePreview?.status === "live" ? "success" : "outline"}>
            {databasePreview?.status === "live" ? "RLS 实时数据" : "当前不可用"}
          </Badge>
          <p className="text-sm leading-6 text-muted-foreground">
            {databasePreview?.message ?? "暂无数据库快照状态。"}
          </p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="space-y-3 rounded-3xl border border-border/60 bg-background/70 p-5">
            <p className="font-medium text-foreground">最近项目</p>
            <div className="space-y-3">
              {databasePreview?.projects.length ? (
                databasePreview.projects.map((project) => (
                  <div key={project.id} className="rounded-2xl border border-border/50 bg-background/80 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{project.title}</p>
                      <Badge variant="secondary">{projectTypeLabels[project.type]}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {(projectStatusLabels[project.status] ?? project.status)} · 最近更新于 {project.updatedAtLabel}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">当前账号下还没有可显示的项目数据。</p>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-border/60 bg-background/70 p-5">
            <p className="font-medium text-foreground">最近笔记</p>
            <div className="space-y-3">
              {databasePreview?.notes.length ? (
                databasePreview.notes.map((note) => (
                  <div key={note.id} className="rounded-2xl border border-border/50 bg-background/80 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{note.noteTitle}</p>
                      <Badge variant="outline">{noteTypeLabels[note.noteType] ?? note.noteType}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {note.projectTitle} · {note.recordedAtLabel}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">当前账号下还没有可显示的笔记数据。</p>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-border/60 bg-background/70 p-5">
            <p className="font-medium text-foreground">热门标签</p>
            <div className="space-y-3">
              {databasePreview?.tags.length ? (
                databasePreview.tags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/80 px-4 py-3">
                    <p className="font-medium text-foreground">{tag.name}</p>
                    <Badge variant="secondary">{tag.usageCount}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">当前账号下还没有可显示的标签数据。</p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="生产接入状态" description="数据库层强隔离上线后，用户态请求只应通过 RLS 和受控 RPC 进入数据层。">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            <ShieldCheck className="mb-3 size-5 text-primary" />
            账号隔离已经下沉到数据库层，项目、标签、笔记、通知和照片都依赖同一套 owner 约束与 RLS policy。
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            <DatabaseZap className="mb-3 size-5 text-primary" />
            运行时读取改走 RPC，避免 Next.js 继续通过高权限连接直接查询底层业务表。
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            <WandSparkles className="mb-3 size-5 text-primary" />
            私有媒体 bucket 与 signed URL 已纳入同一条链路，后续只需要执行迁移和存量媒体重定位脚本即可完成切换。
          </div>
        </div>
      </SectionCard>
    </div>
  );
}