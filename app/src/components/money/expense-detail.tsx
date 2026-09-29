"use client";

import { ArrowRightLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Expense } from "@/lib/actions/expense";
import { Sheet } from "@/components/ui/sheet";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Eyebrow } from "@/components/ui/card";
import { FieldRow } from "@/components/ui/field";
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

  const settlement = expense.kind === "settlement";

  return (
    <Sheet open title={expense.title} onClose={onClose}>
      <div className="space-y-4 pb-1">
        <div className="flex flex-col items-center text-center">
          {settlement ? (
            <span className="w-11 h-11 rounded-full bg-money-ok-soft text-money-ok inline-flex items-center justify-center">
              <ArrowRightLeft size={22} strokeWidth={1.9} aria-hidden />
            </span>
          ) : (
            <CategoryIcon category={expense.category} size={44} />
          )}
          <p className="text-[30px] font-bold text-fg tabular-nums mt-2 leading-tight">
            {localCurrency} {parseFloat(expense.amount).toLocaleString()}
          </p>
          <p className="text-[13px] text-fg-muted mt-1">
            ≈ RM {parseFloat(expense.amount_myr).toFixed(2)} · {format(parseISO(expense.date), "EEE, d MMM")}
          </p>
        </div>

        <FieldRow label="Paid by">
          <span className="text-sm font-medium text-fg">{nameOf(expense.paid_by)}</span>
        </FieldRow>

        <div>
          <Eyebrow className="mb-1.5">
            {SPLIT_LABEL[expense.split_type] ?? "Split"} · {participants.length}{" "}
            {participants.length === 1 ? "person" : "people"}
          </Eyebrow>
          <div className="border border-line rounded-field divide-y divide-line">
            {participants.map((p) => (
              <div key={p.traveller_id} className="flex items-center justify-between px-3 min-h-[44px] text-sm">
                <span className="text-fg">{nameOf(p.traveller_id)}</span>
                <span className="text-fg tabular-nums">
                  {localCurrency}{" "}
                  {parseFloat(p.share).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {expense.notes && <p className="text-sm text-fg-muted whitespace-pre-wrap">{expense.notes}</p>}

        <p className="text-xs text-fg-muted text-center">
          {settlement
            ? "A settle-up payment. Unmark it from Settle up if it didn't happen."
            : "Only the person who logged this, or the planner, can change it."}
        </p>
      </div>
    </Sheet>
  );
}
