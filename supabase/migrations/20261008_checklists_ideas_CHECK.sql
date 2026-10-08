-- READ-ONLY check before 20261008_checklists_ideas.sql — changes nothing.
-- Shows which trips have old shared checklists. The migration copies each
-- of these to that trip's planner as their own personal lists.

SELECT
  t.name                       AS trip,
  a.name                       AS planner,
  COUNT(DISTINCT c.id)         AS lists,
  COUNT(ci.id)                 AS items
FROM checklists c
JOIN trips t     ON t.id = c.trip_id
JOIN accounts a  ON a.id = t.planner_id
LEFT JOIN checklist_items ci ON ci.checklist_id = c.id
GROUP BY t.name, a.name
ORDER BY t.name;
