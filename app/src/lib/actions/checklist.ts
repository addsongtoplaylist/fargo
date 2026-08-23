"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/account";
import { revalidatePath } from "next/cache";

export type ChecklistItem = {
  id: string;
  checklist_id: string;
  text: string;
  done: boolean;
  assigned_to: string | null;
  sort_order: number;
  created_at: string;
};

export type Checklist = {
  id: string;
  trip_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  checklist_items: ChecklistItem[];
};

export async function getChecklists(tripId: string): Promise<Checklist[]> {
  const account = await getOrCreateAccount();
  if (!account) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("checklists")
    .select("*, checklist_items(*)")
    .eq("trip_id", tripId)
    .order("sort_order", { ascending: true });

  // Sort items within each checklist
  if (data) {
    for (const list of data) {
      list.checklist_items?.sort(
        (a: ChecklistItem, b: ChecklistItem) => a.sort_order - b.sort_order
      );
    }
  }

  return (data as Checklist[]) ?? [];
}

export async function createChecklist(tripId: string, name: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("checklists")
    .select("sort_order")
    .eq("trip_id", tripId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { error } = await supabase.from("checklists").insert({
    trip_id: tripId,
    name,
    sort_order: nextOrder,
  });

  if (error) {
    console.error("Failed to create checklist:", error);
    throw new Error("Failed to create checklist");
  }

  revalidatePath(`/trips/${tripId}/prep`);
}

export async function renameChecklist(
  checklistId: string,
  tripId: string,
  name: string
) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklists")
    .update({ name })
    .eq("id", checklistId);

  if (error) {
    console.error("Failed to rename checklist:", error);
    throw new Error("Failed to rename checklist");
  }

  revalidatePath(`/trips/${tripId}/prep`);
}

export async function deleteChecklist(checklistId: string, tripId: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklists")
    .delete()
    .eq("id", checklistId);

  if (error) {
    console.error("Failed to delete checklist:", error);
    throw new Error("Failed to delete checklist");
  }

  revalidatePath(`/trips/${tripId}/prep`);
}

export async function addChecklistItem(
  checklistId: string,
  tripId: string,
  text: string
) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("checklist_items")
    .select("sort_order")
    .eq("checklist_id", checklistId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { error } = await supabase.from("checklist_items").insert({
    checklist_id: checklistId,
    text,
    sort_order: nextOrder,
  });

  if (error) {
    console.error("Failed to add checklist item:", error);
    throw new Error("Failed to add checklist item");
  }

  revalidatePath(`/trips/${tripId}/prep`);
}

export async function updateChecklistItem(
  itemId: string,
  tripId: string,
  text: string
) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_items")
    .update({ text })
    .eq("id", itemId);

  if (error) {
    console.error("Failed to update checklist item:", error);
    throw new Error("Failed to update checklist item");
  }

  revalidatePath(`/trips/${tripId}/prep`);
}

export async function toggleChecklistItem(
  itemId: string,
  tripId: string,
  done: boolean
) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_items")
    .update({ done })
    .eq("id", itemId);

  if (error) {
    console.error("Failed to toggle checklist item:", error);
    throw new Error("Failed to toggle checklist item");
  }

  revalidatePath(`/trips/${tripId}/prep`);
}

export async function deleteChecklistItem(itemId: string, tripId: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("Failed to delete checklist item:", error);
    throw new Error("Failed to delete checklist item");
  }

  revalidatePath(`/trips/${tripId}/prep`);
}
