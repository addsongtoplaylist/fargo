import { Column } from "@/components/column";
import { getExpenses, getBudgetSummary } from "@/lib/actions/expense";
import { ExpensesView } from "@/components/money/expenses-view";

export default async function ExpensesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [expenses, budget] = await Promise.all([getExpenses(id), getBudgetSummary(id)]);

  return (
    <Column className="py-4 pb-8">
      <ExpensesView expenses={expenses} tripId={id} myTravellerId={budget?.travellerId ?? null} />
    </Column>
  );
}
