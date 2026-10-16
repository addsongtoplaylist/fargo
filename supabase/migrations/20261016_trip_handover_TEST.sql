-- Test for 20261016_trip_handover.sql — SAVES NOTHING.
-- Uses "Test trip" (falls back to the oldest trip whose planner has an account)
-- and always ends with an error whose message is the result, which undoes
-- every test change. Expected: all PASS (some may say skipped if the trip has
-- no member with an account or no name-only traveller).

DO $$
DECLARE
  v_trip uuid; v_planner_acc uuid; v_planner_auth uuid;
  v_member uuid; v_member_acc uuid; v_member_auth uuid;
  v_nameonly uuid; v_in_expense uuid; v_old_tr uuid;
  v_n int; v_out text := '';
BEGIN
  -- Plain assignments on purpose (the Supabase SQL Editor misreads the query-into-variable form)
  v_trip := (SELECT t.id FROM trips t JOIN accounts a ON a.id = t.planner_id
             ORDER BY (t.name ILIKE 'test trip%') DESC, t.created_at LIMIT 1);
  v_planner_acc := (SELECT planner_id FROM trips WHERE id = v_trip);
  v_planner_auth := (SELECT auth_id FROM accounts WHERE id = v_planner_acc);
  v_member := (SELECT id FROM travellers WHERE trip_id = v_trip AND account_id IS NOT NULL
                 AND account_id <> v_planner_acc ORDER BY created_at LIMIT 1);
  v_member_acc := (SELECT account_id FROM travellers WHERE id = v_member);
  v_member_auth := (SELECT auth_id FROM accounts WHERE id = v_member_acc);
  v_nameonly := (SELECT id FROM travellers WHERE trip_id = v_trip AND account_id IS NULL LIMIT 1);
  v_in_expense := (SELECT p.traveller_id FROM expense_participants p JOIN expenses e ON e.id = p.expense_id
                    WHERE e.trip_id = v_trip LIMIT 1);
  v_old_tr := (SELECT id FROM travellers WHERE trip_id = v_trip AND account_id = v_planner_acc);
  IF v_trip IS NULL OR v_planner_auth IS NULL THEN
    RAISE EXCEPTION 'RESULTS: needs a trip whose planner has an account';
  END IF;
  v_out := 'trip ' || (SELECT name FROM trips WHERE id = v_trip);

  -- T0: installed
  v_out := v_out || CASE WHEN (SELECT count(*) FROM pg_constraint
                                WHERE conname IN ('expense_participants_traveller_id_fkey',
                                                  'expenses_paid_by_fkey', 'expenses_created_by_fkey')
                                  AND condeferrable AND condeferred) = 3
                          AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'hand_over_and_leave' AND prosecdef)
                         THEN ' | T0 PASS installed' ELSE ' | T0 FAIL not installed' END;

  -- T1: the planner can delete the whole trip (expenses and all)
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_planner_auth, 'role', 'authenticated')::text, true);
  BEGIN
    SET LOCAL ROLE authenticated;
    DELETE FROM trips WHERE id = v_trip;
    SET CONSTRAINTS ALL IMMEDIATE;   -- run the end-of-transaction checks now
    RESET ROLE;
    v_n := (SELECT count(*) FROM travellers WHERE trip_id = v_trip);
    RAISE EXCEPTION 'T1_DONE %', v_n;  -- undo the delete
  EXCEPTION WHEN OTHERS THEN
    RESET ROLE;
    v_out := v_out || CASE WHEN SQLERRM = 'T1_DONE 0' THEN ' | T1 PASS trip deletes'
                           ELSE ' | T1 FAIL ' || SQLERRM END;
  END;
  SET CONSTRAINTS ALL DEFERRED;

  -- T2: removing one traveller who's in an expense is still refused
  IF v_in_expense IS NULL THEN
    v_out := v_out || ' | T2 skipped (trip has no expenses)';
  ELSE
    BEGIN
      DELETE FROM travellers WHERE id = v_in_expense;
      SET CONSTRAINTS ALL IMMEDIATE;
      v_out := v_out || ' | T2 FAIL traveller in expenses was removed';
      RAISE EXCEPTION 'undo';
    EXCEPTION
      WHEN foreign_key_violation THEN v_out := v_out || ' | T2 PASS traveller in expenses kept';
      WHEN OTHERS THEN IF SQLERRM <> 'undo' THEN v_out := v_out || ' | T2 ? ' || SQLERRM; END IF;
    END;
    SET CONSTRAINTS ALL DEFERRED;
  END IF;

  -- T3: a member can't hand over
  IF v_member IS NULL THEN
    v_out := v_out || ' | T3 skipped (no member with an account)';
  ELSE
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_member_auth, 'role', 'authenticated')::text, true);
    SET LOCAL ROLE authenticated;
    BEGIN
      PERFORM hand_over_and_leave(v_trip, v_member);
      v_out := v_out || ' | T3 FAIL member handed over';
    EXCEPTION WHEN OTHERS THEN
      v_out := v_out || CASE WHEN SQLERRM LIKE 'Only the planner%' THEN ' | T3 PASS member blocked' ELSE ' | T3 ? ' || SQLERRM END;
    END;
    RESET ROLE;
  END IF;

  -- T4: can't hand over to a name-only traveller
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_planner_auth, 'role', 'authenticated')::text, true);
  IF v_nameonly IS NULL THEN
    v_out := v_out || ' | T4 skipped (no name-only traveller)';
  ELSE
    SET LOCAL ROLE authenticated;
    BEGIN
      PERFORM hand_over_and_leave(v_trip, v_nameonly);
      v_out := v_out || ' | T4 FAIL handed to name-only';
    EXCEPTION WHEN OTHERS THEN
      v_out := v_out || CASE WHEN SQLERRM LIKE 'Pick someone%' THEN ' | T4 PASS name-only blocked' ELSE ' | T4 ? ' || SQLERRM END;
    END;
    RESET ROLE;
  END IF;

  -- T5: planner hands over to a member and leaves
  IF v_member IS NULL THEN
    v_out := v_out || ' | T5 skipped (no member with an account)';
  ELSE
    SET LOCAL ROLE authenticated;
    BEGIN
      PERFORM hand_over_and_leave(v_trip, v_member);
      SET CONSTRAINTS ALL IMMEDIATE;
      RESET ROLE;
      v_out := v_out || CASE
        WHEN (SELECT planner_id FROM trips WHERE id = v_trip) = v_member_acc
         AND (SELECT role::text FROM travellers WHERE id = v_member) = 'planner'
         AND NOT EXISTS (SELECT 1 FROM travellers WHERE trip_id = v_trip AND account_id = v_planner_acc)
         AND (v_old_tr IS NULL
              OR NOT EXISTS (SELECT 1 FROM travellers WHERE id = v_old_tr)
              OR (SELECT role::text FROM travellers WHERE id = v_old_tr) = 'member')
        THEN ' | T5 PASS handed over ('
             || CASE WHEN EXISTS (SELECT 1 FROM travellers WHERE id = v_old_tr)
                     THEN 'old planner kept as name-only' ELSE 'old planner removed' END || ')'
        ELSE ' | T5 FAIL state wrong after handover' END;
    EXCEPTION WHEN OTHERS THEN
      RESET ROLE;
      v_out := v_out || ' | T5 FAIL ' || SQLERRM;
    END;
  END IF;

  -- T6: signed out can't call it
  v_out := v_out || CASE WHEN has_function_privilege('anon', 'hand_over_and_leave(uuid, uuid)', 'EXECUTE')
                         THEN ' | T6 FAIL signed-out can call' ELSE ' | T6 PASS signed-out blocked' END;

  RAISE EXCEPTION 'RESULTS: %', v_out;
END;
$$;
