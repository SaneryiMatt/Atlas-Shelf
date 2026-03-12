import { date, jsonb, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { travelStageEnum } from "@/lib/db/schema/enums";
import { projects } from "@/lib/db/schema/projects";

export const travelDetails = pgTable("travel_details", {
  projectId: uuid("project_id")
    .primaryKey()
    .references(() => projects.id, { onDelete: "cascade" }),
  city: text("city"),
  region: text("region"),
  country: text("country").notNull(),
  stage: travelStageEnum("stage").notNull().default("idea"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  estimatedBudget: numeric("estimated_budget", { precision: 10, scale: 2 }),
  travelStyle: text("travel_style"),
  latitude: numeric("latitude", { precision: 9, scale: 6 }),
  longitude: numeric("longitude", { precision: 9, scale: 6 }),
  highlights: jsonb("highlights").$type<string[]>().notNull().default(sql`'[]'::jsonb`)
});

