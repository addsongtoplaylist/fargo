-- Test for 20261011_collected_stamps.sql — SAVES NOTHING.
-- Uses a trip (prefers "Test trip") and one of its travellers with an account,
-- moves the trip's dates inside the test, collects as that traveller and as a
-- stranger, then always ends with an error whose message is the result, which
-- undoes every test change (dates and stamps). Expected: all PASS.

DO $$
DECLARE
  v_trip uuid; v_auth uuid; v_acc uuid; v_stranger_auth uuid;
  v_json json; v_n int; v_out text := '';
  v_today date := (now() AT TIME ZONE 'utc')::date;
BEGIN
  -- Plain assignments on purpose (the Supabase SQL Editor misreads the query-into-variable form)
  v_trip := (SELECT tr.trip_id FROM travellers tr JOIN trips t ON t.id = tr.trip_id
             WHERE tr.account_id IS NOT NULL
             ORDER BY (t.name ILIKE 'test trip%') DESC, t.created_at LIMIT 1);
  v_acc := (SELECT tr.account_id FROM travellers tr
            WHERE tr.trip_id = v_trip AND tr.account_id IS NOT NULL ORDER BY tr.created_at LIMIT 1);
  v_auth := (SELECT auth_id FROM accounts WHERE id = v_acc);
  v_stranger_auth := (SELECT a.auth_id FROM accounts a
    WHERE NOT EXISTS (SELECT 1 FROM travellers tr WHERE tr.trip_id = v_trip AND tr.account_id = a.id)
      AND NOT EXISTS (SELECT 1 FROM trips t WHERE t.id = v_trip AND t.planner_id = a.id)
    LIMIT 1);
  IF v_trip IS NULL OR v_auth IS NULL THEN
    RAISE EXCEPTION 'RESULTS: needs a trip with a traveller who has an account';
  END IF;

  -- T0: installed, rules on, stamps kept when a trip is deleted
  v_out := CASE WHEN to_regclass('public.collected_stamps') IS NOT NULL
                 AND (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.collected_stamps'::regclass)
                 AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'collect_stamp' AND prosecdef)
                 AND EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.collected_stamps'::regclass
                               AND confrelid = 'public.trips'::regclass AND confdeltype = 'n')
                THEN 'T0 PASS installed' ELSE 'T0 FAIL not installed' END;

  -- T1: trip still going → can't collect yet
  UPDATE trips SET start_date = v_today - 2, end_date = v_today + 3 WHERE id = v_trip;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_auth, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  BEGIN
    PERFORM collect_stamp(v_trip, 'MY-penang', 'Penang', 'MY', 'OCT 2026');
    v_out := v_out || ' | T1 FAIL collected before the trip ended';
  EXCEPTION WHEN OTHERS THEN
    v_out := v_out || CASE WHEN SQLERRM LIKE '%hasn''t ended%' THEN ' | T1 PASS not ended yet' ELSE ' | T1 ? ' || SQLERRM END;
  END;
  RESET ROLE;

  -- Trip ended yesterday
  UPDATE trips SET start_date = v_today - 5, end_date = v_today - 1 WHERE id = v_trip;
  SET LOCAL ROLE authenticated;

  BEGIN  -- T2: bad stamp id rejected
    PERFORM collect_stamp(v_trip, '<script>', 'Penang', 'MY', 'OCT 2026');
    v_out := v_out || ' | T2 FAIL bad stamp id accepted';
  EXCEPTION WHEN OTHERS THEN
    v_out := v_out || CASE WHEN SQLERRM = 'Unknown stamp' THEN ' | T2 PASS bad stamp id blocked' ELSE ' | T2 ? ' || SQLERRM END;
  END;

  BEGIN  -- T3: traveller collects
    v_json := collect_stamp(v_trip, 'MY-penang', 'Penang', 'MY', 'OCT 2026');
    v_out := v_out || CASE WHEN v_json->>'stamp_id' = 'MY-penang' THEN ' | T3 PASS collected' ELSE ' | T3 FAIL ' || v_json::text END;
  EXCEPTION WHEN OTHERS THEN
    v_out := v_out || ' | T3 FAIL ' || SQLERRM;
  END;

  BEGIN  -- T4: collecting again keeps the first stamp, no second row
    v_json := collect_stamp(v_trip, 'MY-country-1', 'Malaysia', 'MY', 'OCT 2026');
    v_n := (SELECT count(*) FROM collected_stamps WHERE trip_id = v_trip);
    v_out := v_out || CASE WHEN v_json->>'stamp_id' = 'MY-penang' AND v_n = 1
                           THEN ' | T4 PASS second tap changes nothing' ELSE ' | T4 FAIL ' || v_n || ' rows, ' || v_json::text END;
  EXCEPTION WHEN OTHERS THEN
    v_out := v_out || ' | T4 FAIL ' || SQLERRM;
  END;

  BEGIN  -- T5: no direct writes
    INSERT INTO collected_stamps (account_id, trip_id, stamp_id, place, month) VALUES (v_acc, NULL, 'ring', 'x', 'OCT 2026');
    v_out := v_out || ' | T5 FAIL direct insert allowed';
  EXCEPTION WHEN OTHERS THEN
    v_out := v_out || ' | T5 PASS direct insert blocked';
  END;
  RESET ROLE;

  IF v_stranger_auth IS NULL THEN
    v_out := v_out || ' | T6/T7 skipped (needs a second account)';
  ELSE
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_stranger_auth, 'role', 'authenticated')::text, true);
    SET LOCAL ROLE authenticated;
    BEGIN  -- T6: someone not on the trip can't collect
      PERFORM collect_stamp(v_trip, 'MY-penang', 'Penang', 'MY', 'OCT 2026');
      v_out := v_out || ' | T6 FAIL stranger collected';
    EXCEPTION WHEN OTHERS THEN
      v_out := v_out || CASE WHEN SQLERRM = 'Not on this trip' THEN ' | T6 PASS stranger blocked' ELSE ' | T6 ? ' || SQLERRM END;
    END;
    -- T7: and can't see the traveller's stamp
    v_n := (SELECT count(*) FROM collected_stamps WHERE trip_id = v_trip);
    v_out := v_out || CASE WHEN v_n = 0 THEN ' | T7 PASS others'' stamps hidden' ELSE ' | T7 FAIL stranger sees ' || v_n END;
    RESET ROLE;
  END IF;

  -- T8: signed out can't call it
  v_out := v_out || CASE WHEN has_function_privilege('anon', 'collect_stamp(uuid, text, text, text, text)', 'EXECUTE')
                         THEN ' | T8 FAIL signed-out can call' ELSE ' | T8 PASS signed-out blocked' END;

  RAISE EXCEPTION 'RESULTS: %', v_out;
END;
$$;
