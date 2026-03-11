import { pgEnum } from "drizzle-orm/pg-core";

export const itemTypeEnum = pgEnum("item_type", ["book", "screen", "travel"]);
export const itemStatusEnum = pgEnum("item_status", [
  "wishlist",
  "planned",
  "in_progress",
  "completed",
  "paused"
]);
export const screenFormatEnum = pgEnum("screen_format", ["movie", "series", "anime", "documentary"]);
export const travelStageEnum = pgEnum("travel_stage", ["idea", "planning", "booked", "visited"]);

