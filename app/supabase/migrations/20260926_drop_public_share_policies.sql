-- SEC-2 (step 2 of 2): Remove public read access to shared trips
-- Run this in the Supabase SQL Editor AFTER the app update using
-- get_shared_trip() is live. Running it earlier breaks share links.

BEGIN;

DROP POLICY IF EXISTS "Public can read shared trips" ON trips;
DROP POLICY IF EXISTS "Public can read shared trip activities" ON activities;
DROP POLICY IF EXISTS "Public can read shared trip expenses" ON expenses;
DROP POLICY IF EXISTS "Public can read shared trip checklists" ON checklists;
DROP POLICY IF EXISTS "Public can read shared trip checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Public can read shared trip ideas" ON ideas;

COMMIT;
