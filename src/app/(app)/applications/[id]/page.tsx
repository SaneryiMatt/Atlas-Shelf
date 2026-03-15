import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetailPage } from "@/components/shared/project-detail-page";
import { getApplicationDetailPageData } from "@/lib/db/queries/project-details";
import { ApplicationDetailActions } from "@/modules/applications/components/application-detail-actions";

export const metadata: Metadata = {
  title: "投递详情"
};

export default async function ApplicationDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getApplicationDetailPageData(id);

  if (!data) {
    notFound();
  }

  return (
    <ProjectDetailPage
      eyebrow="投递"
      description=""
      backHref="/applications"
      backLabel="返回列表"
      detail={data.detail}
      headerMeta={data.headerMeta}
      actions={
        data.detail.canManage ? (
          <ApplicationDetailActions
            projectId={data.detail.id}
            projectTitle={data.detail.title}
            initialValues={data.editor}
          />
        ) : null
      }
    />
  );
}
