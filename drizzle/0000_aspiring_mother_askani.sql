CREATE TYPE "public"."item_status" AS ENUM('wishlist', 'planned', 'in_progress', 'completed', 'paused');--> statement-breakpoint
CREATE TYPE "public"."item_type" AS ENUM('book', 'screen', 'travel');--> statement-breakpoint
CREATE TYPE "public"."screen_format" AS ENUM('movie', 'series', 'anime', 'documentary');--> statement-breakpoint
CREATE TYPE "public"."travel_stage" AS ENUM('idea', 'planning', 'booked', 'visited');--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "item_type" NOT NULL,
	"status" "item_status" DEFAULT 'wishlist' NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text,
	"cover_image_url" text,
	"rating" numeric(3, 1),
	"priority" integer DEFAULT 3 NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "book_details" (
	"item_id" uuid PRIMARY KEY NOT NULL,
	"author" text NOT NULL,
	"page_count" integer,
	"isbn" text,
	"publisher" text,
	"published_on" date,
	"language" text,
	"format" text
);
--> statement-breakpoint
CREATE TABLE "screen_details" (
	"item_id" uuid PRIMARY KEY NOT NULL,
	"format" "screen_format" NOT NULL,
	"director" text,
	"studio" text,
	"release_year" integer,
	"runtime_minutes" integer,
	"episode_count" integer,
	"season_count" integer,
	"platform" text
);
--> statement-breakpoint
CREATE TABLE "travel_details" (
	"item_id" uuid PRIMARY KEY NOT NULL,
	"city" text,
	"region" text,
	"country" text NOT NULL,
	"stage" "travel_stage" DEFAULT 'idea' NOT NULL,
	"start_date" date,
	"end_date" date,
	"estimated_budget" numeric(10, 2),
	"travel_style" text,
	"highlights" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book_details" ADD CONSTRAINT "book_details_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screen_details" ADD CONSTRAINT "screen_details_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_details" ADD CONSTRAINT "travel_details_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;