import { CheckCircle2, CircleDashed, DatabaseZap, WandSparkles } from "lucide-react";

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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">设置</h1>
        <p className="mt-2 text-muted-foreground">数据、集成和接口配置</p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="环境准备情况" description="接入真实服务时不需要重构页面结构。">
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

        <SectionCard title="运行面板" description="项目结构已经把基础设施决策限制在局部范围内。">
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
        title="数据库预览"
        description="直接读取 projects、project_notes 和 tags，用来验证查询层是否已经接到新 schema。"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={databasePreview?.status === "live" ? "success" : "outline"}>
            {databasePreview?.status === "live" ? "实时数据" : "不可用"}
          </Badge>
          <p className="text-sm leading-6 text-muted-foreground">
            {databasePreview?.message ?? "暂无数据库预览状态。"}
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
                <p className="text-sm leading-6 text-muted-foreground">当前还没有可显示的实时项目数据。</p>
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
                <p className="text-sm leading-6 text-muted-foreground">当前还没有可显示的实时笔记数据。</p>
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
                <p className="text-sm leading-6 text-muted-foreground">当前还没有可显示的实时标签数据。</p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="生产接入状态" description="剩余工作主要集中在服务接入和 CRUD 流程实现。">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            <DatabaseZap className="mb-3 size-5 text-primary" />
            查询模块已经把页面数据需求和底层存储实现隔离开。
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            <WandSparkles className="mb-3 size-5 text-primary" />
            AI 相关字段可以显式存储，而不需要把模型假设写死在页面组件里。
          </div>
          <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
            校验 schema 就近放在模块内，后续扩展表单时不会造成中心化膨胀。
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

