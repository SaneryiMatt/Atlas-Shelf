import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { noteTypeEnum } from "@/lib/db/schema/enums";
import { projects } from "@/lib/db/schema/projects";

export const projectNotes = pgTable(
  "project_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    type: noteTypeEnum("type").notNull().default("general"),
    title: text("title"),
    body: text("body").notNull(),
    sourceUrl: text("source_url"),
    pinned: boolean("pinned").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("project_notes_project_id_idx").on(table.projectId),
    index("project_notes_project_id_recorded_at_idx").on(table.projectId, table.recordedAt)
  ]
);
