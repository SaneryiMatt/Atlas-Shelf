import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetailPage } from "@/components/shared/project-detail-page";
import { getBookDetailPageData } from "@/lib/db/queries/project-details";
import { BookDetailActions } from "@/modules/books/components/book-detail-actions";

export const metadata: Metadata = {
  title: "书籍详情"
};

export default async function BookDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getBookDetailPageData(id);

  if (!data) {
    notFound();
  }

  return (
    <ProjectDetailPage
      eyebrow="书籍"
      description=""
      backHref="/books"
      backLabel="返回列表"
      detail={data.detail}
      actions={
        data.detail.canManage ? (
          <BookDetailActions projectId={data.detail.id} projectTitle={data.detail.title} initialValues={data.editor} />
        ) : null
      }
    />
  );
}
