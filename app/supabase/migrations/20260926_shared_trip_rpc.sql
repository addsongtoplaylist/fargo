-- SEC-2 (step 1 of 2): Shared trip lookup by exact share code
-- Run this in the Supabase SQL Editor BEFORE deploying the app update.
--
-- Replaces the "Public can read shared ..." RLS policies, which let anyone
-- list every shared trip (and its invite code + expenses) without the link.
-- Returns only what the share page and "Save as my trip" need:
-- no invite_code, share_code, planner_id, account IDs, budgets or expenses.
-- Checklist name/done are returned as title/checked (the share view's shape).

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
