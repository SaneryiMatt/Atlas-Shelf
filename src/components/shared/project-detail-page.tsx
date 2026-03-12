import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImageIcon, NotebookPen, Star, Tags } from "lucide-react";

import { DeleteProjectPhotoDialog } from "@/components/shared/delete-project-photo-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
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
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={detail.title}
        description={description}
        actions={
          <>
            {actions}
            <Button asChild variant="outline">
              <Link href={backHref}>
                <ArrowLeft className="size-4" />
                {backLabel}
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">当前状态</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge>{detail.statusLabel}</Badge>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">综合评分</p>
          <div className="mt-3 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Star className="size-4 text-amber-400" />
            <span>{detail.ratingLabel}</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">最近更新</p>
          <p className="mt-3 text-base font-medium text-foreground">{detail.updatedAtLabel}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <SectionCard title="基本信息" description="查看当前条目的核心信息、时间和状态。">
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-background p-5">
              <p className="text-sm leading-7 text-muted-foreground">
                {detail.summary?.trim() || "当前还没有补充简介或简短说明。"}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {detail.fields.map((field) => (
                <div key={field.label} className="rounded-xl border border-border bg-background p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{field.label}</p>
                  <p className="mt-3 text-base font-medium text-foreground">{field.value}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="标签" description="标签用于组织主题、风格和后续筛选。" className="h-fit">
          {detail.tags.length ? (
            <div className="flex flex-wrap gap-2">
              {detail.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="gap-2">
                  <Tags className="size-3.5" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm leading-6 text-muted-foreground">
              这条记录还没有关联标签。
            </div>
          )}
        </SectionCard>
      </section>

      <SectionCard title="笔记" description="笔记按记录时间展示，可承载摘录、回忆和补充说明。">
        {detail.notes.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {detail.notes.map((note) => (
              <article key={note.id} className="rounded-xl border border-border bg-background p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={note.pinned ? "success" : "outline"}>{note.typeLabel}</Badge>
                  {note.pinned ? <Badge variant="secondary">置顶</Badge> : null}
                  <p className="text-xs text-muted-foreground">{note.recordedAtLabel}</p>
                </div>
                <div className="mt-4 space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">{note.title}</h3>
                  <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{note.body}</p>
                  {note.sourceUrl ? (
                    <Link
                      href={note.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      查看来源
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
            当前还没有保存笔记。
          </div>
        )}
      </SectionCard>

      <SectionCard title="图片" description="上传的图片会显示在这里。">
        {detail.photos.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {detail.photos.map((photo) => (
              <article key={photo.id} className="overflow-hidden rounded-xl border border-border bg-background">
                {photo.url ? (
                  <div className="relative aspect-[4/3] bg-muted/20">
                    <Image
                      src={photo.url}
                      alt={photo.altText}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 28vw, (min-width: 768px) 42vw, 100vw"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-muted/30 text-muted-foreground">
                    <div className="space-y-3 text-center">
                      <ImageIcon className="mx-auto size-8" />
                      <p className="text-sm">图片已保存，但没有可直接访问的地址。</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 border-t border-border/60 p-4">
                  {!photo.url ? <p className="text-xs text-muted-foreground">{photo.storageLabel}</p> : <span />}
                  {detail.canManage ? <DeleteProjectPhotoDialog photoId={photo.id} /> : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
            <NotebookPen className="mb-3 size-5 text-primary" />
            当前还没有上传图片。
          </div>
        )}
      </SectionCard>
    </div>
  );
}
