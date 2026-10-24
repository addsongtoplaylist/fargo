"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronRight, PieChart } from "lucide-react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { useTrip } from "@/lib/trip-context";
import { updateBudget } from "@/lib/actions/expense";
import { useToast } from "@/components/toast";
import type { Expense } from "@/lib/actions/expense";
import { Card, CardHeader } from "@/components/ui/card";
import { Button, TextButton } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Avatar } from "@/components/ui/avatar";
import { FieldRow, fieldClass } from "@/components/ui/field";
import { SplitSharesSheet } from "./split-shares-sheet";
import { ExpensesView } from "./expenses-view";
import { BreakdownSheet } from "./breakdown-sheet";
import { useMoneyCurrency } from "./currency-toggle";
import { computeBalances, fewestPayments } from "@/lib/balances";
import { tripTravellers, formatLocal } from "./money-utils";

/**
 * "N days to go" under My budget (device-local date): during the trip, days
 * left including today; before it, the trip length; after it, nothing.
 */
function daysToGoLabel(start: string, end: string): string | null {
  const today = format(new Date(), "yyyy-MM-dd");
  const plural = (n: number) => `${n} day${n === 1 ? "" : "s"}`;
  if (today > end) return null;
  if (today < start) return `${plural(differenceInCalendarDays(parseISO(end), parseISO(start)) + 1)} trip`;
  return `${plural(differenceInCalendarDays(parseISO(end), parseISO(today)) + 1)} to go`;
}

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

/**
 * Money tab (v0.6.5): My budget → Group split → Your expenses (the list), with
 * the by-category breakdown behind "Breakdown". One currency switch for every
 * amount, remembered per trip (useMoneyCurrency). v0.7.1: Daily free is the
 * budget card's main number; Group split shows one line per person.
 */
