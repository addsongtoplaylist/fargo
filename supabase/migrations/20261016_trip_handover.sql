-- TRIP HANDOVER + DELETE FIX (v0.6.2). Run in the Supabase SQL Editor
-- BEFORE deploying v0.6.2 (the app calls hand_over_and_leave).
-- Test afterwards with 20261016_trip_handover_TEST.sql. Undo: …_UNDO.sql.

BEGIN;

-- ── 1. Deleting a trip with expenses failed ─────────────────
-- "update or delete on table travellers violates foreign key constraint
-- expense_participants_traveller_id_fkey". When a trip is deleted, its
-- travellers are removed before its expenses, and these links (NO ACTION,
-- p1a §4) were checked in between. Checked at the end of the transaction
-- instead, the whole delete finishes first. Removing one traveller who is
-- in expenses is still refused — at commit, with the same error.
ALTER TABLE expense_participants
  ALTER CONSTRAINT expense_participants_traveller_id_fkey DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE expenses
  ALTER CONSTRAINT expenses_paid_by_fkey DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE expenses
  ALTER CONSTRAINT expenses_created_by_fkey DEFERRABLE INITIALLY DEFERRED;

-- ── 2. Hand over and leave (planner) ────────────────────────
-- The planner makes another traveller with an account the planner, then
-- leaves. If they're part of any expense their name stays as a name-only
-- traveller (history and balances unchanged, like unlink_traveller);
-- otherwise their traveller row is removed (like leave_trip).
CREATE OR REPLACE FUNCTION hand_over_and_leave(p_trip_id uuid, p_new_planner uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid := fx_my_account_id();
  v_from travellers%ROWTYPE;
  v_to travellers%ROWTYPE;
BEGIN
  IF v_me IS NULL OR NOT EXISTS (SELECT 1 FROM trips WHERE id = p_trip_id AND planner_id = v_me) THEN
    RAISE EXCEPTION 'Only the planner can hand over the trip';
  END IF;

  SELECT * INTO v_to FROM travellers WHERE id = p_new_planner AND trip_id = p_trip_id;
  IF NOT FOUND OR v_to.account_id IS NULL OR v_to.account_id = v_me THEN
    RAISE EXCEPTION 'Pick someone on this trip who has joined with their own account';
  END IF;

  UPDATE trips SET planner_id = v_to.account_id WHERE id = p_trip_id;
  UPDATE travellers SET role = 'planner' WHERE id = v_to.id;

  SELECT * INTO v_from FROM travellers WHERE trip_id = p_trip_id AND account_id = v_me;
  IF FOUND THEN
    IF EXISTS (SELECT 1 FROM expenses WHERE paid_by = v_from.id OR created_by = v_from.id)
       OR EXISTS (SELECT 1 FROM expense_participants WHERE traveller_id = v_from.id) THEN
      UPDATE travellers SET role = 'member', account_id = NULL WHERE id = v_from.id;
    ELSE
      DELETE FROM travellers WHERE id = v_from.id;
    END IF;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION hand_over_and_leave(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION hand_over_and_leave(uuid, uuid) TO authenticated;

COMMIT;
