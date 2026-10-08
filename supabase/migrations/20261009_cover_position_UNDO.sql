-- UNDO for 20261009_cover_position.sql — only if v0.5.5 has to be rolled
-- back. Deploy the previous app version (v0.5.4) FIRST, then run this.
-- Photos themselves are untouched; only the saved positions are lost.

DROP FUNCTION IF EXISTS suggest_place_idea(uuid, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS get_invite_cover(text);
DROP FUNCTION IF EXISTS get_shared_cover_info(text);
DROP FUNCTION IF EXISTS set_trip_cover_position(uuid, integer);
ALTER TABLE trips DROP COLUMN IF EXISTS cover_position;
