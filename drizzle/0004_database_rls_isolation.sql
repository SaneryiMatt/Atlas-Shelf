DO $$
DECLARE
  legacy_owner uuid := nullif(current_setting('app.settings.legacy_owner_user_id', true), '')::uuid;
BEGIN
  IF legacy_owner IS NULL THEN
    RAISE EXCEPTION 'LEGACY_OWNER_USER_ID is required to run 0004_database_rls_isolation';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = legacy_owner
  ) THEN
    RAISE EXCEPTION 'LEGACY_OWNER_USER_ID % does not exist in auth.users', legacy_owner;
  END IF;
END
$$;--> statement-breakpoint

CREATE SCHEMA IF NOT EXISTS "private";--> statement-breakpoint

ALTER TABLE "projects" ADD COLUMN "user_id" uuid REFERENCES auth.users(id) ON DELETE cascade;--> statement-breakpoint
UPDATE "projects"
SET "user_id" = nullif(current_setting('app.settings.legacy_owner_user_id', true), '')::uuid
WHERE "user_id" IS NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "projects_user_type_updated_at_idx" ON "projects" USING btree ("user_id", "type", "updated_at");--> statement-breakpoint

ALTER TABLE "tags" ADD COLUMN "user_id" uuid REFERENCES auth.users(id) ON DELETE cascade;--> statement-breakpoint
UPDATE "tags"
SET "user_id" = nullif(current_setting('app.settings.legacy_owner_user_id', true), '')::uuid
WHERE "user_id" IS NULL;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
DROP INDEX IF EXISTS "tags_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "tags_slug_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "tags_user_name_unique" ON "tags" USING btree ("user_id", "name");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_user_slug_unique" ON "tags" USING btree ("user_id", "slug");--> statement-breakpoint
CREATE INDEX "tags_user_id_idx" ON "tags" USING btree ("user_id");--> statement-breakpoint

