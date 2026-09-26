-- GROUP EXPENSES — Phase 1A verification (read-only). Run after part A,
-- and again after deploying v0.4.0. Every row should say ok = true.

SELECT 'every expense has participants' AS check,
       count(*) = 0 AS ok, count(*) AS problems
  FROM expenses e
 WHERE e.kind = 'expense'
   AND NOT EXISTS (SELECT 1 FROM expense_participants p WHERE p.expense_id = e.id)
UNION ALL
SELECT 'shares add up to each amount',
       count(*) = 0, count(*)
  FROM expenses e
  JOIN (SELECT expense_id, sum(share) AS s FROM expense_participants GROUP BY 1) p
    ON p.expense_id = e.id
 WHERE p.s <> e.amount
UNION ALL
SELECT 'every expense has created_by',
       count(*) = 0, count(*)
  FROM expenses WHERE created_by IS NULL
UNION ALL
SELECT 'no expenses lost vs backup',
       (SELECT count(*) FROM expenses_backup_20260926 b
         WHERE NOT EXISTS (SELECT 1 FROM expenses e WHERE e.id = b.id)) = 0,
       (SELECT count(*) FROM expenses_backup_20260926 b
         WHERE NOT EXISTS (SELECT 1 FROM expenses e WHERE e.id = b.id))
UNION ALL
SELECT 'paid_by no longer cascades',
       NOT EXISTS (SELECT 1 FROM pg_constraint
                    WHERE conrelid = 'expenses'::regclass AND contype = 'f'
                      AND confdeltype = 'c'
                      AND conkey = ARRAY[(SELECT attnum FROM pg_attribute
                                          WHERE attrelid = 'expenses'::regclass AND attname = 'paid_by')]),
       NULL
UNION ALL
SELECT 'backup table not readable by the app',
       NOT has_table_privilege('anon', 'expenses_backup_20260926', 'SELECT')
         OR (SELECT relrowsecurity FROM pg_class WHERE relname = 'expenses_backup_20260926'),
       NULL;
