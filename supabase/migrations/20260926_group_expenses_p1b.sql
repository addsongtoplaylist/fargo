-- GROUP EXPENSES — Phase 1, part B. Run right after part A is verified.
-- A traveller who is in any expense can't leave (D29): say so clearly
-- instead of failing with a database error.

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

  IF EXISTS (SELECT 1 FROM expenses WHERE paid_by = v_traveller_id OR created_by = v_traveller_id)
     OR EXISTS (SELECT 1 FROM expense_participants WHERE traveller_id = v_traveller_id) THEN
    RAISE EXCEPTION 'You can''t leave while you''re part of expenses on this trip. Ask the planner for help.';
  END IF;

  DELETE FROM travellers WHERE id = v_traveller_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION leave_trip(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION leave_trip(uuid, uuid) TO authenticated;
