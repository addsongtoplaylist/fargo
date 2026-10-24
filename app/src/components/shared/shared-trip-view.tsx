"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { format, parseISO, differenceInDays } from "date-fns";
import { CalendarDays } from "lucide-react";
import { CloneTripButton } from "./clone-trip-button";
import { tintFor } from "@/components/trip-cover";
import { countryCode } from "@/lib/country-code";
import { coverUrl, coverObjectPosition } from "@/lib/cover";
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
 * Read-only shared trip (`/s/[code]`): cover + Schedule only — no checklists,
 * ideas or money (v0.5.4, docs/PERMISSIONS.md). Rows follow Schedule's rules
 * (no notes, no cost). v0.7.2 (owner, option A): full-width cover with who
 * shared it and fact chips, day pills that follow the scroll, and "Save as my
 * trip" pinned to the bottom.
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
  const planner = trip.travellers?.find((t) => t.role === "planner")?.display_name;
  const photo = coverUrl(trip.cover_path);
  const code = countryCode(trip.destination);
  const chip = `text-[13px] font-semibold px-3 py-1.5 rounded-full ${photo ? "bg-white/90 text-fg" : "bg-surface text-fg"}`;

  return (
    <div className="min-h-dvh bg-page">
      <div className="mx-auto max-w-[480px]">
        {/* Cover */}
        <header
          className={`relative overflow-hidden h-[300px] px-5 pb-11 flex flex-col justify-end ${photo ? "bg-fg text-white" : tintFor(trip.id)}`}
        >
          {photo && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- Supabase storage photo; already resized on upload */}
              <img
                src={photo}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: coverObjectPosition(trip.cover_position) }}
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            </>
          )}
          {!photo && code && (
            <span aria-hidden className="absolute -right-2 top-4 text-[170px] font-extrabold tracking-[-6px] opacity-[0.14] leading-none">
              {code}
            </span>
          )}
          <div className="relative">
            {planner && <p className="text-[13px] font-semibold">{planner} shared a trip plan</p>}
            <h1 className={`text-[32px] font-bold leading-tight tracking-[-0.6px] mt-1 ${photo ? "text-white" : "text-fg"}`}>{trip.name}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={chip}>{trip.destination}</span>
              <span className={chip}>
                {format(start, "d MMM")} – {format(end, "d MMM")}
              </span>
              <span className={chip}>
                {totalDays} day{totalDays === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </header>

        {/* Plan on a sheet rising over the cover; room at the bottom for the pinned bar */}
        <main className="relative -mt-6 rounded-t-[24px] bg-page px-4 pt-4 pb-[calc(9rem+env(safe-area-inset-bottom))]">
          <ScheduleTab activities={activities} startDate={trip.start_date} endDate={trip.end_date} />
        </main>
      </div>

      {/* Pinned: save (signed in) or sign in, and where it was made */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-surface border-t border-line">
        <div className="mx-auto max-w-[480px] px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {isSignedIn ? (
            <CloneTripButton shareCode={shareCode} variant="primary" />
          ) : (
            <Link href="/sign-in" className={buttonClasses("primary", "lg", true)}>
              Sign in to save this trip
            </Link>
          )}
          <p className="text-center text-xs text-fg-muted mt-2">
            Planned with <span className="font-semibold text-brand">Fargo</span>
          </p>
        </div>
      </div>
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

  // Only days with plans get a pill and a section; each keeps its own "Day N"
  const planned = days
    .map((date, i) => ({ date, n: i + 1, items: byDate[date] ?? [] }))
    .filter((d) => d.items.length > 0);

  return <DayPills days={planned} />;
}

function DayPills({ days }: { days: { date: string; n: number; items: SharedTripViewProps["activities"] }[] }) {
  const [active, setActive] = useState(days[0]?.date ?? "");
  const pillRow = useRef<HTMLDivElement>(null);

  // Highlight the day whose section is at the top of the screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id.replace("day-", ""));
      },
      { rootMargin: "-72px 0px -60% 0px" }
    );
    for (const d of days) {
      const el = document.getElementById(`day-${d.date}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [days]);

  // Keep the active pill in view
  useEffect(() => {
    pillRow.current?.querySelector<HTMLElement>(`[data-day="${active}"]`)?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [active]);

  return (
    <>
      <nav aria-label="Days" className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-page">
        <div ref={pillRow} className="flex gap-2 overflow-x-auto scrollbar-none">
          {days.map((d) => (
            <a
              key={d.date}
              href={`#day-${d.date}`}
              data-day={d.date}
              aria-current={active === d.date ? "true" : undefined}
              onClick={() => setActive(d.date)}
              className={`shrink-0 h-9 px-3.5 rounded-full text-sm font-semibold flex items-center ${
                active === d.date ? "bg-fg text-white" : "bg-surface text-fg border border-line"
              }`}
            >
              Day {d.n}
            </a>
          ))}
        </div>
      </nav>

      <div className="space-y-4 mt-1">
        {days.map((d) => (
          <section key={d.date} id={`day-${d.date}`} className="bg-surface rounded-card p-4 scroll-mt-[64px]">
            <h2 className="text-[15px] font-semibold text-fg">
              Day {d.n} <span className="font-normal text-fg-muted">· {format(parseISO(d.date), "EEEE, d MMM")}</span>
            </h2>
            <div className="mt-2 divide-y divide-line">
              {d.items.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-[42px] shrink-0 text-[13px] text-fg-muted">{activity.time}</span>
                  <CategoryIcon category={activity.category} size={32} />
                  <p className="flex-1 min-w-0 text-[15px] font-semibold text-fg truncate">{activity.title}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
