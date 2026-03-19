import { z } from "zod";

import { isDiscreteRatingValue } from "@/lib/module-list";
import type { ItemStatus } from "@/lib/types/items";

export const movieStatusValues = ["planned", "in_progress", "completed"] as const;

export const movieStatusLabels: Record<ItemStatus, string> = {
  wishlist: "想看",
  planned: "待看",
  in_progress: "在看",
  completed: "已看完",
  paused: "已暂停"
};

export const movieStatusOptions: Array<{ value: (typeof movieStatusValues)[number]; label: string }> = [
  { value: "planned", label: movieStatusLabels.planned },
  { value: "in_progress", label: movieStatusLabels.in_progress },
  { value: "completed", label: movieStatusLabels.completed }
];

export function splitMovieTags(rawValue: string) {
  return Array.from(
    new Set(
      rawValue
        .split(/[，,]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

export const movieFormSchema = z.object({
  title: z.string().trim().min(1, "请输入片名").max(120, "片名不能超过 120 个字符"),
  director: z.string().trim().min(1, "请输入导演").max(80, "导演不能超过 80 个字符"),
  releaseYear: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{4}$/.test(value), "上映年份需为 4 位数字")
    .refine((value) => value === "" || (Number(value) >= 1888 && Number(value) <= 2100), "上映年份需在 1888 到 2100 之间"),
  platform: z.string().trim().min(1, "请输入观看平台").max(80, "观看平台不能超过 80 个字符"),
  status: z.enum(movieStatusValues, {
    errorMap: () => ({ message: "请选择观看状态" })
  }),
  rating: z
    .string()
    .trim()
    .refine((value) => value === "" || isDiscreteRatingValue(value), "评分只能选择 0 到 5 分"),
  note: z.string().trim().max(280, "简短备注不能超过 280 个字符"),
  tags: z
    .string()
    .trim()
    .max(120, "标签总长度不能超过 120 个字符")
    .refine((value) => splitMovieTags(value).length <= 8, "最多填写 8 个标签")
    .refine((value) => splitMovieTags(value).every((tag) => tag.length <= 20), "单个标签不能超过 20 个字符")
});

export type MovieFormValues = z.infer<typeof movieFormSchema>;
