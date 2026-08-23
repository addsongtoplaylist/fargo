import { Column } from "@/components/column";
import { getExpenses, getBudgetSummary } from "@/lib/actions/expense";
import { MoneyView } from "@/components/money/money-view";

export default async function MoneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [expenses, budget] = await Promise.all([
    getExpenses(id),
    getBudgetSummary(id),
  ]);

  return (
    <Column className="py-4 pb-8">
      <MoneyView expenses={expenses} budget={budget} tripId={id} />
    </Column>
  );
}