ALTER TABLE "notification_states" ADD COLUMN "user_id_v2" uuid REFERENCES auth.users(id) ON DELETE cascade;--> statement-breakpoint
UPDATE "notification_states"
SET "user_id_v2" = "user_id"::uuid
WHERE "user_id_v2" IS NULL;--> statement-breakpoint
ALTER TABLE "notification_states" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "notification_states" RENAME COLUMN "user_id_v2" TO "user_id";--> statement-breakpoint
ALTER TABLE "notification_states" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
DROP INDEX IF EXISTS "notification_states_user_key_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "notification_states_user_status_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "notification_states_user_key_unique" ON "notification_states" USING btree ("user_id", "notification_key");--> statement-breakpoint
CREATE INDEX "notification_states_user_status_idx" ON "notification_states" USING btree ("user_id", "status");--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.require_user_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN current_user_id;
END
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.current_media_bucket()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(NULLIF(current_setting('app.settings.media_bucket', true), ''), 'media-assets');
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.owns_project(target_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects AS project_record
    WHERE project_record.id = target_project_id
      AND project_record.user_id = auth.uid()
  );
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.owns_tag(target_tag_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tags AS tag_record
    WHERE tag_record.id = target_tag_id
      AND tag_record.user_id = auth.uid()
  );
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.can_link_project_tag(target_project_id uuid, target_tag_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private, auth
AS $$
  SELECT private.owns_project(target_project_id) AND private.owns_tag(target_tag_id);
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.build_tag_slug(tag_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CONCAT(
    COALESCE(
      NULLIF(
        trim(both '-' from regexp_replace(lower(COALESCE(tag_name, '')), '[^a-z0-9]+', '-', 'g')),
        ''
      ),
      'tag'
    ),
    '-',
    substring(md5(COALESCE(tag_name, '')) from 1 for 6)
  );
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.sync_managed_note(target_project_id uuid, managed_title text, managed_type public.note_type, managed_body text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  cleaned_body text := NULLIF(btrim(managed_body), '');
  existing_note_id uuid;
  current_timestamp timestamptz := now();
BEGIN
  SELECT note_record.id
  INTO existing_note_id
  FROM public.project_notes AS note_record
  WHERE note_record.project_id = target_project_id
    AND note_record.title = managed_title
  LIMIT 1;

  IF cleaned_body IS NULL THEN
    IF existing_note_id IS NOT NULL THEN
      DELETE FROM public.project_notes
      WHERE id = existing_note_id;
    END IF;

    RETURN;
  END IF;

  IF existing_note_id IS NOT NULL THEN
    UPDATE public.project_notes
    SET type = managed_type,
        body = cleaned_body,
        recorded_at = current_timestamp,
        updated_at = current_timestamp
    WHERE id = existing_note_id;

    RETURN;
  END IF;

  INSERT INTO public.project_notes (
    project_id,
    title,
    type,
    body,
    recorded_at,
    updated_at
  ) VALUES (
    target_project_id,
    managed_title,
    managed_type,
    cleaned_body,
    current_timestamp,
    current_timestamp
  );
END
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.sync_project_tags(target_project_id uuid, raw_tag_names text[])
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id uuid := private.require_user_id();
  normalized_tag_names text[];
BEGIN
  normalized_tag_names := ARRAY(
    SELECT DISTINCT cleaned_tag_name
    FROM (
      SELECT NULLIF(btrim(tag_name), '') AS cleaned_tag_name
      FROM unnest(COALESCE(raw_tag_names, ARRAY[]::text[])) AS tag_name
    ) AS cleaned_tags
    WHERE cleaned_tag_name IS NOT NULL
    ORDER BY cleaned_tag_name
  );

  IF COALESCE(array_length(normalized_tag_names, 1), 0) = 0 THEN
    DELETE FROM public.project_tags
    WHERE project_id = target_project_id;

    RETURN;
  END IF;

  INSERT INTO public.tags (
    user_id,
    name,
    slug
  )
  SELECT current_user_id, tag_name, private.build_tag_slug(tag_name)
  FROM unnest(normalized_tag_names) AS tag_name
  ON CONFLICT (user_id, name) DO NOTHING;

  DELETE FROM public.project_tags
  WHERE project_id = target_project_id
    AND tag_id NOT IN (
      SELECT tag_record.id
      FROM public.tags AS tag_record
      WHERE tag_record.user_id = current_user_id
        AND tag_record.name = ANY(normalized_tag_names)
    );

  INSERT INTO public.project_tags (
    project_id,
    tag_id
  )
  SELECT target_project_id, tag_record.id
  FROM public.tags AS tag_record
  WHERE tag_record.user_id = current_user_id
    AND tag_record.name = ANY(normalized_tag_names)
  ON CONFLICT (project_id, tag_id) DO NOTHING;
END
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.current_project_rows()
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
  WHERE project_record.user_id = auth.uid();
$$;--> statement-breakpoint
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE public.book_details ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE public.screen_details ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE public.travel_details ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE public.notification_states ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

DROP POLICY IF EXISTS projects_owner_policy ON public.projects;--> statement-breakpoint
CREATE POLICY projects_owner_policy ON public.projects
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());--> statement-breakpoint

DROP POLICY IF EXISTS tags_owner_policy ON public.tags;--> statement-breakpoint
CREATE POLICY tags_owner_policy ON public.tags
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());--> statement-breakpoint

DROP POLICY IF EXISTS book_details_owner_policy ON public.book_details;--> statement-breakpoint
CREATE POLICY book_details_owner_policy ON public.book_details
FOR ALL
TO authenticated
USING (private.owns_project(project_id))
WITH CHECK (private.owns_project(project_id));--> statement-breakpoint

DROP POLICY IF EXISTS screen_details_owner_policy ON public.screen_details;--> statement-breakpoint
CREATE POLICY screen_details_owner_policy ON public.screen_details
FOR ALL
TO authenticated
USING (private.owns_project(project_id))
WITH CHECK (private.owns_project(project_id));--> statement-breakpoint

DROP POLICY IF EXISTS travel_details_owner_policy ON public.travel_details;--> statement-breakpoint
CREATE POLICY travel_details_owner_policy ON public.travel_details
FOR ALL
TO authenticated
USING (private.owns_project(project_id))
WITH CHECK (private.owns_project(project_id));--> statement-breakpoint

DROP POLICY IF EXISTS project_notes_owner_policy ON public.project_notes;--> statement-breakpoint
CREATE POLICY project_notes_owner_policy ON public.project_notes
FOR ALL
TO authenticated
USING (private.owns_project(project_id))
WITH CHECK (private.owns_project(project_id));--> statement-breakpoint

DROP POLICY IF EXISTS project_photos_owner_policy ON public.project_photos;--> statement-breakpoint
CREATE POLICY project_photos_owner_policy ON public.project_photos
FOR ALL
TO authenticated
USING (private.owns_project(project_id))
WITH CHECK (private.owns_project(project_id));--> statement-breakpoint

DROP POLICY IF EXISTS project_tags_owner_policy ON public.project_tags;--> statement-breakpoint
CREATE POLICY project_tags_owner_policy ON public.project_tags
FOR ALL
TO authenticated
USING (private.owns_project(project_id) AND private.owns_tag(tag_id))
WITH CHECK (private.can_link_project_tag(project_id, tag_id));--> statement-breakpoint

DROP POLICY IF EXISTS notification_states_owner_policy ON public.notification_states;--> statement-breakpoint
CREATE POLICY notification_states_owner_policy ON public.notification_states
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());--> statement-breakpoint

