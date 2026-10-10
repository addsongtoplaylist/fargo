-- OPTIONAL (REVIEW.md E4) — only run once you're sure you'll never need it.
-- expenses_backup_20260926 is the copy taken before the group-expenses change
-- (v0.4.0). Group expenses passed UAT; the table is locked (row security on,
-- no rules) so nobody can read it through the app, but it's no longer needed.
-- This can't be undone: download it first (Table Editor → Export) if unsure.

DROP TABLE IF EXISTS expenses_backup_20260926;
