import { date, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { items } from "@/lib/db/schema/items";

export const bookDetails = pgTable("book_details", {
  itemId: uuid("item_id")
    .primaryKey()
    .references(() => items.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  pageCount: integer("page_count"),
  isbn: text("isbn"),
  publisher: text("publisher"),
  publishedOn: date("published_on"),
  language: text("language"),
  format: text("format")
});

