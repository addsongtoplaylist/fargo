-- Phase 2: Activities
-- Run this in Supabase SQL Editor

-- Category enum (shared by activities and expenses)
CREATE TYPE activity_category AS ENUM (
  'flights',
  'accommodation',
  'food',
  'transport',
  'activities',
  'shopping',
  'misc'
);

-- Activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT,                              -- "09:00" 24h format, nullable
  title TEXT NOT NULL,
  notes TEXT,
  category activity_category NOT NULL DEFAULT 'misc',
  cost NUMERIC(12,2),                     -- local currency, nullable
  cost_shared BOOLEAN NOT NULL DEFAULT false,
  place_name TEXT,
  place_lat NUMERIC(10,7),
  place_lng NUMERIC(10,7),
  sort_order INTEGER NOT NULL DEFAULT 0,
  idea_id UUID,                           -- FK added when ideas table exists
  expense_id UUID,                        -- FK added when expenses table exists
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fetching activities by trip (the primary query)
CREATE INDEX idx_activities_trip_date ON activities(trip_id, date, sort_order);

-- Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read activities on own trips"
  ON activities FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

CREATE POLICY "Users can insert activities on own trips"
  ON activities FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

CREATE POLICY "Users can update activities on own trips"
  ON activities FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

CREATE POLICY "Users can delete activities on own trips"
  ON activities FOR DELETE
  USING (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));
