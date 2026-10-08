"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/account";
import { revalidatePath } from "next/cache";
import { createActivity } from "./activity";

export type Idea = {
  id: string;
  trip_id: string;
  title: string;
  link: string | null;
  notes: string | null;
  time: string | null;
  category: string | null;
  place_name: string | null;
  place_lat: string | null;
  place_lng: string | null;
  promoted: boolean;
  promoted_activity_id: string | null;
  promoted_date: string | null;
  /** Account that suggested it (null for ideas from before v0.5.4) */
  created_by: string | null;
  sort_order: number;
  created_at: string;
};

export async function getIdeas(tripId: string): Promise<Idea[]> {
  const account = await getOrCreateAccount();
  if (!account) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("ideas")
    .select("*")
    .eq("trip_id", tripId)
    .order("sort_order", { ascending: true });

  return (data as Idea[]) ?? [];
}

/** Add an idea — anyone on the trip with an account (shown as "Ali suggested"). */
export async function createIdea(
  tripId: string,
  fields: { title: string; link?: string; notes?: string }
) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase.rpc("add_idea", {
    p_trip_id: tripId,
    p_title: fields.title,
    p_link: fields.link ?? null,
    p_notes: fields.notes ?? null,
  });

  if (error) {
    console.error("Failed to create idea:", error);
    throw new Error("Failed to create idea");
  }

  revalidatePath(`/trips/${tripId}/prep`);
}

/** Edit an idea — the author or the planner (checked by the database). */
export async function updateIdea(
  ideaId: string,
  tripId: string,
  fields: { title?: string; link?: string; notes?: string }
) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  // undefined = leave unchanged; "" clears link / notes
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_idea", {
    p_idea_id: ideaId,
    p_title: fields.title ?? null,
    p_link: fields.link ?? null,
    p_notes: fields.notes ?? null,
  });

  if (error) {
    console.error("Failed to update idea:", error);
    throw new Error("Failed to update idea");
  }

  revalidatePath(`/trips/${tripId}/prep`);
}

/** Delete an idea — the author or the planner (checked by the database). */
export async function deleteIdea(ideaId: string, tripId: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_idea", { p_idea_id: ideaId });

  if (error) {
    console.error("Failed to delete idea:", error);
    throw new Error("Failed to delete idea");
  }

  revalidatePath(`/trips/${tripId}/prep`);
}

/** Planner's Prep badge: ideas members added since they last opened Prep (0 for members). */
export async function getPrepBadgeCount(tripId: string): Promise<number> {
  const account = await getOrCreateAccount();
  if (!account) return 0;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("prep_badge_count", { p_trip_id: tripId });
  if (error) return 0;
  return typeof data === "number" ? data : 0;
}

/** Planner opened Prep — clears their badge (no-op for members). */
export async function markPrepSeen(tripId: string) {
  const account = await getOrCreateAccount();
  if (!account) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_prep_seen", { p_trip_id: tripId });
  if (error) console.error("Failed to mark Prep seen:", error);
}

/** Promote an idea to a scheduled activity, preserving all its data */
export async function promoteIdea(
  ideaId: string,
  tripId: string,
  date: string,
  dayLabel: string // "Day 3"
) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  // Fetch full idea data
  const supabase = await createClient();
  const { data: idea } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", ideaId)
    .single();

  if (!idea) throw new Error("Idea not found");

  // Create the activity from this idea, carrying over all saved data
  const activityId = await createActivity(tripId, {
    date,
    title: idea.title ?? "Untitled",
    time: idea.time || undefined,
    category: idea.category || undefined,
    notes: idea.notes || undefined,
    place_name: idea.place_name || undefined,
    place_lat: idea.place_lat || undefined,
    place_lng: idea.place_lng || undefined,
  });

  // Remember who suggested it, so moving it back to Ideas keeps the author
  if (idea.created_by) {
    const { error: authorErr } = await supabase
      .from("activities")
      .update({ suggested_by: idea.created_by })
      .eq("id", activityId);
    if (authorErr) console.error("Failed to keep idea author:", authorErr);
  }

  // Mark the idea as promoted
  const { error } = await supabase
    .from("ideas")
    .update({ promoted: true, promoted_date: dayLabel })
    .eq("id", ideaId);

  if (error) {
    // Undo the activity so the item isn't duplicated in both lists
    await supabase.from("activities").delete().eq("id", activityId);
    console.error("Failed to mark idea as promoted:", error);
    throw new Error("Failed to promote idea");
  }

  revalidatePath(`/trips/${tripId}/prep`);
  revalidatePath(`/trips/${tripId}/schedule`);
}
