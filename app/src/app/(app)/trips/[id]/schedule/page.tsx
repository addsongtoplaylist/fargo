import { getActivities } from "@/lib/actions/activity";
import { getBudgetSummary } from "@/lib/actions/expense";
import { ActivityList } from "@/components/schedule/activity-list";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [activities, budget] = await Promise.all([
    getActivities(id),
    getBudgetSummary(id),
  ]);

  return (
    <div className="mx-auto w-full max-w-[var(--max-width-column)] py-2 pb-8">
      <ActivityList
        activities={activities}
        dailyFree={budget?.dailyFree ?? 0}
        spendingByDate={budget?.spendingByDate ?? {}}
      />
    </div>
  );
}
