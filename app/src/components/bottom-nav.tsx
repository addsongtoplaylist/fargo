"use client";

import { usePathname } from "next/navigation";
import { Compass, Map as MapIcon, Stamp, User } from "lucide-react";
import { TabBar } from "@/components/ui/tab-bar";

/** Screens that show the home bar. Trips have their own bar; New trip has a back button. */
const HOME_SCREENS = ["/trips", "/explore", "/passport", "/profile"];

/** Home bar: My trips · Explore · Passport · Profile (DESIGN.md v0.8; Passport v0.5.6). */
export function BottomNav() {
  const pathname = usePathname();
  if (!HOME_SCREENS.includes(pathname)) return null;

  return (
    <TabBar
      label="Main"
      items={[
        { href: "/trips?noauto=1", label: "My trips", icon: MapIcon, active: pathname === "/trips" },
        { href: "/explore", label: "Explore", icon: Compass, active: pathname === "/explore" },
        { href: "/passport", label: "Passport", icon: Stamp, active: pathname === "/passport" },
        { href: "/profile", label: "Profile", icon: User, active: pathname === "/profile" },
      ]}
    />
  );
}
