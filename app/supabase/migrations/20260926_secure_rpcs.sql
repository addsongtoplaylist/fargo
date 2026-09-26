-- SEC-1: Lock down SECURITY DEFINER RPCs + traveller self-insert
-- Run this in the Supabase SQL Editor
--
-- Problem: these functions bypass RLS and trusted a caller-supplied
-- p_account_id, and were executable by anonymous visitors. Anyone could
-- list another user's trips, join/leave trips as them, or reorder any
-- trip's activities.
--
-- Fix: each function derives the caller from auth.uid() instead.
-- p_account_id is kept (DEFAULT NULL, ignored) so the currently deployed
-- app keeps working — this script can be applied before or after the
-- next deploy. A later cleanup can drop the parameter.

BEGIN;

-- ── get_my_trips ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_my_trips(p_account_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
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
  WHERE tr.account_id = (SELECT id FROM accounts WHERE auth_id = auth.uid());
$$;

-- ── join_trip_by_invite ─────────────────────────────────────
CREATE OR REPLACE FUNCTION join_trip_by_invite(
  p_code text,
  p_account_id uuid DEFAULT NULL,
  p_display_name text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid;
  v_name text;
  v_trip_id uuid;
BEGIN
  SELECT id, name INTO v_me, v_name FROM accounts WHERE auth_id = auth.uid();
  IF v_me IS NULL THEN
    RETURN json_build_object('error', 'Not signed in');
  END IF;

  SELECT id INTO v_trip_id FROM trips WHERE invite_code = p_code LIMIT 1;
  IF v_trip_id IS NULL THEN
    RETURN json_build_object('error', 'Invalid invite link');
  END IF;

  IF EXISTS (
    SELECT 1 FROM travellers WHERE trip_id = v_trip_id AND account_id = v_me
  ) THEN
    RETURN json_build_object('tripId', v_trip_id);
  END IF;

  INSERT INTO travellers (trip_id, display_name, role, account_id)
  VALUES (v_trip_id, COALESCE(NULLIF(p_display_name, ''), v_name), 'member', v_me);

  RETURN json_build_object('tripId', v_trip_id);
END;
$$;

-- ── leave_trip ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION leave_trip(p_trip_id uuid, p_account_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_traveller_id uuid;
  v_role traveller_role;
BEGIN
  SELECT tr.id, tr.role INTO v_traveller_id, v_role
  FROM travellers tr
  JOIN accounts a ON a.id = tr.account_id
  WHERE tr.trip_id = p_trip_id AND a.auth_id = auth.uid();

  IF v_traveller_id IS NULL THEN
    RAISE EXCEPTION 'You are not a member of this trip';
  END IF;

  IF v_role = 'planner' THEN
    RAISE EXCEPTION 'The planner cannot leave. Delete the trip instead.';
  END IF;

  DELETE FROM travellers WHERE id = v_traveller_id;
END;
$$;

-- ── batch_reorder_activities ────────────────────────────────
-- Mirrors the activities UPDATE policy: planner only.
CREATE OR REPLACE FUNCTION batch_reorder_activities(
  p_trip_id uuid,
  p_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM trips t
    JOIN accounts a ON a.id = t.planner_id
    WHERE t.id = p_trip_id AND a.auth_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only the planner can reorder activities';
  END IF;

  UPDATE activities a
  SET
    sort_order = t.new_order - 1,  -- ordinality is 1-based, sort_order is 0-based
    updated_at = now()
  FROM unnest(p_ids) WITH ORDINALITY AS t(id, new_order)
  WHERE a.id = t.id
    AND a.trip_id = p_trip_id;
END;
$$;

-- ── Who may call these ──────────────────────────────────────
-- Signed-in users only. get_trip_by_invite stays public (invite preview).
REVOKE EXECUTE ON FUNCTION get_my_trips(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION join_trip_by_invite(text, uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION leave_trip(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION batch_reorder_activities(uuid, uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_my_trips(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION join_trip_by_invite(text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION leave_trip(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION batch_reorder_activities(uuid, uuid[]) TO authenticated;

-- ── travellers self-insert ──────────────────────────────────
-- The old policy let any signed-in user add themselves to ANY trip
-- (no invite code needed, any role). Joining goes through
-- join_trip_by_invite, so direct self-insert is only needed when the
-- planner adds themselves to their own new trip (createTrip, cloneTrip).
DROP POLICY IF EXISTS "Users can join trips via invite" ON travellers;
CREATE POLICY "Planner can add self to own trip" ON travellers
  FOR INSERT
  WITH CHECK (
    account_id = (SELECT id FROM accounts WHERE auth_id = auth.uid())
    AND trip_id IN (
      SELECT t.id FROM trips t
      JOIN accounts a ON a.id = t.planner_id
      WHERE a.auth_id = auth.uid()
    )
  );

COMMIT;
