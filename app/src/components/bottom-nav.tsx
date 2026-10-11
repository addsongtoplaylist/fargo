"use client";

import { usePathname } from "next/navigation";
import { Map as MapIcon, Stamp, User } from "lucide-react";
import { TabBar } from "@/components/ui/tab-bar";

/** Screens that show the home bar. Trips have their own bar; New trip has a back button.
 *  /explore keeps the bar if visited directly, but Explore is shelved and not in the bar (v0.6.0). */
const HOME_SCREENS = ["/trips", "/explore", "/passport", "/profile"];

/** Home bar: My trips · Passport · Profile, icons only (DESIGN.md → Navigation, v0.6.0). Explore is shelved. */
export function BottomNav() {
  const pathname = usePathname();
  if (!HOME_SCREENS.includes(pathname)) return null;

  return (
    <TabBar
      label="Main"
      items={[
        { href: "/trips?noauto=1", label: "My trips", icon: MapIcon, active: pathname === "/trips" },
        { href: "/passport", label: "Passport", icon: Stamp, active: pathname === "/passport" },
        { href: "/profile", label: "Profile", icon: User, active: pathname === "/profile" },
      ]}
    />
  );
}
