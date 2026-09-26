-- Base city for weather (planner-set in Trip settings).
-- Run this in the Supabase SQL Editor BEFORE deploying v0.3.7 — saving
-- trip settings writes these columns.

ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS base_city text,
  ADD COLUMN IF NOT EXISTS base_lat double precision,
  ADD COLUMN IF NOT EXISTS base_lng double precision;
