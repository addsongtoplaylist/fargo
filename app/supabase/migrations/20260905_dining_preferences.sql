-- Add dining preference columns to accounts for the Bites feature
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS dining_budget text NOT NULL DEFAULT 'moderate',
  ADD COLUMN IF NOT EXISTS dietary_restrictions text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cuisine_preferences text[] NOT NULL DEFAULT '{}';
