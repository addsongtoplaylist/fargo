-- v0.5.11 · Security Batch E (docs/REVIEW.md E5, E2)
-- Run on STAGING first, then 20261010_security_e_TEST.sql there; then production.
-- Order with the app doesn't matter: both apps work before and after.
-- Undo: 20261010_security_e_UNDO.sql
--
-- E5 · Direct edits to travellers may only link YOURSELF to a trip.
--   The dashboard rule "Planners can manage travellers" let a planner insert
--   or update a traveller row with ANY account_id, i.e. put someone on their
--   trip without an invite. Rules (RLS) can't compare old and new values, so
--   a trigger checks it. Database functions (join by invite, claim a name,
--   change owner, unlink…) run as their owner, not as the signed-in role, so
--   they're not affected. Both apps only ever insert the creator themselves.
--
-- E2 · The invite preview (callable signed out) returned every traveller's
--   account_id. Now only the caller's own id comes back; everyone else's is
--   null. Both apps only compare it with the caller's id ("already on this
--   trip"), so they keep working. "claimed" still reflects every traveller.

-- ── E5 ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION travellers_guard_account_link()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Only direct API writes (signed-in or signed-out roles) are checked
  IF current_user IN ('authenticated', 'anon')
     AND NEW.account_id IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.account_id IS DISTINCT FROM OLD.account_id)
     AND NEW.account_id IS DISTINCT FROM (SELECT id FROM accounts WHERE auth_id = auth.uid())
  THEN
    RAISE EXCEPTION 'You can only add yourself to a trip. Use an invite link to add someone else.';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION travellers_guard_account_link() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS travellers_guard_account_link ON travellers;
CREATE TRIGGER travellers_guard_account_link
  BEFORE INSERT OR UPDATE OF account_id ON travellers
  FOR EACH ROW EXECUTE FUNCTION travellers_guard_account_link();

-- ── E2 ──────────────────────────────────────────────────────────
-- Same as 20260927_group_expenses_p5.sql, except account_id is the caller's only.
CREATE OR REPLACE FUNCTION get_trip_by_invite(p_code text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT json_build_object(
    'id', t.id,
    'name', t.name,
    'destination', t.destination,
    'start_date', t.start_date,
    'end_date', t.end_date,
    'travellers', COALESCE(
      (SELECT json_agg(json_build_object(
        'id', tr.id,
        'display_name', tr.display_name,
        'account_id', CASE
          WHEN tr.account_id = (SELECT id FROM accounts WHERE auth_id = auth.uid()) THEN tr.account_id
        END,
        'claimed', tr.account_id IS NOT NULL,
        'paid_count', (SELECT count(*) FROM expenses e WHERE e.paid_by = tr.id AND e.kind = 'expense'),
        'in_count', (SELECT count(*) FROM expense_participants p
                      JOIN expenses e ON e.id = p.expense_id
                     WHERE p.traveller_id = tr.id AND e.kind = 'expense')
      ) ORDER BY tr.created_at, tr.id)
      FROM travellers tr
      WHERE tr.trip_id = t.id),
      '[]'::json
    )
  )
  FROM trips t
  WHERE t.invite_code = p_code
  LIMIT 1;
$$;
-- Grants unchanged: stays callable signed out (invite preview)
