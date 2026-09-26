-- Record "We are Riize" as settled (settled in real life). Run AFTER v0.4.2
-- is live. Step 1 is a read-only preview; run step 2 only if it looks right.

-- ── Step 1 · Preview (read-only) ────────────────────────────
-- Each traveller's balance on the trip: + is owed, − owes.
SELECT t.name AS trip, tr.display_name,
       coalesce(paid.total, 0) - coalesce(owed.total, 0) AS balance
FROM trips t
JOIN travellers tr ON tr.trip_id = t.id
LEFT JOIN (SELECT paid_by, sum(amount) AS total FROM expenses GROUP BY 1) paid ON paid.paid_by = tr.id
LEFT JOIN (SELECT traveller_id, sum(share) AS total FROM expense_participants GROUP BY 1) owed ON owed.traveller_id = tr.id
WHERE t.name ILIKE 'We are Ri%'
ORDER BY balance;

-- ── Step 2 · Record the settlements ─────────────────────────
-- Fewest payments (largest debtor pays largest creditor), dated the trip's
-- last day. Stops if the name matches more or fewer than one trip.
DO $$
DECLARE
  v_trip trips%ROWTYPE;
  v_n int;
  d record;
  c record;
  v_pay numeric;
  v_id uuid;
BEGIN
  SELECT count(*) INTO v_n FROM trips WHERE name ILIKE 'We are Ri%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one "We are Ri…" trip, found %', v_n;
  END IF;
  SELECT * INTO v_trip FROM trips WHERE name ILIKE 'We are Ri%';

  PERFORM set_config('fargo.via_rpc', 'on', true);

  CREATE TEMP TABLE bal ON COMMIT DROP AS
    SELECT tr.id, tr.created_at,
           (coalesce((SELECT sum(amount) FROM expenses WHERE paid_by = tr.id), 0)
          - coalesce((SELECT sum(share) FROM expense_participants WHERE traveller_id = tr.id), 0)) AS b
    FROM travellers tr WHERE tr.trip_id = v_trip.id;

  LOOP
    SELECT * INTO d FROM bal WHERE b < 0 ORDER BY b ASC, created_at LIMIT 1;
    SELECT * INTO c FROM bal WHERE b > 0 ORDER BY b DESC, created_at LIMIT 1;
    EXIT WHEN d.id IS NULL OR c.id IS NULL;

    v_pay := least(-d.b, c.b);

    INSERT INTO expenses (trip_id, date, title, category, amount, amount_myr, paid_by,
                          is_shared, kind, split_type, created_by)
    VALUES (v_trip.id, v_trip.end_date, 'Settle up', 'misc', v_pay,
            round(v_pay / nullif(v_trip.fx_rate, 0), 2), d.id, false, 'settlement', 'amount', d.id)
    RETURNING id INTO v_id;
    INSERT INTO expense_participants (expense_id, traveller_id, weight, share)
    VALUES (v_id, c.id, v_pay, v_pay);

    UPDATE bal SET b = b + v_pay WHERE id = d.id;
    UPDATE bal SET b = b - v_pay WHERE id = c.id;
    d := NULL; c := NULL;
  END LOOP;
END $$;

-- Re-run step 1 afterwards: every balance should be 0.
