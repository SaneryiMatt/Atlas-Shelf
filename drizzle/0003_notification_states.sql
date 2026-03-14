CREATE TYPE "public"."notification_status" AS ENUM('active', 'read', 'processed');--> statement-breakpoint
CREATE TABLE "notification_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"notification_key" text NOT NULL,
	"status" "notification_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX "notification_states_user_key_unique" ON "notification_states" USING btree ("user_id", "notification_key");--> statement-breakpoint
CREATE INDEX "notification_states_user_status_idx" ON "notification_states" USING btree ("user_id", "status");--> statement-breakpoint
CREATE INDEX "notification_states_updated_at_idx" ON "notification_states" USING btree ("updated_at");
