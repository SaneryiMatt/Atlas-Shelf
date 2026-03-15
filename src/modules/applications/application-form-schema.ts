import { z } from "zod";

export const applicationStageValues = ["applied", "viewed", "interviewing", "closed", "archived"] as const;
export const applicationResultValues = ["pending", "accepted", "rejected"] as const;

export const applicationStageOptions = [
  { value: "applied", label: "已投递" },
  { value: "viewed", label: "已查看" },
  { value: "interviewing", label: "面试中" },
  { value: "closed", label: "已结束" },
  { value: "archived", label: "已归档" }
] as const;

export const applicationResultOptions = [
  { value: "pending", label: "待定" },
  { value: "accepted", label: "通过" },
  { value: "rejected", label: "未通过" }
] as const;

export const applicationStageLabels = Object.fromEntries(
  applicationStageOptions.map((option) => [option.value, option.label])
) as Record<(typeof applicationStageValues)[number], string>;

export const applicationResultLabels = Object.fromEntries(
  applicationResultOptions.map((option) => [option.value, option.label])
) as Record<(typeof applicationResultValues)[number], string>;

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isValidDateTime(value: string) {
  if (!value) {
    return true;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export const applicationFormSchema = z
  .object({
    company: z.string().trim().min(1, "请输入公司名称").max(120, "公司名称不能超过 120 个字符"),
    role: z.string().trim().min(1, "请输入岗位名称").max(120, "岗位名称不能超过 120 个字符"),
    source: z.string().trim().min(1, "请输入投递来源").max(80, "投递来源不能超过 80 个字符"),
    stage: z.enum(applicationStageValues, {
      errorMap: () => ({ message: "请选择当前进度" })
    }),
    result: z.enum(applicationResultValues, {
      errorMap: () => ({ message: "请选择最终结果" })
    }),
    appliedAt: z
      .string()
      .trim()
      .refine((value) => isValidDate(value), "请输入有效的投递日期"),
    interviewAt: z
      .string()
      .trim()
      .refine((value) => value === "" || isValidDateTime(value), "请输入有效的面试时间"),
    notes: z.string().trim().max(500, "备注不能超过 500 个字符")
  })
  .superRefine((values, ctx) => {
    const isOpenStage = ["applied", "viewed", "interviewing"].includes(values.stage);
    const isResolvedStage = ["closed", "archived"].includes(values.stage);

    if (values.result !== "pending" && !isResolvedStage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["result"],
        message: "有最终结果时，当前进度必须是已结束或已归档"
      });
    }

    if (isOpenStage && values.result !== "pending") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stage"],
        message: "未结束的投递记录结果必须保持为待定"
      });
    }
  });

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;
