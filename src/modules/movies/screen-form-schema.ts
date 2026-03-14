import { z } from "zod";

import type { ItemStatus } from "@/lib/types/items";

export const movieStatusValues = ["planned", "in_progress", "completed"] as const;

export const movieStatusOptions: Array<{ value: ItemStatus; label: string }> = [
  { value: "planned", label: "过去式" },
  { value: "in_progress", label: "现在进行时" },
  { value: "completed", label: "完成时" }
];

export const movieStatusLabels = Object.fromEntries(movieStatusOptions.map((option) => [option.value, option.label])) as Record<
  ItemStatus,
  string
>;

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
    .refine((value) => value === "" || !Number.isNaN(Number(value)), "评分必须是数字")
    .refine((value) => value === "" || (Number(value) >= 0 && Number(value) <= 5), "评分需在 0 到 5 之间")
    .refine((value) => value === "" || /^\d(?:\.0|\.5)?$/.test(value), "评分只能是整数或 .5"),
  note: z.string().trim().max(280, "简短备注不能超过 280 个字符"),
  tags: z
    .string()
    .trim()
    .max(120, "标签总长度不能超过 120 个字符")
    .refine((value) => splitMovieTags(value).length <= 8, "最多填写 8 个标签")
    .refine((value) => splitMovieTags(value).every((tag) => tag.length <= 20), "单个标签不能超过 20 个字符")
});

export type MovieFormValues = z.infer<typeof movieFormSchema>;
