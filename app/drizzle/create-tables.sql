-- Fargo schema
-- Run this in Supabase SQL Editor

-- Enums
CREATE TYPE trip_status AS ENUM ('planning', 'active', 'completed');
CREATE TYPE trip_type AS ENUM ('free_and_easy', 'city_break', 'road_trip', 'beach_and_resort', 'adventure', 'business');
CREATE TYPE traveller_role AS ENUM ('planner', 'traveller');

-- Accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  home_currency TEXT NOT NULL DEFAULT 'MYR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trips
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  trip_type trip_type NOT NULL,
  local_currency TEXT NOT NULL,
  fx_rate NUMERIC(12,4) NOT NULL,
  status trip_status NOT NULL DEFAULT 'planning',
  planner_id UUID NOT NULL REFERENCES accounts(id),
  share_slug TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Travellers
CREATE TABLE travellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role traveller_role NOT NULL DEFAULT 'traveller',
  account_id UUID REFERENCES accounts(id),
  budget_total INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE travellers ENABLE ROW LEVEL SECURITY;

-- Policies: accounts
CREATE POLICY "Users can read own account"
  ON accounts FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "Users can update own account"
  ON accounts FOR UPDATE
  USING (auth_id = auth.uid());

CREATE POLICY "Users can insert own account"
  ON accounts FOR INSERT
  WITH CHECK (auth_id = auth.uid());

-- Policies: trips
CREATE POLICY "Users can read own trips"
  ON trips FOR SELECT
  USING (planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  WITH CHECK (planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  USING (planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  USING (planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid()));

-- Policies: travellers
CREATE POLICY "Users can read travellers on own trips"
  ON travellers FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

CREATE POLICY "Users can manage travellers on own trips"
  ON travellers FOR ALL
  USING (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));
