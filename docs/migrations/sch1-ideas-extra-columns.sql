-- SCH-1: Add columns to ideas table so demoted activities preserve their data
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS time text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'misc',
  ADD COLUMN IF NOT EXISTS place_name text,
  ADD COLUMN IF NOT EXISTS place_lat text,
  ADD COLUMN IF NOT EXISTS place_lng text;
