-- v0.5.5 · Cover photo position, cover on the invite card, Discover for members
-- Run in the Supabase SQL Editor BEFORE deploying the app update.
--
-- Additive only: one new column and four new functions. Existing functions
-- (set_trip_cover, get_shared_cover, get_trip_by_invite) stay untouched, so
-- the current app and the parked native app keep working.
-- Undo: 20261009_cover_position_UNDO.sql

-- 1. How far down the photo is shown, in % (0 = top, 50 = middle, 100 = bottom)
ALTER TABLE trips ADD COLUMN IF NOT EXISTS cover_position smallint NOT NULL DEFAULT 50
  CHECK (cover_position BETWEEN 0 AND 100);

-- 2. Save the position — planner only (same check as the cover photo itself)
CREATE OR REPLACE FUNCTION set_trip_cover_position(p_trip_id uuid, p_position integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT can_manage_trip_cover(p_trip_id::text) THEN
    RAISE EXCEPTION 'Only the planner can change the cover photo';
  END IF;
  IF p_position IS NULL OR p_position NOT BETWEEN 0 AND 100 THEN
    RAISE EXCEPTION 'Invalid position';
  END IF;
  UPDATE trips SET cover_position = p_position, updated_at = now() WHERE id = p_trip_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION set_trip_cover_position(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION set_trip_cover_position(uuid, integer) TO authenticated;

-- 3. Share page (signed out too): cover path + position for a share code
CREATE OR REPLACE FUNCTION get_shared_cover_info(p_code text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT json_build_object('path', cover_path, 'position', cover_position)
  FROM trips WHERE share_code = p_code LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION get_shared_cover_info(text) TO anon, authenticated;

-- 4. Invite card (signed out too): cover path + position for an invite code.
--    Only the photo — the invite page already shows name, place and dates.
CREATE OR REPLACE FUNCTION get_invite_cover(p_code text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT json_build_object('path', cover_path, 'position', cover_position)
  FROM trips WHERE invite_code = p_code LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION get_invite_cover(text) TO anon, authenticated;

-- 5. Discover for members: suggest a place as an idea, keeping its map pin.
--    Same rules as add_idea (20261008_checklists_ideas.sql): anyone on the
--    trip with an account; shown as "Mei suggested"; badges the planner.
CREATE OR REPLACE FUNCTION suggest_place_idea(
  p_trip_id uuid, p_title text, p_link text, p_notes text,
  p_category text, p_place_name text, p_lat text, p_lng text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  v_id := add_idea(p_trip_id, p_title, p_link, p_notes); -- all checks live there
  UPDATE ideas SET
    category   = COALESCE(NULLIF(btrim(p_category), ''), category),
    place_name = NULLIF(left(btrim(COALESCE(p_place_name, '')), 200), ''),
    place_lat  = NULLIF(btrim(COALESCE(p_lat, '')), ''),
    place_lng  = NULLIF(btrim(COALESCE(p_lng, '')), '')
  WHERE id = v_id;
  RETURN v_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION suggest_place_idea(uuid, text, text, text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION suggest_place_idea(uuid, text, text, text, text, text, text, text) TO authenticated;
