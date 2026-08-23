"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/account";
import { redirect } from "next/navigation";

const TRIP_TYPE_MAP: Record<string, string> = {
  "Free & easy": "free_and_easy",
  "City break": "city_break",
  "Road trip": "road_trip",
  "Beach & resort": "beach_and_resort",
  Adventure: "adventure",
  Business: "business",
};

export async function createTrip(formData: FormData) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  const name = formData.get("name") as string;
  const destination = formData.get("destination") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const tripType = formData.get("tripType") as string;
  const localCurrency = formData.get("localCurrency") as string;
  const fxRate = formData.get("fxRate") as string;

  if (!name || !destination || !startDate || !endDate || !tripType || !localCurrency || !fxRate) {
    throw new Error("All fields are required");
  }

  // Create the trip
  const { data: trip, error } = await supabase
    .from("trips")
    .insert({
      name,
      destination,
      start_date: startDate,
      end_date: endDate,
      trip_type: TRIP_TYPE_MAP[tripType] || "free_and_easy",
      local_currency: localCurrency.toUpperCase(),
      fx_rate: parseFloat(fxRate),
      planner_id: account.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create trip:", error);
    throw new Error("Failed to create trip");
  }

  // Add the planner as a traveller
  await supabase.from("travellers").insert({
    trip_id: trip.id,
    display_name: account.name,
    role: "planner",
    account_id: account.id,
  });

  redirect(`/trips/${trip.id}/overview`);
}

export async function getMyTrips() {
  const account = await getOrCreateAccount();
  if (!account) return { active: null, upcoming: [], past: [] };

  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Get all trips for this planner
  const { data: trips } = await supabase
    .from("trips")
    .select("*, travellers(*)")
    .eq("planner_id", account.id)
    .order("start_date", { ascending: true });

  if (!trips) return { active: null, upcoming: [], past: [] };

  const active = trips.find(
    (t) => t.start_date <= today && t.end_date >= today
  );
  const upcoming = trips.filter((t) => t.start_date > today);
  const past = trips.filter((t) => t.end_date < today && t !== active);

  return { active: active || null, upcoming, past };
}

export async function getTrip(id: string) {
  const account = await getOrCreateAccount();
  if (!account) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("trips")
    .select("*, travellers(*)")
    .eq("id", id)
    .single();

  return data;
}

/** Generate or return the share code for a trip */
export async function getOrCreateShareCode(tripId: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  // Check if code already exists
  const { data: trip } = await supabase
    .from("trips")
    .select("share_code")
    .eq("id", tripId)
    .single();

  if (trip?.share_code) return trip.share_code;

  // Generate a unique 8-char code
  const code = generateShareCode();

  const { error } = await supabase
    .from("trips")
    .update({ share_code: code })
    .eq("id", tripId);

  if (error) {
    console.error("Failed to create share code:", error);
    throw new Error("Failed to create share link");
  }

  return code;
}

/** Look up a trip by its share code (no auth required) */
export async function getTripByShareCode(code: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trips")
    .select("*, travellers(*)")
    .eq("share_code", code)
    .single();

  return data;
}

function generateShareCode(): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789"; // no confusing chars (0/o, 1/l)
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
