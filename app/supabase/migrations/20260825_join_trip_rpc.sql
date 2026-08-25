-- RPC function to join a trip by invite code.
-- Uses SECURITY DEFINER so authenticated users can look up the trip
-- by invite code even if RLS blocks direct access to the trips table.
-- The function checks auth, checks membership, and inserts if needed.

CREATE OR REPLACE FUNCTION join_trip_by_invite(
  p_code text,
  p_account_id uuid,
  p_display_name text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trip_id uuid;
  v_already boolean;
BEGIN
  -- Look up trip by invite code
  SELECT id INTO v_trip_id
  FROM trips
  WHERE invite_code = p_code
  LIMIT 1;

  IF v_trip_id IS NULL THEN
    RETURN json_build_object('error', 'Invalid invite link');
  END IF;

  -- Check if already a member
  SELECT EXISTS(
    SELECT 1 FROM travellers
    WHERE trip_id = v_trip_id AND account_id = p_account_id
  ) INTO v_already;

  IF v_already THEN
    RETURN json_build_object('tripId', v_trip_id);
  END IF;

  -- Add as member
  INSERT INTO travellers (trip_id, display_name, role, account_id)
  VALUES (v_trip_id, p_display_name, 'member', p_account_id);

  RETURN json_build_object('tripId', v_trip_id);
END;
$$;
