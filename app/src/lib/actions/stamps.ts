"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/account";
import { todayForCountry } from "@/lib/dates";
import { countryCode } from "@/lib/country-code";
import { stampLabel, stampTrip } from "@/lib/passport";
import { chooseStamp, stampFile } from "@/lib/stamp-library";
import { tripIdSchema } from "@/lib/validations";

/**
 * Collecting stamps (STAMPS.md v2.2). The app picks the stamp (the library lives here) and the
 * database function collect_stamp() checks you're on the trip and it has ended, then saves it
 * once. The browser only sends the trip id — never which stamp.
 */

export type CollectedStamp = { stampId: string; file: string | null; place: string; month: string };

type StampTripRow = {
  id: string;
  destination: string;
  destination_country_code: string | null;
  base_city: string | null;
  base_lat: number | null;
  base_lng: number | null;
  start_date: string;
  end_date: string;
};

const num = (v: unknown) => (v == null ? null : Number(v));

function toTrip(t: StampTripRow) {
  const cc = (t.destination_country_code || countryCode(t.destination))?.toUpperCase() ?? null;
  return {
    id: t.id,
    destination: t.destination,
    countryCode: cc,
    baseCity: t.base_city,
    baseLat: num(t.base_lat),
    baseLng: num(t.base_lng),
    start_date: t.start_date,
  };
}

async function load(tripId: string) {
  const supabase = await createClient();
  const [{ data: trip }, { data: mine }] = await Promise.all([
    supabase
      .from("trips")
      .select("id, destination, destination_country_code, base_city, base_lat, base_lng, start_date, end_date")
      .eq("id", tripId)
      .maybeSingle(),
    supabase.from("collected_stamps").select("stamp_id, trip_id"),
  ]);
  return { supabase, trip: trip as StampTripRow | null, mine: (mine ?? []) as { stamp_id: string; trip_id: string | null }[] };
}

/**
 * For the trip overview: the stamp you can collect now (a preview, not saved), or null when the
 * trip hasn't ended, you've already collected it, or you aren't on it with your account.
 */
export async function getStampToCollect(tripId: string, onTrip: boolean): Promise<CollectedStamp | null> {
  const account = await getOrCreateAccount();
  if (!account || !onTrip || !tripIdSchema.safeParse(tripId).success) return null;
  const { trip, mine } = await load(tripId);
  if (!trip || trip.end_date >= todayForCountry(account.home_country_code)) return null;
  if (mine.some((r) => r.trip_id === tripId)) return null;

  const t = toTrip(trip);
  const stampId = chooseStamp(stampTrip(t), mine.map((r) => r.stamp_id));
  const { place, month } = stampLabel(t);
  return { stampId, file: stampFile(stampId), place, month };
}

/**
 * For the home Passport badge (v0.7.0): how many of these trips have ended with no stamp
 * collected — the same rule as Passport's "stamps to collect" (ended by your home date).
 */
export async function countStampsToCollect(trips: { id: string; end_date: string }[]): Promise<number> {
  const account = await getOrCreateAccount();
  if (!account) return 0;
  const today = todayForCountry(account.home_country_code);
  const ended = trips.filter((t) => t.end_date < today).map((t) => t.id);
  if (ended.length === 0) return 0;
  const supabase = await createClient();
  // Your own stamps only (RLS)
  const { data } = await supabase.from("collected_stamps").select("trip_id").in("trip_id", ended);
  const collected = new Set((data ?? []).map((r: { trip_id: string | null }) => r.trip_id));
  return ended.filter((id) => !collected.has(id)).length;
}

/** Collect a trip's stamp into your Passport. Collecting twice returns the stamp you already have. */
export async function collectStamp(tripId: string): Promise<{ stamp: CollectedStamp } | { error: string }> {
  const account = await getOrCreateAccount();
  if (!account) return { error: "Please sign in again." };
  if (!tripIdSchema.safeParse(tripId).success) return { error: "Trip not found." };

  const { supabase, trip, mine } = await load(tripId);
  if (!trip) return { error: "Trip not found." };
  if (trip.end_date >= todayForCountry(account.home_country_code)) return { error: "You can collect this stamp once the trip ends." };

  const t = toTrip(trip);
  const stampId = chooseStamp(
    stampTrip(t),
    mine.filter((r) => r.trip_id !== tripId).map((r) => r.stamp_id)
  );
  const label = stampLabel(t);
  const { data, error } = await supabase.rpc("collect_stamp", {
    p_trip_id: tripId,
    p_stamp_id: stampId,
    p_place: label.place.slice(0, 120),
    p_country_code: label.countryCode,
    p_month: label.month,
  });
  if (error || !data) {
    console.error("collect_stamp failed:", error);
    return { error: error?.message === "Not on this trip" ? "Only travellers on this trip can collect its stamp." : "Couldn't collect the stamp. Please try again." };
  }

  const row = data as { stamp_id: string; place: string; month: string };
  // No revalidatePath: Passport and the overview are rendered fresh on every visit, and
  // revalidating would re-render this page mid-animation and remove the card being tapped.
  return { stamp: { stampId: row.stamp_id, file: stampFile(row.stamp_id), place: row.place, month: row.month } };
}