INSERT INTO storage.buckets (id, name, public)
VALUES (private.current_media_bucket(), private.current_media_bucket(), false)
ON CONFLICT (id) DO UPDATE
SET public = false;--> statement-breakpoint

DROP POLICY IF EXISTS media_assets_select_policy ON storage.objects;--> statement-breakpoint
CREATE POLICY media_assets_select_policy ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = private.current_media_bucket()
  AND split_part(name, '/', 1) = auth.uid()::text
);--> statement-breakpoint

DROP POLICY IF EXISTS media_assets_insert_policy ON storage.objects;--> statement-breakpoint
CREATE POLICY media_assets_insert_policy ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = private.current_media_bucket()
  AND split_part(name, '/', 1) = auth.uid()::text
);--> statement-breakpoint

DROP POLICY IF EXISTS media_assets_update_policy ON storage.objects;--> statement-breakpoint
CREATE POLICY media_assets_update_policy ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = private.current_media_bucket()
  AND split_part(name, '/', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id = private.current_media_bucket()
  AND split_part(name, '/', 1) = auth.uid()::text
);--> statement-breakpoint

DROP POLICY IF EXISTS media_assets_delete_policy ON storage.objects;--> statement-breakpoint
CREATE POLICY media_assets_delete_policy ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = private.current_media_bucket()
  AND split_part(name, '/', 1) = auth.uid()::text
);--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_dashboard_snapshot()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    jsonb_agg(to_jsonb(project_row) ORDER BY project_row."updatedAt" DESC),
    '[]'::jsonb
  )
  FROM private.current_project_rows() AS project_row;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_project_list(kind text)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  WITH filtered_projects AS (
    SELECT *
    FROM private.current_project_rows() AS project_row
    WHERE CASE
      WHEN kind = 'book' THEN project_row."type" = 'book'
      WHEN kind = 'movie' THEN project_row."type" = 'screen' AND COALESCE(project_row."screenFormat", 'movie') = 'movie'
      WHEN kind = 'travel' THEN project_row."type" = 'travel'
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
    FROM private.current_project_rows()
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
    FROM private.current_project_rows() AS project_row
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
CREATE OR REPLACE FUNCTION public.app_notification_feed()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  WITH stale_project_notifications AS (
    SELECT
      CASE WHEN project_row."type" = 'book' THEN 'book' ELSE 'screen' END || '-stale:' || project_row."id" || ':' || to_char(project_row."updatedAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS key,
      CASE WHEN project_row."type" = 'book' THEN 'book_stale' ELSE 'screen_stale' END AS kind,
      project_row."type" AS "sourceType",
      project_row."title" AS title,
      CASE
        WHEN project_row."status" = 'in_progress' THEN '该条目已超过 14 天未更新，建议补一条最新进度或想法。'
        ELSE '该条目已超过 14 天未推进，建议确认优先级或更新状态。'
      END AS description,
      CASE WHEN project_row."type" = 'book' THEN '/books/' ELSE '/movies/' END || project_row."id" AS href,
      CASE WHEN project_row."type" = 'book' THEN '书籍 · ' ELSE '影视 · ' END || CASE project_row."status"
        WHEN 'planned' THEN '计划中'
        WHEN 'in_progress' THEN '进行中'
        ELSE project_row."status"
      END AS meta,
      '上次更新 ' || to_char(project_row."updatedAt", 'MM"月"DD"日"') AS "triggeredAtLabel",
      CASE
        WHEN project_row."type" = 'book' AND project_row."status" = 'in_progress' THEN 2
        WHEN project_row."type" = 'screen' AND project_row."status" = 'in_progress' THEN 3
        WHEN project_row."type" = 'book' THEN 4
        ELSE 5
      END AS sort_category,
      EXTRACT(EPOCH FROM project_row."updatedAt") * 1000 AS sort_value
    FROM private.current_project_rows() AS project_row
    WHERE project_row."type" IN ('book', 'screen')
      AND (project_row."type" <> 'screen' OR COALESCE(project_row."screenFormat", 'movie') = 'movie')
      AND project_row."status" IN ('planned', 'in_progress')
      AND project_row."updatedAt" <= date_trunc('day', now()) - interval '14 days'
  ),
  travel_notifications AS (
    SELECT
      'travel-upcoming:' || project_row."id" || ':' || to_char(project_row."startDate", 'YYYY-MM-DD') AS key,
      'travel_upcoming' AS kind,
      'travel' AS "sourceType",
      project_row."title" AS title,
      CASE
        WHEN project_row."startDate" <= current_date + 1 THEN '行程已临近，建议确认交通、住宿和证件信息。'
        ELSE '旅行日期临近，建议检查预算、路线和待办清单。'
      END AS description,
      '/travels/' || project_row."id" AS href,
      '旅行 · ' || CASE project_row."travelStage"
        WHEN 'planning' THEN '规划中'
        WHEN 'booked' THEN '已预订'
        ELSE project_row."travelStage"
      END AS meta,
      '出发日期 ' || to_char(project_row."startDate", 'MM"月"DD"日"') AS "triggeredAtLabel",
      CASE WHEN project_row."startDate" <= current_date + 3 THEN 0 ELSE 1 END AS sort_category,
      EXTRACT(EPOCH FROM project_row."startDate"::timestamp) * 1000 AS sort_value
    FROM private.current_project_rows() AS project_row
    WHERE project_row."type" = 'travel'
      AND project_row."travelStage" IN ('planning', 'booked')
      AND project_row."startDate" IS NOT NULL
      AND project_row."startDate" >= current_date
      AND project_row."startDate" <= current_date + 14
  ),
  derived_notifications AS (
    SELECT * FROM travel_notifications
    UNION ALL
    SELECT * FROM stale_project_notifications
  ),
  resolved_notifications AS (
    SELECT
      derived_notifications.*,
      COALESCE(notification_state.status::text, 'active') AS status
    FROM derived_notifications
    LEFT JOIN public.notification_states AS notification_state
      ON notification_state.user_id = auth.uid()
     AND notification_state.notification_key = derived_notifications.key
  ),
  limited_notifications AS (
    SELECT *
    FROM resolved_notifications
    ORDER BY CASE status
      WHEN 'active' THEN 0
      WHEN 'read' THEN 1
      ELSE 2
    END, sort_category, sort_value
    LIMIT 6
  )
  SELECT jsonb_build_object(
    'unreadCount', COALESCE((SELECT count(*) FROM resolved_notifications WHERE status = 'active'), 0),
    'canManage', true,
    'items', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'key', notification_record.key,
            'kind', notification_record.kind,
            'sourceType', notification_record."sourceType",
            'title', notification_record.title,
            'description', notification_record.description,
            'href', notification_record.href,
            'meta', notification_record.meta,
            'status', notification_record.status,
            'statusLabel', CASE notification_record.status
              WHEN 'active' THEN '提醒中'
              WHEN 'read' THEN '已读'
              ELSE '已处理'
            END,
            'triggeredAtLabel', notification_record."triggeredAtLabel"
          )
          ORDER BY CASE notification_record.status
            WHEN 'active' THEN 0
            WHEN 'read' THEN 1
            ELSE 2
          END, notification_record.sort_category, notification_record.sort_value
        )
        FROM limited_notifications AS notification_record
      ),
      '[]'::jsonb
    )
  );
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_settings_snapshot()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  WITH current_projects AS (
    SELECT *
    FROM private.current_project_rows()
  ),
  preview_projects AS (
    SELECT "id", "title", "type", "status", "updatedAt"
    FROM current_projects
    ORDER BY "updatedAt" DESC
    LIMIT 6
  ),
  preview_notes AS (
    SELECT note_record.id,
           project_record."title" AS "projectTitle",
           note_record.type AS "noteType",
           COALESCE(note_record.title, left(note_record.body, 48)) AS "noteTitle",
           note_record.recorded_at AS "recordedAt"
    FROM public.project_notes AS note_record
    INNER JOIN current_projects AS project_record
      ON project_record."id" = note_record.project_id
    ORDER BY note_record.recorded_at DESC
    LIMIT 6
  ),
  preview_tags AS (
    SELECT tag_record.id,
           tag_record.name,
           count(project_tag_record.tag_id) AS "usageCount"
    FROM public.tags AS tag_record
    LEFT JOIN public.project_tags AS project_tag_record
      ON project_tag_record.tag_id = tag_record.id
    WHERE tag_record.user_id = auth.uid()
    GROUP BY tag_record.id, tag_record.name
    ORDER BY count(project_tag_record.tag_id) DESC, tag_record.name ASC
    LIMIT 8
  )
  SELECT jsonb_build_object(
    'status', 'live',
    'message', '已通过 RLS RPC 读取当前账号的数据。',
    'projects', COALESCE((SELECT jsonb_agg(to_jsonb(project_record) ORDER BY project_record."updatedAt" DESC) FROM preview_projects AS project_record), '[]'::jsonb),
    'notes', COALESCE((SELECT jsonb_agg(to_jsonb(note_record) ORDER BY note_record."recordedAt" DESC) FROM preview_notes AS note_record), '[]'::jsonb),
    'tags', COALESCE((SELECT jsonb_agg(to_jsonb(tag_record) ORDER BY tag_record."usageCount" DESC, tag_record.name ASC) FROM preview_tags AS tag_record), '[]'::jsonb)
  );
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_upsert_book(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id uuid := private.require_user_id();
  target_project_id uuid := NULLIF(payload->>'projectId', '')::uuid;
  project_title text := btrim(COALESCE(payload->>'title', ''));
  book_author text := btrim(COALESCE(payload->>'author', ''));
  project_status public.project_status := COALESCE(NULLIF(payload->>'status', ''), 'planned')::public.project_status;
  project_rating numeric := NULLIF(payload->>'rating', '')::numeric;
  project_started_at timestamptz := CASE WHEN NULLIF(payload->>'startedAt', '') IS NULL THEN NULL ELSE (payload->>'startedAt')::date::timestamp AT TIME ZONE 'UTC' END;
  project_completed_at timestamptz := CASE WHEN NULLIF(payload->>'completedAt', '') IS NULL THEN NULL ELSE (payload->>'completedAt')::date::timestamp AT TIME ZONE 'UTC' END;
  project_summary text := NULLIF(btrim(COALESCE(payload->>'summary', '')), '');
  project_slug text := NULLIF(btrim(COALESCE(payload->>'slug', '')), '');
  project_tags text[] := ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'tags', '[]'::jsonb)));
