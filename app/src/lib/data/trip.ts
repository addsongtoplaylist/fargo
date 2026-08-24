import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Cached trip data fetch — persists across requests via Vercel Data Cache.
 * Keyed by trip ID, tagged for targeted invalidation on mutations.
 * Auth is handled separately by the caller.
 */
export function getCachedTrip(tripId: string) {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("trips")
        .select("*, travellers(*)")
        .eq("id", tripId)
        .single();

      return data;
    },
    [`trip-${tripId}`],
    {
      tags: [`trip-${tripId}`],
      revalidate: 60, // 60 seconds — short enough that stale data self-heals
    }
  )();
}

/**
 * Cached trip list for a specific account.
 * Tagged per-account so creating/joining a trip invalidates just that user's list.
 */
export function getCachedMyTrips(accountId: string) {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      const today = new Date().toISOString().split("T")[0];

      const { data: memberships } = await supabase
        .from("travellers")
        .select("trip_id")
        .eq("account_id", accountId);

      if (!memberships || memberships.length === 0) {
        return { active: null, upcoming: [], past: [] };
      }

      const tripIds = memberships.map((m) => m.trip_id);

      const { data: trips } = await supabase
        .from("trips")
        .select("*, travellers(*)")
        .in("id", tripIds)
        .order("start_date", { ascending: true });

      if (!trips) return { active: null, upcoming: [], past: [] };

      const active = trips.find(
        (t) => t.start_date <= today && t.end_date >= today
      );
      const upcoming = trips.filter((t) => t.start_date > today);
      const past = trips.filter((t) => t.end_date < today && t !== active);

      return { active: active || null, upcoming, past };
    },
    [`my-trips-${accountId}`],
    {
      tags: [`my-trips-${accountId}`],
      revalidate: 60,
    }
  )();
}
