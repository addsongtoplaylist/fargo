import { Column } from "@/components/column";
import { ShareButton } from "@/components/share-button";
import { getBudgetSummary } from "@/lib/actions/expense";
import { getActivities } from "@/lib/actions/activity";
import { getChecklists } from "@/lib/actions/checklist";
import { getTrip, getMyRole } from "@/lib/actions/trip";
import { format, parseISO, isAfter } from "date-fns";

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
  const [budget, activities, checklists, trip, myRole] = await Promise.all([
    getBudgetSummary(id),
    getActivities(id),
    getChecklists(id),
    getTrip(id),
    getMyRole(id),
  ]);

  const isPlanner = myRole === "planner";

  // Check if trip has ended
  const tripEnded = trip
    ? isAfter(new Date(), parseISO(trip.end_date))
    : false;

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
      {/* Share — planner only */}
      {isPlanner && <ShareButton tripId={id} />}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Activities"
          value={activities.length.toString()}
          sub="planned"
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
        />
        <StatCard
          label="Expenses"
          value={
            budget
              ? `RM ${budget.totalSpent.toLocaleString()}`
              : "RM 0"
          }
          sub={`across ${budget?.tripDays ?? 0} days`}
        />
        <StatCard
          label="Daily budget"
          value={
            budget && budget.dailyFree > 0
              ? `RM ${budget.dailyFree.toLocaleString()}`
              : "—"
          }
          sub="per day free"
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
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <p className="text-[10px] font-medium text-muted uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-lg font-semibold text-ink leading-tight">{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  );
}
