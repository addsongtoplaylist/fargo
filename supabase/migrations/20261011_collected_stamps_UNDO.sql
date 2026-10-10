-- UNDO for 20261011_collected_stamps.sql — only if v0.5.17 has to be rolled back.
-- Deploy the previous app version (v0.5.16) FIRST, then run this.
-- Every collected stamp is lost (travellers would collect again after a redo).

DROP FUNCTION IF EXISTS collect_stamp(uuid, text, text, text, text);
DROP TABLE IF EXISTS collected_stamps;
