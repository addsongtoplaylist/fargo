import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Ensures an account row exists for the current auth user.
 * Wrapped in React cache() so duplicate calls within a single
 * server render are deduplicated (e.g. layout + page both call this).
 */
export const getOrCreateAccount = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Check if account already exists
  const { data: existing } = await supabase
    .from("accounts")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (existing) return existing;

  // Create account from auth user metadata
  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Traveller";

  const { data: created, error } = await supabase
    .from("accounts")
    .insert({
      auth_id: user.id,
      email: user.email!,
      name,
      avatar_url: user.user_metadata?.avatar_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create account:", error);
    return null;
  }

  return created;
});
