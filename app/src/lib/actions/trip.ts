"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/account";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateTripSchema, tripIdSchema, uuidSchema } from "@/lib/validations";

const TRIP_TYPE_MAP: Record<string, string> = {
  "Free & easy": "free_and_easy",
  "City break": "city_break",
  "Road trip": "road_trip",
  "Beach & resort": "beach_and_resort",
  Adventure: "adventure",
  Business: "business",
};

export async function createTrip(formData: FormData): Promise<{ error?: string }> {
  const account = await getOrCreateAccount();
  if (!account) return { error: "Not signed in" };

  const supabase = await createClient();

  const name = formData.get("name") as string;
  const destination = formData.get("destination") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const tripType = formData.get("tripType") as string;
  const localCurrency = formData.get("localCurrency") as string;
  const fxRate = formData.get("fxRate") as string;
  const destinationCountry = formData.get("destinationCountry") as string | null;
  const destinationLat = formData.get("destinationLat") as string | null;
  const destinationLng = formData.get("destinationLng") as string | null;

  if (!name || !destination || !startDate || !endDate || !tripType || !localCurrency || !fxRate) {
    return { error: "All fields are required" };
  }

  // Compute initial status from dates
  const today = new Date().toISOString().split("T")[0];
  let status: "planning" | "active" | "completed" = "planning";
  if (startDate <= today && endDate >= today) status = "active";
  else if (endDate < today) status = "completed";

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
      status,
      destination_country: destinationCountry || null,
      destination_lat: destinationLat ? parseFloat(destinationLat) : null,
      destination_lng: destinationLng ? parseFloat(destinationLng) : null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create trip:", error);
    return { error: `Failed to create trip: ${error.message}` };
  }

  // Add the planner as a traveller
  const { error: travellerError } = await supabase.from("travellers").insert({
    trip_id: trip.id,
    display_name: account.name,
    role: "planner",
    account_id: account.id,
  });

  if (travellerError) {
    console.error("Failed to add planner as traveller:", travellerError);
  }

  redirect(`/trips/${trip.id}/overview`);
}

/**
 * Lightweight check: return the active trip ID if one exists.
 * Uses a single query with a join — much faster than getMyTrips()
 * which fetches all trips with all travellers.
 */
export async function getActiveTrip(): Promise<string | null> {
  const account = await getOrCreateAccount();
  if (!account) return null;

  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Single query: join travellers → trips, filter for active dates
  const { data } = await supabase
    .from("travellers")
    .select("trip_id, trips!inner(id, start_date, end_date)")
    .eq("account_id", account.id)
    .lte("trips.start_date", today)
    .gte("trips.end_date", today)
    .limit(1)
    .single();

  return data?.trip_id ?? null;
}

