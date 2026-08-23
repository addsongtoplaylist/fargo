import { createClient } from "@/lib/supabase/server";

/**
 * Ensures an account row exists for the current auth user.
 * Called on every authenticated page load (cached per request).
 * Returns the account or null if not signed in.
 */
export async function getOrCreateAccount() {
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
}