BEGIN
  IF project_title = '' OR book_author = '' THEN
    RAISE EXCEPTION 'Book title and author are required';
  END IF;

  IF target_project_id IS NULL THEN
    IF project_slug IS NULL THEN
      RAISE EXCEPTION 'Book slug is required for create';
    END IF;

    INSERT INTO public.projects (user_id, type, status, title, slug, summary, rating, started_at, completed_at)
    VALUES (current_user_id, 'book', project_status, project_title, project_slug, project_summary, project_rating, project_started_at, project_completed_at)
    RETURNING id INTO target_project_id;

    INSERT INTO public.book_details (project_id, author)
    VALUES (target_project_id, book_author);
  ELSE
    UPDATE public.projects
    SET status = project_status,
        title = project_title,
        summary = project_summary,
        rating = project_rating,
        started_at = project_started_at,
        completed_at = project_completed_at,
        updated_at = now()
    WHERE id = target_project_id
      AND user_id = current_user_id
      AND type = 'book'
    RETURNING id INTO target_project_id;

    IF target_project_id IS NULL THEN
      RAISE EXCEPTION 'Book project not found';
    END IF;

    UPDATE public.book_details
    SET author = book_author
    WHERE project_id = target_project_id;
  END IF;

  PERFORM private.sync_managed_note(target_project_id, '创建时备注', 'general', project_summary);
  PERFORM private.sync_project_tags(target_project_id, project_tags);

  RETURN jsonb_build_object('projectId', target_project_id);
