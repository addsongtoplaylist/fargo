"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ProfileRow } from "@/components/profile-row";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleSignOut} className="w-full text-left bg-surface rounded-card hover:bg-money-over-soft/40 transition-colors">
      <ProfileRow icon={LogOut} label="Sign out" tone="danger" />
    </button>
  );
}
