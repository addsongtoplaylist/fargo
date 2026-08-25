-- BUG-5: Add "member" to traveller_role enum so joinTripByInviteCode works
ALTER TYPE traveller_role ADD VALUE IF NOT EXISTS 'member';