END
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_upsert_movie(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id uuid := private.require_user_id();
  target_project_id uuid := NULLIF(payload->>'projectId', '')::uuid;
  project_title text := btrim(COALESCE(payload->>'title', ''));
  movie_director text := btrim(COALESCE(payload->>'director', ''));
  movie_platform text := NULLIF(btrim(COALESCE(payload->>'platform', '')), '');
  movie_release_year integer := NULLIF(payload->>'releaseYear', '')::integer;
  project_status public.project_status := COALESCE(NULLIF(payload->>'status', ''), 'planned')::public.project_status;
  project_rating numeric := NULLIF(payload->>'rating', '')::numeric;
  project_summary text := NULLIF(btrim(COALESCE(payload->>'note', '')), '');
  project_slug text := NULLIF(btrim(COALESCE(payload->>'slug', '')), '');
  project_tags text[] := ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'tags', '[]'::jsonb)));
BEGIN
  IF project_title = '' OR movie_director = '' THEN
    RAISE EXCEPTION 'Movie title and director are required';
  END IF;

  IF target_project_id IS NULL THEN
    IF project_slug IS NULL THEN
      RAISE EXCEPTION 'Movie slug is required for create';
    END IF;

    INSERT INTO public.projects (user_id, type, status, title, slug, summary, rating)
    VALUES (current_user_id, 'screen', project_status, project_title, project_slug, project_summary, project_rating)
    RETURNING id INTO target_project_id;

    INSERT INTO public.screen_details (project_id, format, director, release_year, platform)
    VALUES (target_project_id, 'movie', movie_director, movie_release_year, movie_platform);
  ELSE
    UPDATE public.projects
    SET status = project_status,
        title = project_title,
        summary = project_summary,
        rating = project_rating,
        updated_at = now()
    WHERE id = target_project_id
      AND user_id = current_user_id
      AND type = 'screen'
    RETURNING id INTO target_project_id;

    IF target_project_id IS NULL THEN
      RAISE EXCEPTION 'Movie project not found';
    END IF;

    UPDATE public.screen_details
    SET director = movie_director,
        release_year = movie_release_year,
        platform = movie_platform
    WHERE project_id = target_project_id
      AND format = 'movie';
  END IF;

  PERFORM private.sync_managed_note(target_project_id, '创建时备注', 'general', project_summary);
  PERFORM private.sync_project_tags(target_project_id, project_tags);

  RETURN jsonb_build_object('projectId', target_project_id);
