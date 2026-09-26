"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, StickyNote, Receipt } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useTrip } from "@/lib/trip-context";
import { LogExpensePanel } from "./log-expense-panel";
import { ExpenseDetail } from "./expense-detail";
import type { Expense } from "@/lib/actions/expense";
import { CATEGORY_EMOJI } from "@/lib/categories";
import { EmptyState } from "@/components/empty-state";
import { tripTravellers } from "./money-utils";

/** View expenses (S3): what you paid, settlements included (D19, D27). */
export function ExpensesView({
  expenses,
  tripId,
  myTravellerId,
}: {
  expenses: Expense[];
  tripId: string;
  myTravellerId: string | null;
}) {
  const trip = useTrip();
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [viewing, setViewing] = useState<Expense | null>(null);

  if (!trip) return null;

  const cur = trip.local_currency;
  const isPlanner = trip.myRole === "planner";
  const travellers = tripTravellers(trip.travellers);
  const nameOf = (id: string) =>
    id === myTravellerId ? "You" : travellers.find((t) => t.id === id)?.display_name ?? "Someone";

  const mine = expenses.filter((e) => e.paid_by === myTravellerId);

  function open(e: Expense) {
    // Settlements are changed from Settle up; others' expenses are read-only (D8, D35)
    const canEdit =
      e.kind === "expense" && (isPlanner || (myTravellerId !== null && e.created_by === myTravellerId));
    if (!canEdit) {
      setViewing(e);
      return;
    }
    setEditing(e);
    setPanelOpen(true);
  }

  const byDate: Record<string, Expense[]> = {};
  for (const e of mine) (byDate[e.date] ??= []).push(e);
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Link
          href={`/trips/${tripId}/money`}
          className="flex items-center gap-1.5 text-sm font-semibold text-ink"
        >
          <ArrowLeft size={16} className="text-muted" />
          What you paid
        </Link>
        {myTravellerId && (
          <button
            onClick={() => {
              setEditing(null);
              setPanelOpen(true);
            }}
            className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            <Plus size={14} />
            Log expense
          </button>
        )}
      </div>

      {mine.length === 0 ? (
        <EmptyState icon={Receipt} message="Nothing you've paid yet. What others paid shows under Settle up." />
      ) : (
        dates.map((date) => {
          const dayTotal = byDate[date].reduce((sum, e) => sum + parseFloat(e.amount), 0);
          return (
            <div key={date}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-muted">{format(parseISO(date), "EEEE, d MMM")}</p>
                <p className="text-xs font-medium text-muted money">
                  {cur}{" "}
                  {dayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                {byDate[date].map((e, i) => {
                  const settle = e.kind === "settlement";
                  const to = e.expense_participants[0]?.traveller_id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => open(e)}
                      className={`flex items-center gap-2 px-3 py-2.5 w-full text-left hover:bg-ground/50 transition-colors active:bg-ground ${
                        i > 0 ? "border-t border-border" : ""
                      }`}
                    >
                      <span className="text-sm shrink-0">{settle ? "🤝" : CATEGORY_EMOJI[e.category] ?? "📦"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-ink truncate">
                            {settle ? `You paid ${to ? nameOf(to) : "back"}` : e.title}
                          </p>
                          {e.notes && <StickyNote size={10} className="text-muted/60 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted truncate">
                          {settle
                            ? "Settlement"
                            : `${e.expense_participants.length} ${e.expense_participants.length === 1 ? "person" : "people"}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-ink money">
                          {cur} {parseFloat(e.amount).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted money">≈ RM {parseFloat(e.amount_myr).toFixed(2)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {panelOpen && myTravellerId && (
        <LogExpensePanel
          tripId={tripId}
          localCurrency={cur}
          fxRate={trip.fx_rate}
          myTravellerId={myTravellerId}
          travellers={travellers}
          editing={editing}
          onClose={() => {
            setPanelOpen(false);
            setEditing(null);
          }}
        />
      )}

      {viewing && myTravellerId && (
        <ExpenseDetail
          expense={viewing}
          travellers={travellers}
          myTravellerId={myTravellerId}
          localCurrency={cur}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}
