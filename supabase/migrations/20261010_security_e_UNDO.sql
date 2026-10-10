-- Undo 20261010_security_e.sql: removes the travellers check and restores the
-- invite preview from 20260927_group_expenses_p5.sql (every account_id returned).

DROP TRIGGER IF EXISTS travellers_guard_account_link ON travellers;
DROP FUNCTION IF EXISTS travellers_guard_account_link();

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
        'account_id', tr.account_id,
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
