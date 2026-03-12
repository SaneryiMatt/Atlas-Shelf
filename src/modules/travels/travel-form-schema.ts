import { z } from "zod";

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

export const travelFormSchema = z
  .object({
    placeName: z.string().trim().min(1, "请输入地点名称。").max(120, "地点名称不能超过 120 个字符。"),
    country: z.string().trim().min(1, "请输入国家或地区。").max(80, "国家或地区不能超过 80 个字符。"),
    city: z.string().trim().min(1, "请输入城市。").max(80, "城市不能超过 80 个字符。"),
    travelDate: z
      .string()
      .trim()
      .refine((value) => isValidDate(value), "请输入有效的旅行日期。"),
    description: z.string().trim().min(1, "请输入地点描述。").max(280, "描述不能超过 280 个字符。"),
    latitude: z
      .string()
      .trim()
      .refine((value) => value === "" || !Number.isNaN(Number(value)), "纬度必须是数字。")
      .refine((value) => value === "" || (Number(value) >= -90 && Number(value) <= 90), "纬度需在 -90 到 90 之间。"),
    longitude: z
      .string()
      .trim()
      .refine((value) => value === "" || !Number.isNaN(Number(value)), "经度必须是数字。")
      .refine((value) => value === "" || (Number(value) >= -180 && Number(value) <= 180), "经度需在 -180 到 180 之间。")
  })
  .superRefine((values, ctx) => {
    const hasLatitude = values.latitude !== "";
    const hasLongitude = values.longitude !== "";

    if (hasLatitude !== hasLongitude) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [hasLatitude ? "longitude" : "latitude"],
        message: "纬度和经度需要同时填写。"
      });
    }
  });

export type TravelFormValues = z.infer<typeof travelFormSchema>;
