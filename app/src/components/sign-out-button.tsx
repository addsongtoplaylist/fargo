"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="mt-8 w-full py-2.5 text-sm font-medium text-money-over border border-money-over rounded-md hover:bg-money-over-soft transition-colors"
    >
      Sign out
    </button>
  );
}
