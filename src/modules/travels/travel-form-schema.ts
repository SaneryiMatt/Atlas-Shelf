import { z } from "zod";

export const travelFormSchema = z.object({
  title: z.string().min(2, "Trip title is required."),
  country: z.string().min(2, "Country is required."),
  stage: z.enum(["idea", "planning", "booked", "visited"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  estimatedBudget: z.coerce.number().nonnegative().optional(),
  summary: z.string().max(1000).optional(),
  highlights: z.array(z.string().min(1)).max(8).default([])
});

export type TravelFormValues = z.infer<typeof travelFormSchema>;

