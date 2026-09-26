"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { createExpense, updateExpense, deleteExpense } from "@/lib/actions/expense";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { format } from "date-fns";
import type { Expense } from "@/lib/actions/expense";
import { EXPENSE_CATEGORIES as CATEGORIES } from "@/lib/categories";
import { computeShares, evenWeights, remaining, type SplitType } from "@/lib/split";

export type SplitTraveller = {
  id: string;
  display_name: string;
  default_shares?: number | null;
};

type LogExpensePanelProps = {
  tripId: string;
  localCurrency: string;
  fxRate: number;
  myTravellerId: string;
  /** Everyone on the trip, in join order */
  travellers: SplitTraveller[];
  editing?: Expense | null;
  onClose: () => void;
};

const SPLIT_TYPES: { value: SplitType; label: string }[] = [
  { value: "equal", label: "Equal" },
  { value: "shares", label: "Shares" },
  { value: "percent", label: "%" },
  { value: "amount", label: "Amounts" },
];

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function LogExpensePanel({
  tripId,
  localCurrency,
  fxRate,
  myTravellerId,
  travellers,
  editing,
  onClose,
}: LogExpensePanelProps) {
  const [amount, setAmount] = useState(editing ? parseFloat(editing.amount).toString() : "");
  const [title, setTitle] = useState(editing?.title ?? "");
  const [category, setCategory] = useState(editing?.category ?? "food");
  const [date, setDate] = useState(editing?.date ?? format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [inputCurrency, setInputCurrency] = useState<"local" | "myr">("local");
  const [paidBy, setPaidBy] = useState(editing?.paid_by ?? myTravellerId);
  const [splitType, setSplitType] = useState<SplitType>(editing?.split_type ?? "equal");
  // Participants start unticked (D10); editing restores the saved split
  const [included, setIncluded] = useState<Set<string>>(
    () => new Set(editing?.expense_participants.map((p) => p.traveller_id) ?? [])
  );
  const [weights, setWeights] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      editing?.expense_participants.map((p) => [p.traveller_id, String(parseFloat(p.weight))]) ?? []
    )
  );
  const amountRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setTimeout(() => amountRef.current?.focus(), 100);
  }, []);

  const numericAmount = parseFloat(amount) || 0;
  const localAmount = inputCurrency === "local" ? numericAmount : numericAmount * fxRate;
  const myrAmount = inputCurrency === "local" ? (fxRate > 0 ? numericAmount / fxRate : 0) : numericAmount;
  // Splits always work on the local amount, to the cent (D34)
  const splitTotal = Math.round(localAmount * 100) / 100;

  const ticked = travellers.filter((t) => included.has(t.id));
  const tickedWeights = ticked.map((t) => (splitType === "equal" ? 1 : parseFloat(weights[t.id]) || 0));
  const shares = computeShares(splitTotal, splitType, tickedWeights);
  const shareOf = (id: string) => shares[ticked.findIndex((t) => t.id === id)] ?? 0;
  const left = remaining(splitTotal, splitType, tickedWeights);
  const sharesTotal = splitType === "shares" ? tickedWeights.reduce((a, b) => a + b, 0) : 1;
  const splitValid = ticked.length > 0 && left === 0 && sharesTotal > 0;
  const allTicked = ticked.length === travellers.length;

  /** Default weights for a new set of ticked people / split type (D33). */
  function prefill(type: SplitType, ids: string[], total: number): Record<string, string> {
    if (type === "shares") {
      return Object.fromEntries(
        ids.map((id) => {
          const t = travellers.find((x) => x.id === id);
          return [id, weights[id] ?? String(t?.default_shares ?? 1)];
        })
      );
    }
    if (type === "percent" || type === "amount") {
      const even = evenWeights(ids.length, type === "percent" ? 100 : total);
      return Object.fromEntries(ids.map((id, i) => [id, String(even[i])]));
    }
    return {};
  }

  function orderedIds(set: Set<string>) {
    return travellers.filter((t) => set.has(t.id)).map((t) => t.id);
  }

  function setTicked(next: Set<string>) {
    setIncluded(next);
    setWeights((w) => ({ ...w, ...prefill(splitType, orderedIds(next), splitTotal) }));
  }

  function toggle(id: string) {
    const next = new Set(included);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setTicked(next);
  }

  function changeSplitType(type: SplitType) {
    setSplitType(type);
    setWeights((w) => ({ ...w, ...prefill(type, orderedIds(included), splitTotal) }));
  }

  function handleSave() {
    if (!amount || !title.trim() || numericAmount <= 0 || !splitValid) return;

    const payload = {
      date,
      title: title.trim(),
      category,
      amount: splitTotal,
      paidBy,
      splitType,
      participants: ticked.map((t, i) => ({ travellerId: t.id, weight: tickedWeights[i] })),
      notes: notes.trim() || undefined,
    };

    // Close panel immediately — optimistic UX
    onClose();

    // Fire server action in the background; toast on failure
    const action = editing
      ? updateExpense(editing.id, tripId, payload)
      : createExpense(tripId, payload);

    action.catch((err) => {
      console.error(err);
      toast("Failed to save expense. Please try again.", "error");
    });
  }

  async function handleDelete() {
    if (!editing) return;
    setSaving(true);
    try {
      await deleteExpense(editing.id, tripId);
      onClose();
    } catch (err) {
      console.error(err);
      toast("Failed to delete expense. Please try again.", "error");
      setSaving(false);
    }
  }

  // Status line under the list
  let status: { ok: boolean; text: string };
  if (ticked.length === 0) status = { ok: false, text: "Tick who it's for" };
  else if (splitType === "percent" && left !== 0)
    status = { ok: false, text: left > 0 ? `${left}% left to allocate` : `${-left}% over` };
  else if (splitType === "amount" && left !== 0)
    status = {
      ok: false,
      text: left > 0 ? `${localCurrency} ${fmt(left)} left to allocate` : `${localCurrency} ${fmt(-left)} over`,
    };
  else if (sharesTotal <= 0) status = { ok: false, text: "Give someone at least 1 share" };
  else
    status = {
      ok: true,
      text:
        splitType === "equal"
          ? `${localCurrency} ${fmt(splitTotal)} split ${ticked.length} way${ticked.length === 1 ? "" : "s"}`
          : `${localCurrency} ${fmt(splitTotal)} of ${fmt(splitTotal)}`,
    };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/30 z-[60]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 z-[60] bg-card rounded-t-2xl border-t border-border max-w-[var(--max-width-column)] mx-auto animate-slide-up max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-ink">
            {editing ? "Edit expense" : "Log expense"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 flex items-center justify-center -mr-2 text-muted hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-3">
          {/* Amount — large centered with currency toggle */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1 mb-1">
              <button
                onClick={() => {
                  if (inputCurrency === "local") {
                    // Switch to MYR: convert current amount
                    if (numericAmount > 0 && fxRate > 0) {
                      setAmount((numericAmount / fxRate).toFixed(2));
                    }
                    setInputCurrency("myr");
                  } else {
                    // Switch to local: convert current amount
                    if (numericAmount > 0) {
                      setAmount(Math.round(numericAmount * fxRate).toString());
                    }
                    setInputCurrency("local");
                  }
                }}
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors px-1.5 py-0.5 rounded border border-accent/30 hover:bg-accent-soft"
              >
                {inputCurrency === "local" ? localCurrency : "MYR"} ⇄
              </button>
            </div>
            <input
              ref={amountRef}
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => {
                const n = parseFloat(amount);
                if (!isNaN(n) && n > 0) setAmount(n.toFixed(2));
                // Amounts split follows the total when it changes
                if (splitType === "amount") {
                  const total = inputCurrency === "local" ? n : n * fxRate;
                  setWeights((w) => ({ ...w, ...prefill("amount", orderedIds(included), Math.round(total * 100) / 100) }));
                }
              }}
              className="w-full text-center text-4xl font-semibold text-ink bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {numericAmount > 0 && (
              <p className="text-xs text-muted mt-1">
                ≈ {inputCurrency === "local" ? `RM ${myrAmount.toFixed(2)}` : `${localCurrency} ${localAmount.toLocaleString()}`}
              </p>
            )}
          </div>

          {/* What for */}
          <input
            type="text"
            placeholder="What for?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-ground border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-accent transition-colors"
          />

          {/* Paid by (D32) */}
          <div className="flex items-center gap-2">
            <label htmlFor="expense-paid-by" className="text-xs text-muted w-14">Paid by</label>
            <select
              id="expense-paid-by"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="bg-ground border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-accent transition-colors"
            >
              {travellers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id === myTravellerId ? `You (${t.display_name})` : t.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2">
            <label htmlFor="expense-date" className="text-xs text-muted w-14">Date</label>
            <input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-ground border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Category chips */}
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`
                  px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors
                  ${
                    category === cat.value
                      ? "bg-accent text-accent-on"
                      : "bg-ground text-muted border border-border hover:border-accent/40"
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Split as */}
          <div className="flex border border-border rounded-md overflow-hidden">
            {SPLIT_TYPES.map((s) => (
              <button
                key={s.value}
                onClick={() => changeSplitType(s.value)}
                className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                  splitType === s.value ? "bg-accent-soft text-accent" : "bg-card text-muted hover:text-ink"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Split between — list (D32) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-muted">
                Split between · {ticked.length} of {travellers.length}
              </p>
              <button
                onClick={() => setTicked(allTicked ? new Set() : new Set(travellers.map((t) => t.id)))}
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
              >
                {allTicked ? "Clear" : "Select all"}
              </button>
            </div>
            <div className="border border-border rounded-md divide-y divide-border">
              {travellers.map((t) => {
                const on = included.has(t.id);
                return (
                  <div key={t.id} className="flex items-center gap-2 px-2.5 py-2">
                    <input
                      id={`split-${t.id}`}
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(t.id)}
                      className="w-4 h-4 accent-[var(--color-accent)] shrink-0"
                    />
                    <label
                      htmlFor={`split-${t.id}`}
                      className={`flex-1 min-w-0 truncate text-sm ${on ? "text-ink" : "text-muted"}`}
                    >
                      {t.id === myTravellerId ? "You" : t.display_name}
                    </label>
                    {on && splitType !== "equal" && (
                      <input
                        type="number"
                        inputMode="decimal"
                        aria-label={`${t.display_name} ${splitType === "shares" ? "shares" : splitType === "percent" ? "percent" : "amount"}`}
                        value={weights[t.id] ?? ""}
                        onChange={(e) => setWeights((w) => ({ ...w, [t.id]: e.target.value }))}
                        className={`${splitType === "amount" ? "w-24" : "w-14"} bg-ground border border-border rounded-md px-2 py-1 text-sm text-ink text-right outline-none focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                      />
                    )}
                    {splitType !== "amount" && (
                      <span className={`w-20 text-right text-sm tabular-nums ${on ? "text-ink" : "text-muted"}`}>
                        {on ? fmt(shareOf(t.id)) : "—"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <p
              className={`mt-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-center ${
                status.ok ? "bg-money-ok-soft text-money-ok" : "bg-money-warn-soft text-money-warn"
              }`}
            >
              {status.text}{status.ok ? " ✓" : ""}
            </p>
          </div>

          {/* Notes */}
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-ground border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        {/* Footer — clears the 56px bottom nav + safe area */}
        <div className="px-4 pt-3 pb-[calc(0.75rem+56px+env(safe-area-inset-bottom))] border-t border-border space-y-3">
          {/* Primary actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium text-muted border border-border rounded-lg hover:border-ink/30 hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!amount || !title.trim() || numericAmount <= 0 || !splitValid || saving}
              className="flex-1 py-2 bg-accent text-accent-on text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {editing ? "Save" : "Log"}
            </button>
          </div>

          {/* Secondary action — only in edit mode */}
          {editing && (
            <div className="flex items-center justify-center pt-1">
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
                className="text-xs text-money-over hover:text-money-over/80 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete expense"
        message={`Are you sure you want to delete "${editing?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
