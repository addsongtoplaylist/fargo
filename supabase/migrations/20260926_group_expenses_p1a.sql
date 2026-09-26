-- GROUP EXPENSES — Phase 1, part A (see docs/EXPENSES.md §10)
-- Run in the Supabase SQL Editor BEFORE deploying PWA v0.4.0.
--
-- Additive only: no existing column is changed or removed, and both the
-- PWA and the native app keep working as today. Everything runs in one
-- transaction — if any statement fails, nothing is applied.

BEGIN;

-- ── 0. Backup ───────────────────────────────────────────────
-- Copy of expenses as they are right now. RLS on with no policies, so the
-- API can't read it — only the SQL Editor can.
CREATE TABLE expenses_backup_20260926 AS TABLE expenses;
ALTER TABLE expenses_backup_20260926 ENABLE ROW LEVEL SECURITY;

-- ── 1. Types ────────────────────────────────────────────────
CREATE TYPE expense_kind AS ENUM ('expense', 'settlement');
CREATE TYPE split_type AS ENUM ('equal', 'shares', 'percent', 'amount');

-- ── 2. New columns ──────────────────────────────────────────
ALTER TABLE expenses
  ADD COLUMN kind expense_kind NOT NULL DEFAULT 'expense',
  ADD COLUMN split_type split_type NOT NULL DEFAULT 'equal',
  ADD COLUMN created_by uuid REFERENCES travellers(id);   -- who logged it (D8)

ALTER TABLE travellers
  ADD COLUMN default_shares integer NOT NULL DEFAULT 1 CHECK (default_shares > 0);

-- ── 3. Participants ─────────────────────────────────────────
CREATE TABLE expense_participants (
  expense_id   uuid NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  traveller_id uuid NOT NULL REFERENCES travellers(id),   -- NO ACTION: see §4
  weight       numeric(12,2) NOT NULL CHECK (weight >= 0), -- what was entered
  share        numeric(12,2) NOT NULL,                     -- computed, local currency
  PRIMARY KEY (expense_id, traveller_id)
);
CREATE INDEX idx_expense_participants_traveller ON expense_participants(traveller_id);

-- Everyone on the trip can read; writes only through the functions below.
ALTER TABLE expense_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trip travellers can read participants" ON expense_participants
  FOR SELECT USING (
    expense_id IN (
      SELECT e.id FROM expenses e
      WHERE e.trip_id IN (
        SELECT tr.trip_id FROM travellers tr
        JOIN accounts a ON a.id = tr.account_id
        WHERE a.auth_id = auth.uid()
      )
    )
  );
REVOKE ALL ON expense_participants FROM anon;
REVOKE INSERT, UPDATE, DELETE ON expense_participants FROM authenticated;

-- ── 4. Stop silent deletes ──────────────────────────────────
-- paid_by was ON DELETE CASCADE: removing a traveller deleted every expense
-- they paid. NO ACTION (not RESTRICT) so deleting a whole trip still works.
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_paid_by_fkey;
ALTER TABLE expenses
  ADD CONSTRAINT expenses_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES travellers(id);

-- ── 5. Share calculation (D3, D26) ──────────────────────────
-- p_parts: [{"traveller_id": uuid, "weight": number}, ...] in list order.
-- Equal ignores weights. Leftover cents go to participants in list order,
-- so shares always add up to the amount exactly.
CREATE OR REPLACE FUNCTION fx_compute_shares(
  p_amount numeric, p_split split_type, p_parts jsonb
)
RETURNS TABLE (traveller_id uuid, weight numeric, share numeric)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_n int;
  v_distinct int;
  v_total numeric;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be more than zero';
  END IF;
  IF p_parts IS NULL OR jsonb_typeof(p_parts) <> 'array' OR jsonb_array_length(p_parts) = 0 THEN
    RAISE EXCEPTION 'Pick at least one person to split with';
  END IF;

  SELECT count(*), count(DISTINCT (e->>'traveller_id')),
         sum(CASE WHEN p_split = 'equal' THEN 1 ELSE coalesce((e->>'weight')::numeric, 0) END)
    INTO v_n, v_distinct, v_total
    FROM jsonb_array_elements(p_parts) e;

  IF v_n <> v_distinct THEN
    RAISE EXCEPTION 'Someone is in the split twice';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_parts) e
             WHERE p_split <> 'equal' AND coalesce((e->>'weight')::numeric, 0) < 0) THEN
    RAISE EXCEPTION 'Split values can''t be negative';
  END IF;
  IF v_total <= 0 THEN
    RAISE EXCEPTION 'The split adds up to nothing';
  END IF;
  IF p_split = 'percent' AND v_total <> 100 THEN
    RAISE EXCEPTION 'Percentages must add up to 100 (now %)', v_total;
  END IF;
  IF p_split = 'amount' AND round(v_total, 2) <> round(p_amount, 2) THEN
    RAISE EXCEPTION 'Amounts must add up to % (now %)', p_amount, v_total;
  END IF;

  RETURN QUERY
  WITH p AS (
    SELECT (e->>'traveller_id')::uuid AS tid,
           CASE WHEN p_split = 'equal' THEN 1::numeric
                ELSE coalesce((e->>'weight')::numeric, 0) END AS w,
           ord
    FROM jsonb_array_elements(p_parts) WITH ORDINALITY AS x(e, ord)
  ),
  b AS (
    SELECT tid, w, ord,
           CASE WHEN p_split = 'amount' THEN round(w * 100)::bigint
                ELSE floor(round(p_amount * 100) * w / v_total)::bigint END AS base
    FROM p
  ),
  l AS (SELECT round(p_amount * 100)::bigint - sum(base) AS left_c FROM b),
  r AS (SELECT tid, row_number() OVER (ORDER BY ord) AS rn FROM b WHERE w > 0)
  SELECT b.tid,
         CASE WHEN p_split = 'equal' THEN 1::numeric ELSE b.w END,
         ((b.base + CASE WHEN r.rn IS NOT NULL AND r.rn <= l.left_c THEN 1 ELSE 0 END) / 100.0)::numeric(12,2)
  FROM b
  LEFT JOIN r ON r.tid = b.tid
  CROSS JOIN l
  ORDER BY b.ord;
