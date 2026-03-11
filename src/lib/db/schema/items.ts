import { sql } from "drizzle-orm";
import { integer, jsonb, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { itemStatusEnum, itemTypeEnum } from "@/lib/db/schema/enums";

export const items = pgTable("items", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: itemTypeEnum("type").notNull(),
  status: itemStatusEnum("status").notNull().default("wishlist"),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary"),
  coverImageUrl: text("cover_image_url"),
  rating: numeric("rating", { precision: 3, scale: 1 }),
  priority: integer("priority").notNull().default(3),
  tags: jsonb("tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

