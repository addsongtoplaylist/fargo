"use client";

import { useState } from "react";
import { format, parseISO, differenceInDays } from "date-fns";
import {
  MapPin,
  Calendar,
  ChevronDown,
  Check,
  Lightbulb,
} from "lucide-react";

const CATEGORY_EMOJI: Record<string, string> = {
  flights: "✈️",
  accommodation: "🏨",
  food: "🍜",
  transport: "🚕",
  activities: "🏛",
  shopping: "🛒",
  misc: "📦",
};

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
  expenses: {
    id: string;
    date: string;
    title: string;
    category: string;
    amount: string;
    amount_myr: string;
    is_shared: boolean;
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
};

type Tab = "schedule" | "money" | "prep";

export function SharedTripView({
  trip,
  activities,
  expenses,
  checklists,
  ideas,
}: SharedTripViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("schedule");

  const start = parseISO(trip.start_date);
  const end = parseISO(trip.end_date);
  const totalDays = differenceInDays(end, start) + 1;
  const fxRate = parseFloat(trip.fx_rate) || 1;

  // Compute total spent
  const totalSpent = expenses.reduce(
    (sum, e) => sum + parseFloat(e.amount_myr),
    0
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "schedule", label: "Schedule" },
    { key: "money", label: "Money" },
    { key: "prep", label: "Prep" },
  ];

  return (
    <div className="min-h-full bg-ground">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="mx-auto max-w-[480px] px-4 py-5">
          <div className="flex items-center gap-1.5 text-xs text-accent font-medium mb-1">
            <MapPin size={12} />
            {trip.destination}
          </div>
          <h1 className="text-xl font-semibold text-ink">{trip.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(start, "d MMM")} – {format(end, "d MMM yyyy")}
            </span>
            <span>{totalDays} days</span>
            {trip.travellers && trip.travellers.length > 0 && (
              <span>
                {trip.travellers.length}{" "}
                {trip.travellers.length === 1 ? "traveller" : "travellers"}
              </span>
            )}
          </div>

          {/* Sign up CTA for viewers */}
          <a
            href="/sign-in"
            className="mt-3 w-full py-2 flex items-center justify-center gap-1.5 text-xs font-medium text-accent border border-accent/30 rounded-md hover:bg-accent-soft transition-colors"
          >
            Plan your own trip on Fargo →
          </a>
        </div>
      </div>

      {/* Tab bar */}
      <nav className="bg-card border-b border-border sticky top-0 z-40">
        <div className="mx-auto max-w-[480px] px-4 flex gap-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative px-3 py-2.5 text-sm whitespace-nowrap transition-colors ${
                activeTab === key
                  ? "text-accent font-medium"
                  : "text-muted hover:text-ink"
              }`}
            >
              {label}
              {activeTab === key && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab content */}
      <div className="mx-auto max-w-[480px] px-4 py-4 pb-8">
        {activeTab === "schedule" && (
          <ScheduleTab activities={activities} startDate={trip.start_date} endDate={trip.end_date} />
        )}
        {activeTab === "money" && (
          <MoneyTab expenses={expenses} totalSpent={totalSpent} currency={trip.local_currency} />
        )}
        {activeTab === "prep" && (
          <PrepTab checklists={checklists} ideas={ideas} />
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-border">
        <p className="text-xs text-muted">
          Shared via{" "}
          <span className="font-medium text-accent">Fargo</span>
          {" "}— Every trip starts here.
        </p>
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
  // Group by date
  const byDate: Record<string, typeof activities> = {};
  for (const a of activities) {
    if (!byDate[a.date]) byDate[a.date] = [];
    byDate[a.date].push(a);
  }

  // Generate all dates in range
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(format(current, "yyyy-MM-dd"));
    current.setDate(current.getDate() + 1);
  }

  if (activities.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border px-3 py-6">
        <p className="text-sm text-muted text-center">No activities planned yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {days.map((date, dayIndex) => {
        const dayActivities = byDate[date] ?? [];
        if (dayActivities.length === 0) return null;

        return (
          <div key={date}>
            <h3 className="text-xs font-medium text-muted mb-1.5">
              Day {dayIndex + 1} — {format(parseISO(date), "EEEE, d MMM")}
            </h3>
            <div className="space-y-1.5">
              {dayActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-card rounded-lg border border-border p-3 flex items-start gap-3"
                >
                  <span className="text-sm mt-0.5">
                    {CATEGORY_EMOJI[activity.category] ?? "📌"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {activity.title}
                    </p>
                    {activity.time && (
                      <p className="text-xs text-muted mt-0.5">
                        {activity.time}
                      </p>
                    )}
                    {activity.notes && (
                      <p className="text-xs text-muted mt-1">
                        {activity.notes}
                      </p>
                    )}
                  </div>
                  {activity.cost && (
                    <span className="text-xs font-medium text-ink shrink-0">
                      {parseFloat(activity.cost).toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Money Tab ---
function MoneyTab({
  expenses,
  totalSpent,
  currency,
}: {
  expenses: SharedTripViewProps["expenses"];
  totalSpent: number;
  currency: string;
}) {
  // Group by date
  const byDate: Record<string, typeof expenses> = {};
  for (const e of expenses) {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  }
  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      {/* Summary */}
      <div className="bg-card rounded-lg border border-border p-3 mb-4">
        <p className="text-[10px] font-medium text-muted uppercase tracking-wide mb-1">
          Total spent
        </p>
        <p className="text-2xl font-semibold text-ink">
          RM {Math.round(totalSpent).toLocaleString()}
        </p>
        <p className="text-xs text-muted mt-0.5">
          {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Expense list */}
      {expenses.length === 0 ? (
        <div className="bg-card rounded-lg border border-border px-3 py-6">
          <p className="text-sm text-muted text-center">No expenses logged yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDates.map((date) => (
            <div key={date}>
              <p className="text-xs font-medium text-muted mb-1.5">
                {format(parseISO(date), "EEEE, d MMM")}
              </p>
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                {byDate[date].map((expense, i) => (
                  <div
                    key={expense.id}
                    className={`flex items-center gap-2 px-3 py-2.5 ${
                      i > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <span className="text-sm shrink-0">
                      {CATEGORY_EMOJI[expense.category] ?? "📦"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink truncate">
                        {expense.title}
                      </p>
                      {expense.is_shared && (
                        <p className="text-[10px] text-muted">Shared</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-ink">
                        {parseFloat(expense.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted">
                        ≈ RM {parseFloat(expense.amount_myr).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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
  return (
    <div className="space-y-6">
      {/* Checklists */}
      {checklists.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-ink mb-2">Checklists</h3>
          <div className="space-y-3">
            {checklists.map((list) => (
              <div
                key={list.id}
                className="bg-card rounded-lg border border-border p-3"
              >
                <p className="text-sm font-medium text-ink mb-2">
                  {list.title}
                </p>
                <div className="space-y-1.5">
                  {list.checklist_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          item.checked
                            ? "bg-accent border-accent"
                            : "border-border"
                        }`}
                      >
                        {item.checked && (
                          <Check size={10} className="text-accent-on" />
                        )}
                      </span>
                      <span
                        className={`text-sm ${
                          item.checked
                            ? "text-muted line-through"
                            : "text-ink"
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ideas */}
      {ideas.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-ink mb-2">Ideas</h3>
          <div className="space-y-1.5">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="bg-card rounded-lg border border-border px-3 py-2.5 flex items-center gap-2"
              >
                <Lightbulb
                  size={14}
                  className={idea.promoted ? "text-accent" : "text-muted"}
                />
                <span className="text-sm text-ink flex-1">{idea.title}</span>
                {idea.promoted && (
                  <span className="text-[10px] text-accent font-medium">
                    In schedule
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {checklists.length === 0 && ideas.length === 0 && (
        <div className="bg-card rounded-lg border border-border px-3 py-6">
          <p className="text-sm text-muted text-center">No prep items yet.</p>
        </div>
      )}
    </div>
  );
}
