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
 * amount, remembered per trip (useMoneyCurrency).
 */
export function MoneyView({ expenses, budget, tripId }: MoneyViewProps) {
  const trip = useTrip();
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [sharesOpen, setSharesOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
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
  const myBalance = myTravellerId ? balances.get(myTravellerId) ?? 0 : 0;
  const names = (ids: string[]) => {
    const unique = [...new Set(ids)].map(nameOf);
    return unique.length <= 2 ? unique.join(" and ") : `${unique.slice(0, 2).join(", ")} and ${unique.length - 2} more`;
  };
  // Group split card: 2+ travellers and at least one expense (M3)
  let settle: { label: string; amount: string | null; sub: string; tone: "ok" | "over" | "plain" } | null = null;
  if (travellers.length > 1 && expenses.length > 0 && myTravellerId) {
    if (myBalance < 0) {
      settle = {
        label: "You pay back",
        amount: `${shownCur} ${formatLocal(money.fromLocal(-myBalance))}`,
        sub: `To ${names(payments.filter((p) => p.from === myTravellerId).map((p) => p.to))}`,
        tone: "over",
      };
    } else if (myBalance > 0) {
      settle = {
        label: "You get back",
        amount: `${shownCur} ${formatLocal(money.fromLocal(myBalance))}`,
        sub: `From ${names(payments.filter((p) => p.to === myTravellerId).map((p) => p.from))}`,
        tone: "ok",
      };
    } else if (payments.length > 0) {
      settle = {
        label: "You're settled up",
        amount: null,
        sub: `${payments.length} payment${payments.length === 1 ? "" : "s"} still open in the group`,
        tone: "plain",
      };
    } else {
      settle = { label: "All square", amount: null, sub: "Everyone is settled up", tone: "ok" };
    }
  }
  const isPlanner = trip.myRole === "planner";
  // Planner reaches Split shares from this card even before the first expense
  const showGroupCard = !!settle || (isPlanner && travellers.length > 1);

  const hasBudget = !!budget && budget.budgetTotal > 0;
  // Rows on the View expenses screen: what you paid + what you logged (D44)
  const viewCount = expenses.filter(
    (e) => e.paid_by === myTravellerId || (e.kind === "expense" && e.created_by === myTravellerId)
  ).length;
  const spentLocal = Math.round((budget?.totalSpent ?? 0) * shownRate);

  const daysToGo = daysToGoLabel(trip.start_date, trip.end_date);

  return (
    <div className="space-y-3">
      {/* My budget — only you see and set this */}
      <Card>
        <CardHeader
          title="My budget"
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
            const over = budget.remaining < 0;
            // Smaller hero when amounts are 6+ digits (e.g. VND 1,500,000)
            const isLarge = Math.abs(spentLocal) >= 100_000 || Math.abs(budgetLocal) >= 100_000;
            return (
              <div className="mt-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`${isLarge ? "text-[22px]" : "text-[26px]"} font-bold leading-tight tabular-nums ${over ? "text-money-over" : "text-fg"}`}>
                      {shownCur} {spentLocal.toLocaleString()}
                    </p>
                    <p className="text-[13px] text-fg-muted mt-0.5 tabular-nums">
                      spent of {shownCur} {budgetLocal.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-semibold text-fg tabular-nums">
                      {shownCur} {Math.round(budget.dailyFree * shownRate).toLocaleString()}
                    </p>
                    <p className="text-[13px] text-fg-muted mt-0.5">daily free</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-page rounded-full overflow-hidden" aria-hidden>
                  <div
                    className={`h-full rounded-full transition-all ${over ? "bg-money-over" : "bg-brand"}`}
                    style={{ width: `${Math.min(100, (budget.totalSpent / budget.budgetTotal) * 100)}%` }}
                  />
                </div>
                <p className="text-[13px] mt-2 tabular-nums">
                  <span className={`font-semibold ${over ? "text-money-over" : "text-money-ok"}`}>
                    {shownCur} {Math.abs(remainingLocal).toLocaleString()} {over ? "over" : "left"}
                  </span>
                  {daysToGo && <span className="text-fg-muted"> · {daysToGo}</span>}
                </p>
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

      {/* Group split — who owes whom (D21, D30) + planner's Split shares */}
      {showGroupCard && (
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
            <Link href={`/trips/${tripId}/money/settle`} className="block mt-2.5">
              {settle.amount ? (
                <>
                  <p className="text-[13px] text-fg-muted">{settle.label}</p>
                  <p className={`text-[22px] font-bold leading-tight tabular-nums ${settle.tone === "over" ? "text-money-over" : "text-money-ok"}`}>
                    {settle.amount}
                  </p>
                </>
              ) : (
                <p className={`text-[17px] font-semibold ${settle.tone === "ok" ? "text-money-ok" : "text-fg"}`}>{settle.label}</p>
              )}
              <p className="text-[13px] text-fg-muted mt-0.5 truncate">{settle.sub}</p>
            </Link>
          )}
          {isPlanner && travellers.length > 1 && (
            <div className={`flex items-center justify-between ${settle ? "mt-3.5 pt-3 border-t border-line" : "mt-2"}`}>
              <span className="text-sm text-fg">Split shares</span>
              <TextButton onClick={() => setSharesOpen(true)} className="py-0">
                Edit
              </TextButton>
            </div>
          )}
        </Card>
      )}

      {/* Your expenses (S3) — the list; categories behind Breakdown */}
      <div className="pt-2">
        <ExpensesView
          expenses={expenses}
          tripId={tripId}
          myTravellerId={myTravellerId}
          money={money}
          header={
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-semibold text-fg">
                Your expenses{viewCount > 0 && <span className="text-fg-muted font-normal"> · {viewCount}</span>}
              </h2>
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
