"use client";

import { useState } from "react";
import { StickyNote, Receipt } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useTrip } from "@/lib/trip-context";
import { LogExpensePanel } from "./log-expense-panel";
import { ExpenseDetail } from "./expense-detail";
import type { Expense } from "@/lib/actions/expense";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Empty } from "@/components/ui/empty";
import { Fab } from "@/components/ui/fab";
import { tripTravellers } from "./money-utils";

/**
 * View expenses (S3): what you paid (settlements included) plus expenses you
 * logged for someone else, so you can still edit them (D19, D27, D44).
 */
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

  const mine = expenses.filter(
    (e) => e.paid_by === myTravellerId || (e.kind === "expense" && e.created_by === myTravellerId)
  );

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
    <div className="space-y-4">

      {mine.length === 0 ? (
        <div className="bg-surface rounded-card">
          <Empty icon={Receipt} message="Nothing you've paid or logged yet. What others paid shows under Settle up." />
        </div>
      ) : (
        dates.map((date) => {
          // Day total counts only what you paid, matching your breakdown
          const dayTotal = byDate[date]
            .filter((e) => e.paid_by === myTravellerId)
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);
          return (
            <section key={date}>
              <div className="flex items-baseline justify-between px-1 mb-1.5">
                <h3 className="text-[13px] font-semibold text-fg-muted">{format(parseISO(date), "EEEE, d MMM")}</h3>
                <p className="text-[13px] font-semibold text-fg-muted tabular-nums">
                  {cur}{" "}
                  {dayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-surface rounded-card overflow-hidden divide-y divide-line">
                {byDate[date].map((e) => {
                  const settle = e.kind === "settlement";
                  const to = e.expense_participants[0]?.traveller_id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => open(e)}
                      className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-page transition-colors"
                    >
                      <CategoryIcon category={settle ? "settlement" : e.category} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[15px] font-semibold text-fg truncate">
                            {settle ? `You paid ${to ? nameOf(to) : "back"}` : e.title}
                          </p>
                          {e.notes && <StickyNote size={12} className="text-fg-faint shrink-0" aria-label="Has notes" />}
                        </div>
                        <p className="text-[13px] text-fg-muted truncate">
                          {settle
                            ? "Settle-up"
                            : `${e.paid_by !== myTravellerId ? `Logged for ${nameOf(e.paid_by)} · ` : ""}${e.expense_participants.length} ${e.expense_participants.length === 1 ? "person" : "people"}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-fg tabular-nums">
                          {cur} {parseFloat(e.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-fg-muted tabular-nums">≈ RM {parseFloat(e.amount_myr).toFixed(2)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })
      )}

      {/* Anyone with an account can log (D1) */}
      {myTravellerId && (
        <Fab
          label="Log expense"
          onClick={() => {
            setEditing(null);
            setPanelOpen(true);
          }}
        />
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
