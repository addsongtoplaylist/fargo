"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/account";
import { getMyTrips } from "@/lib/actions/trip";
import { todayForCountry } from "@/lib/dates";
import { countryCode } from "@/lib/country-code";
import { computePassport, type CollectedRow, type PassportStats } from "@/lib/passport";

/** Passport stats for the signed-in traveller (v0.5.6): trips you're on + stamps you've collected (v0.5.17). */
export async function getPassport(): Promise<{ stats: PassportStats; hasTrips: boolean } | null> {
  const account = await getOrCreateAccount();
  if (!account) return null;

  const { active, upcoming, past } = await getMyTrips();
  const trips = [...active, ...upcoming, ...past];

  // Destination country + location aren't in get_my_trips: one extra read, normal trip rules
  const supabase = await createClient();
  type Place = {
    id: string;
    destination_country_code: string | null;
    destination_lat: number | null;
    destination_lng: number | null;
    base_city: string | null;
    base_lat: number | null;
    base_lng: number | null;
  };
  const places = new Map<string, Place>();
  const [placeRows, collectedRows] = await Promise.all([
    trips.length > 0
      ? supabase
          .from("trips")
          .select("id, destination_country_code, destination_lat, destination_lng, base_city, base_lat, base_lng")
          .in("id", trips.map((t) => t.id))
      : Promise.resolve({ data: [] }),
    // Your own stamps only (RLS), including trips you've since left or that were deleted
    supabase.from("collected_stamps").select("stamp_id, trip_id, place, country_code, month, collected_at"),
  ]);
  for (const p of (placeRows.data ?? []) as Place[]) places.set(p.id, p);
  const num = (v: unknown) => (v == null ? null : Number(v));

  const stats = computePassport(
    trips.map((t) => {
      const p = places.get(t.id);
      return {
        id: t.id,
        name: t.name,
        destination: t.destination,
        countryCode: (p?.destination_country_code || countryCode(t.destination))?.toUpperCase() ?? null,
        baseCity: p?.base_city ?? null,
        lat: p?.destination_lat != null ? Number(p.destination_lat) : null,
        lng: p?.destination_lng != null ? Number(p.destination_lng) : null,
        baseLat: num(p?.base_lat),
        baseLng: num(p?.base_lng),
        start_date: t.start_date,
        end_date: t.end_date,
        travellers: t.travellers ?? [],
      };
    }),
    {
      accountId: account.id,
      homeCountryCode: account.home_country_code ?? null,
      collected: (collectedRows.data ?? []) as CollectedRow[],
    },
    todayForCountry(account.home_country_code)
  );

  return { stats, hasTrips: trips.length > 0 };
}
