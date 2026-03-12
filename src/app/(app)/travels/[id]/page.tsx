import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetailPage } from "@/components/shared/project-detail-page";
import { getTravelDetailPageData } from "@/lib/db/queries/project-details";
import { TravelDetailActions } from "@/modules/travels/components/travel-detail-actions";

export const metadata: Metadata = {
  title: "旅行详情"
};

export default async function TravelDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getTravelDetailPageData(id);

  if (!data) {
    notFound();
  }

  return (
    <ProjectDetailPage
      eyebrow="旅行"
      description=""
      backHref="/travels"
      backLabel="返回列表"
      detail={data.detail}
      actions={
        data.detail.canManage ? (
          <TravelDetailActions projectId={data.detail.id} projectTitle={data.detail.title} initialValues={data.editor} />
        ) : null
      }
    />
  );
}