export async function getMyTrips() {
  const account = await getOrCreateAccount();
  if (!account) return { active: null, upcoming: [], past: [] };

  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Single RPC call replaces the 2-query waterfall
  const { data: trips } = await supabase.rpc("get_my_trips", {
    p_account_id: account.id,
  });

  if (!trips || !Array.isArray(trips) || trips.length === 0) {
    return { active: null, upcoming: [], past: [] };
  }

  const active = trips.find(
    (t: { start_date: string; end_date: string }) =>
      t.start_date <= today && t.end_date >= today
  );
  const upcoming = trips.filter(
    (t: { start_date: string }) => t.start_date > today
  );
  const past = trips.filter(
    (t: { end_date: string }) => t.end_date < today && t !== active
  );

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
export async function joinTripByInviteCode(code: string): Promise<{ tripId?: string; error?: string }> {
  const account = await getOrCreateAccount();
  if (!account) return { error: "Not signed in" };

  const supabase = await createClient();

  // Look up the trip
  const { data: trip } = await supabase
    .from("trips")
    .select("id, travellers(account_id)")
    .eq("invite_code", code)
    .single();

  if (!trip) return { error: "Invalid invite link" };

  // Check if already a member
  const alreadyMember = trip.travellers?.some(
    (t: { account_id: string }) => t.account_id === account.id
  );
  if (alreadyMember) return { tripId: trip.id };

  // Add as member
  const { error } = await supabase.from("travellers").insert({
    trip_id: trip.id,
    display_name: account.name,
    role: "member",
    account_id: account.id,
  });

  if (error) {
    console.error("Failed to join trip:", error);
    return { error: `Failed to join trip: ${error.message}` };
  }

  return { tripId: trip.id };
}

/** Remove a traveller from a trip (planner only) */
export async function removeTraveller(tripId: string, travellerId: string) {
  tripIdSchema.parse(tripId);
  uuidSchema.parse(travellerId);

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

/** Update trip details (planner only) */
export async function updateTrip(
  tripId: string,
  data: {
    name?: string;
    destination?: string;
    start_date?: string;
    end_date?: string;
    local_currency?: string;
    fx_rate?: number;
    destination_country?: string | null;
    destination_lat?: number | null;
    destination_lng?: number | null;
  }
): Promise<{ error?: string }> {
  try {
    tripIdSchema.parse(tripId);
    updateTripSchema.parse(data);
  } catch {
    return { error: "Invalid input" };
  }

  const account = await getOrCreateAccount();
  if (!account) return { error: "Not signed in" };

  const supabase = await createClient();

  // Verify caller is the planner
  const { data: trip } = await supabase
    .from("trips")
    .select("planner_id")
    .eq("id", tripId)
    .single();

  if (!trip || trip.planner_id !== account.id) {
    return { error: "Only the planner can edit trip settings" };
  }

  // Recompute status if dates changed
  const updateData: Record<string, unknown> = { ...data };
  if (data.start_date || data.end_date) {
    const today = new Date().toISOString().split("T")[0];
    const startDate = data.start_date ?? "";
    const endDate = data.end_date ?? "";
    if (startDate && endDate) {
      if (startDate <= today && endDate >= today) updateData.status = "active";
      else if (endDate < today) updateData.status = "completed";
      else updateData.status = "planning";
    }
  }

  const { error } = await supabase
    .from("trips")
    .update(updateData)
    .eq("id", tripId);

  if (error) {
    console.error("Failed to update trip:", error);
    return { error: `Failed to update trip: ${error.message}` };
  }

  revalidatePath(`/trips/${tripId}`);
  return {};
}

/** Delete a trip (planner only) */
export async function deleteTrip(tripId: string): Promise<{ error?: string }> {
  try { tripIdSchema.parse(tripId); } catch { return { error: "Invalid trip ID" }; }

  const account = await getOrCreateAccount();
  if (!account) return { error: "Not signed in" };

  const supabase = await createClient();

  // Verify caller is the planner
  const { data: trip } = await supabase
    .from("trips")
    .select("planner_id")
    .eq("id", tripId)
    .single();

  if (!trip || trip.planner_id !== account.id) {
    return { error: "Only the planner can delete a trip" };
  }

  const { error } = await supabase.from("trips").delete().eq("id", tripId);

  if (error) {
    console.error("Failed to delete trip:", error);
    return { error: `Failed to delete trip: ${error.message}` };
  }

  return {};
}

/** Clone a shared trip as your own (activities + ideas, not expenses/checklists) */
export async function cloneTrip(
  shareCode: string
): Promise<{ tripId?: string; error?: string }> {
  const account = await getOrCreateAccount();
  if (!account) return { error: "Not signed in" };

  const supabase = await createClient();

  // Look up the source trip by share code
  const { data: source } = await supabase
    .from("trips")
    .select("*")
    .eq("share_code", shareCode)
    .single();

  if (!source) return { error: "Trip not found" };

  // Create the new trip
  const { data: newTrip, error: tripError } = await supabase
    .from("trips")
    .insert({
      name: `${source.name} (copy)`,
      destination: source.destination,
      start_date: source.start_date,
      end_date: source.end_date,
      trip_type: source.trip_type,
      local_currency: source.local_currency,
      fx_rate: source.fx_rate,
      planner_id: account.id,
      status: "planning",
    })
    .select()
    .single();

  if (tripError || !newTrip) {
    console.error("Failed to clone trip:", tripError);
    return { error: "Failed to clone trip" };
  }

  // Add cloner as planner
  await supabase.from("travellers").insert({
    trip_id: newTrip.id,
    display_name: account.name,
    role: "planner",
    account_id: account.id,
  });

  // Clone activities
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("trip_id", source.id)
    .order("date")
    .order("sort_order");

  if (activities && activities.length > 0) {
    const clonedActivities = activities.map((a) => ({
      trip_id: newTrip.id,
      date: a.date,
      title: a.title,
      time: a.time,
      notes: a.notes,
      category: a.category,
      place_name: a.place_name,
      place_lat: a.place_lat,
      place_lng: a.place_lng,
      sort_order: a.sort_order,
    }));
    await supabase.from("activities").insert(clonedActivities);
  }

  // Clone ideas (unpromoted only)
  const { data: ideas } = await supabase
    .from("ideas")
    .select("*")
    .eq("trip_id", source.id)
    .eq("promoted", false);

  if (ideas && ideas.length > 0) {
    const clonedIdeas = ideas.map((i) => ({
      trip_id: newTrip.id,
      title: i.title,
      link: i.link,
      notes: i.notes,
      promoted: false,
    }));
    await supabase.from("ideas").insert(clonedIdeas);
  }

  return { tripId: newTrip.id };
}

function generateCode(): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789"; // no confusing chars (0/o, 1/l)
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
