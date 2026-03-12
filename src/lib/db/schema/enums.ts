import { pgEnum } from "drizzle-orm/pg-core";

export const projectTypeEnum = pgEnum("project_type", ["book", "screen", "travel"]);
export const projectStatusEnum = pgEnum("project_status", [
  "wishlist",
  "planned",
  "in_progress",
  "completed",
  "paused"
]);
export const screenFormatEnum = pgEnum("screen_format", ["movie", "series", "anime", "documentary"]);
export const travelStageEnum = pgEnum("travel_stage", ["idea", "planning", "booked", "visited"]);
export const noteTypeEnum = pgEnum("note_type", [
  "general",
  "progress",
  "quote",
  "review",
  "planning",
  "memory"
]);
export const photoKindEnum = pgEnum("photo_kind", ["cover", "gallery", "reference"]);

