-- GROUP EXPENSES — Phases 3 + 4 (v0.4.2). See docs/EXPENSES.md §12.
-- Run in the Supabase SQL Editor BEFORE deploying v0.4.2.
-- Additive only: three new functions. Nothing existing changes.

BEGIN;

-- ── Set your own budget (D11) ───────────────────────────────
-- Only ever your own traveller row on this trip. Budget is stored in MYR.
CREATE OR REPLACE FUNCTION set_my_budget(p_trip_id uuid, p_budget_myr integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid;
BEGIN
  IF p_budget_myr IS NOT NULL AND p_budget_myr < 0 THEN
    RAISE EXCEPTION 'Budget can''t be negative';
  END IF;

  SELECT tr.id INTO v_me
    FROM travellers tr
    JOIN accounts a ON a.id = tr.account_id
   WHERE tr.trip_id = p_trip_id AND a.auth_id = auth.uid();
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'You are not on this trip';
  END IF;

  UPDATE travellers SET budget_total = p_budget_myr WHERE id = v_me;
END;
$$;

-- ── Mark as settled (D12, D25) ──────────────────────────────
-- The person who owes, or the planner (also on behalf of name-only
-- travellers). Saved as an expense of kind 'settlement': paid by the
-- person who owed, one participant = the person owed, full amount.
CREATE OR REPLACE FUNCTION mark_settled(
  p_trip_id uuid,
  p_from uuid,        -- traveller who owes and is paying
  p_to uuid,          -- traveller being paid
  p_amount numeric,   -- local currency
  p_date date
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid;
  v_is_planner boolean;
  v_fx numeric;
  v_id uuid;
BEGIN
  SELECT tr.id, (t.planner_id = a.id), t.fx_rate
    INTO v_me, v_is_planner, v_fx
    FROM travellers tr
    JOIN accounts a ON a.id = tr.account_id
    JOIN trips t ON t.id = tr.trip_id
   WHERE tr.trip_id = p_trip_id AND a.auth_id = auth.uid();
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'You are not on this trip';
  END IF;
  IF v_me <> p_from AND NOT v_is_planner THEN
    RAISE EXCEPTION 'Only the person who owes, or the planner, can mark this settled';
  END IF;
  IF p_from = p_to THEN
    RAISE EXCEPTION 'Someone can''t settle up with themselves';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be more than zero';
  END IF;
  IF (SELECT count(*) FROM travellers WHERE trip_id = p_trip_id AND id IN (p_from, p_to)) <> 2 THEN
    RAISE EXCEPTION 'Both people must be on this trip';
  END IF;

  PERFORM set_config('fargo.via_rpc', 'on', true);

  INSERT INTO expenses (trip_id, date, title, category, amount, amount_myr, paid_by,
                        is_shared, kind, split_type, created_by)
  VALUES (p_trip_id, coalesce(p_date, current_date), 'Settle up', 'misc', round(p_amount, 2),
          round(p_amount / nullif(v_fx, 0), 2), p_from, false, 'settlement', 'amount', v_me)
  RETURNING id INTO v_id;

  INSERT INTO expense_participants (expense_id, traveller_id, weight, share)
  VALUES (v_id, p_to, round(p_amount, 2), round(p_amount, 2));

  RETURN v_id;
END;
$$;

-- ── Unmark (D25) ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION unmark_settled(p_expense_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing expenses%ROWTYPE;
  v_me uuid;
  v_is_planner boolean;
BEGIN
  SELECT * INTO v_existing FROM expenses WHERE id = p_expense_id;
  IF NOT FOUND OR v_existing.kind <> 'settlement' THEN
    RAISE EXCEPTION 'Settlement not found';
  END IF;

  SELECT tr.id, (t.planner_id = a.id)
    INTO v_me, v_is_planner
    FROM travellers tr
    JOIN accounts a ON a.id = tr.account_id
    JOIN trips t ON t.id = tr.trip_id
   WHERE tr.trip_id = v_existing.trip_id AND a.auth_id = auth.uid();
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'You are not on this trip';
  END IF;
  IF v_existing.paid_by <> v_me AND NOT v_is_planner THEN
    RAISE EXCEPTION 'Only the person who owed, or the planner, can unmark this';
  END IF;

  DELETE FROM expenses WHERE id = p_expense_id;  -- participant cascades
END;
$$;

REVOKE EXECUTE ON FUNCTION set_my_budget(uuid, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION mark_settled(uuid, uuid, uuid, numeric, date) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION unmark_settled(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION set_my_budget(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_settled(uuid, uuid, uuid, numeric, date) TO authenticated;
GRANT EXECUTE ON FUNCTION unmark_settled(uuid) TO authenticated;

COMMIT;
