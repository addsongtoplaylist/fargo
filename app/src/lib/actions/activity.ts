"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/account";
import { revalidatePath } from "next/cache";

export type Activity = {
  id: string;
  trip_id: string;
  date: string;
  time: string | null;
  title: string;
  notes: string | null;
  category: string;
  cost: string | null;
  cost_shared: boolean;
  place_name: string | null;
  place_lat: string | null;
  place_lng: string | null;
  sort_order: number;
  idea_id: string | null;
  expense_id: string | null;
  created_at: string;
  updated_at: string;
};

/** Fetch all activities for a trip, ordered by date + sort_order */
export async function getActivities(tripId: string): Promise<Activity[]> {
  const account = await getOrCreateAccount();
  if (!account) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq("trip_id", tripId)
    .order("date", { ascending: true })
    .order("sort_order", { ascending: true });

  return (data as Activity[]) ?? [];
}

/** Create a new activity */
export async function createActivity(
  tripId: string,
  fields: {
    date: string;
    time?: string;
    title: string;
    notes?: string;
    category?: string;
  }
) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  // Get the next sort_order for this day
  const { data: existing } = await supabase
    .from("activities")
    .select("sort_order")
    .eq("trip_id", tripId)
    .eq("date", fields.date)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { error } = await supabase.from("activities").insert({
    trip_id: tripId,
    date: fields.date,
    time: fields.time || null,
    title: fields.title,
    notes: fields.notes || null,
    category: fields.category || "misc",
    sort_order: nextOrder,
  });

  if (error) {
    console.error("Failed to create activity:", error);
    throw new Error("Failed to create activity");
  }

  revalidatePath(`/trips/${tripId}/schedule`);
}

/** Update an existing activity */
export async function updateActivity(
  activityId: string,
  tripId: string,
  fields: {
    time?: string | null;
    title?: string;
    notes?: string | null;
    category?: string;
    cost?: string | null;
    cost_shared?: boolean;
  }
) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", activityId);

  if (error) {
    console.error("Failed to update activity:", error);
    throw new Error("Failed to update activity");
  }

  revalidatePath(`/trips/${tripId}/schedule`);
}

/** Delete an activity */
export async function deleteActivity(activityId: string, tripId: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId);

  if (error) {
    console.error("Failed to delete activity:", error);
    throw new Error("Failed to delete activity");
  }

  revalidatePath(`/trips/${tripId}/schedule`);
}

/** Reorder activities within a day */
export async function reorderActivities(
  tripId: string,
  orderedIds: string[]
) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  // Update each activity's sort_order
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("activities")
      .update({ sort_order: index, updated_at: new Date().toISOString() })
      .eq("id", id)
  );

  await Promise.all(updates);
  revalidatePath(`/trips/${tripId}/schedule`);
}
