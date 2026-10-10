-- Test for 20261010_security_e.sql — SAVES NOTHING.
-- Acts as a trip's planner (prefers "Test trip"), tries the blocked and the
-- allowed edits, then always ends with an error whose message is the result,
-- which undoes every test change. Expected after the fix: all PASS.
-- (Run it before the fix too, if you like: T0, T1, T3, T5 then show FAIL.)

DO $$
DECLARE
  v_trip uuid; v_code text; v_planner_auth uuid; v_planner_acc uuid; v_stranger uuid;
  v_id uuid; v_json json; v_ids text[]; v_out text := '';
BEGIN
  SELECT t.id, t.invite_code, a.auth_id, a.id INTO v_trip, v_code, v_planner_auth, v_planner_acc
  FROM trips t JOIN accounts a ON a.id = t.planner_id
  ORDER BY (t.name ILIKE 'test trip%') DESC, (t.invite_code IS NOT NULL) DESC, t.created_at
  LIMIT 1;
  SELECT id INTO v_stranger FROM accounts WHERE id <> v_planner_acc LIMIT 1;
  IF v_trip IS NULL OR v_stranger IS NULL THEN
    RAISE EXCEPTION 'RESULTS: needs one trip and at least two accounts';
  END IF;

  v_out := CASE WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'travellers_guard_account_link')
                THEN 'T0 PASS check installed' ELSE 'T0 FAIL check not installed' END;

  -- Become that trip's planner, signed in through the app
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_planner_auth, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;

  BEGIN  -- T1: put someone else's account on the trip
    INSERT INTO travellers (trip_id, display_name, role, account_id) VALUES (v_trip, 'Guard test', 'member', v_stranger);
    v_out := v_out || ' | T1 FAIL planner added another account';
  EXCEPTION WHEN OTHERS THEN
    v_out := v_out || CASE WHEN SQLERRM LIKE 'You can only add yourself%'
                           THEN ' | T1 PASS adding another account blocked' ELSE ' | T1 ? ' || SQLERRM END;
  END;

  BEGIN  -- T2: name-only traveller (normal planner action)
    INSERT INTO travellers (trip_id, display_name, role, account_id) VALUES (v_trip, 'Guard test', 'member', NULL)
    RETURNING id INTO v_id;
    v_out := v_out || ' | T2 PASS name-only traveller allowed';

    BEGIN  -- T3: link that name to someone else's account
      UPDATE travellers SET account_id = v_stranger WHERE id = v_id;
      v_out := v_out || ' | T3 FAIL planner linked another account';
    EXCEPTION WHEN OTHERS THEN
      v_out := v_out || CASE WHEN SQLERRM LIKE 'You can only add yourself%'
                             THEN ' | T3 PASS linking another account blocked' ELSE ' | T3 ? ' || SQLERRM END;
    END;

    UPDATE travellers SET display_name = 'Guard test renamed' WHERE id = v_id;  -- T4: rename
    v_out := v_out || ' | T4 PASS renaming allowed';
  EXCEPTION WHEN OTHERS THEN
    v_out := v_out || ' | T2/T4 FAIL ' || SQLERRM;
  END;

  IF v_code IS NULL THEN
    v_out := v_out || ' | T5/T6 skipped (trip has no invite link)';
  ELSE
    -- T5: invite preview signed in shows only your own account id
    v_json := get_trip_by_invite(v_code);
    SELECT array_agg(x->>'account_id') FILTER (WHERE x->>'account_id' IS NOT NULL) INTO v_ids
    FROM json_array_elements(v_json->'travellers') x;
    v_out := v_out || CASE WHEN COALESCE(v_ids, '{}') <@ ARRAY[v_planner_acc::text]
                           THEN ' | T5 PASS signed-in sees only own id' ELSE ' | T5 FAIL other ids visible' END;

    -- T6: signed out sees no ids
    RESET ROLE;
    PERFORM set_config('request.jwt.claims', '{"role":"anon"}', true);
    SET LOCAL ROLE anon;
    v_json := get_trip_by_invite(v_code);
    v_out := v_out || CASE WHEN NOT EXISTS (SELECT 1 FROM json_array_elements(v_json->'travellers') x WHERE x->>'account_id' IS NOT NULL)
                           THEN ' | T6 PASS signed-out sees no ids' ELSE ' | T6 FAIL signed-out sees ids' END;
  END IF;

  RAISE EXCEPTION 'RESULTS (nothing was saved): %', v_out;
END $$;
