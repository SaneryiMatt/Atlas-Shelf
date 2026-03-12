import { date, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { projects } from "@/lib/db/schema/projects";

export const bookDetails = pgTable("book_details", {
  projectId: uuid("project_id")
    .primaryKey()
    .references(() => projects.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  subtitle: text("subtitle"),
  pageCount: integer("page_count"),
  currentPage: integer("current_page"),
  isbn: text("isbn"),
  publisher: text("publisher"),
  publishedOn: date("published_on"),
  language: text("language"),
  format: text("format"),
  edition: text("edition")
});

