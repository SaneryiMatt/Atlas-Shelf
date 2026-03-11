import { z } from "zod";

export const bookFormSchema = z.object({
  title: z.string().min(2, "Title is required."),
  author: z.string().min(2, "Author is required."),
  status: z.enum(["wishlist", "planned", "in_progress", "completed", "paused"]),
  pageCount: z.coerce.number().int().positive().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  summary: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional()
});

export type BookFormValues = z.infer<typeof bookFormSchema>;

