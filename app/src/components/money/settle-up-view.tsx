"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useTrip } from "@/lib/trip-context";
import { markSettled, unmarkSettled } from "@/lib/actions/expense";
import type { Expense } from "@/lib/actions/expense";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { computeBalances, fewestPayments, type Payment } from "@/lib/balances";
import { tripTravellers, formatLocal, myrHint } from "./money-utils";
import { Button, TextButton } from "@/components/ui/button";

type Pending =
  | { type: "mark"; payment: Payment }
  | { type: "unmark"; expense: Expense }
  | null;

/**
 * Settle up (redesign P6b, owner 2026-09-29): one "How to settle up" list for
 * the whole group, Kittysplit-style — open payments first, then settle-ups,
 * newest first; rows with you are highlighted. Mark / unmark rules unchanged.
 */
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
  // Everyone sees every settle-up — the whole story (owner, 2026-09-29) — newest first
  const settlements = expenses
    .filter((e) => e.kind === "settlement")
    .sort((a, b) => b.date.localeCompare(a.date));

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

  /** "You" in bold so people spot their own name. */
  const who = (id: string, lower = false) =>
    id === myTravellerId ? <strong className="font-bold">{lower ? "you" : "You"}</strong> : nameOf(id);
  const row = (mine: boolean) => `flex gap-3 px-4 py-3 ${mine ? "shadow-[inset_3px_0_0_#0071bc]" : ""}`;

  return (
    <div className="space-y-4">
      <section className="bg-surface rounded-card overflow-hidden">
        <h2 className="text-base font-semibold text-fg px-4 pt-4 pb-2">How to settle up</h2>
        <div className="divide-y divide-line">
          {payments.length === 0 && (
            <p className="px-4 py-3.5 text-[15px] text-money-ok font-semibold flex items-center gap-2">
              <CheckCircle2 size={18} strokeWidth={2} aria-hidden />
              All settled
            </p>
          )}

          {/* Open payments first — they need action */}
          {payments.map((p, i) => {
            const mine = p.from === myTravellerId || p.to === myTravellerId;
            return (
              <div key={`open-${i}`} className={row(mine)}>
                <span className="w-9 h-9 rounded-full bg-money-warn-soft text-money-warn flex items-center justify-center shrink-0">
                  <Clock size={17} strokeWidth={2} aria-hidden />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[15px] font-medium text-fg pt-1.5">
                      {who(p.from)} {p.from === myTravellerId ? "pay" : "pays"} {who(p.to, true)}
                    </span>
                    <span className="text-right shrink-0">
                      <span className="block text-[15px] font-semibold text-fg tabular-nums">
                        {cur} {formatLocal(p.amount)}
                      </span>
                      <span className="block text-xs text-fg-muted tabular-nums">{myrHint(p.amount, trip.fx_rate)}</span>
                    </span>
                  </div>
                  {canMark(p) ? (
                    <Button variant="soft" size="sm" className="mt-2" onClick={() => setPending({ type: "mark", payment: p })}>
                      Mark as settled
                    </Button>
                  ) : (
                    <p className="text-[13px] text-fg-muted mt-1">Waiting for {nameOf(p.from)} to mark it settled</p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Settled, newest first */}
          {settlements.map((e) => {
            const to = e.expense_participants[0]?.traveller_id;
            const mine = e.paid_by === myTravellerId || to === myTravellerId;
            return (
              <div key={e.id} className={row(mine)}>
                <span className="w-9 h-9 rounded-full bg-money-ok-soft text-money-ok flex items-center justify-center shrink-0">
                  <Check size={18} strokeWidth={2.4} aria-hidden />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[15px] font-medium text-fg pt-1.5">
                      {who(e.paid_by)} paid {to ? who(to, true) : ""}
                    </span>
                    <span className="text-right shrink-0">
                      <span className="block text-[15px] font-semibold text-fg tabular-nums">
                        {cur} {formatLocal(parseFloat(e.amount))}
                      </span>
                      <span className="block text-xs text-fg-muted tabular-nums">{myrHint(parseFloat(e.amount), trip.fx_rate)}</span>
                    </span>
                  </div>
                  <p className="flex items-center gap-3 text-[13px] text-fg-muted mt-0.5">
                    Settled {format(parseISO(e.date), "d MMM")}
                    {canUnmark(e) && (
                      <TextButton
                        onClick={() => setPending({ type: "unmark", expense: e })}
                        aria-label={`Unmark ${nameOf(e.paid_by)} paid ${to ? nameOf(to) : ""}`}
                        className="py-0"
                      >
                        Unmark
                      </TextButton>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
