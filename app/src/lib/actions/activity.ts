"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/account";
import { revalidatePath } from "next/cache";
import { createActivitySchema, updateActivitySchema, tripIdSchema, uuidSchema } from "@/lib/validations";

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
    place_name?: string;
    place_lat?: string;
    place_lng?: string;
  }
) {
  tripIdSchema.parse(tripId);
  const validated = createActivitySchema.parse(fields);

  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  // Determine sort_order: if this activity has a time, insert it in
  // chronological position among the day's activities; otherwise append to end
  const { data: dayActivities } = await supabase
    .from("activities")
    .select("id, time, sort_order")
    .eq("trip_id", tripId)
    .eq("date", fields.date)
    .order("sort_order", { ascending: true });

  let nextOrder = 0;
  if (dayActivities && dayActivities.length > 0) {
    if (fields.time) {
      // Find the first activity whose time is after this one (or has no time)
      const insertIdx = dayActivities.findIndex(
        (a) => !a.time || a.time > fields.time!
      );
      if (insertIdx === -1) {
        // Goes at the end — after all existing
        nextOrder = dayActivities[dayActivities.length - 1].sort_order + 1;
      } else {
        // Insert before this activity — shift everything from insertIdx onward
        nextOrder = dayActivities[insertIdx].sort_order;
        const toShift = dayActivities.slice(insertIdx);
        for (let i = 0; i < toShift.length; i++) {
          await supabase
            .from("activities")
            .update({ sort_order: nextOrder + i + 1 })
            .eq("id", toShift[i].id);
        }
      }
    } else {
      // No time — append to end
      nextOrder = dayActivities[dayActivities.length - 1].sort_order + 1;
    }
  }

  const { error } = await supabase.from("activities").insert({
    trip_id: tripId,
    date: validated.date,
    time: validated.time || null,
    title: validated.title,
    notes: validated.notes || null,
    category: validated.category || "misc",
    sort_order: nextOrder,
    place_name: validated.place_name || null,
    place_lat: validated.place_lat || null,
    place_lng: validated.place_lng || null,
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
    date?: string;
    time?: string | null;
    title?: string;
    notes?: string | null;
    category?: string;
    cost?: string | null;
    cost_shared?: boolean;
    place_name?: string | null;
    place_lat?: string | null;
    place_lng?: string | null;
  }
) {
  uuidSchema.parse(activityId);
  tripIdSchema.parse(tripId);
  const validated = updateActivitySchema.parse(fields);

  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq("id", activityId)
    .eq("trip_id", tripId);

  if (error) {
    console.error("Failed to update activity:", error);
    throw new Error("Failed to update activity");
  }

  revalidatePath(`/trips/${tripId}/schedule`);
}

/** Delete an activity */
export async function deleteActivity(activityId: string, tripId: string) {
  uuidSchema.parse(activityId);
  tripIdSchema.parse(tripId);

  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId)
    .eq("trip_id", tripId);

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
  tripIdSchema.parse(tripId);
  orderedIds.forEach((id) => uuidSchema.parse(id));

  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  // Single atomic RPC call instead of N individual UPDATEs
  const { error } = await supabase.rpc("batch_reorder_activities", {
    p_trip_id: tripId,
    p_ids: orderedIds,
  });

  if (error) {
    console.error("Failed to reorder activities:", error);
    throw new Error("Failed to reorder activities");
  }

  revalidatePath(`/trips/${tripId}/schedule`);
}
