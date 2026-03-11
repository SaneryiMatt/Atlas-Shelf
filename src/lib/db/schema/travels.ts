import { date, numeric, pgTable, text, uuid, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { travelStageEnum } from "@/lib/db/schema/enums";
import { items } from "@/lib/db/schema/items";

export const travelDetails = pgTable("travel_details", {
  itemId: uuid("item_id")
    .primaryKey()
    .references(() => items.id, { onDelete: "cascade" }),
  city: text("city"),
  region: text("region"),
  country: text("country").notNull(),
  stage: travelStageEnum("stage").notNull().default("idea"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  estimatedBudget: numeric("estimated_budget", { precision: 10, scale: 2 }),
  travelStyle: text("travel_style"),
  highlights: jsonb("highlights").$type<string[]>().notNull().default(sql`'[]'::jsonb`)
});

