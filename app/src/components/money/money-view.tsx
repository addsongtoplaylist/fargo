"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useTrip } from "@/lib/trip-context";
import { deleteExpense, updateBudget } from "@/lib/actions/expense";
import { LogExpensePanel } from "./log-expense-panel";
import type { Expense } from "@/lib/actions/expense";

const CATEGORY_EMOJI: Record<string, string> = {
  flights: "✈️",
  accommodation: "🏨",
  food: "🍜",
  transport: "🚕",
  activities: "🏛",
  shopping: "🛒",
  misc: "📦",
};

type BudgetSummary = {
  travellerId: string;
  budgetTotal: number;
  totalSpent: number;
  remaining: number;
  dailyFree: number;
  activityCostsMyr: number;
  tripDays: number;
  spendingByCategory: Record<string, number>;
};

type MoneyViewProps = {
  expenses: Expense[];
  budget: BudgetSummary | null;
  tripId: string;
};

export function MoneyView({ expenses, budget, tripId }: MoneyViewProps) {
  const trip = useTrip();
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(
    budget?.budgetTotal?.toString() ?? ""
  );

  if (!trip) return null;

  const fxRate = parseFloat(trip.fx_rate) || 1;

  async function handleBudgetSave() {
    const value = parseInt(budgetInput);
    if (isNaN(value) || value < 0) return;
    await updateBudget(tripId, value);
    setEditingBudget(false);
  }

  async function handleDelete(expenseId: string) {
    await deleteExpense(expenseId, tripId);
  }

  // Group expenses by date
  const groupedByDate: Record<string, Expense[]> = {};
  for (const expense of expenses) {
    if (!groupedByDate[expense.date]) groupedByDate[expense.date] = [];
    groupedByDate[expense.date].push(expense);
  }
  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    b.localeCompare(a)
  );

  return (
    <div>
      {/* Budget card */}
      <div className="bg-card rounded-lg border border-border p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-muted uppercase tracking-wide">
            Budget
          </h3>
          <button
            onClick={() => setEditingBudget(!editingBudget)}
            className="text-xs text-accent hover:text-accent-hover transition-colors"
          >
            {editingBudget ? "Cancel" : "Edit"}
          </button>
        </div>

        {editingBudget ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">RM</span>
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="flex-1 bg-ground border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleBudgetSave();
              }}
            />
            <button
              onClick={handleBudgetSave}
              className="px-3 py-1.5 bg-accent text-accent-on text-xs font-medium rounded-md"
            >
              Save
            </button>
          </div>
        ) : budget && budget.budgetTotal > 0 ? (
          <div>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-semibold text-ink money">
                  RM {budget.budgetTotal.toLocaleString()}
                </p>
                <p className="text-xs text-muted mt-0.5">Total budget</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-semibold money ${
                    budget.remaining >= 0 ? "text-money-ok" : "text-money-over"
                  }`}
                >
                  RM {budget.remaining.toLocaleString()}
                </p>
                <p className="text-xs text-muted mt-0.5">Remaining</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-2 bg-ground rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  budget.remaining >= 0 ? "bg-money-ok" : "bg-money-over"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (budget.totalSpent / budget.budgetTotal) * 100
                  )}%`,
                }}
              />
            </div>

            <div className="flex justify-between mt-1.5">
              <p className="text-xs text-muted">
                Spent: RM {budget.totalSpent.toLocaleString()}
              </p>
              <p className="text-xs text-muted">
                Daily free: RM {budget.dailyFree.toLocaleString()}
              </p>
            </div>

            {/* Category breakdown */}
            {Object.keys(budget.spendingByCategory).length > 0 && (
              <div className="mt-3 pt-3 border-t border-border space-y-1">
                {Object.entries(budget.spendingByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amount]) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted">
                        {CATEGORY_EMOJI[cat] ?? "📦"}{" "}
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </span>
                      <span className="text-ink money">
                        RM {Math.round(amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              setEditingBudget(true);
              setBudgetInput("");
            }}
            className="w-full py-3 text-sm text-accent border border-dashed border-accent/40 rounded-md hover:bg-accent-soft transition-colors"
          >
            Set your budget
          </button>
        )}
      </div>

      {/* Expenses header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-ink">Expenses</h3>
        <button
          onClick={() => setPanelOpen(true)}
          className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
        >
          <Plus size={14} />
          Log expense
        </button>
      </div>

      {/* Expense list grouped by date */}
      {expenses.length === 0 ? (
        <div className="bg-card rounded-lg border border-border px-3 py-6">
          <p className="text-sm text-muted text-center">
            No expenses yet. Log your first one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDates.map((date) => (
            <div key={date}>
              <p className="text-xs font-medium text-muted mb-1.5">
                {format(parseISO(date), "EEEE, d MMM")}
              </p>
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                {groupedByDate[date].map((expense, i) => (
                  <div
                    key={expense.id}
                    className={`flex items-center gap-2 px-3 py-2.5 group ${
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
                      <p className="text-sm font-medium text-ink money">
                        {parseFloat(expense.amount).toLocaleString()}{" "}
                        <span className="text-xs text-muted font-normal">
                          {trip.local_currency}
                        </span>
                      </p>
                      <p className="text-[10px] text-muted money">
                        RM {parseFloat(expense.amount_myr).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-muted hover:text-money-over transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log expense panel */}
      {panelOpen && budget && (
        <LogExpensePanel
          tripId={tripId}
          localCurrency={trip.local_currency}
          fxRate={fxRate}
          travellerId={budget.travellerId}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  );
}
