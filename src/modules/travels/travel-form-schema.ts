import { z } from "zod";

export const travelStatusValues = ["planned", "in_progress", "completed"] as const;

export const travelStatusLabels = {
  planned: "规划中",
  in_progress: "已预订",
  completed: "已到访"
} as const;

export const travelStatusOptions: Array<{ value: (typeof travelStatusValues)[number]; label: string }> = [
  { value: "planned", label: travelStatusLabels.planned },
  { value: "in_progress", label: travelStatusLabels.in_progress },
  { value: "completed", label: travelStatusLabels.completed }
];

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const travelFormSchema = z.object({
  placeName: z.string().trim().min(1, "请输入地点名称").max(120, "地点名称不能超过 120 个字符"),
  country: z.string().trim().min(1, "请输入国家或地区").max(80, "国家或地区不能超过 80 个字符"),
  city: z.string().trim().min(1, "请输入城市").max(80, "城市不能超过 80 个字符"),
  status: z.enum(travelStatusValues, {
    errorMap: () => ({ message: "请选择旅行状态" })
  }),
  travelDate: z
    .string()
    .trim()
    .refine((value) => isValidDate(value), "请输入有效的旅行日期"),
  description: z.string().trim().min(1, "请输入地点描述").max(280, "描述不能超过 280 个字符")
});

export type TravelFormValues = z.infer<typeof travelFormSchema>;
