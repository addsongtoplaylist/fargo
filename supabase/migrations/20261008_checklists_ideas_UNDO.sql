-- UNDO for 20261008_checklists_ideas.sql — only if v0.5.4 has to be rolled
-- back. Deploy the previous app version (v0.5.1) FIRST, then run this.
--
-- Removes everything the migration added: personal checklists (all lists
-- people made since — they are lost), idea authors, the badge, and restores
-- the share page to return checklists and ideas again. The old shared
-- checklists were never touched, so they are still there.

-- Part C · share page back to the 20260926 version
CREATE OR REPLACE FUNCTION get_shared_trip(p_code text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT json_build_object(
    'trip', json_build_object(
      'id', t.id,
      'name', t.name,
      'destination', t.destination,
      'start_date', t.start_date,
      'end_date', t.end_date,
      'trip_type', t.trip_type,
      'local_currency', t.local_currency,
      'fx_rate', t.fx_rate,
      'travellers', COALESCE((
        SELECT json_agg(json_build_object(
          'id', tr.id,
          'display_name', tr.display_name,
          'role', tr.role
        ))
        FROM travellers tr WHERE tr.trip_id = t.id
      ), '[]'::json)
    ),
    'activities', COALESCE((
      SELECT json_agg(json_build_object(
        'id', a.id,
        'date', a.date,
        'time', a.time,
        'title', a.title,
        'notes', a.notes,
        'category', a.category,
        'cost', a.cost,
        'place_name', a.place_name,
        'place_lat', a.place_lat,
        'place_lng', a.place_lng,
        'sort_order', a.sort_order
      ) ORDER BY a.date, a.sort_order)
      FROM activities a WHERE a.trip_id = t.id
    ), '[]'::json),
    'checklists', COALESCE((
      SELECT json_agg(json_build_object(
        'id', c.id,
        'title', c.name,
        'checklist_items', COALESCE((
          SELECT json_agg(json_build_object(
            'id', ci.id,
            'text', ci.text,
            'checked', ci.done
          ) ORDER BY ci.sort_order, ci.created_at)
          FROM checklist_items ci WHERE ci.checklist_id = c.id
        ), '[]'::json)
      ) ORDER BY c.sort_order, c.created_at)
      FROM checklists c WHERE c.trip_id = t.id
    ), '[]'::json),
    'ideas', COALESCE((
      SELECT json_agg(json_build_object(
        'id', i.id,
        'title', i.title,
        'link', i.link,
        'notes', i.notes,
        'promoted', i.promoted
      ) ORDER BY i.created_at)
      FROM ideas i WHERE i.trip_id = t.id
    ), '[]'::json)
  )
  FROM trips t
  WHERE t.share_code = p_code
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_shared_trip(text) TO anon, authenticated;

-- Part B · idea suggestions
DROP FUNCTION IF EXISTS prep_badge_count(uuid);
DROP FUNCTION IF EXISTS mark_prep_seen(uuid);
DROP TABLE IF EXISTS prep_seen;
DROP FUNCTION IF EXISTS delete_idea(uuid);
DROP FUNCTION IF EXISTS update_idea(uuid, text, text, text);
DROP FUNCTION IF EXISTS add_idea(uuid, text, text, text);
DROP FUNCTION IF EXISTS ideas_is_planner(uuid);
ALTER TABLE activities DROP COLUMN IF EXISTS suggested_by;
ALTER TABLE ideas      DROP COLUMN IF EXISTS suggested_at;
ALTER TABLE ideas      DROP COLUMN IF EXISTS created_by;

-- Part A · personal checklists
DROP FUNCTION IF EXISTS save_my_checklist_as_default(uuid);
DROP FUNCTION IF EXISTS setup_my_checklists(uuid);
DROP TABLE IF EXISTS my_checklist_setup;
DROP TABLE IF EXISTS my_checklist_items;
DROP TABLE IF EXISTS my_checklists;
DROP FUNCTION IF EXISTS my_lists_on_trip(uuid);
DROP FUNCTION IF EXISTS my_lists_account_id();
