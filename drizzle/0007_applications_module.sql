ALTER TYPE "public"."project_type" ADD VALUE IF NOT EXISTS 'application';--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."application_stage" AS ENUM('applied', 'viewed', 'interviewing', 'closed', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."application_result" AS ENUM('pending', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "application_details" (
	"project_id" uuid PRIMARY KEY NOT NULL,
	"company" text NOT NULL,
	"role" text NOT NULL,
	"source" text NOT NULL,
	"stage" "application_stage" DEFAULT 'applied' NOT NULL,
	"result" "application_result" DEFAULT 'pending' NOT NULL,
	"applied_at" date NOT NULL,
	"interview_at" timestamp with time zone
);--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "application_details" ADD CONSTRAINT "application_details_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "application_details_applied_at_idx" ON "application_details" USING btree ("applied_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "application_details_interview_at_idx" ON "application_details" USING btree ("interview_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "application_details_stage_result_idx" ON "application_details" USING btree ("stage", "result");--> statement-breakpoint
ALTER TABLE public.application_details ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS application_details_owner_policy ON public.application_details;--> statement-breakpoint
CREATE POLICY application_details_owner_policy ON public.application_details
FOR ALL
TO authenticated
USING (private.owns_project(project_id))
WITH CHECK (private.owns_project(project_id));--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.application_details TO authenticated;--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.current_project_rows_v2()
RETURNS TABLE (
  "id" uuid,
  "type" text,
  "status" text,
  "title" text,
  "slug" text,
  "summary" text,
  "rating" numeric,
  "priority" integer,
  "startedAt" timestamptz,
  "completedAt" timestamptz,
  "createdAt" timestamptz,
  "updatedAt" timestamptz,
  "author" text,
  "pageCount" integer,
  "currentPage" integer,
  "screenFormat" text,
  "director" text,
  "platform" text,
  "releaseYear" integer,
  "country" text,
  "city" text,
  "travelStage" text,
  "startDate" date,
  "endDate" date,
  "company" text,
  "role" text,
  "applicationSource" text,
  "applicationStage" text,
  "applicationResult" text,
  "appliedAt" date,
  "interviewAt" timestamptz,
  "tagNames" text[]
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    project_record.id,
    project_record.type::text,
    project_record.status::text,
    project_record.title,
    project_record.slug,
    project_record.summary,
    project_record.rating,
    project_record.priority,
    project_record.started_at AS "startedAt",
    project_record.completed_at AS "completedAt",
    project_record.created_at AS "createdAt",
    project_record.updated_at AS "updatedAt",
    book_record.author,
    book_record.page_count AS "pageCount",
    book_record.current_page AS "currentPage",
    screen_record.format::text AS "screenFormat",
    screen_record.director,
    screen_record.platform,
    screen_record.release_year AS "releaseYear",
    travel_record.country,
    travel_record.city,
    travel_record.stage::text AS "travelStage",
    travel_record.start_date AS "startDate",
    travel_record.end_date AS "endDate",
    application_record.company,
    application_record.role,
    application_record.source AS "applicationSource",
    application_record.stage::text AS "applicationStage",
    application_record.result::text AS "applicationResult",
    application_record.applied_at AS "appliedAt",
    application_record.interview_at AS "interviewAt",
    COALESCE(
      (
        SELECT array_agg(tag_record.name ORDER BY tag_record.name)
        FROM public.project_tags AS project_tag_record
        INNER JOIN public.tags AS tag_record
          ON tag_record.id = project_tag_record.tag_id
        WHERE project_tag_record.project_id = project_record.id
      ),
      ARRAY[]::text[]
    ) AS "tagNames"
  FROM public.projects AS project_record
  LEFT JOIN public.book_details AS book_record
    ON book_record.project_id = project_record.id
  LEFT JOIN public.screen_details AS screen_record
    ON screen_record.project_id = project_record.id
  LEFT JOIN public.travel_details AS travel_record
    ON travel_record.project_id = project_record.id
  LEFT JOIN public.application_details AS application_record
    ON application_record.project_id = project_record.id
  WHERE project_record.user_id = auth.uid();
$$;--> statement-breakpoint

GRANT EXECUTE ON FUNCTION private.current_project_rows_v2() TO authenticated;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_dashboard_snapshot()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    jsonb_agg(to_jsonb(project_row) ORDER BY project_row."updatedAt" DESC),
    '[]'::jsonb
  )
  FROM private.current_project_rows_v2() AS project_row;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_project_list(kind text)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  WITH filtered_projects AS (
    SELECT *
    FROM private.current_project_rows_v2() AS project_row
    WHERE CASE
      WHEN kind = 'book' THEN project_row."type" = 'book'
      WHEN kind = 'movie' THEN project_row."type" = 'screen' AND COALESCE(project_row."screenFormat", 'movie') = 'movie'
      WHEN kind = 'travel' THEN project_row."type" = 'travel'
      WHEN kind = 'application' THEN project_row."type" = 'application'
      ELSE false
    END
  )
  SELECT COALESCE(
    jsonb_agg(to_jsonb(filtered_projects) ORDER BY filtered_projects."updatedAt" DESC),
    '[]'::jsonb
  )
  FROM filtered_projects;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_project_detail(project_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  WITH selected_project AS (
    SELECT *
    FROM private.current_project_rows_v2()
    WHERE "id" = project_id
    LIMIT 1
  )
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM selected_project) THEN jsonb_build_object(
      'project', (SELECT to_jsonb(selected_project) FROM selected_project),
      'tags', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', tag_record.id,
              'name', tag_record.name,
              'color', tag_record.color
            )
            ORDER BY tag_record.name
          )
          FROM public.project_tags AS project_tag_record
          INNER JOIN public.tags AS tag_record
            ON tag_record.id = project_tag_record.tag_id
          WHERE project_tag_record.project_id = project_id
        ),
        '[]'::jsonb
      ),
      'notes', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', note_record.id,
              'title', note_record.title,
              'body', note_record.body,
              'type', note_record.type,
              'sourceUrl', note_record.source_url,
              'pinned', note_record.pinned,
              'recordedAt', note_record.recorded_at
            )
            ORDER BY note_record.pinned DESC, note_record.sort_order ASC, note_record.recorded_at DESC
          )
          FROM public.project_notes AS note_record
          WHERE note_record.project_id = project_id
        ),
        '[]'::jsonb
      ),
      'photos', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', photo_record.id,
              'publicUrl', photo_record.public_url,
              'storageBucket', photo_record.storage_bucket,
              'storagePath', photo_record.storage_path,
              'caption', photo_record.caption,
              'altText', photo_record.alt_text,
              'kind', photo_record.kind,
              'isPrimary', photo_record.is_primary,
              'createdAt', photo_record.created_at
            )
            ORDER BY photo_record.is_primary DESC, photo_record.sort_order ASC, photo_record.created_at DESC
          )
          FROM public.project_photos AS photo_record
          WHERE photo_record.project_id = project_id
        ),
        '[]'::jsonb
      )
    )
    ELSE NULL
  END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_search_projects(query text, result_limit integer DEFAULT 10)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  WITH normalized_query AS (
    SELECT trim(COALESCE(query, '')) AS value,
           LEAST(GREATEST(COALESCE(result_limit, 10), 1), 50) AS limited_size
  ),
  matched_projects AS (
    SELECT project_row.*
    FROM private.current_project_rows_v2() AS project_row
    CROSS JOIN normalized_query
    WHERE normalized_query.value <> ''
      AND (
        project_row."title" ILIKE ('%' || normalized_query.value || '%')
        OR COALESCE(project_row."summary", '') ILIKE ('%' || normalized_query.value || '%')
        OR COALESCE(project_row."author", '') ILIKE ('%' || normalized_query.value || '%')
        OR COALESCE(project_row."director", '') ILIKE ('%' || normalized_query.value || '%')
        OR COALESCE(project_row."platform", '') ILIKE ('%' || normalized_query.value || '%')
        OR COALESCE(project_row."country", '') ILIKE ('%' || normalized_query.value || '%')
        OR COALESCE(project_row."city", '') ILIKE ('%' || normalized_query.value || '%')
        OR COALESCE(project_row."company", '') ILIKE ('%' || normalized_query.value || '%')
        OR COALESCE(project_row."role", '') ILIKE ('%' || normalized_query.value || '%')
        OR COALESCE(project_row."applicationSource", '') ILIKE ('%' || normalized_query.value || '%')
        OR EXISTS (
          SELECT 1
          FROM unnest(project_row."tagNames") AS tag_name
          WHERE tag_name ILIKE ('%' || normalized_query.value || '%')
        )
      )
      AND NOT (project_row."type" = 'screen' AND COALESCE(project_row."screenFormat", 'movie') <> 'movie')
    ORDER BY project_row."updatedAt" DESC
    LIMIT (SELECT limited_size FROM normalized_query)
  )
  SELECT COALESCE(
    jsonb_agg(to_jsonb(matched_projects) ORDER BY matched_projects."updatedAt" DESC),
    '[]'::jsonb
  )
  FROM matched_projects;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_upsert_application(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id uuid := private.require_user_id();
  target_project_id uuid := NULLIF(payload->>'projectId', '')::uuid;
  project_company text := btrim(COALESCE(payload->>'company', ''));
  project_role text := btrim(COALESCE(payload->>'role', ''));
  project_source text := btrim(COALESCE(payload->>'source', ''));
  project_notes text := NULLIF(btrim(COALESCE(payload->>'notes', '')), '');
  project_stage public.application_stage := COALESCE(NULLIF(payload->>'stage', ''), 'applied')::public.application_stage;
  project_result public.application_result := COALESCE(NULLIF(payload->>'result', ''), 'pending')::public.application_result;
  project_applied_at date := NULLIF(payload->>'appliedAt', '')::date;
  project_interview_at timestamptz := NULLIF(payload->>'interviewAt', '')::timestamptz;
  project_status public.project_status := CASE
    WHEN project_stage = 'interviewing' THEN 'in_progress'::public.project_status
    WHEN project_stage = 'closed' THEN 'completed'::public.project_status
    WHEN project_stage = 'archived' THEN 'paused'::public.project_status
    ELSE 'planned'::public.project_status
  END;
  project_slug text := NULLIF(btrim(COALESCE(payload->>'slug', '')), '');
  project_title text := project_company || ' - ' || project_role;
  project_started_at timestamptz := CASE WHEN project_applied_at IS NULL THEN NULL ELSE project_applied_at::timestamp AT TIME ZONE 'UTC' END;
BEGIN
  IF project_company = '' OR project_role = '' OR project_source = '' OR project_applied_at IS NULL THEN
    RAISE EXCEPTION 'Application company, role, source, and applied date are required';
  END IF;

  IF project_result <> 'pending'::public.application_result
     AND project_stage NOT IN ('closed'::public.application_stage, 'archived'::public.application_stage) THEN
    RAISE EXCEPTION 'Resolved applications must be closed or archived';
  END IF;

  IF project_stage IN ('applied'::public.application_stage, 'viewed'::public.application_stage, 'interviewing'::public.application_stage)
     AND project_result <> 'pending'::public.application_result THEN
    RAISE EXCEPTION 'Open applications must keep result pending';
  END IF;

  IF target_project_id IS NULL THEN
    IF project_slug IS NULL THEN
      RAISE EXCEPTION 'Application slug is required for create';
    END IF;

    INSERT INTO public.projects (user_id, type, status, title, slug, summary, started_at, completed_at)
    VALUES (current_user_id, 'application', project_status, project_title, project_slug, project_notes, project_started_at, NULL)
    RETURNING id INTO target_project_id;

    INSERT INTO public.application_details (project_id, company, role, source, stage, result, applied_at, interview_at)
    VALUES (target_project_id, project_company, project_role, project_source, project_stage, project_result, project_applied_at, project_interview_at);
  ELSE
    UPDATE public.projects
    SET status = project_status,
        title = project_title,
        summary = project_notes,
        started_at = project_started_at,
        completed_at = NULL,
        updated_at = now()
    WHERE id = target_project_id
      AND user_id = current_user_id
      AND type = 'application'
    RETURNING id INTO target_project_id;

    IF target_project_id IS NULL THEN
      RAISE EXCEPTION 'Application project not found';
    END IF;

    UPDATE public.application_details
    SET company = project_company,
        role = project_role,
        source = project_source,
        stage = project_stage,
        result = project_result,
        applied_at = project_applied_at,
        interview_at = project_interview_at
    WHERE project_id = target_project_id;
  END IF;

  RETURN jsonb_build_object('projectId', target_project_id);
END
$$;--> statement-breakpoint

GRANT EXECUTE ON FUNCTION public.app_upsert_application(jsonb) TO authenticated;
