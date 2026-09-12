-- RPC function: leave_trip
-- Allows a non-planner member to remove themselves from a trip.
-- Uses SECURITY DEFINER to bypass RLS (travellers table only lets
-- the planner delete rows).

CREATE OR REPLACE FUNCTION leave_trip(p_trip_id UUID, p_account_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_traveller_id UUID;
  v_role traveller_role;
BEGIN
  -- Find the traveller row for this account on this trip
  SELECT id, role INTO v_traveller_id, v_role
  FROM travellers
  WHERE trip_id = p_trip_id AND account_id = p_account_id;

  IF v_traveller_id IS NULL THEN
    RAISE EXCEPTION 'You are not a member of this trip';
  END IF;

  IF v_role = 'planner' THEN
    RAISE EXCEPTION 'The planner cannot leave. Delete the trip instead.';
  END IF;

  DELETE FROM travellers WHERE id = v_traveller_id;
END;
$$;
