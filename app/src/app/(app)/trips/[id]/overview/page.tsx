import Link from "next/link";
import { Column } from "@/components/column";
import { getBudgetSummary } from "@/lib/actions/expense";
import { getActivities } from "@/lib/actions/activity";
import { getChecklists } from "@/lib/actions/checklist";
import { getTrip } from "@/lib/actions/trip";
import { CATEGORY_EMOJI } from "@/lib/categories";
import {
  format,
  parseISO,
  isAfter,
  isBefore,
  isToday,
  differenceInCalendarDays,
} from "date-fns";
import { notFound } from "next/navigation";
import { MapPin, Clock } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  flights: "✈️ Flights",
  accommodation: "🏨 Accommodation",
  food: "🍜 Food",
  transport: "🚕 Transport",
  activities: "🏛 Activities",
  shopping: "🛒 Shopping",
  misc: "📦 Misc",
};

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [budget, activities, checklists, trip] = await Promise.all([
    getBudgetSummary(id),
    getActivities(id),
    getChecklists(id),
    getTrip(id),
  ]);

  if (!trip) notFound();

  const now = new Date();
  const startDate = parseISO(trip.start_date);
  const endDate = parseISO(trip.end_date);
  const tripEnded = isAfter(now, endDate);
  const tripStarted = !isBefore(now, startDate);
  const isActive = tripStarted && !tripEnded;

  // Trip progress
  const totalDays = differenceInCalendarDays(endDate, startDate) + 1;
  const currentDay = isActive
    ? differenceInCalendarDays(now, startDate) + 1
    : tripEnded
      ? totalDays
      : 0;
  const progressPct = totalDays > 0 ? Math.min((currentDay / totalDays) * 100, 100) : 0;

  // Today's activities (for active trips)
  const todayStr = format(now, "yyyy-MM-dd");
  const todayActivities = isActive
    ? activities
        .filter((a) => a.date === todayStr)
        .sort((a, b) => {
          if (!a.time && !b.time) return a.sort_order - b.sort_order;
          if (!a.time) return 1;
          if (!b.time) return -1;
          return a.time.localeCompare(b.time);
        })
    : [];

  // Find next upcoming activity (with time >= now)
  const nowTime = format(now, "HH:mm");
  const nextIdx = todayActivities.findIndex(
    (a) => !a.time || a.time >= nowTime
  );

  // Checklist stats
  const allItems = checklists.flatMap((c) => c.checklist_items);
  const checkedCount = allItems.filter((i) => i.done).length;
  const totalItems = allItems.length;

  // Top spending category
  let topCategory: string | null = null;
  let topCategoryAmount = 0;
  if (budget?.spendingByCategory) {
    for (const [cat, amount] of Object.entries(budget.spendingByCategory)) {
      if (amount > topCategoryAmount) {
        topCategoryAmount = amount;
        topCategory = cat;
      }
    }
  }

  return (
    <Column className="py-4 pb-8 space-y-4">
      {/* Trip progress — active or upcoming */}
      {!tripEnded && (
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-ink">
              {isActive
                ? `Day ${currentDay} of ${totalDays}`
                : `${differenceInCalendarDays(startDate, now)} days to go`}
            </p>
            <p className="text-xs text-muted">
              {format(startDate, "d MMM")} – {format(endDate, "d MMM yyyy")}
            </p>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-ground rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${isActive ? progressPct : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Today's plan — active trips only */}
      {isActive && (
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink">Today's plan</p>
            <Link
              href={`/trips/${id}/schedule`}
              className="text-xs text-accent font-medium hover:text-accent-hover transition-colors"
            >
              View schedule →
            </Link>
          </div>

          {todayActivities.length === 0 ? (
            <p className="text-sm text-muted py-2">
              Nothing planned for today.
            </p>
          ) : (
            <div className="space-y-2">
              {todayActivities.slice(0, 4).map((activity, i) => {
                const isNext = i === nextIdx;
                return (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-3 rounded-md px-2.5 py-2 ${
                      isNext
                        ? "bg-accent/10 border border-accent/20"
                        : "bg-ground"
                    }`}
                  >
                    {/* Time */}
                    <div className="w-12 shrink-0 pt-0.5">
                      {activity.time ? (
                        <span
                          className={`text-xs font-medium tabular-nums ${
                            isNext ? "text-accent" : "text-muted"
                          }`}
                        >
                          {activity.time}
                        </span>
                      ) : (
                        <span className="text-xs text-muted/50">—</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">
                          {CATEGORY_EMOJI[activity.category] ?? "📦"}
                        </span>
                        <span
                          className={`text-sm truncate ${
                            isNext
                              ? "font-semibold text-ink"
                              : "font-medium text-ink"
                          }`}
                        >
                          {activity.title}
                        </span>
                      </div>
                      {activity.place_name && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin
                            size={10}
                            className="text-muted/60 shrink-0"
                          />
                          <span className="text-[11px] text-muted truncate">
                            {activity.place_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* "Up next" label */}
                    {isNext && (
                      <span className="text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">
                        Next
                      </span>
                    )}
                  </div>
                );
              })}
              {todayActivities.length > 4 && (
                <Link
                  href={`/trips/${id}/schedule`}
                  className="block text-center text-xs text-muted hover:text-accent py-1 transition-colors"
                >
                  +{todayActivities.length - 4} more
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick stats — tappable */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Activities"
          value={activities.length.toString()}
          sub="planned"
          href={`/trips/${id}/schedule`}
        />
        <StatCard
          label="Budget"
          value={
            budget && budget.budgetTotal > 0
              ? `RM ${budget.budgetTotal.toLocaleString()}`
              : "Not set"
          }
          sub={
            budget && budget.budgetTotal > 0
              ? `RM ${budget.remaining.toLocaleString()} left`
              : undefined
          }
          href={`/trips/${id}/money`}
        />
        <StatCard
          label="Expenses"
          value={
            budget
              ? `RM ${budget.totalSpent.toLocaleString()}`
              : "RM 0"
          }
          sub={`across ${budget?.tripDays ?? 0} days`}
          href={`/trips/${id}/money`}
        />
        <StatCard
          label="Daily budget"
          value={
            budget && budget.dailyFree > 0
              ? `RM ${budget.dailyFree.toLocaleString()}`
              : "—"
          }
          sub="per day free"
          href={`/trips/${id}/money`}
        />
      </div>

      {/* Post-trip summary — only shows after trip ends */}
      {tripEnded && (
        <div className="space-y-3">
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm font-semibold text-ink mb-3">
              🎉 Trip complete
            </p>
            <div className="space-y-2.5">
              {/* Total spent */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Total spent</span>
                <span className="text-sm font-medium text-ink">
                  RM {budget ? budget.totalSpent.toLocaleString() : "0"}
                </span>
              </div>

              {/* Top category */}
              {topCategory && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Biggest category</span>
                  <span className="text-sm font-medium text-ink">
                    {CATEGORY_LABELS[topCategory] ?? topCategory}{" "}
                    <span className="text-muted font-normal">
                      RM {Math.round(topCategoryAmount).toLocaleString()}
                    </span>
                  </span>
                </div>
              )}

              {/* Daily average */}
              {budget && budget.tripDays > 0 && budget.totalSpent > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Daily average</span>
                  <span className="text-sm font-medium text-ink">
                    RM{" "}
                    {Math.round(
                      budget.totalSpent / budget.tripDays
                    ).toLocaleString()}
                    /day
                  </span>
                </div>
              )}

              {/* Checklist completion */}
              {totalItems > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Packing & prep</span>
                  <span className="text-sm font-medium text-ink">
                    {checkedCount}/{totalItems} done
                    {checkedCount === totalItems && " ✅"}
                  </span>
                </div>
              )}

              {/* Budget status */}
              {budget && budget.budgetTotal > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Budget</span>
                  <span
                    className={`text-sm font-medium ${
                      budget.remaining >= 0 ? "text-accent" : "text-red-500"
                    }`}
                  >
                    {budget.remaining >= 0
                      ? `RM ${budget.remaining.toLocaleString()} under`
                      : `RM ${Math.abs(budget.remaining).toLocaleString()} over`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Column>
  );
}

function StatCard({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-card rounded-lg border border-border p-3 hover:border-accent/40 transition-colors"
    >
      <p className="text-[10px] font-medium text-muted uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-lg font-semibold text-ink leading-tight">{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </Link>
  );
}
