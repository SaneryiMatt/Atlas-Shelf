ALTER TYPE "public"."item_status" RENAME TO "project_status";--> statement-breakpoint
ALTER TYPE "public"."item_type" RENAME TO "project_type";--> statement-breakpoint
CREATE TYPE "public"."note_type" AS ENUM('general', 'progress', 'quote', 'review', 'planning', 'memory');--> statement-breakpoint
CREATE TYPE "public"."photo_kind" AS ENUM('cover', 'gallery', 'reference');--> statement-breakpoint
ALTER TABLE "items" RENAME TO "projects";--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "book_details" ADD COLUMN "subtitle" text;--> statement-breakpoint
ALTER TABLE "book_details" ADD COLUMN "current_page" integer;--> statement-breakpoint
ALTER TABLE "book_details" ADD COLUMN "edition" text;--> statement-breakpoint
ALTER TABLE "screen_details" ADD COLUMN "creator" text;--> statement-breakpoint
ALTER TABLE "travel_details" ADD COLUMN "latitude" numeric(9, 6);--> statement-breakpoint
ALTER TABLE "travel_details" ADD COLUMN "longitude" numeric(9, 6);--> statement-breakpoint
ALTER TABLE "book_details" DROP CONSTRAINT "book_details_item_id_items_id_fk";--> statement-breakpoint
ALTER TABLE "screen_details" DROP CONSTRAINT "screen_details_item_id_items_id_fk";--> statement-breakpoint
ALTER TABLE "travel_details" DROP CONSTRAINT "travel_details_item_id_items_id_fk";--> statement-breakpoint
ALTER TABLE "book_details" RENAME COLUMN "item_id" TO "project_id";--> statement-breakpoint
ALTER TABLE "screen_details" RENAME COLUMN "item_id" TO "project_id";--> statement-breakpoint
ALTER TABLE "travel_details" RENAME COLUMN "item_id" TO "project_id";--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"color" text DEFAULT 'stone' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "project_tags" (
	"project_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_tags_project_id_tag_id_pk" PRIMARY KEY("project_id","tag_id")
);--> statement-breakpoint
CREATE TABLE "project_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"type" "note_type" DEFAULT 'general' NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"source_url" text,
	"pinned" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "project_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"kind" "photo_kind" DEFAULT 'gallery' NOT NULL,
	"storage_bucket" text NOT NULL,
	"storage_path" text NOT NULL,
	"public_url" text,
	"caption" text,
	"alt_text" text,
	"mime_type" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"taken_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
INSERT INTO "tags" ("id", "name", "slug", "color", "created_at")
SELECT
	gen_random_uuid(),
	"tag_name",
	trim(both '-' from lower(regexp_replace("tag_name", '[^a-zA-Z0-9]+', '-', 'g'))) || '-' || substr(md5("tag_name"), 1, 6),
	'stone',
	now()
FROM (
	SELECT DISTINCT jsonb_array_elements_text("tags") AS "tag_name"
	FROM "projects"
	WHERE jsonb_typeof("tags") = 'array'
	  AND jsonb_array_length("tags") > 0
) AS "project_tag_names";--> statement-breakpoint
INSERT INTO "project_tags" ("project_id", "tag_id", "created_at")
SELECT
	"projects"."id",
	"tags"."id",
	now()
FROM "projects"
CROSS JOIN LATERAL jsonb_array_elements_text("projects"."tags") AS "project_tag"("name")
JOIN "tags" ON "tags"."name" = "project_tag"."name";--> statement-breakpoint
INSERT INTO "project_photos" (
	"id",
	"project_id",
	"kind",
	"storage_bucket",
	"storage_path",
	"public_url",
	"alt_text",
	"sort_order",
	"is_primary",
	"created_at"
)
SELECT
	gen_random_uuid(),
	"id",
	'cover',
	'legacy-import',
	"cover_image_url",
	"cover_image_url",
	"title",
	0,
	true,
	"created_at"
FROM "projects"
WHERE "cover_image_url" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "items_slug_unique";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "cover_image_url";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "tags";--> statement-breakpoint
ALTER TABLE "book_details" ADD CONSTRAINT "book_details_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screen_details" ADD CONSTRAINT "screen_details_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_details" ADD CONSTRAINT "travel_details_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_notes" ADD CONSTRAINT "project_notes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_photos" ADD CONSTRAINT "project_photos_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_unique" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "projects_type_status_idx" ON "projects" USING btree ("type", "status");--> statement-breakpoint
CREATE INDEX "projects_started_at_idx" ON "projects" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "projects_completed_at_idx" ON "projects" USING btree ("completed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_unique" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_unique" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tags_color_idx" ON "tags" USING btree ("color");--> statement-breakpoint
CREATE INDEX "project_tags_tag_id_idx" ON "project_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "project_notes_project_id_idx" ON "project_notes" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_notes_project_id_recorded_at_idx" ON "project_notes" USING btree ("project_id", "recorded_at");--> statement-breakpoint
CREATE INDEX "project_photos_project_id_idx" ON "project_photos" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_photos_project_id_sort_order_idx" ON "project_photos" USING btree ("project_id", "sort_order");
