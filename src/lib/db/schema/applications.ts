import { date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { applicationResultEnum, applicationStageEnum } from "@/lib/db/schema/enums";
import { projects } from "@/lib/db/schema/projects";

export const applicationDetails = pgTable("application_details", {
  projectId: uuid("project_id")
    .primaryKey()
    .references(() => projects.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  source: text("source").notNull(),
  stage: applicationStageEnum("stage").notNull().default("applied"),
  result: applicationResultEnum("result").notNull().default("pending"),
  appliedAt: date("applied_at").notNull(),
  interviewAt: timestamp("interview_at", { withTimezone: true })
});
