"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { CalendarDays, Compass, LayoutDashboard, ListChecks, Wallet } from "lucide-react";
import { TabBar } from "@/components/ui/tab-bar";
import { useTrip } from "@/lib/trip-context";
import { getPrepBadgeCount, markPrepSeen } from "@/lib/actions/idea";

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
 * Planner only: a number on Prep for ideas members added since they last
 * opened it (docs/IDEAS.md); opening Prep clears it.
 */
export function TripBar() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const trip = useTrip();
  const isPlanner = trip?.myRole === "planner";
  const base = `/trips/${params.id}`;
  const onPrep = pathname.startsWith(`${base}/prep`);
  const [prepBadge, setPrepBadge] = useState(0);

  useEffect(() => {
    if (!isPlanner) return;
    let stale = false;
    if (onPrep) {
      markPrepSeen(params.id)
        .then(() => !stale && setPrepBadge(0))
        .catch(() => {});
    } else {
      getPrepBadgeCount(params.id)
        .then((n) => !stale && setPrepBadge(n))
        .catch(() => {});
    }
    return () => {
      stale = true;
    };
  }, [isPlanner, onPrep, params.id]);

  if (pathname.startsWith(`${base}/settings`)) return null;

  return (
    <TabBar
      label="Trip sections"
      items={SECTIONS.map(({ slug, label, icon }) => {
        const href = `${base}/${slug}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const badge = slug === "prep" && isPlanner && !onPrep ? prepBadge : 0;
        return { href, label, icon, active, badge };
      })}
    />
  );
}
