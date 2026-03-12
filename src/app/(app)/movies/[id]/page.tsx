import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetailPage } from "@/components/shared/project-detail-page";
import { getMovieDetailPageData } from "@/lib/db/queries/project-details";
import { MovieDetailActions } from "@/modules/movies/components/movie-detail-actions";

export const metadata: Metadata = {
  title: "影视详情"
};

export default async function MovieDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getMovieDetailPageData(id);

  if (!data) {
    notFound();
  }

  return (
    <ProjectDetailPage
      eyebrow="影视详情"
      description="这里展示作品的基本信息、标签、笔记、评分和图片。"
      backHref="/movies"
      backLabel="返回影视列表"
      detail={data.detail}
      actions={
        data.detail.canManage ? (
          <MovieDetailActions projectId={data.detail.id} projectTitle={data.detail.title} initialValues={data.editor} />
        ) : null
      }
    />
  );
}
