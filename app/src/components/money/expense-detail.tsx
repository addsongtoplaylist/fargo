"use client";

import { X } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Expense } from "@/lib/actions/expense";
import { CATEGORY_EMOJI } from "@/lib/categories";
import type { SplitTraveller } from "./log-expense-panel";

const SPLIT_LABEL: Record<string, string> = {
  equal: "Split equally",
  shares: "Split by shares",
  percent: "Split by percentage",
  amount: "Split by amounts",
};

/** Read-only view of an expense you can't edit (D35). */
export function ExpenseDetail({
  expense,
  travellers,
  myTravellerId,
  localCurrency,
  onClose,
}: {
  expense: Expense;
  travellers: SplitTraveller[];
  myTravellerId: string;
  localCurrency: string;
  onClose: () => void;
}) {
  const nameOf = (id: string) =>
    id === myTravellerId ? "You" : travellers.find((t) => t.id === id)?.display_name ?? "Someone";
  const order = (id: string) => {
    const i = travellers.findIndex((t) => t.id === id);
    return i === -1 ? travellers.length : i;
  };
  const participants = [...expense.expense_participants].sort(
    (a, b) => order(a.traveller_id) - order(b.traveller_id)
  );

  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-[60]" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-[60] bg-card rounded-t-2xl border-t border-border max-w-[var(--max-width-column)] mx-auto animate-slide-up max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-ink truncate">
            {CATEGORY_EMOJI[expense.category] ?? "📦"} {expense.title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 flex items-center justify-center -mr-2 text-muted hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-3 pb-[calc(0.75rem+56px+env(safe-area-inset-bottom))]">
          <div className="text-center">
            <p className="text-3xl font-semibold text-ink money">
              {localCurrency} {parseFloat(expense.amount).toLocaleString()}
            </p>
            <p className="text-xs text-muted mt-1">
              ≈ RM {parseFloat(expense.amount_myr).toFixed(2)} · {format(parseISO(expense.date), "EEE, d MMM")}
            </p>
          </div>

          <p className="text-sm text-ink">
            <span className="text-muted">Paid by </span>
            {nameOf(expense.paid_by)}
          </p>

          <div>
            <p className="text-xs text-muted mb-1.5">
              {SPLIT_LABEL[expense.split_type] ?? "Split"} · {participants.length}{" "}
              {participants.length === 1 ? "person" : "people"}
            </p>
            <div className="border border-border rounded-md divide-y divide-border">
              {participants.map((p) => (
                <div key={p.traveller_id} className="flex items-center justify-between px-2.5 py-2 text-sm">
                  <span className="text-ink">{nameOf(p.traveller_id)}</span>
                  <span className="text-ink tabular-nums">
                    {localCurrency}{" "}
                    {parseFloat(p.share).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {expense.notes && <p className="text-sm text-muted whitespace-pre-wrap">{expense.notes}</p>}

          <p className="text-[11px] text-muted text-center">
            {expense.kind === "settlement"
              ? "A settle-up payment. Unmark it from Settle up if it didn't happen."
              : "Only the person who logged this, or the planner, can change it."}
          </p>
        </div>
      </div>
    </>
  );
}
