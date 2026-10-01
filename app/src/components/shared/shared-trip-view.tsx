"use client";

import { useState } from "react";
import Link from "next/link";
import { format, parseISO, differenceInDays } from "date-fns";
import { Check, Lightbulb, CalendarDays, ListChecks } from "lucide-react";
import { CloneTripButton } from "./clone-trip-button";
import { TripCover } from "@/components/trip-cover";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Segmented } from "@/components/ui/segmented";
import { Empty } from "@/components/ui/empty";
import { buttonClasses } from "@/components/ui/button";

type SharedTripViewProps = {
  trip: {
    id: string;
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
  checklists: {
    id: string;
    title: string;
    checklist_items: {
      id: string;
      text: string;
      checked: boolean;
    }[];
  }[];
  ideas: {
    id: string;
    title: string;
    link: string | null;
    promoted: boolean;
  }[];
  shareCode: string;
  isSignedIn: boolean;
};

type Tab = "schedule" | "prep";

/**
 * Read-only shared trip (`/s/[code]`, redesign P8b): cover header, Schedule /
 * Prep segmented, no money. Rows follow Schedule's rules (no notes, no cost).
 */
export function SharedTripView({
  trip,
  activities,
  checklists,
  ideas,
  shareCode,
  isSignedIn,
}: SharedTripViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("schedule");

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
            <TripCover tripId={trip.id} destination={trip.destination} size={64} radius={16} />
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

      {/* Schedule / Prep */}
      <nav className="sticky top-0 z-40 bg-page">
        <div className="mx-auto max-w-[480px] px-4 py-3">
          <Segmented
            label="Section"
            options={[
              { value: "schedule", label: "Schedule" },
              { value: "prep", label: "Prep" },
            ]}
            value={activeTab}
            onChange={setActiveTab}
            className="bg-surface"
          />
        </div>
      </nav>

      <main className="mx-auto max-w-[480px] px-4 pb-8">
        {activeTab === "schedule" && (
          <ScheduleTab activities={activities} startDate={trip.start_date} endDate={trip.end_date} />
        )}
        {activeTab === "prep" && <PrepTab checklists={checklists} ideas={ideas} />}
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

// --- Prep Tab ---
function PrepTab({
  checklists,
  ideas,
}: {
  checklists: SharedTripViewProps["checklists"];
  ideas: SharedTripViewProps["ideas"];
}) {
  if (checklists.length === 0 && ideas.length === 0) {
    return (
      <div className="bg-surface rounded-card">
        <Empty icon={ListChecks} message="No prep items yet." />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {checklists.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-fg mx-1 mb-2">Checklists</h2>
          <div className="space-y-3">
            {checklists.map((list) => {
              const done = list.checklist_items.filter((i) => i.checked).length;
              return (
                <div key={list.id} className="bg-surface rounded-card">
                  <p className="px-4 pt-3 pb-2 text-[15px] font-semibold text-fg">
                    {list.title}{" "}
                    {list.checklist_items.length > 0 && (
                      <span className="text-[13px] font-normal text-fg-muted tabular-nums">
                        {done} of {list.checklist_items.length}
                      </span>
                    )}
                  </p>
                  <div className="divide-y divide-line border-t border-line">
                    {list.checklist_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 px-4 min-h-[44px]">
                        <span
                          aria-hidden
                          className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 ${
                            item.checked ? "bg-brand border-brand" : "border-line"
                          }`}
                        >
                          {item.checked && <Check size={13} strokeWidth={3} className="text-brand-on" />}
                        </span>
                        <span className={`text-sm py-2.5 ${item.checked ? "text-fg-faint line-through" : "text-fg"}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {ideas.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-fg mx-1 mb-2">Ideas</h2>
          <div className="bg-surface rounded-card divide-y divide-line">
            {ideas.map((idea) => (
              <div key={idea.id} className="flex items-center gap-3 px-4 min-h-[48px]">
                <Lightbulb size={16} className={idea.promoted ? "text-brand" : "text-fg-faint"} aria-hidden />
                <span className="text-sm text-fg flex-1 py-2.5">{idea.title}</span>
                {idea.promoted && <span className="text-xs font-semibold text-brand">In schedule</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
