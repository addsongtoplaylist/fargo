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

export async function createIdea(
  tripId: string,
  fields: { title: string; link?: string; notes?: string }
) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("ideas")
    .select("sort_order")
    .eq("trip_id", tripId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { error } = await supabase.from("ideas").insert({
    trip_id: tripId,
    title: fields.title,
    link: fields.link || null,
    notes: fields.notes || null,
    sort_order: nextOrder,
  });

  if (error) {
    console.error("Failed to create idea:", error);
    throw new Error("Failed to create idea");
  }

  revalidatePath(`/trips/${tripId}/prep`);
}

export async function updateIdea(
  ideaId: string,
  tripId: string,
  fields: { title?: string; link?: string; notes?: string }
) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const updates: Record<string, unknown> = {};
  if (fields.title !== undefined) updates.title = fields.title;
  if (fields.link !== undefined) updates.link = fields.link || null;
  if (fields.notes !== undefined) updates.notes = fields.notes || null;

  const { error } = await supabase
    .from("ideas")
    .update(updates)
    .eq("id", ideaId);

  if (error) {
    console.error("Failed to update idea:", error);
    throw new Error("Failed to update idea");
  }

  revalidatePath(`/trips/${tripId}/prep`);
}

export async function deleteIdea(ideaId: string, tripId: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase.from("ideas").delete().eq("id", ideaId);

  if (error) {
    console.error("Failed to delete idea:", error);
    throw new Error("Failed to delete idea");
  }

  revalidatePath(`/trips/${tripId}/prep`);
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
  await createActivity(tripId, {
    date,
    title: idea.title ?? "Untitled",
    time: idea.time || undefined,
    category: idea.category || undefined,
    notes: idea.notes || undefined,
    place_name: idea.place_name || undefined,
    place_lat: idea.place_lat || undefined,
    place_lng: idea.place_lng || undefined,
  });

  // Mark the idea as promoted
  await supabase
    .from("ideas")
    .update({ promoted: true, promoted_date: dayLabel })
    .eq("id", ideaId);

  revalidatePath(`/trips/${tripId}/prep`);
  revalidatePath(`/trips/${tripId}/schedule`);
}
