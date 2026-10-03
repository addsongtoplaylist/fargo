-- P10 · Trip cover photo (v0.5.1)
-- Run in the Supabase SQL Editor BEFORE deploying the app update.
--
-- Additive only: one new column, one storage bucket, storage policies and
-- three new functions. No existing table, policy or function is changed, so
-- the PWA and the native app keep working as they are.
-- Undo: 20261002_trip_cover_photo_UNDO.sql
--
-- Who can do what (docs/PERMISSIONS.md): only the trip's planner adds,
-- changes or removes the cover. Anyone with the image link can view it
-- (the share page shows it to people without an account); file names are
-- random so they can't be guessed.

-- 1. Where the cover lives: "<trip id>/<random>.jpg" inside the bucket
ALTER TABLE trips ADD COLUMN IF NOT EXISTS cover_path text;

-- 2. Storage bucket — public read, 5 MB max, images only
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('trip-covers', 'trip-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 3. Is the signed-in caller the planner of this trip? (trip id as text,
--    because storage folder names are text). Named for this feature on
--    purpose: production already has an unrelated is_trip_planner() that
--    existing policies may use — never touch it.
CREATE OR REPLACE FUNCTION can_manage_trip_cover(p_trip_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM trips t
    JOIN accounts a ON a.id = t.planner_id
    WHERE t.id::text = p_trip_id
      AND a.auth_id = auth.uid()
  );
$$;
REVOKE EXECUTE ON FUNCTION can_manage_trip_cover(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION can_manage_trip_cover(text) TO authenticated;

-- 4. Storage policies — planner of the trip in the folder name only
DROP POLICY IF EXISTS "Trip planner can read own trip covers" ON storage.objects;
CREATE POLICY "Trip planner can read own trip covers" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'trip-covers' AND can_manage_trip_cover((storage.foldername(name))[1]));

DROP POLICY IF EXISTS "Trip planner can upload trip covers" ON storage.objects;
CREATE POLICY "Trip planner can upload trip covers" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'trip-covers' AND can_manage_trip_cover((storage.foldername(name))[1]));

DROP POLICY IF EXISTS "Trip planner can replace trip covers" ON storage.objects;
CREATE POLICY "Trip planner can replace trip covers" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'trip-covers' AND can_manage_trip_cover((storage.foldername(name))[1]))
  WITH CHECK (bucket_id = 'trip-covers' AND can_manage_trip_cover((storage.foldername(name))[1]));

DROP POLICY IF EXISTS "Trip planner can delete trip covers" ON storage.objects;
CREATE POLICY "Trip planner can delete trip covers" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'trip-covers' AND can_manage_trip_cover((storage.foldername(name))[1]));

-- 5. Save / clear the cover — planner only, path must be inside the trip's folder
CREATE OR REPLACE FUNCTION set_trip_cover(p_trip_id uuid, p_path text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT can_manage_trip_cover(p_trip_id::text) THEN
    RAISE EXCEPTION 'Only the planner can change the cover photo';
  END IF;
  IF p_path IS NOT NULL AND p_path NOT LIKE p_trip_id::text || '/%' THEN
    RAISE EXCEPTION 'Invalid cover path';
  END IF;
  UPDATE trips SET cover_path = p_path, updated_at = now() WHERE id = p_trip_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION set_trip_cover(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION set_trip_cover(uuid, text) TO authenticated;

-- 6. The share page (signed out too) gets only the cover path for a share code
CREATE OR REPLACE FUNCTION get_shared_cover(p_code text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT cover_path FROM trips WHERE share_code = p_code LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION get_shared_cover(text) TO anon, authenticated;
