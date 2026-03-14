import { index, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { authUsers } from "@/lib/db/schema/auth";
import { projects } from "@/lib/db/schema/projects";

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    color: text("color").notNull().default("stone"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("tags_user_name_unique").on(table.userId, table.name),
    uniqueIndex("tags_user_slug_unique").on(table.userId, table.slug),
    index("tags_user_id_idx").on(table.userId),
    index("tags_color_idx").on(table.color)
  ]
);

export const projectTags = pgTable(
  "project_tags",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    primaryKey({
      columns: [table.projectId, table.tagId],
      name: "project_tags_project_id_tag_id_pk"
    }),
    index("project_tags_tag_id_idx").on(table.tagId)
  ]
);