export function MoneyView({ expenses, budget, tripId }: MoneyViewProps) {
  const trip = useTrip();
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [sharesOpen, setSharesOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  // v0.7.1: Your expenses and Group split share one spot under the budget card
  const [view, setView] = useState<"expenses" | "split">("expenses");
  const money = useMoneyCurrency(tripId, trip?.local_currency ?? "", trip?.fx_rate ?? 0);
  const [budgetInput, setBudgetInput] = useState(
    budget?.budgetTotal ? budget.budgetTotal.toString() : ""
  );
  const savingBudgetRef = useRef(false);
  const { toast } = useToast();

  if (!trip) return null;

  const fxRate = trip.fx_rate;
  const cur = trip.local_currency;
  // Budget amounts are stored in MYR; shown × fxRate in the trip currency
  const shownCur = money.code;
  const shownRate = money.home ? 1 : fxRate;
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
  // Group split card: 2+ travellers and at least one expense (M3). One line per
  // payment you're part of — "Ben pays you", "You pay Mei" (v0.7.1, owner)
  type SplitLine = { id: string; who: string; hasAccount: boolean; text: string; amount: string; owed: boolean };
  let settle: { lines: SplitLine[]; status: string | null } | null = null;
  if (travellers.length > 1 && expenses.length > 0 && myTravellerId) {
    const lines: SplitLine[] = payments
      .filter((p) => p.from === myTravellerId || p.to === myTravellerId)
      .map((p) => {
        const owed = p.to === myTravellerId;
        const other = owed ? p.from : p.to;
        return {
          id: `${p.from}-${p.to}`,
          who: nameOf(other),
          hasAccount: !!trip.travellers?.find((t) => t.id === other)?.account_id,
          text: owed ? `${nameOf(other)} pays you` : `You pay ${nameOf(other)}`,
          amount: `${shownCur} ${formatLocal(money.fromLocal(p.amount))}`,
          owed,
        };
      });
    const status =
      lines.length > 0
        ? null
        : payments.length > 0
          ? `You're settled up · ${payments.length} payment${payments.length === 1 ? "" : "s"} still open in the group`
          : "All square — everyone is settled up";
    settle = { lines, status };
  }
  const isPlanner = trip.myRole === "planner";
  // Planner reaches Split shares from this card even before the first expense
  const showGroupCard = !!settle || (isPlanner && travellers.length > 1);

  const hasBudget = !!budget && budget.budgetTotal > 0;
  const spentLocal = Math.round((budget?.totalSpent ?? 0) * shownRate);

  const daysToGo = daysToGoLabel(trip.start_date, trip.end_date);

  return (
    <div className="space-y-3">
      {/* My budget — only you see and set this */}
      <Card>
        <CardHeader
          title={hasBudget && !editingBudget ? "Daily free" : "My budget"}
          action={
            (editingBudget || hasBudget) && (
              <TextButton onClick={() => setEditingBudget(!editingBudget)} className="py-0">
                {editingBudget ? "Cancel" : "Edit"}
              </TextButton>
            )
          }
        />

        {editingBudget ? (
          <div className="mt-3 space-y-2">
            <FieldRow label="RM" htmlFor="budget-input">
              <input
                id="budget-input"
                type="number"
                inputMode="numeric"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className={`${fieldClass} flex-1 min-w-0`}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleBudgetSave();
                }}
              />
              <Button variant="soft" onClick={handleBudgetSave}>
                Save
              </Button>
            </FieldRow>
            {budgetInput && !isNaN(parseInt(budgetInput)) && parseInt(budgetInput) > 0 && (
              <p className="text-[13px] text-fg-muted">
                ≈ {cur} {Math.round(parseInt(budgetInput) * fxRate).toLocaleString()} in {trip.destination}
              </p>
            )}
          </div>
        ) : hasBudget && budget ? (
          (() => {
            const budgetLocal = Math.round(budget.budgetTotal * shownRate);
            const remainingLocal = Math.round(budget.remaining * shownRate);
            const dailyLocal = Math.round(budget.dailyFree * shownRate);
            const over = budget.remaining < 0;
            // Smaller hero when the amount is 7+ digits (e.g. VND 1,500,000)
            const isLarge = Math.abs(dailyLocal) >= 1_000_000;
            return (
              <div className="mt-1.5">
                <p className={`${isLarge ? "text-[28px]" : "text-[34px]"} font-bold leading-tight tracking-[-0.5px] tabular-nums ${dailyLocal > 0 ? "text-money-ok" : "text-money-over"}`}>
                  {shownCur} {dailyLocal.toLocaleString()}
                </p>
                <div className="mt-3 h-2 bg-page rounded-full overflow-hidden" aria-hidden>
                  <div
                    className={`h-full rounded-full transition-all ${over ? "bg-money-over" : "bg-brand"}`}
                    style={{ width: `${Math.min(100, (budget.totalSpent / budget.budgetTotal) * 100)}%` }}
                  />
                </div>
                <div className="flex items-baseline justify-between gap-3 text-[13px] mt-2 tabular-nums">
                  <span className={over ? "font-semibold text-money-over" : "text-fg-muted"}>
                    {over
                      ? `${shownCur} ${Math.abs(remainingLocal).toLocaleString()} over budget`
                      : `${spentLocal.toLocaleString()} of ${budgetLocal.toLocaleString()} spent`}
                  </span>
                  {daysToGo && <span className="text-fg-muted shrink-0">{daysToGo}</span>}
                </div>
              </div>
            );
          })()
        ) : (
          // No budget (D20): what you paid + Set a budget
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[22px] font-bold text-fg leading-tight tabular-nums">
                {shownCur} {spentLocal.toLocaleString()}
              </p>
              <p className="text-[13px] text-fg-muted mt-0.5">spent · what you paid</p>
            </div>
            {myTravellerId && (
              <Button
                variant="soft"
                size="sm"
                onClick={() => {
                  setEditingBudget(true);
                  setBudgetInput("");
                }}
              >
                Set a budget
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Your expenses | Group split — one at a time so the list stays close (v0.7.1, owner) */}
      {showGroupCard && (
        <Segmented
          label="Show"
          options={[
            { value: "expenses", label: "Your expenses" },
            { value: "split", label: "Group split" },
          ]}
          value={view}
          onChange={setView}
          className="!bg-line"
        />
      )}

      {/* Group split — who owes whom (D21, D30) + planner's Split shares */}
      {showGroupCard && view === "split" && (
        <Card>
          <CardHeader
            title="Group split"
            action={
              settle && (
                <Link
                  href={`/trips/${tripId}/money/settle`}
                  className="flex items-center text-[13px] font-semibold text-brand hover:text-brand-hover"
                >
                  Settle up <ChevronRight size={15} strokeWidth={2.2} aria-hidden />
                </Link>
              )
            }
          />
          {settle && (
            <Link href={`/trips/${tripId}/money/settle`} className="block mt-3 space-y-3">
              {settle.lines.map((l) => (
                <div key={l.id} className="flex items-center gap-2.5">
                  <Avatar name={l.who} kind={l.hasAccount ? "account" : "name-only"} size={32} />
                  <span className="flex-1 min-w-0 text-[15px] text-fg truncate">{l.text}</span>
                  <span className={`text-[15px] font-semibold tabular-nums shrink-0 ${l.owed ? "text-money-ok" : "text-money-over"}`}>
                    {l.amount}
                  </span>
                </div>
              ))}
              {settle.status && <p className="text-sm text-fg-muted">{settle.status}</p>}
            </Link>
          )}
          {isPlanner && travellers.length > 1 && (
            <div className={`flex items-center justify-between ${settle ? "mt-3.5 pt-3 border-t border-line" : "mt-2"}`}>
              <span className="text-sm text-fg-muted">Split shares</span>
              <TextButton onClick={() => setSharesOpen(true)} className="py-0">
                Edit split
              </TextButton>
            </div>
          )}
        </Card>
      )}

      {/* Your expenses (S3) — the list; categories behind Breakdown */}
      {(!showGroupCard || view === "expenses") && (
        <div className={showGroupCard ? "" : "pt-2"}>
          <ExpensesView
            expenses={expenses}
            tripId={tripId}
            myTravellerId={myTravellerId}
            money={money}
            header={
              <div className={`flex items-center px-1 ${showGroupCard ? "justify-end" : "justify-between"}`}>
                {/* The switch above already names the list */}
                <h2 className={showGroupCard ? "sr-only" : "text-base font-semibold text-fg"}>Your expenses</h2>
                {Object.keys(budget?.spendingByCategory ?? {}).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setBreakdownOpen(true)}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:text-brand-hover"
                  >
                    <PieChart size={15} strokeWidth={2.1} aria-hidden />
                    Breakdown
                  </button>
                )}
              </div>
            }
          />
        </div>
      )}

      {breakdownOpen && (
        <BreakdownSheet
          spendingByCategory={budget?.spendingByCategory ?? {}}
          money={money}
          onClose={() => setBreakdownOpen(false)}
        />
      )}

      {sharesOpen && (
        <SplitSharesSheet tripId={tripId} travellers={travellers} onClose={() => setSharesOpen(false)} />
      )}
    </div>
  );
}
