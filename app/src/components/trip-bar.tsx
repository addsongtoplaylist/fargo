"use client";

import { useParams, usePathname } from "next/navigation";
import { CalendarDays, Compass, LayoutDashboard, ListChecks, Wallet } from "lucide-react";
import { TabBar } from "@/components/ui/tab-bar";

const SECTIONS = [
  { slug: "overview", label: "Overview", icon: LayoutDashboard },
  { slug: "schedule", label: "Schedule", icon: CalendarDays },
  { slug: "money", label: "Money", icon: Wallet },
  { slug: "prep", label: "Prep", icon: ListChecks },
  { slug: "discover", label: "Discover", icon: Compass },
] as const;

/**
 * Trip bar (DESIGN.md v0.8) — replaces the top tab row. Sub-pages keep their
 * section active (Your expenses, Settle up → Money). Hidden on Trip settings.
 */
export function TripBar() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const base = `/trips/${params.id}`;
  if (pathname.startsWith(`${base}/settings`)) return null;

  return (
    <TabBar
      label="Trip sections"
      items={SECTIONS.map(({ slug, label, icon }) => {
        const href = `${base}/${slug}`;
        return { href, label, icon, active: pathname === href || pathname.startsWith(`${href}/`) };
      })}
    />
  );
}
