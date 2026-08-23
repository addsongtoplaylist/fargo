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

/** Promote an idea to a scheduled activity */
export async function promoteIdea(
  ideaId: string,
  tripId: string,
  date: string,
  dayLabel: string // "Day 3"
) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  // Create the activity from this idea
  await createActivity(tripId, {
    date,
    title: (await getIdeaTitle(ideaId)) ?? "Untitled",
  });

  // Mark the idea as promoted
  const supabase = await createClient();
  await supabase
    .from("ideas")
    .update({ promoted: true, promoted_date: dayLabel })
    .eq("id", ideaId);

  revalidatePath(`/trips/${tripId}/prep`);
  revalidatePath(`/trips/${tripId}/schedule`);
}

async function getIdeaTitle(ideaId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ideas")
    .select("title")
    .eq("id", ideaId)
    .single();
  return data?.title ?? null;
}