END;
$$;

-- ── 6. Default participants for old-style expenses (D15) ─────
-- Shared → everyone on the trip (in join order); solo → payer only.
CREATE OR REPLACE FUNCTION fx_apply_default_participants(p_expense_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v expenses%ROWTYPE;
  v_parts jsonb;
BEGIN
  SELECT * INTO v FROM expenses WHERE id = p_expense_id;
  IF NOT FOUND OR v.kind <> 'expense' THEN RETURN; END IF;

  IF v.is_shared THEN
    SELECT jsonb_agg(jsonb_build_object('traveller_id', id) ORDER BY created_at, id)
      INTO v_parts FROM travellers WHERE trip_id = v.trip_id;
  ELSE
    v_parts := jsonb_build_array(jsonb_build_object('traveller_id', v.paid_by));
  END IF;

  DELETE FROM expense_participants WHERE expense_id = p_expense_id;
  INSERT INTO expense_participants (expense_id, traveller_id, weight, share)
    SELECT p_expense_id, s.traveller_id, s.weight, s.share
    FROM fx_compute_shares(v.amount, 'equal', v_parts) s;
END;
$$;

-- ── 7. Backfill every existing expense ──────────────────────
UPDATE expenses SET created_by = paid_by WHERE created_by IS NULL;
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM expenses LOOP
    PERFORM fx_apply_default_participants(r.id);
  END LOOP;
END $$;

-- ── 8. Compatibility trigger (native app + old PWA code) ────
-- Writes that don't come through save_expense (they don't set
-- fargo.via_rpc) get created_by and participants filled in automatically.
CREATE OR REPLACE FUNCTION fx_expenses_legacy_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := NEW.paid_by;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fx_expenses_legacy_after_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(current_setting('fargo.via_rpc', true), '') <> 'on' AND NEW.kind = 'expense' THEN
    PERFORM fx_apply_default_participants(NEW.id);
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER expenses_legacy_before_insert
  BEFORE INSERT ON expenses
  FOR EACH ROW EXECUTE FUNCTION fx_expenses_legacy_before_insert();

CREATE TRIGGER expenses_legacy_after_write
  AFTER INSERT OR UPDATE OF amount, is_shared, paid_by ON expenses
  FOR EACH ROW EXECUTE FUNCTION fx_expenses_legacy_after_write();

