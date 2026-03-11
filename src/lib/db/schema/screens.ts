import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { screenFormatEnum } from "@/lib/db/schema/enums";
import { items } from "@/lib/db/schema/items";

export const screenDetails = pgTable("screen_details", {
  itemId: uuid("item_id")
    .primaryKey()
    .references(() => items.id, { onDelete: "cascade" }),
  format: screenFormatEnum("format").notNull(),
  director: text("director"),
  studio: text("studio"),
  releaseYear: integer("release_year"),
  runtimeMinutes: integer("runtime_minutes"),
  episodeCount: integer("episode_count"),
  seasonCount: integer("season_count"),
  platform: text("platform")
});

