"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/account";
import { revalidatePath } from "next/cache";

/** Update the current user's profile settings */
export async function updateProfile(data: {
  home_country_code?: string | null;
}): Promise<{ error?: string }> {
  const account = await getOrCreateAccount();
  if (!account) return { error: "Not signed in" };

  const supabase = await createClient();

  const update: Record<string, unknown> = {};
  if (data.home_country_code !== undefined) {
    update.home_country_code = data.home_country_code || null;
  }

  if (Object.keys(update).length === 0) return {};

  const { error } = await supabase
    .from("accounts")
    .update(update)
    .eq("id", account.id);

  if (error) {
    console.error("Failed to update profile:", error);
    return { error: `Failed to update profile: ${error.message}` };
  }

  revalidatePath("/profile");
  return {};
}
