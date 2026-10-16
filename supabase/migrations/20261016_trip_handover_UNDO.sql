-- UNDO for 20261016_trip_handover.sql — only if v0.6.2 has to be rolled back.
-- Deploy the previous app version (v0.6.1) FIRST, then run this.
-- Handovers already done stay done. Deleting a trip with expenses fails again.

BEGIN;

DROP FUNCTION IF EXISTS hand_over_and_leave(uuid, uuid);

ALTER TABLE expense_participants
  ALTER CONSTRAINT expense_participants_traveller_id_fkey NOT DEFERRABLE;
ALTER TABLE expenses
  ALTER CONSTRAINT expenses_paid_by_fkey NOT DEFERRABLE;
ALTER TABLE expenses
  ALTER CONSTRAINT expenses_created_by_fkey NOT DEFERRABLE;

COMMIT;
