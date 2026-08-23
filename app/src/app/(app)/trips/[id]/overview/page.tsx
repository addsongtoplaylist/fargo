import { Column } from "@/components/column";
import { ShareButton } from "@/components/share-button";
import { getBudgetSummary } from "@/lib/actions/expense";
import { getActivities } from "@/lib/actions/activity";
import { format, parseISO, differenceInDays, isAfter, isBefore } from "date-fns";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [budget, activities] = await Promise.all([
    getBudgetSummary(id),
    getActivities(id),
  ]);

  return (
    <Column className="py-4 pb-8 space-y-4">
      {/* Share */}
      <ShareButton tripId={id} />

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

      {/* Coming soon placeholder */}
      <div className="bg-card rounded-lg border border-border px-3 py-4">
        <p className="text-sm text-muted text-center">
          More overview details coming soon.
        </p>
      </div>
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
