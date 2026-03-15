import { buildPagination, formatUpdatedAtLabel, MODULE_LIST_PAGE_SIZE, parseModuleListParams } from "@/lib/module-list";
import { getProjectRowsByKind, type RpcProjectRow } from "@/lib/supabase/app-data";
import type { ApplicationListItem } from "@/lib/types/items";
import { applicationResultLabels, applicationStageLabels } from "@/modules/applications/application-form-schema";

function formatDateLabel(value: string | null | undefined) {
  if (!value) {
    return "未填写";
  }

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00.000Z`) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "未填写";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatDateTimeLabel(value: string | null | undefined) {
  if (!value) {
    return "待安排";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "待安排";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function sortApplicationRows(rows: RpcProjectRow[], sort: "applied" | "updated") {
  if (sort === "updated") {
    return [...rows].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
  }

  return [...rows].sort((left, right) => {
    const leftApplied = left.appliedAt ? new Date(`${left.appliedAt}T00:00:00.000Z`).getTime() : 0;
    const rightApplied = right.appliedAt ? new Date(`${right.appliedAt}T00:00:00.000Z`).getTime() : 0;
    return rightApplied - leftApplied || new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

function toApplicationListItem(row: RpcProjectRow): ApplicationListItem {
  return {
    id: row.id,
    title: row.title,
    company: row.company ?? "未填写公司",
    role: row.role ?? "未填写岗位",
    source: row.applicationSource ?? "未填写来源",
    stageLabel: applicationStageLabels[row.applicationStage as keyof typeof applicationStageLabels] ?? row.applicationStage ?? "未填写",
    resultLabel:
      applicationResultLabels[row.applicationResult as keyof typeof applicationResultLabels] ?? row.applicationResult ?? "待定",
    appliedAtLabel: formatDateLabel(row.appliedAt),
    interviewAtLabel: formatDateTimeLabel(row.interviewAt),
    summary: row.summary?.trim() || "暂无备注。",
    updatedAtLabel: formatUpdatedAtLabel(row.updatedAt)
  };
}

function buildEmptyApplicationsPageData(sort: "applied" | "updated", page: number) {
  const pagination = buildPagination(0, page, MODULE_LIST_PAGE_SIZE);

  return {
    stats: [
      {
        label: "进行中投递数",
        value: "0",
        detail: "统计已投递、已查看和面试中的记录数量。",
        trend: "steady" as const
      },
      {
        label: "已安排面试数",
        value: "0",
        detail: "统计已经填写下一场面试时间的记录数量。",
        trend: "steady" as const
      },
      {
        label: "已结束投递数",
        value: "0",
        detail: "统计已结束和已归档的投递记录数量。",
        trend: "steady" as const
      }
    ],
    items: [] as ApplicationListItem[],
    sort,
    pagination,
    canCreateApplications: true
  };
}

export async function getApplicationsPageData(searchParams?: { page?: string; sort?: string }) {
  const { page, sort } = parseModuleListParams(searchParams, {
    allowedSorts: ["applied", "updated"],
    defaultSort: "applied"
  });

  try {
    const rows = await getProjectRowsByKind("application");
    const sortedRows = sortApplicationRows(rows, sort as "applied" | "updated");
    const pagination = buildPagination(sortedRows.length, page, MODULE_LIST_PAGE_SIZE);
    const offset = (pagination.page - 1) * pagination.perPage;
    const visibleRows = sortedRows.slice(offset, offset + pagination.perPage);

    return {
      stats: [
        {
          label: "进行中投递数",
          value: String(rows.filter((row) => ["applied", "viewed", "interviewing"].includes(row.applicationStage ?? "")).length),
          detail: "统计已投递、已查看和面试中的记录数量。",
          trend: "steady" as const
        },
        {
          label: "已安排面试数",
          value: String(rows.filter((row) => Boolean(row.interviewAt)).length),
          detail: "统计已经填写下一场面试时间的记录数量。",
          trend: "up" as const
        },
        {
          label: "已结束投递数",
          value: String(rows.filter((row) => ["closed", "archived"].includes(row.applicationStage ?? "")).length),
          detail: "统计已结束和已归档的投递记录数量。",
          trend: "up" as const
        }
      ],
      items: visibleRows.map(toApplicationListItem),
      sort: sort as "applied" | "updated",
      pagination,
      canCreateApplications: true
    };
  } catch {
    return buildEmptyApplicationsPageData(sort as "applied" | "updated", page);
  }
}
