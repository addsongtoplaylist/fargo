-- Phase 2: Ideas + Checklists
-- Run this in Supabase SQL Editor

-- Ideas
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  link TEXT,
  notes TEXT,
  promoted BOOLEAN NOT NULL DEFAULT false,
  promoted_activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  promoted_date TEXT,                     -- "Day 3" label stored on promote
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ideas_trip ON ideas(trip_id, sort_order);

-- Checklists
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_checklists_trip ON checklists(trip_id, sort_order);

-- Checklist items
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  assigned_to UUID REFERENCES travellers(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_checklist_items_list ON checklist_items(checklist_id, sort_order);

-- Row Level Security
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Policies: ideas
CREATE POLICY "Users can read ideas on own trips"
  ON ideas FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

CREATE POLICY "Users can insert ideas on own trips"
  ON ideas FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

CREATE POLICY "Users can update ideas on own trips"
  ON ideas FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

CREATE POLICY "Users can delete ideas on own trips"
  ON ideas FOR DELETE
  USING (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

-- Policies: checklists
CREATE POLICY "Users can read checklists on own trips"
  ON checklists FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

CREATE POLICY "Users can insert checklists on own trips"
  ON checklists FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

CREATE POLICY "Users can update checklists on own trips"
  ON checklists FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

CREATE POLICY "Users can delete checklists on own trips"
  ON checklists FOR DELETE
  USING (trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid())));

-- Policies: checklist_items (access through checklist → trip ownership)
CREATE POLICY "Users can read checklist items on own trips"
  ON checklist_items FOR SELECT
  USING (checklist_id IN (SELECT id FROM checklists WHERE trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid()))));

CREATE POLICY "Users can insert checklist items on own trips"
  ON checklist_items FOR INSERT
  WITH CHECK (checklist_id IN (SELECT id FROM checklists WHERE trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid()))));

CREATE POLICY "Users can update checklist items on own trips"
  ON checklist_items FOR UPDATE
  USING (checklist_id IN (SELECT id FROM checklists WHERE trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid()))));

CREATE POLICY "Users can delete checklist items on own trips"
  ON checklist_items FOR DELETE
  USING (checklist_id IN (SELECT id FROM checklists WHERE trip_id IN (SELECT id FROM trips WHERE planner_id IN (SELECT id FROM accounts WHERE auth_id = auth.uid()))));