-- ── 9. save_expense / delete_expense ────────────────────────
-- The checked way to write expenses. Any traveller with an account can
-- log (D1); edit/delete only what you logged, or anything as planner (D8).
CREATE OR REPLACE FUNCTION save_expense(
  p_trip_id uuid,
  p_expense_id uuid,          -- null = new expense
  p_date date,
  p_title text,
  p_category text,
  p_amount numeric,           -- local currency
  p_paid_by uuid,
  p_split_type text,
  p_participants jsonb,       -- [{"traveller_id": uuid, "weight": number}]
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid;
  v_is_planner boolean;
  v_fx numeric;
  v_split split_type;
  v_id uuid;
  v_existing expenses%ROWTYPE;
  v_count int;
BEGIN
  -- Caller's traveller row on this trip
  SELECT tr.id, (t.planner_id = a.id), t.fx_rate
    INTO v_me, v_is_planner, v_fx
    FROM travellers tr
    JOIN accounts a ON a.id = tr.account_id
    JOIN trips t ON t.id = tr.trip_id
   WHERE tr.trip_id = p_trip_id AND a.auth_id = auth.uid();
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'You are not on this trip';
  END IF;

  IF p_expense_id IS NOT NULL THEN
    SELECT * INTO v_existing FROM expenses WHERE id = p_expense_id AND trip_id = p_trip_id;
    IF NOT FOUND OR v_existing.kind <> 'expense' THEN
      RAISE EXCEPTION 'Expense not found';
    END IF;
    IF v_existing.created_by IS DISTINCT FROM v_me AND NOT v_is_planner THEN
      RAISE EXCEPTION 'You can only edit expenses you logged';
    END IF;
  END IF;

  IF p_title IS NULL OR length(trim(p_title)) = 0 OR length(p_title) > 200 THEN
    RAISE EXCEPTION 'Enter what the expense was for';
  END IF;
  IF p_notes IS NOT NULL AND length(p_notes) > 1000 THEN
    RAISE EXCEPTION 'Notes are too long';
  END IF;
  v_split := p_split_type::split_type;

  -- Payer and every participant must be on this trip
  IF NOT EXISTS (SELECT 1 FROM travellers WHERE id = p_paid_by AND trip_id = p_trip_id) THEN
    RAISE EXCEPTION 'The payer is not on this trip';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(coalesce(p_participants, '[]'::jsonb)) e
    WHERE NOT EXISTS (SELECT 1 FROM travellers tr
                      WHERE tr.id = (e->>'traveller_id')::uuid AND tr.trip_id = p_trip_id)
  ) THEN
    RAISE EXCEPTION 'Someone in the split is not on this trip';
  END IF;

  -- Our own participants below; stop the compatibility trigger adding defaults
  PERFORM set_config('fargo.via_rpc', 'on', true);

  v_count := jsonb_array_length(p_participants);

  IF p_expense_id IS NULL THEN
    INSERT INTO expenses (trip_id, date, title, category, amount, amount_myr, paid_by,
                          is_shared, notes, kind, split_type, created_by)
    VALUES (p_trip_id, p_date, trim(p_title), p_category::activity_category, p_amount,
            round(p_amount / nullif(v_fx, 0), 2), p_paid_by, v_count > 1, p_notes,
            'expense', v_split, v_me)
    RETURNING id INTO v_id;
  ELSE
    UPDATE expenses SET
      date = p_date, title = trim(p_title), category = p_category::activity_category,
      amount = p_amount, amount_myr = round(p_amount / nullif(v_fx, 0), 2),
      paid_by = p_paid_by, is_shared = v_count > 1, notes = p_notes,
      split_type = v_split, updated_at = now()
    WHERE id = p_expense_id
    RETURNING id INTO v_id;
  END IF;

  DELETE FROM expense_participants WHERE expense_id = v_id;
  INSERT INTO expense_participants (expense_id, traveller_id, weight, share)
    SELECT v_id, s.traveller_id, s.weight, s.share
    FROM fx_compute_shares(p_amount, v_split, p_participants) s;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION delete_expense(p_expense_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing expenses%ROWTYPE;
  v_me uuid;
  v_is_planner boolean;
BEGIN
  SELECT * INTO v_existing FROM expenses WHERE id = p_expense_id;
  IF NOT FOUND OR v_existing.kind <> 'expense' THEN
    RAISE EXCEPTION 'Expense not found';
  END IF;

  SELECT tr.id, (t.planner_id = a.id)
    INTO v_me, v_is_planner
    FROM travellers tr
    JOIN accounts a ON a.id = tr.account_id
    JOIN trips t ON t.id = tr.trip_id
   WHERE tr.trip_id = v_existing.trip_id AND a.auth_id = auth.uid();
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'You are not on this trip';
  END IF;
  IF v_existing.created_by IS DISTINCT FROM v_me AND NOT v_is_planner THEN
    RAISE EXCEPTION 'You can only delete expenses you logged';
  END IF;

  DELETE FROM expenses WHERE id = p_expense_id;  -- participants cascade
END;
$$;

-- ── 10. Who can call what ───────────────────────────────────
REVOKE EXECUTE ON FUNCTION fx_compute_shares(numeric, split_type, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION fx_apply_default_participants(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION fx_expenses_legacy_before_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION fx_expenses_legacy_after_write() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION save_expense(uuid, uuid, date, text, text, numeric, uuid, text, jsonb, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION delete_expense(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION save_expense(uuid, uuid, date, text, text, numeric, uuid, text, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_expense(uuid) TO authenticated;

COMMIT;
