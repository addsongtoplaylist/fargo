-- GROUP EXPENSES — Phase 5 (v0.4.3): travellers without an account.
-- See docs/EXPENSES.md §13 (D17, D29, D38–D42).
-- Run in the Supabase SQL Editor BEFORE deploying v0.4.3.

BEGIN;

-- ── Helper: the caller's account ────────────────────────────
CREATE OR REPLACE FUNCTION fx_my_account_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM accounts WHERE auth_id = auth.uid();
$$;

-- ── Add someone without an account (planner) ────────────────
CREATE OR REPLACE FUNCTION add_traveller(p_trip_id uuid, p_name text, p_shares integer DEFAULT 1)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM trips WHERE id = p_trip_id AND planner_id = fx_my_account_id()) THEN
    RAISE EXCEPTION 'Only the planner can add travellers';
  END IF;
  IF p_name IS NULL OR length(trim(p_name)) = 0 OR length(trim(p_name)) > 60 THEN
    RAISE EXCEPTION 'Enter a name (up to 60 characters)';
  END IF;
  IF coalesce(p_shares, 1) < 1 THEN
    RAISE EXCEPTION 'Shares must be at least 1';
  END IF;

  INSERT INTO travellers (trip_id, display_name, role, account_id, default_shares)
  VALUES (p_trip_id, trim(p_name), 'member', NULL, coalesce(p_shares, 1))
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- ── Rename / default shares (planner) ───────────────────────
-- Name changes only for travellers without an account (D39).
CREATE OR REPLACE FUNCTION update_traveller(p_traveller_id uuid, p_name text, p_shares integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v travellers%ROWTYPE;
BEGIN
  SELECT * INTO v FROM travellers WHERE id = p_traveller_id;
  IF NOT FOUND OR NOT EXISTS (SELECT 1 FROM trips WHERE id = v.trip_id AND planner_id = fx_my_account_id()) THEN
    RAISE EXCEPTION 'Only the planner can change travellers';
  END IF;
  IF p_shares IS NOT NULL AND p_shares < 1 THEN
    RAISE EXCEPTION 'Shares must be at least 1';
  END IF;
  IF p_name IS NOT NULL AND v.account_id IS NULL
     AND (length(trim(p_name)) = 0 OR length(trim(p_name)) > 60) THEN
    RAISE EXCEPTION 'Enter a name (up to 60 characters)';
  END IF;

  UPDATE travellers SET
    display_name = CASE WHEN p_name IS NOT NULL AND v.account_id IS NULL THEN trim(p_name) ELSE display_name END,
    default_shares = coalesce(p_shares, default_shares)
  WHERE id = p_traveller_id;
END;
$$;

-- ── Invite preview: also list unclaimed names (D42) ─────────
-- Signature unchanged; adds id, claimed and counts per traveller.
CREATE OR REPLACE FUNCTION get_trip_by_invite(p_code text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT json_build_object(
    'id', t.id,
    'name', t.name,
    'destination', t.destination,
    'start_date', t.start_date,
    'end_date', t.end_date,
    'travellers', COALESCE(
      (SELECT json_agg(json_build_object(
        'id', tr.id,
        'display_name', tr.display_name,
        'account_id', tr.account_id,
        'claimed', tr.account_id IS NOT NULL,
        'paid_count', (SELECT count(*) FROM expenses e WHERE e.paid_by = tr.id AND e.kind = 'expense'),
        'in_count', (SELECT count(*) FROM expense_participants p
                      JOIN expenses e ON e.id = p.expense_id
                     WHERE p.traveller_id = tr.id AND e.kind = 'expense')
      ) ORDER BY tr.created_at, tr.id)
      FROM travellers tr
      WHERE tr.trip_id = t.id),
      '[]'::json
    )
  )
  FROM trips t
  WHERE t.invite_code = p_code
  LIMIT 1;
$$;

-- ── Join: must pick a name when unclaimed names exist (D42) ──
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

  IF EXISTS (SELECT 1 FROM travellers WHERE trip_id = v_trip_id AND account_id = v_me) THEN
    RETURN json_build_object('tripId', v_trip_id);
  END IF;

  IF EXISTS (SELECT 1 FROM travellers WHERE trip_id = v_trip_id AND account_id IS NULL) THEN
    RETURN json_build_object('error', 'Pick your name from the list to join');
  END IF;

  INSERT INTO travellers (trip_id, display_name, role, account_id)
  VALUES (v_trip_id, COALESCE(NULLIF(p_display_name, ''), v_name), 'member', v_me);

  RETURN json_build_object('tripId', v_trip_id);
END;
$$;

-- ── Claim a name from the invite link (D23, D42) ────────────
CREATE OR REPLACE FUNCTION claim_traveller(p_code text, p_traveller_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid := fx_my_account_id();
  v_trip_id uuid;
  v_updated uuid;
BEGIN
  IF v_me IS NULL THEN
    RETURN json_build_object('error', 'Not signed in');
  END IF;

  SELECT id INTO v_trip_id FROM trips WHERE invite_code = p_code LIMIT 1;
  IF v_trip_id IS NULL THEN
    RETURN json_build_object('error', 'Invalid invite link');
  END IF;

  IF EXISTS (SELECT 1 FROM travellers WHERE trip_id = v_trip_id AND account_id = v_me) THEN
    RETURN json_build_object('error', 'You''re already on this trip');
  END IF;

  -- Only an unclaimed name on this trip; the WHERE guards against two
  -- people claiming the same name at once
  UPDATE travellers SET account_id = v_me
   WHERE id = p_traveller_id AND trip_id = v_trip_id AND account_id IS NULL
  RETURNING id INTO v_updated;

  IF v_updated IS NULL THEN
    RETURN json_build_object('error', 'Someone has already picked that name');
  END IF;

  RETURN json_build_object('tripId', v_trip_id);
END;
$$;

-- ── Change owner (D40) ──────────────────────────────────────
-- Move yourself from the name you're on to an unclaimed name on the same
-- trip. The name you leave keeps its history and goes back to no owner.
CREATE OR REPLACE FUNCTION change_owner(p_trip_id uuid, p_to_traveller uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid := fx_my_account_id();
  v_from travellers%ROWTYPE;
BEGIN
  SELECT * INTO v_from FROM travellers WHERE trip_id = p_trip_id AND account_id = v_me;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'You are not on this trip';
  END IF;
  IF v_from.role = 'planner' THEN
    RAISE EXCEPTION 'The planner''s entry can''t change owner';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM travellers
                  WHERE id = p_to_traveller AND trip_id = p_trip_id AND account_id IS NULL) THEN
    RAISE EXCEPTION 'Pick a name that nobody has claimed';
  END IF;

  UPDATE travellers SET account_id = NULL WHERE id = v_from.id;
  UPDATE travellers SET account_id = v_me WHERE id = p_to_traveller;
END;
$$;

-- ── Turn a member into no-account (planner, D29) ────────────
-- For someone leaving who's part of expenses: history stays, access goes.
CREATE OR REPLACE FUNCTION unlink_traveller(p_traveller_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v travellers%ROWTYPE;
BEGIN
  SELECT * INTO v FROM travellers WHERE id = p_traveller_id;
  IF NOT FOUND OR NOT EXISTS (SELECT 1 FROM trips WHERE id = v.trip_id AND planner_id = fx_my_account_id()) THEN
    RAISE EXCEPTION 'Only the planner can do this';
  END IF;
  IF v.role = 'planner' THEN
    RAISE EXCEPTION 'The planner''s own entry can''t be unlinked';
  END IF;
  UPDATE travellers SET account_id = NULL WHERE id = p_traveller_id;
END;
$$;

-- ── Who can call what ───────────────────────────────────────
REVOKE EXECUTE ON FUNCTION fx_my_account_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION add_traveller(uuid, text, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION update_traveller(uuid, text, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION join_trip_by_invite(text, uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION claim_traveller(text, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION change_owner(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION unlink_traveller(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION add_traveller(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION update_traveller(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION join_trip_by_invite(text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION claim_traveller(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION change_owner(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION unlink_traveller(uuid) TO authenticated;
-- get_trip_by_invite stays callable signed-out (invite preview)

COMMIT;
