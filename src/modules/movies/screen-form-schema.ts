import { z } from "zod";

export const screenFormSchema = z.object({
  title: z.string().min(2, "Title is required."),
  format: z.enum(["movie", "series", "anime", "documentary"]),
  platform: z.string().min(2, "Platform is required."),
  status: z.enum(["wishlist", "planned", "in_progress", "completed", "paused"]),
  rating: z.coerce.number().min(0).max(5).optional(),
  summary: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional()
});

export type ScreenFormValues = z.infer<typeof screenFormSchema>;

