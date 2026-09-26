"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { useTrip } from "@/lib/trip-context";
import { updateBudget } from "@/lib/actions/expense";
import { LogExpensePanel } from "./log-expense-panel";
import { useToast } from "@/components/toast";
import type { Expense } from "@/lib/actions/expense";
import { CATEGORY_EMOJI, categoryLabel } from "@/lib/categories";
import { computeBalances, fewestPayments } from "@/lib/balances";
import { tripTravellers, formatLocal } from "./money-utils";

const FIXED_CATEGORIES = ["flights", "accommodation", "activities"];

export type BudgetSummary = {
  travellerId: string;
  budgetTotal: number;
  totalSpent: number;
  remaining: number;
  dailyFree: number;
  fixedExpensesMyr: number;
  tripDays: number;
  paidCount: number;
  spendingByCategory: Record<string, number>;
};

type MoneyViewProps = {
  /** Every expense and settlement on the trip — used for balances */
  expenses: Expense[];
  budget: BudgetSummary | null;
  tripId: string;
};

export function MoneyView({ expenses, budget, tripId }: MoneyViewProps) {
  const trip = useTrip();
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(
    budget?.budgetTotal ? budget.budgetTotal.toString() : ""
  );
  const savingBudgetRef = useRef(false);
  const { toast } = useToast();

  if (!trip) return null;

  const fxRate = trip.fx_rate;
  const cur = trip.local_currency;
  const myTravellerId = budget?.travellerId ?? null;
  const travellers = tripTravellers(trip.travellers);
  const travellerIds = travellers.map((t) => t.id);
  const nameOf = (id: string) => travellers.find((t) => t.id === id)?.display_name ?? "Someone";

  async function handleBudgetSave() {
    const value = parseInt(budgetInput);
    if (isNaN(value) || value < 0 || savingBudgetRef.current) return;
    savingBudgetRef.current = true;
    try {
      await updateBudget(tripId, value);
      setEditingBudget(false);
    } catch (err) {
      console.error(err);
      toast("Failed to save budget. Please try again.", "error");
    } finally {
      savingBudgetRef.current = false;
    }
  }

  // ── Settle-up card (D21, D30) ──
  const balances = computeBalances(expenses, travellerIds);
  const payments = fewestPayments(balances, travellerIds);
  const myBalance = myTravellerId ? balances.get(myTravellerId) ?? 0 : 0;
  const names = (ids: string[]) => {
    const unique = [...new Set(ids)].map(nameOf);
    return unique.length <= 2 ? unique.join(" and ") : `${unique.slice(0, 2).join(", ")} and ${unique.length - 2} more`;
  };
  let settle: { title: string; sub: string; done: boolean } | null = null;
  if (travellers.length > 1 && expenses.length > 0 && myTravellerId) {
    if (myBalance < 0) {
      settle = {
        title: `You owe ${cur} ${formatLocal(-myBalance)}`,
        sub: `To ${names(payments.filter((p) => p.from === myTravellerId).map((p) => p.to))}`,
        done: false,
      };
    } else if (myBalance > 0) {
      settle = {
        title: `You're owed ${cur} ${formatLocal(myBalance)}`,
        sub: `From ${names(payments.filter((p) => p.to === myTravellerId).map((p) => p.from))}`,
        done: false,
      };
    } else if (payments.length > 0) {
      settle = {
        title: "You're settled up",
        sub: `${payments.length} payment${payments.length === 1 ? "" : "s"} still open in the group`,
        done: true,
      };
    } else {
      settle = { title: "All settled ✓", sub: "Everyone is square", done: true };
    }
  }

  // ── Breakdown (what you paid, D19/D27) ──
  const entries = Object.entries(budget?.spendingByCategory ?? {});
  const groups = [
    { label: "Fixed", items: entries.filter(([k]) => FIXED_CATEGORIES.includes(k)) },
    { label: "Daily", items: entries.filter(([k]) => !FIXED_CATEGORIES.includes(k) && k !== "settlement") },
    { label: "Settle-ups", items: entries.filter(([k]) => k === "settlement") },
  ].filter((g) => g.items.length > 0);

  const hasBudget = !!budget && budget.budgetTotal > 0;
  const spentLocal = Math.round((budget?.totalSpent ?? 0) * fxRate);

  return (
    <div className="space-y-4">
      {/* Settle-up card */}
      {settle && (
        <Link
          href={`/trips/${tripId}/money/settle`}
          className={`block bg-card rounded-lg border p-3 hover:bg-ground/50 transition-colors ${
            settle.done ? "border-border" : "border-accent/40"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${settle.done && payments.length === 0 ? "text-money-ok" : "text-ink"}`}>
                {settle.title}
              </p>
              <p className="text-xs text-muted truncate">{settle.sub}</p>
            </div>
            <span className="flex items-center text-xs font-medium text-accent shrink-0">
              Settle up <ChevronRight size={14} />
            </span>
          </div>
        </Link>
      )}

      {/* My budget card */}
      <div className="bg-card rounded-lg border border-border p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-muted uppercase tracking-wide">My budget</h3>
          {(editingBudget || hasBudget) && (
            <button
              onClick={() => setEditingBudget(!editingBudget)}
              className="text-xs text-accent hover:text-accent-hover transition-colors"
            >
              {editingBudget ? "Cancel" : "Edit"}
            </button>
          )}
        </div>

        {editingBudget ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">RM</span>
              <input
                id="budget-input"
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
            {budgetInput && !isNaN(parseInt(budgetInput)) && parseInt(budgetInput) > 0 && (
              <p className="text-xs text-muted">
                ≈ {cur} {Math.round(parseInt(budgetInput) * fxRate).toLocaleString()} in {trip.destination}
              </p>
            )}
            <p className="text-[10px] text-muted/70">
              Only you see and set this. (Total budget − fixed costs you paid) ÷ {budget?.tripDays ?? "trip"} days = daily free budget
            </p>
          </div>
        ) : hasBudget && budget ? (
          (() => {
            const budgetLocal = Math.round(budget.budgetTotal * fxRate);
            const remainingLocal = Math.round(budget.remaining * fxRate);
            // Smaller font when either amount is 6+ digits (e.g. VND 1,500,000)
            const isLarge = Math.abs(budgetLocal) >= 100_000 || Math.abs(remainingLocal) >= 100_000;
            return (
              <div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <p
                      className={`${isLarge ? "text-lg" : "text-2xl"} font-semibold tabular-nums ${
                        budget.remaining >= 0 ? "text-money-ok" : "text-money-over"
                      }`}
                    >
                      {cur} {remainingLocal.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      left of {cur} {budgetLocal.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`${isLarge ? "text-base" : "text-lg"} font-semibold text-ink money`}>
                      {cur} {Math.round(budget.dailyFree * fxRate).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted mt-0.5">daily free</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-ground rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budget.remaining >= 0 ? "bg-money-ok" : "bg-money-over"
                    }`}
                    style={{ width: `${Math.min(100, (budget.totalSpent / budget.budgetTotal) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted mt-1.5">
                  Spent {cur} {spentLocal.toLocaleString()} · what you paid
                </p>
              </div>
            );
          })()
        ) : (
          // No budget (D20)
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-ink tabular-nums">
                {cur} {spentLocal.toLocaleString()}
              </p>
              <p className="text-xs text-muted">Spent · what you paid</p>
            </div>
            {myTravellerId && (
              <button
                onClick={() => {
                  setEditingBudget(true);
                  setBudgetInput("");
                }}
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
              >
                Set a budget
              </button>
            )}
          </div>
        )}
      </div>

      {/* Breakdown card */}
      <div className="bg-card rounded-lg border border-border p-3">
        <h3 className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Breakdown · what you paid</h3>
        {groups.length === 0 ? (
          <p className="text-xs text-muted">Nothing paid yet.</p>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => (
              <div key={g.label}>
                <p className="text-[10px] font-medium text-muted/60 uppercase tracking-wide mb-1">{g.label}</p>
                <div className="space-y-1">
                  {[...g.items]
                    .sort(([, a], [, b]) => b - a)
                    .map(([key, amount]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-muted">
                          {CATEGORY_EMOJI[key] ?? "📦"} {categoryLabel(key)}
                        </span>
                        <span className="text-ink money">
                          {cur} {Math.round(amount * fxRate).toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <Link
          href={`/trips/${tripId}/money/expenses`}
          className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs font-medium text-accent hover:text-accent-hover transition-colors"
        >
          <span className="flex items-center">
            View expenses <ChevronRight size={14} />
          </span>
          <span className="text-muted font-normal">{budget?.paidCount ?? 0}</span>
        </Link>
      </div>

      {/* Anyone on the trip can log (D1) */}
      {myTravellerId && (
        <button
          onClick={() => setPanelOpen(true)}
          className="w-full flex items-center justify-center gap-1 py-2.5 text-sm font-medium text-accent border border-dashed border-accent/40 rounded-lg hover:bg-accent-soft transition-colors"
        >
          <Plus size={15} />
          Log expense
        </button>
      )}

      {panelOpen && myTravellerId && (
        <LogExpensePanel
          tripId={tripId}
          localCurrency={cur}
          fxRate={fxRate}
          myTravellerId={myTravellerId}
          travellers={travellers}
          editing={null}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  );
}
