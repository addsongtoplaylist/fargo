-- F-03: Get all trips for a user with their travellers in a single query
-- Run this in the Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_my_trips(p_account_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'destination', t.destination,
        'start_date', t.start_date,
        'end_date', t.end_date,
        'trip_type', t.trip_type,
        'local_currency', t.local_currency,
        'fx_rate', t.fx_rate,
        'status', t.status,
        'planner_id', t.planner_id,
        'share_code', t.share_code,
        'invite_code', t.invite_code,
        'created_at', t.created_at,
        'updated_at', t.updated_at,
        'travellers', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', tr2.id,
              'trip_id', tr2.trip_id,
              'display_name', tr2.display_name,
              'role', tr2.role,
              'account_id', tr2.account_id,
              'budget_total', tr2.budget_total,
              'created_at', tr2.created_at
            )
          ), '[]'::jsonb)
          FROM travellers tr2
          WHERE tr2.trip_id = t.id
        )
      )
      ORDER BY t.start_date
    ),
    '[]'::jsonb
  )
  FROM trips t
  INNER JOIN travellers tr ON tr.trip_id = t.id
  WHERE tr.account_id = p_account_id;
$$;