END
$$;--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.app_upsert_travel(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id uuid := private.require_user_id();
  target_project_id uuid := NULLIF(payload->>'projectId', '')::uuid;
  project_title text := btrim(COALESCE(payload->>'placeName', ''));
  travel_country text := btrim(COALESCE(payload->>'country', ''));
  travel_city text := NULLIF(btrim(COALESCE(payload->>'city', '')), '');
  travel_description text := NULLIF(btrim(COALESCE(payload->>'description', '')), '');
  travel_date date := NULLIF(payload->>'travelDate', '')::date;
  travel_status text := COALESCE(NULLIF(payload->>'status', ''), 'planned');
  travel_stage public.travel_stage := CASE
    WHEN travel_status = 'completed' THEN 'visited'::public.travel_stage
    WHEN travel_status = 'in_progress' THEN 'booked'::public.travel_stage
    ELSE 'planning'::public.travel_stage
  END;
  project_status public.project_status := CASE
    WHEN travel_stage = 'visited' THEN 'completed'::public.project_status
    WHEN travel_stage = 'booked' THEN 'in_progress'::public.project_status
    ELSE 'planned'::public.project_status
  END;
  project_started_at timestamptz := CASE WHEN travel_date IS NULL THEN NULL ELSE travel_date::timestamp AT TIME ZONE 'UTC' END;
  project_slug text := NULLIF(btrim(COALESCE(payload->>'slug', '')), '');
BEGIN
  IF project_title = '' OR travel_country = '' OR travel_date IS NULL THEN
    RAISE EXCEPTION 'Travel title, country, and date are required';
  END IF;

  IF target_project_id IS NULL THEN
    IF project_slug IS NULL THEN
      RAISE EXCEPTION 'Travel slug is required for create';
    END IF;

    INSERT INTO public.projects (user_id, type, status, title, slug, summary, started_at, completed_at)
    VALUES (current_user_id, 'travel', project_status, project_title, project_slug, travel_description, project_started_at, CASE WHEN travel_stage = 'visited' THEN project_started_at ELSE NULL END)
    RETURNING id INTO target_project_id;

    INSERT INTO public.travel_details (project_id, city, country, stage, start_date, end_date, highlights)
    VALUES (target_project_id, travel_city, travel_country, travel_stage, travel_date, travel_date, '[]'::jsonb);
  ELSE
    UPDATE public.projects
    SET status = project_status,
        title = project_title,
        summary = travel_description,
        started_at = project_started_at,
        completed_at = CASE WHEN travel_stage = 'visited' THEN project_started_at ELSE NULL END,
        updated_at = now()
    WHERE id = target_project_id
      AND user_id = current_user_id
      AND type = 'travel'
    RETURNING id INTO target_project_id;

    IF target_project_id IS NULL THEN
      RAISE EXCEPTION 'Travel project not found';
    END IF;

    UPDATE public.travel_details
    SET city = travel_city,
        country = travel_country,
        stage = travel_stage,
        start_date = travel_date,
        end_date = travel_date
    WHERE project_id = target_project_id;
  END IF;

  PERFORM private.sync_managed_note(
    target_project_id,
    '创建时描述',
    CASE WHEN travel_stage = 'visited' THEN 'memory'::public.note_type ELSE 'planning'::public.note_type END,
    travel_description
  );

  RETURN jsonb_build_object('projectId', target_project_id);
END
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_delete_project(project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id uuid := private.require_user_id();
  deleted_project_id uuid;
BEGIN
  DELETE FROM public.projects
  WHERE id = project_id
    AND user_id = current_user_id
  RETURNING id INTO deleted_project_id;

  IF deleted_project_id IS NULL THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  RETURN jsonb_build_object('projectId', deleted_project_id);
END
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_add_note(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id uuid := private.require_user_id();
  target_project_id uuid := NULLIF(payload->>'projectId', '')::uuid;
  created_note_id uuid;
BEGIN
  IF target_project_id IS NULL THEN
    RAISE EXCEPTION 'projectId is required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.projects AS project_record
    WHERE project_record.id = target_project_id
      AND project_record.user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  INSERT INTO public.project_notes (
    project_id,
    title,
    type,
    body,
    source_url,
    pinned,
    updated_at
  ) VALUES (
    target_project_id,
    NULLIF(btrim(COALESCE(payload->>'title', '')), ''),
    COALESCE(NULLIF(payload->>'type', ''), 'general')::public.note_type,
    btrim(COALESCE(payload->>'body', '')),
    NULLIF(btrim(COALESCE(payload->>'sourceUrl', '')), ''),
    COALESCE((payload->>'pinned')::boolean, false),
    now()
  )
  RETURNING id INTO created_note_id;

  UPDATE public.projects SET updated_at = now() WHERE id = target_project_id;

  RETURN jsonb_build_object('noteId', created_note_id, 'projectId', target_project_id);
END
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_delete_note(note_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id uuid := private.require_user_id();
  deleted_project_id uuid;
BEGIN
  DELETE FROM public.project_notes AS note_record
  USING public.projects AS project_record
  WHERE note_record.id = note_id
    AND project_record.id = note_record.project_id
    AND project_record.user_id = current_user_id
  RETURNING note_record.project_id INTO deleted_project_id;

  IF deleted_project_id IS NULL THEN
    RAISE EXCEPTION 'Note not found';
  END IF;

  UPDATE public.projects SET updated_at = now() WHERE id = deleted_project_id;

  RETURN jsonb_build_object('projectId', deleted_project_id, 'noteId', note_id);
END
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_set_notification_status(notification_key text, status public.notification_status)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id uuid := private.require_user_id();
BEGIN
  IF NULLIF(btrim(notification_key), '') IS NULL THEN
    RAISE EXCEPTION 'notification_key is required';
  END IF;

  INSERT INTO public.notification_states (user_id, notification_key, status, updated_at)
  VALUES (current_user_id, btrim(notification_key), status, now())
  ON CONFLICT (user_id, notification_key) DO UPDATE
  SET status = EXCLUDED.status,
      updated_at = now();

  RETURN jsonb_build_object('notificationKey', btrim(notification_key), 'status', status::text);
END
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_create_photo_record(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id uuid := private.require_user_id();
  target_project_id uuid := NULLIF(payload->>'projectId', '')::uuid;
  target_project_type public.project_type;
  next_sort_order integer;
  created_photo_id uuid;
BEGIN
  IF target_project_id IS NULL THEN
    RAISE EXCEPTION 'projectId is required';
  END IF;

  SELECT project_record.type
  INTO target_project_type
  FROM public.projects AS project_record
  WHERE project_record.id = target_project_id
    AND project_record.user_id = current_user_id;

  IF target_project_type IS NULL THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  SELECT COALESCE(MAX(photo_record.sort_order), -1) + 1
  INTO next_sort_order
  FROM public.project_photos AS photo_record
  WHERE photo_record.project_id = target_project_id;

  INSERT INTO public.project_photos (
    project_id,
    kind,
    storage_bucket,
    storage_path,
    public_url,
    mime_type,
    sort_order,
    is_primary
  ) VALUES (
    target_project_id,
    'gallery',
    COALESCE(NULLIF(payload->>'storageBucket', ''), private.current_media_bucket()),
    btrim(COALESCE(payload->>'storagePath', '')),
    NULLIF(btrim(COALESCE(payload->>'publicUrl', '')), ''),
    NULLIF(btrim(COALESCE(payload->>'contentType', '')), ''),
    next_sort_order,
    false
  )
  RETURNING id INTO created_photo_id;

  UPDATE public.projects SET updated_at = now() WHERE id = target_project_id;

  RETURN jsonb_build_object(
    'photoId', created_photo_id,
    'projectId', target_project_id,
    'projectType', target_project_type::text
  );
END
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.app_delete_photo(photo_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id uuid := private.require_user_id();
  deleted_project_id uuid;
  deleted_project_type public.project_type;
  deleted_storage_bucket text;
  deleted_storage_path text;
BEGIN
  DELETE FROM public.project_photos AS photo_record
  USING public.projects AS project_record
  WHERE photo_record.id = photo_id
    AND project_record.id = photo_record.project_id
    AND project_record.user_id = current_user_id
  RETURNING photo_record.project_id, project_record.type, photo_record.storage_bucket, photo_record.storage_path
  INTO deleted_project_id, deleted_project_type, deleted_storage_bucket, deleted_storage_path;

  IF deleted_project_id IS NULL THEN
    RAISE EXCEPTION 'Photo not found';
  END IF;

  UPDATE public.projects SET updated_at = now() WHERE id = deleted_project_id;

  RETURN jsonb_build_object(
    'photoId', photo_id,
    'projectId', deleted_project_id,
    'projectType', deleted_project_type::text,
    'storageBucket', deleted_storage_bucket,
    'storagePath', deleted_storage_path
  );
END
$$;--> statement-breakpoint

GRANT EXECUTE ON FUNCTION public.app_dashboard_snapshot() TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.app_project_list(text) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.app_project_detail(uuid) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.app_search_projects(text, integer) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.app_notification_feed() TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.app_settings_snapshot() TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.app_upsert_book(jsonb) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.app_upsert_movie(jsonb) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.app_upsert_travel(jsonb) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.app_delete_project(uuid) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.app_add_note(jsonb) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.app_delete_note(uuid) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.app_set_notification_status(text, public.notification_status) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.app_create_photo_record(jsonb) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.app_delete_photo(uuid) TO authenticated;