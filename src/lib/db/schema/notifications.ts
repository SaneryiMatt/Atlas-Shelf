import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { authUsers } from "@/lib/db/schema/auth";
import { notificationStatusEnum } from "@/lib/db/schema/enums";

export const notificationStates = pgTable(
  "notification_states",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    notificationKey: text("notification_key").notNull(),
    status: notificationStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("notification_states_user_key_unique").on(table.userId, table.notificationKey),
    index("notification_states_user_status_idx").on(table.userId, table.status),
    index("notification_states_updated_at_idx").on(table.updatedAt)
  ]
);