-- Phase 3: Expenses
-- Run this in Supabase SQL Editor

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  category activity_category NOT NULL DEFAULT 'misc',
  amount NUMERIC(12,2) NOT NULL,          -- local currency
  amount_myr NUMERIC(12,2) NOT NULL,      -- derived from trip fx_rate
  paid_by UUID NOT NULL REFERENCES travellers(id) ON DELETE CASCADE,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_trip_date ON expenses(trip_id, date);

-- Now wire up the activity → expense FK
ALTER TABLE activities
  ADD CONSTRAINT fk_activities_expense
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE SET NULL;

-- Also wire up the activity → idea FK
ALTER TABLE activities
  ADD CONSTRAINT fk_activities_idea
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE SET NULL;

-- Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read expenses on own trips"
  ON expenses FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

CREATE POLICY "Users can insert expenses on own trips"
  ON expenses FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

CREATE POLICY "Users can update expenses on own trips"
  ON expenses FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

CREATE POLICY "Users can delete expenses on own trips"
  ON expenses FOR DELETE
  USING (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));
