CREATE OR REPLACE FUNCTION public.app_project_detail(project_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  WITH selected_project AS (
    SELECT *
    FROM private.current_project_rows_v2()
    WHERE "id" = $1
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
          WHERE project_tag_record.project_id = $1
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
          WHERE note_record.project_id = $1
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
          WHERE photo_record.project_id = $1
        ),
        '[]'::jsonb
      )
    )
    ELSE NULL
  END;
$$;--> statement-breakpoint

GRANT EXECUTE ON FUNCTION public.app_project_detail(uuid) TO authenticated;--> statement-breakpoint
