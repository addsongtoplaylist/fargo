"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/account";
import { revalidatePath } from "next/cache";

/**
 * Personal checklists (v0.5.4, docs/CHECKLISTS.md). Every list belongs to
 * one account; nobody else can read it (row-level security on
 * my_checklists / my_checklist_items). `tripId` null = a default list,
 * kept in Profile → My checklists and copied into each trip once.
 */

export type ChecklistItem = {
  id: string;
  list_id: string;
  text: string;
  done: boolean;
  sort_order: number;
  created_at: string;
};

export type Checklist = {
  id: string;
  trip_id: string | null;
  name: string;
  sort_order: number;
  created_at: string;
  checklist_items: ChecklistItem[];
};

const LIST_SELECT = "id, trip_id, name, sort_order, created_at, checklist_items:my_checklist_items(*)";

function revalidateLists(tripId: string | null) {
  if (tripId) {
    revalidatePath(`/trips/${tripId}/prep`);
  } else {
    revalidatePath("/profile/checklists");
    revalidatePath("/profile");
  }
}

function sortItems(lists: Checklist[]) {
  for (const list of lists) {
    list.checklist_items?.sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
  }
  return lists;
}

/** Your lists for a trip. Copies your defaults in the first time (once per trip). */
export async function getChecklists(tripId: string): Promise<Checklist[]> {
  const account = await getOrCreateAccount();
  if (!account) return [];

  const supabase = await createClient();
  const { error: setupError } = await supabase.rpc("setup_my_checklists", { p_trip_id: tripId });
  if (setupError) console.error("Failed to set up checklists:", setupError);

  const { data } = await supabase
    .from("my_checklists")
    .select(LIST_SELECT)
    .eq("account_id", account.id)
    .eq("trip_id", tripId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return sortItems((data as Checklist[]) ?? []);
}

/** Your default lists (Profile → My checklists). */
export async function getMyDefaultChecklists(): Promise<Checklist[]> {
  const account = await getOrCreateAccount();
  if (!account) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("my_checklists")
    .select(LIST_SELECT)
    .eq("account_id", account.id)
    .is("trip_id", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return sortItems((data as Checklist[]) ?? []);
}

export async function createChecklist(tripId: string | null, name: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  let lastQuery = supabase
    .from("my_checklists")
    .select("sort_order")
    .eq("account_id", account.id);
  lastQuery = tripId ? lastQuery.eq("trip_id", tripId) : lastQuery.is("trip_id", null);
  const { data: existing } = await lastQuery.order("sort_order", { ascending: false }).limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { error } = await supabase.from("my_checklists").insert({
    account_id: account.id,
    trip_id: tripId,
    name,
    sort_order: nextOrder,
  });

  if (error) {
    console.error("Failed to create checklist:", error);
    throw new Error("Failed to create checklist");
  }

  revalidateLists(tripId);
}

export async function renameChecklist(checklistId: string, tripId: string | null, name: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase.from("my_checklists").update({ name }).eq("id", checklistId);

  if (error) {
    console.error("Failed to rename checklist:", error);
    throw new Error("Failed to rename checklist");
  }

  revalidateLists(tripId);
}

export async function deleteChecklist(checklistId: string, tripId: string | null) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase.from("my_checklists").delete().eq("id", checklistId);

  if (error) {
    console.error("Failed to delete checklist:", error);
    throw new Error("Failed to delete checklist");
  }

  revalidateLists(tripId);
}

/** Copy a trip list (unticked) into your defaults, replacing one with the same name. */
export async function saveChecklistToDefaults(checklistId: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_my_checklist_as_default", { p_list_id: checklistId });

  if (error) {
    console.error("Failed to save checklist to defaults:", error);
    throw new Error("Failed to save to your defaults");
  }

  revalidateLists(null);
}

export async function addChecklistItem(checklistId: string, tripId: string | null, text: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("my_checklist_items")
    .select("sort_order")
    .eq("list_id", checklistId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { error } = await supabase.from("my_checklist_items").insert({
    list_id: checklistId,
    text,
    sort_order: nextOrder,
  });

  if (error) {
    console.error("Failed to add checklist item:", error);
    throw new Error("Failed to add checklist item");
  }

  revalidateLists(tripId);
}

export async function updateChecklistItem(itemId: string, tripId: string | null, text: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase.from("my_checklist_items").update({ text }).eq("id", itemId);

  if (error) {
    console.error("Failed to update checklist item:", error);
    throw new Error("Failed to update checklist item");
  }

  revalidateLists(tripId);
}

export async function toggleChecklistItem(itemId: string, tripId: string | null, done: boolean) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase.from("my_checklist_items").update({ done }).eq("id", itemId);

  if (error) {
    console.error("Failed to toggle checklist item:", error);
    throw new Error("Failed to toggle checklist item");
  }

  revalidateLists(tripId);
}

export async function deleteChecklistItem(itemId: string, tripId: string | null) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase.from("my_checklist_items").delete().eq("id", itemId);

  if (error) {
    console.error("Failed to delete checklist item:", error);
    throw new Error("Failed to delete checklist item");
  }

  revalidateLists(tripId);
}
