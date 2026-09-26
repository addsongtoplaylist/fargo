import { Column } from "@/components/column";
import { getExpenses, getBudgetSummary } from "@/lib/actions/expense";
import { SettleUpView } from "@/components/money/settle-up-view";

export default async function SettleUpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [expenses, budget] = await Promise.all([getExpenses(id), getBudgetSummary(id)]);

  return (
    <Column className="py-4 pb-8">
      <SettleUpView expenses={expenses} tripId={id} myTravellerId={budget?.travellerId ?? null} />
    </Column>
  );
}
