"use client";

import Link from "next/link";
import { format, parseISO, differenceInDays } from "date-fns";
import { CalendarDays } from "lucide-react";
import { CloneTripButton } from "./clone-trip-button";
import { TripCover } from "@/components/trip-cover";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Empty } from "@/components/ui/empty";
import { buttonClasses } from "@/components/ui/button";

type SharedTripViewProps = {
  trip: {
    id: string;
    cover_path?: string | null;
    cover_position?: number | null;
    name: string;
    destination: string;
    start_date: string;
    end_date: string;
    trip_type: string;
    local_currency: string;
    fx_rate: string;
    travellers?: { id: string; display_name: string; role: string }[];
  };
  activities: {
    id: string;
    date: string;
    time: string | null;
    title: string;
    notes: string | null;
    category: string;
    cost: string | null;
    sort_order: number;
  }[];
  shareCode: string;
  isSignedIn: boolean;
};

/**
 * Read-only shared trip (`/s/[code]`): cover header + Schedule only — no
 * checklists, ideas or money (v0.5.4, docs/PERMISSIONS.md). Rows follow
 * Schedule's rules (no notes, no cost).
 */
export function SharedTripView({
  trip,
  activities,
  shareCode,
  isSignedIn,
}: SharedTripViewProps) {
  const start = parseISO(trip.start_date);
  const end = parseISO(trip.end_date);
  const totalDays = differenceInDays(end, start) + 1;
  const travellerCount = trip.travellers?.length ?? 0;

  return (
    <div className="min-h-dvh bg-page">
      {/* Header */}
      <header className="mx-auto max-w-[480px] px-4 pt-6">
        <div className="bg-surface rounded-card p-4">
          <div className="flex items-start gap-3.5">
            <TripCover tripId={trip.id} destination={trip.destination} coverPath={trip.cover_path} coverPosition={trip.cover_position} size={64} radius={16} />
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-xs font-semibold tracking-[1px] uppercase text-brand">{trip.destination}</p>
              <h1 className="text-xl font-bold text-fg leading-tight mt-0.5">{trip.name}</h1>
              <p className="text-[13px] text-fg-muted mt-1">
                {format(start, "d MMM")} – {format(end, "d MMM yyyy")} · {totalDays} days
                {travellerCount > 0 && ` · ${travellerCount} ${travellerCount === 1 ? "traveller" : "travellers"}`}
              </p>
            </div>
          </div>

          {/* CTA — clone if signed in, sign in otherwise */}
          <div className="mt-4">
            {isSignedIn ? (
              <CloneTripButton shareCode={shareCode} />
            ) : (
              <Link href="/sign-in" className={buttonClasses("soft", "md", true)}>
                Sign in to save this trip
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[480px] px-4 pt-4 pb-8">
        <ScheduleTab activities={activities} startDate={trip.start_date} endDate={trip.end_date} />
      </main>

      <footer className="text-center pb-10 pt-2">
        <p className="text-xs text-fg-muted">
          Shared via <span className="font-semibold text-brand">Fargo</span> — Every trip starts here.
        </p>
      </footer>
    </div>
  );
}

// --- Schedule Tab ---
function ScheduleTab({
  activities,
  startDate,
  endDate,
}: {
  activities: SharedTripViewProps["activities"];
  startDate: string;
  endDate: string;
}) {
  const byDate: Record<string, typeof activities> = {};
  for (const a of activities) (byDate[a.date] ??= []).push(a);

  // All dates in range, so each day keeps its "Day N"
  const days: string[] = [];
  const current = new Date(parseISO(startDate));
  const end = parseISO(endDate);
  while (current <= end) {
    days.push(format(current, "yyyy-MM-dd"));
    current.setDate(current.getDate() + 1);
  }

  if (activities.length === 0) {
    return (
      <div className="bg-surface rounded-card">
        <Empty icon={CalendarDays} message="No activities planned yet." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {days.map((date, dayIndex) => {
        const dayActivities = byDate[date] ?? [];
        if (dayActivities.length === 0) return null;
        return (
          <section key={date} className="bg-surface rounded-card p-4">
            <h2 className="text-[15px] font-semibold text-fg">
              Day {dayIndex + 1} <span className="font-normal text-fg-muted">· {format(parseISO(date), "EEEE, d MMM")}</span>
            </h2>
            <div className="mt-2 divide-y divide-line">
              {dayActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-[42px] shrink-0 text-[13px] text-fg-muted">{activity.time}</span>
                  <CategoryIcon category={activity.category} size={32} />
                  <p className="flex-1 min-w-0 text-[15px] font-semibold text-fg truncate">{activity.title}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
