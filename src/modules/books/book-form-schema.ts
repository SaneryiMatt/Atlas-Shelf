import { z } from "zod";

import { isDiscreteRatingValue } from "@/lib/module-list";
import type { ItemStatus } from "@/lib/types/items";

export const bookStatusValues = ["planned", "in_progress", "completed"] as const;

export const bookStatusLabels: Record<ItemStatus, string> = {
  wishlist: "想读",
  planned: "待读",
  in_progress: "在读",
  completed: "已读完",
  paused: "已暂停"
};

export const bookStatusOptions: Array<{ value: (typeof bookStatusValues)[number]; label: string }> = [
  { value: "planned", label: bookStatusLabels.planned },
  { value: "in_progress", label: bookStatusLabels.in_progress },
  { value: "completed", label: bookStatusLabels.completed }
];

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function splitBookTags(rawValue: string) {
  return Array.from(
    new Set(
      rawValue
        .split(/[，,]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

export const bookFormSchema = z
  .object({
    title: z.string().trim().min(1, "请输入书名").max(120, "书名不能超过 120 个字符"),
    author: z.string().trim().min(1, "请输入作者").max(80, "作者不能超过 80 个字符"),
    status: z.enum(bookStatusValues, {
      errorMap: () => ({ message: "请选择阅读状态" })
    }),
    rating: z
      .string()
      .trim()
      .refine((value) => value === "" || isDiscreteRatingValue(value), "评分只能选择 0 到 5 分"),
    startedAt: z
      .string()
      .trim()
      .refine((value) => value === "" || isValidDate(value), "开始日期格式无效"),
    completedAt: z
      .string()
      .trim()
      .refine((value) => value === "" || isValidDate(value), "结束日期格式无效"),
    summary: z.string().trim().max(280, "简短备注不能超过 280 个字符"),
    tags: z
      .string()
      .trim()
      .max(120, "标签总长度不能超过 120 个字符")
      .refine((value) => splitBookTags(value).length <= 8, "最多填写 8 个标签")
      .refine((value) => splitBookTags(value).every((tag) => tag.length <= 20), "单个标签不能超过 20 个字符")
  })
  .superRefine((values, ctx) => {
    if (values.startedAt && values.completedAt && values.startedAt > values.completedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["completedAt"],
        message: "结束日期不能早于开始日期"
      });
    }

    if (values.completedAt && values.status !== "completed") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["completedAt"],
        message: "只有状态为“已读完”时才能填写结束日期"
      });
    }
  });

export type BookFormValues = z.infer<typeof bookFormSchema>;
