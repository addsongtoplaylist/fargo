-- GROUP EXPENSES — Phase 1A UNDO. Only if something goes wrong.
-- Puts the database back to how it was before part A. Existing expense
-- rows were never changed except for the new created_by column, which
-- this drops, so the backup is only a safety net.
-- If PWA v0.4.0 is already deployed, redeploy v0.3.8 first.

BEGIN;
DROP TRIGGER IF EXISTS expenses_legacy_after_write ON expenses;
DROP TRIGGER IF EXISTS expenses_legacy_before_insert ON expenses;
DROP FUNCTION IF EXISTS save_expense(uuid, uuid, date, text, text, numeric, uuid, text, jsonb, text);
DROP FUNCTION IF EXISTS delete_expense(uuid);
DROP FUNCTION IF EXISTS fx_expenses_legacy_after_write();
DROP FUNCTION IF EXISTS fx_expenses_legacy_before_insert();
DROP FUNCTION IF EXISTS fx_apply_default_participants(uuid);
DROP FUNCTION IF EXISTS fx_compute_shares(numeric, split_type, jsonb);
DROP TABLE IF EXISTS expense_participants;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_paid_by_fkey;
ALTER TABLE expenses
  ADD CONSTRAINT expenses_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES travellers(id) ON DELETE CASCADE;
ALTER TABLE expenses DROP COLUMN IF EXISTS created_by, DROP COLUMN IF EXISTS split_type, DROP COLUMN IF EXISTS kind;
ALTER TABLE travellers DROP COLUMN IF EXISTS default_shares;
DROP TYPE IF EXISTS split_type;
DROP TYPE IF EXISTS expense_kind;
-- Keep expenses_backup_20260926 until you're sure; drop it by hand later.
COMMIT;
