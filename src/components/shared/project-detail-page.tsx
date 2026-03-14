import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImageIcon, ExternalLink } from "lucide-react";

import { DeleteProjectPhotoDialog } from "@/components/shared/delete-project-photo-dialog";
import { projectDetailActionGroupClassName } from "@/components/shared/project-detail-action-button-styles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProjectDetailPageData } from "@/lib/types/items";

interface ProjectDetailPageProps {
  eyebrow: string;
  description: string;
  backHref: string;
  backLabel: string;
  detail: ProjectDetailPageData;
  actions?: ReactNode;
}

export function ProjectDetailPage({
  eyebrow,
  description,
  backHref,
  backLabel,
  detail,
  actions
}: ProjectDetailPageProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 顶部导航 */}
      <nav className="mb-8">
        <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <Link href={backHref}>
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>
        </Button>
      </nav>

      {/* 主标题区域 */}
      <header className="mb-10 border-b border-border/40 pb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
            <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{detail.title}</h1>
            
            {/* 状态指标 */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">状态</span>
                <Badge variant="outline">{detail.statusLabel}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">评分</span>
                <span className="font-medium text-foreground">{detail.ratingLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">更新</span>
                <span className="text-foreground">{detail.updatedAtLabel}</span>
              </div>
            </div>
          </div>
          
          {/* 操作按钮 */}
          {actions}
        </div>
      </header>

      {/* 简介 */}
      {detail.summary?.trim() && (
        <section className="mb-10">
          <p className="text-base leading-relaxed text-muted-foreground">{detail.summary}</p>
        </section>
      )}

      {/* 详细信息 */}
      <section className="mb-10">
        <h2 className="mb-5 text-sm font-medium uppercase tracking-widest text-muted-foreground">详细信息</h2>
        <div className="grid gap-px overflow-hidden rounded-lg border border-border/40 bg-border/40 sm:grid-cols-2">
          {detail.fields.map((field) => (
            <div key={field.label} className="bg-card/50 p-4">
              <p className="mb-1 text-xs text-muted-foreground">{field.label}</p>
              <p className="font-medium text-foreground">{field.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 标签 */}
      {detail.tags.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">标签</h2>
          <div className="flex flex-wrap gap-2">
            {detail.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-border/60 bg-card/30 px-3 py-1 text-sm text-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 笔记 */}
      {detail.notes.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-5 text-sm font-medium uppercase tracking-widest text-muted-foreground">笔记</h2>
          <div className="space-y-4">
            {detail.notes.map((note) => (
              <article
                key={note.id}
                className="rounded-lg border border-border/40 bg-card/30 p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Badge variant={note.pinned ? "default" : "outline"} className="text-xs">
                    {note.typeLabel}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{note.recordedAtLabel}</span>
                </div>
                <h3 className="mb-2 font-medium text-foreground">{note.title}</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{note.body}</p>
                {note.sourceUrl && (
                  <Link
                    href={note.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ExternalLink className="size-3" />
                    来源链接
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 图片 */}
      {detail.photos.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-5 text-sm font-medium uppercase tracking-widest text-muted-foreground">图片</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {detail.photos.map((photo) => (
              <article key={photo.id} className="group overflow-hidden rounded-lg border border-border/40 bg-card/30">
                {photo.url ? (
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={photo.url}
                      alt={photo.altText}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 28vw, (min-width: 640px) 42vw, 100vw"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-muted/20">
                    <ImageIcon className="size-8 text-muted-foreground/40" />
                  </div>
                )}
                {detail.canManage && (
                  <div className="flex justify-end border-t border-border/40 p-2">
                    <DeleteProjectPhotoDialog photoId={photo.id} />
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 空状态提示 */}
      {!detail.summary?.trim() && detail.tags.length === 0 && detail.notes.length === 0 && detail.photos.length === 0 && (
        <div className="rounded-lg border border-dashed border-border/40 py-12 text-center">
          <p className="text-sm text-muted-foreground">暂无更多详情</p>
        </div>
      )}
    </div>
  );
}
