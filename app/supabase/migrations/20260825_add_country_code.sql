-- Add ISO country code for location search filtering
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS destination_country_code text;
