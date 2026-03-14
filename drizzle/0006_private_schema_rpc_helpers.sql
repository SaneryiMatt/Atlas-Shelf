GRANT USAGE ON SCHEMA private TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION private.require_user_id() TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION private.current_media_bucket() TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION private.owns_project(uuid) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION private.owns_tag(uuid) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION private.can_link_project_tag(uuid, uuid) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION private.build_tag_slug(text) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION private.sync_managed_note(uuid, text, public.note_type, text) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION private.sync_project_tags(uuid, text[]) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION private.current_project_rows() TO authenticated;
