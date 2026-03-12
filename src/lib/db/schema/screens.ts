import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { screenFormatEnum } from "@/lib/db/schema/enums";
import { projects } from "@/lib/db/schema/projects";

export const screenDetails = pgTable("screen_details", {
  projectId: uuid("project_id")
    .primaryKey()
    .references(() => projects.id, { onDelete: "cascade" }),
  format: screenFormatEnum("format").notNull(),
  creator: text("creator"),
  director: text("director"),
  studio: text("studio"),
  releaseYear: integer("release_year"),
  runtimeMinutes: integer("runtime_minutes"),
  episodeCount: integer("episode_count"),
  seasonCount: integer("season_count"),
  platform: text("platform")
});

