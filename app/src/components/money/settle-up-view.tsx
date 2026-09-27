"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useTrip } from "@/lib/trip-context";
import { markSettled, unmarkSettled } from "@/lib/actions/expense";
import type { Expense } from "@/lib/actions/expense";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { computeBalances, fewestPayments, type Payment } from "@/lib/balances";
import { tripTravellers, formatLocal, myrHint } from "./money-utils";

type Pending =
  | { type: "mark"; payment: Payment }
  | { type: "unmark"; expense: Expense }
  | null;

/** Settle up (S4): your payments first, everyone collapsed (D24). */
export function SettleUpView({
  expenses,
  tripId,
  myTravellerId,
}: {
  expenses: Expense[];
  tripId: string;
  myTravellerId: string | null;
}) {
  const trip = useTrip();
  const router = useRouter();
  const { toast } = useToast();
  const [showEveryone, setShowEveryone] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);

  if (!trip) return null;

  const cur = trip.local_currency;
  const isPlanner = trip.myRole === "planner";
  const travellers = tripTravellers(trip.travellers);
  const ids = travellers.map((t) => t.id);
  const nameOf = (id: string) =>
    id === myTravellerId ? "You" : travellers.find((t) => t.id === id)?.display_name ?? "Someone";

  const balances = computeBalances(expenses, ids);
  const payments = fewestPayments(balances, ids);
  const mine = payments.filter((p) => p.from === myTravellerId || p.to === myTravellerId);
  const settlements = expenses
    .filter((e) => e.kind === "settlement")
    .filter(
      (e) =>
        isPlanner ||
        e.paid_by === myTravellerId ||
        e.expense_participants.some((p) => p.traveller_id === myTravellerId)
    );

  // D25: the person who owes, or the planner (also for name-only travellers)
  const canMark = (p: Payment) => p.from === myTravellerId || isPlanner;
  const canUnmark = (e: Expense) => e.paid_by === myTravellerId || isPlanner;

  async function confirm() {
    if (!pending || busy) return;
    setBusy(true);
    const result =
      pending.type === "mark"
        ? await markSettled(tripId, pending.payment.from, pending.payment.to, pending.payment.amount, format(new Date(), "yyyy-MM-dd"))
        : await unmarkSettled(tripId, pending.expense.id);
    setBusy(false);
    setPending(null);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    toast(pending.type === "mark" ? "Marked as settled" : "Unmarked", "success");
    router.refresh();
  }

  const payRow = (p: Payment, key: string) => (
    <div key={key} className="px-3 py-2.5 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-ink">
          {p.from === myTravellerId ? `You pay ${nameOf(p.to)}` : p.to === myTravellerId ? `${nameOf(p.from)} pays you` : `${nameOf(p.from)} pays ${nameOf(p.to)}`}
        </span>
        <span className="text-right shrink-0">
          <span className="block text-sm font-semibold text-ink money">
            {cur} {formatLocal(p.amount)}
          </span>
          <span className="block text-[10px] text-muted money">{myrHint(p.amount, trip.fx_rate)}</span>
        </span>
      </div>
      {canMark(p) ? (
        <button
          onClick={() => setPending({ type: "mark", payment: p })}
          className="px-2.5 py-1 bg-accent-soft text-accent text-xs font-medium rounded-md hover:bg-accent hover:text-accent-on transition-colors"
        >
          Mark as settled
        </button>
      ) : (
        <p className="text-[11px] text-muted">Waiting for {nameOf(p.from)} to mark it settled</p>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <Link href={`/trips/${tripId}/money`} className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        <ArrowLeft size={16} className="text-muted" />
        Settle up
      </Link>

      {/* Your payments */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1.5">Your payments</p>
        <div className="bg-card rounded-lg border border-border divide-y divide-border">
          {mine.length === 0 ? (
            <p className="px-3 py-3 text-sm text-money-ok font-medium">
              {payments.length === 0 ? "All settled ✓" : "You're settled up"}
            </p>
          ) : (
            mine.map((p, i) => payRow(p, `mine-${i}`))
          )}
        </div>
      </div>

      {/* Everyone — collapsed by default (D24) */}
      <div>
        <button
          onClick={() => setShowEveryone(!showEveryone)}
          className="w-full flex items-center justify-between bg-card rounded-lg border border-border px-3 py-2.5"
        >
          <span className="text-sm text-ink">Everyone</span>
          <span className="flex items-center gap-1 text-xs text-muted">
            {payments.length} payment{payments.length === 1 ? "" : "s"} · balances
            {showEveryone ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </button>
        {showEveryone && (
          <div className="mt-2 space-y-2">
            {payments.length > 0 && (
              <div className="bg-card rounded-lg border border-border divide-y divide-border">
                {payments.map((p, i) => payRow(p, `all-${i}`))}
              </div>
            )}
            <div className="bg-card rounded-lg border border-border px-3 py-2 space-y-1">
              {travellers.map((t) => {
                const b = balances.get(t.id) ?? 0;
                return (
                  <div key={t.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted">{nameOf(t.id)}</span>
                    <span className={`money ${b > 0 ? "text-money-ok" : b < 0 ? "text-money-over" : "text-muted"}`}>
                      {b > 0 ? "+" : b < 0 ? "−" : ""}
                      {cur} {formatLocal(Math.abs(b))}
                      <span className="text-[10px] text-muted ml-1">{myrHint(b, trip.fx_rate)}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Settled */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1.5">Settled</p>
        <div className="bg-card rounded-lg border border-border divide-y divide-border">
          {settlements.length === 0 ? (
            <p className="px-3 py-3 text-xs text-muted">Nothing yet.</p>
          ) : (
            settlements.map((e) => {
              const to = e.expense_participants[0]?.traveller_id;
              return (
                <div key={e.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">
                      {nameOf(e.paid_by)} paid {to ? (to === myTravellerId ? "you" : nameOf(to)) : ""}
                    </p>
                    <p className="text-[11px] text-muted">
                      {cur} {formatLocal(parseFloat(e.amount))} ({myrHint(parseFloat(e.amount), trip.fx_rate)}) · {format(parseISO(e.date), "d MMM")}
                    </p>
                  </div>
                  {canUnmark(e) && (
                    <button
                      onClick={() => setPending({ type: "unmark", expense: e })}
                      className="text-xs font-medium text-accent hover:text-accent-hover shrink-0"
                    >
                      Unmark
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={pending?.type === "unmark" ? "Unmark settlement?" : "Mark as settled?"}
        message={
          pending?.type === "mark"
            ? `${nameOf(pending.payment.from) === "You" ? "You paid" : `${nameOf(pending.payment.from)} paid`} ${nameOf(pending.payment.to) === "You" ? "you" : nameOf(pending.payment.to)} ${cur} ${formatLocal(pending.payment.amount)}. This is added to the payer's expenses and counts in their budget.`
            : pending?.type === "unmark"
              ? "The debt comes back, and it's removed from the payer's expenses."
              : ""
        }
        confirmLabel={pending?.type === "unmark" ? "Unmark" : "Mark settled"}
        destructive={pending?.type === "unmark"}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
