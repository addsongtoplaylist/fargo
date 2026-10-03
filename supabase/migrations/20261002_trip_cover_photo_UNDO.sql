-- UNDO for 20261002_trip_cover_photo.sql — only if the cover photo change
-- has to be rolled back. Deploy the previous app version first.
--
-- Step 1 (dashboard, before running this): Storage → trip-covers → select
-- all files → Delete. Supabase doesn't allow deleting stored files from SQL,
-- and a bucket must be empty before it can be removed.

DROP FUNCTION IF EXISTS get_shared_cover(text);
DROP FUNCTION IF EXISTS set_trip_cover(uuid, text);

DROP POLICY IF EXISTS "Trip planner can read own trip covers" ON storage.objects;
DROP POLICY IF EXISTS "Trip planner can upload trip covers" ON storage.objects;
DROP POLICY IF EXISTS "Trip planner can replace trip covers" ON storage.objects;
DROP POLICY IF EXISTS "Trip planner can delete trip covers" ON storage.objects;

DROP FUNCTION IF EXISTS can_manage_trip_cover(text);

DELETE FROM storage.buckets WHERE id = 'trip-covers';

ALTER TABLE trips DROP COLUMN IF EXISTS cover_path;
