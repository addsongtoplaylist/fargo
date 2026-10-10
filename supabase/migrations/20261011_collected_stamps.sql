-- v0.5.17 · Collecting stamps (docs/STAMPS.md v2.2, "Next — collecting stamps")
-- Run on STAGING first, then 20261011_collected_stamps_TEST.sql there; then production.
-- Order with the app: run this BEFORE pushing v0.5.17 (its Passport and trip
-- overview call collect_stamp). Older app versions don't use it, so running it
-- early is safe. The native app doesn't use stamps.
-- Undo: 20261011_collected_stamps_UNDO.sql
--
-- When a trip has ended, each traveller with an account collects its stamp
-- once. The app picks the stamp (the library lives in the app) and calls
-- collect_stamp(); the stamp is saved with its label, so it never changes and
-- stays in the traveller's Passport even after they leave the trip or the trip
-- is deleted. Each person can read only their own stamps.

-- ── Table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collected_stamps (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  trip_id       uuid REFERENCES trips(id) ON DELETE SET NULL,  -- kept when the trip is deleted
  stamp_id      text NOT NULL,   -- library id ("MY-penang", "MY-country-2") or "ring"
  place         text NOT NULL,   -- label saved at collect time
  country_code  text,
  month         text NOT NULL,   -- "NOV 2026"
  collected_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, trip_id)   -- one stamp per traveller per trip
);
CREATE INDEX IF NOT EXISTS collected_stamps_account_idx ON collected_stamps (account_id, collected_at DESC);

-- ── Rules: read your own; all writes go through collect_stamp() ──
ALTER TABLE collected_stamps ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON collected_stamps FROM anon;
REVOKE INSERT, UPDATE, DELETE ON collected_stamps FROM authenticated;
GRANT SELECT ON collected_stamps TO authenticated;

DROP POLICY IF EXISTS "Owner reads own stamps" ON collected_stamps;
CREATE POLICY "Owner reads own stamps" ON collected_stamps
  FOR SELECT TO authenticated
  USING (account_id = (SELECT id FROM accounts WHERE auth_id = auth.uid()));

-- ── Collect ─────────────────────────────────────────────────────
-- Returns the saved stamp as JSON. Collecting again returns the stamp you
-- already have for that trip (nothing changes).
CREATE OR REPLACE FUNCTION collect_stamp(
  p_trip_id      uuid,
  p_stamp_id     text,
  p_place        text,
  p_country_code text,
  p_month        text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account uuid;
  v_end     date;
  v_mine    json;
BEGIN
  -- Plain assignments on purpose: the Supabase SQL Editor misreads the
  -- query-into-variable form as a new table and splices an RLS line in here.
  v_account := (SELECT id FROM accounts WHERE auth_id = auth.uid());
  IF v_account IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  -- On the trip with your own account (planner or member)
  IF NOT EXISTS (SELECT 1 FROM travellers WHERE trip_id = p_trip_id AND account_id = v_account)
     AND NOT EXISTS (SELECT 1 FROM trips WHERE id = p_trip_id AND planner_id = v_account) THEN
    RAISE EXCEPTION 'Not on this trip';
  END IF;

  -- Ended: the app shows Collect the day after the last day (traveller's local
  -- date). Local dates are at most one day ahead of UTC, so "last day is today
  -- or earlier in UTC" never blocks a traveller anywhere.
  v_end := (SELECT end_date FROM trips WHERE id = p_trip_id);
  IF v_end IS NULL OR v_end > (now() AT TIME ZONE 'utc')::date THEN
    RAISE EXCEPTION 'This trip hasn''t ended yet';
  END IF;

  -- Already collected → return it unchanged
  v_mine := (SELECT row_to_json(c) FROM collected_stamps c WHERE c.account_id = v_account AND c.trip_id = p_trip_id);
  IF v_mine IS NOT NULL THEN
    RETURN v_mine;
  END IF;

  -- Shape checks (the label is only ever shown to you)
  IF p_stamp_id IS NULL OR p_stamp_id !~ '^([A-Z]{2}-[a-z0-9-]{1,60}|ring)$' THEN
    RAISE EXCEPTION 'Unknown stamp';
  END IF;
  IF p_place IS NULL OR length(btrim(p_place)) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'Missing place';
  END IF;
  IF p_country_code IS NOT NULL AND p_country_code !~ '^[A-Z]{2}$' THEN
    RAISE EXCEPTION 'Bad country code';
  END IF;
  IF p_month IS NULL OR p_month !~ '^[A-Z]{3} [0-9]{4}$' THEN
    RAISE EXCEPTION 'Bad month';
  END IF;

  INSERT INTO collected_stamps (account_id, trip_id, stamp_id, place, country_code, month)
  VALUES (v_account, p_trip_id, p_stamp_id, btrim(p_place), p_country_code, p_month)
  ON CONFLICT (account_id, trip_id) DO NOTHING;  -- two taps at once: the first one wins

  RETURN (SELECT row_to_json(c) FROM collected_stamps c WHERE c.account_id = v_account AND c.trip_id = p_trip_id);
END;
$$;
REVOKE EXECUTE ON FUNCTION collect_stamp(uuid, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION collect_stamp(uuid, text, text, text, text) TO authenticated;
