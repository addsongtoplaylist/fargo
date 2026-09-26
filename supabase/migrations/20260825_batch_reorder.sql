-- F-01: Batch reorder activities in a single atomic transaction
-- Run this in the Supabase SQL Editor

CREATE OR REPLACE FUNCTION batch_reorder_activities(
  p_trip_id uuid,
  p_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE activities a
  SET
    sort_order = t.new_order - 1,  -- ordinality is 1-based, sort_order is 0-based
    updated_at = now()
  FROM unnest(p_ids) WITH ORDINALITY AS t(id, new_order)
  WHERE a.id = t.id
    AND a.trip_id = p_trip_id;
END;
$$;
