import { index, integer, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { projectStatusEnum, projectTypeEnum } from "@/lib/db/schema/enums";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: projectTypeEnum("type").notNull(),
    status: projectStatusEnum("status").notNull().default("wishlist"),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    summary: text("summary"),
    sourceUrl: text("source_url"),
    rating: numeric("rating", { precision: 3, scale: 1 }),
    priority: integer("priority").notNull().default(3),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("projects_slug_unique").on(table.slug),
    index("projects_type_status_idx").on(table.type, table.status),
    index("projects_started_at_idx").on(table.startedAt),
    index("projects_completed_at_idx").on(table.completedAt)
  ]
);
