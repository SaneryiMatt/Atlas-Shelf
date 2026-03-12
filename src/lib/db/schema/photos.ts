import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { photoKindEnum } from "@/lib/db/schema/enums";
import { projects } from "@/lib/db/schema/projects";

export const projectPhotos = pgTable(
  "project_photos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    kind: photoKindEnum("kind").notNull().default("gallery"),
    storageBucket: text("storage_bucket").notNull(),
    storagePath: text("storage_path").notNull(),
    publicUrl: text("public_url"),
    caption: text("caption"),
    altText: text("alt_text"),
    mimeType: text("mime_type"),
    sortOrder: integer("sort_order").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
    takenAt: timestamp("taken_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("project_photos_project_id_idx").on(table.projectId),
    index("project_photos_project_id_sort_order_idx").on(table.projectId, table.sortOrder)
  ]
);
