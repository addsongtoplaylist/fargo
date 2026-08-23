"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/account";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

  // Get trip IDs where this user is a traveller (planner or member)
  const { data: memberships } = await supabase
    .from("travellers")
    .select("trip_id")
    .eq("account_id", account.id);

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
  const code = generateCode();

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

/** Generate or return the invite code for a trip (planner only) */
export async function getOrCreateInviteCode(tripId: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  // Verify caller is the planner
  const { data: trip } = await supabase
    .from("trips")
    .select("invite_code, planner_id")
    .eq("id", tripId)
    .single();

  if (!trip || trip.planner_id !== account.id) {
    throw new Error("Only the planner can generate invite links");
  }

  if (trip.invite_code) return trip.invite_code;

  const code = generateCode();

  const { error } = await supabase
    .from("trips")
    .update({ invite_code: code })
    .eq("id", tripId);

  if (error) {
    console.error("Failed to create invite code:", error);
    throw new Error("Failed to create invite link");
  }

  return code;
}

/** Look up a trip by its invite code */
export async function getTripByInviteCode(code: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trips")
    .select("*, travellers(*)")
    .eq("invite_code", code)
    .single();

  return data;
}

/** Join a trip using an invite code */
export async function joinTripByInviteCode(code: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  // Look up the trip
  const { data: trip } = await supabase
    .from("trips")
    .select("id, travellers(account_id)")
    .eq("invite_code", code)
    .single();

  if (!trip) throw new Error("Invalid invite link");

  // Check if already a member
  const alreadyMember = trip.travellers?.some(
    (t: { account_id: string }) => t.account_id === account.id
  );
  if (alreadyMember) return trip.id;

  // Add as member
  const { error } = await supabase.from("travellers").insert({
    trip_id: trip.id,
    display_name: account.name,
    role: "member",
    account_id: account.id,
  });

  if (error) {
    console.error("Failed to join trip:", error);
    throw new Error("Failed to join trip");
  }

  return trip.id;
}

/** Remove a traveller from a trip (planner only) */
export async function removeTraveller(tripId: string, travellerId: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  // Verify caller is the planner
  const { data: trip } = await supabase
    .from("trips")
    .select("planner_id")
    .eq("id", tripId)
    .single();

  if (!trip || trip.planner_id !== account.id) {
    throw new Error("Only the planner can remove travellers");
  }

  const { error } = await supabase
    .from("travellers")
    .delete()
    .eq("id", travellerId)
    .eq("trip_id", tripId);

  if (error) {
    console.error("Failed to remove traveller:", error);
    throw new Error("Failed to remove traveller");
  }

  revalidatePath(`/trips/${tripId}/people`);
}

/** Get the current user's role for a trip */
export async function getMyRole(tripId: string) {
  const account = await getOrCreateAccount();
  if (!account) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("travellers")
    .select("role")
    .eq("trip_id", tripId)
    .eq("account_id", account.id)
    .single();

  return data?.role ?? null;
}

function generateCode(): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789"; // no confusing chars (0/o, 1/l)
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
