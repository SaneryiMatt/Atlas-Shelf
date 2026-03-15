import { pgEnum } from "drizzle-orm/pg-core";

export const projectTypeEnum = pgEnum("project_type", ["book", "screen", "travel", "application"]);
export const projectStatusEnum = pgEnum("project_status", [
  "wishlist",
  "planned",
  "in_progress",
  "completed",
  "paused"
]);
export const screenFormatEnum = pgEnum("screen_format", ["movie", "series", "anime", "documentary"]);
export const travelStageEnum = pgEnum("travel_stage", ["idea", "planning", "booked", "visited"]);
export const applicationStageEnum = pgEnum("application_stage", [
  "applied",
  "viewed",
  "interviewing",
  "closed",
  "archived"
]);
export const applicationResultEnum = pgEnum("application_result", ["pending", "accepted", "rejected"]);
export const noteTypeEnum = pgEnum("note_type", [
  "general",
  "progress",
  "quote",
  "review",
  "planning",
  "memory"
]);
export const photoKindEnum = pgEnum("photo_kind", ["cover", "gallery", "reference"]);
export const notificationStatusEnum = pgEnum("notification_status", ["active", "read", "processed"]);
