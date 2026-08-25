-- RPC function to look up a trip by invite code.
-- Uses SECURITY DEFINER so it bypasses RLS — unauthenticated visitors
-- can see the invite preview without needing a session.
-- Returns only the fields needed for the preview (no budget, no planner_id).

CREATE OR REPLACE FUNCTION get_trip_by_invite(p_code text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT json_build_object(
    'id', t.id,
    'name', t.name,
    'destination', t.destination,
    'start_date', t.start_date,
    'end_date', t.end_date,
    'travellers', COALESCE(
      (SELECT json_agg(json_build_object(
        'display_name', tr.display_name,
        'account_id', tr.account_id
      ))
      FROM travellers tr
      WHERE tr.trip_id = t.id),
      '[]'::json
    )
  )
  FROM trips t
  WHERE t.invite_code = p_code
  LIMIT 1;
$$;
