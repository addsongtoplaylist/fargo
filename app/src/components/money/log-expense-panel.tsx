"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeftRight, Check } from "lucide-react";
import { createExpense, updateExpense, deleteExpense } from "@/lib/actions/expense";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { format } from "date-fns";
import type { Expense } from "@/lib/actions/expense";
import { EXPENSE_CATEGORIES as CATEGORIES } from "@/lib/categories";
import { computeShares, evenWeights, remaining, type SplitType } from "@/lib/split";
import { Sheet } from "@/components/ui/sheet";
import { Button, TextButton } from "@/components/ui/button";
import { CategorySelect } from "@/components/ui/category-select";
import { Segmented } from "@/components/ui/segmented";
import { Eyebrow } from "@/components/ui/card";
import { FieldRow, fieldClass, textareaClass } from "@/components/ui/field";

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

/** Per-trip memory of the last "Split with others" choice (this device). */
const splitMemoryKey = (tripId: string) => `fargo:split-with-others:${tripId}`;

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
  // "Split with others" (owner, 2026-09-29, replaces D10's always-tick rule).
  // Off = only the payer is on it (a personal expense, same as ticking just
  // them). Editing restores what was saved; a new expense remembers the last
  // choice on this trip (this device), first one on. Hidden on a solo trip.
  const canSplit = travellers.length > 1;
  const [splitOn, setSplitOn] = useState<boolean>(() => {
    if (!canSplit) return false;
    if (editing) {
      const ids = editing.expense_participants.map((p) => p.traveller_id);
      return !(ids.length === 1 && ids[0] === editing.paid_by);
    }
    try {
      return localStorage.getItem(splitMemoryKey(tripId)) !== "off";
    } catch {
      return true;
    }
  });
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

  // Not split → just the payer, equal (one share of the whole amount)
  const effectiveType: SplitType = splitOn ? splitType : "equal";
  const ticked = splitOn ? travellers.filter((t) => included.has(t.id)) : travellers.filter((t) => t.id === paidBy);
  const tickedWeights = ticked.map((t) => (effectiveType === "equal" ? 1 : parseFloat(weights[t.id]) || 0));
  const shares = computeShares(splitTotal, effectiveType, tickedWeights);
  const shareOf = (id: string) => shares[ticked.findIndex((t) => t.id === id)] ?? 0;
  const left = remaining(splitTotal, effectiveType, tickedWeights);
  const sharesTotal = effectiveType === "shares" ? tickedWeights.reduce((a, b) => a + b, 0) : 1;
  const splitValid = ticked.length > 0 && left === 0 && sharesTotal > 0;
  const allTicked = ticked.length === travellers.length;

  /**
   * Default weights for a new set of ticked people / split type (D33).
   * keepShares: when only the ticks change, keep shares already entered;
   * when the split type changes, always reset to defaults (UAT-07).
   */
  function prefill(type: SplitType, ids: string[], total: number, keepShares = false): Record<string, string> {
    if (type === "shares") {
      return Object.fromEntries(
        ids.map((id) => {
          const t = travellers.find((x) => x.id === id);
          const fallback = String(t?.default_shares ?? 1);
          return [id, keepShares ? weights[id] ?? fallback : fallback];
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
    setWeights((w) => ({ ...w, ...prefill(splitType, orderedIds(next), splitTotal, true) }));
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
      splitType: effectiveType,
      participants: ticked.map((t, i) => ({ travellerId: t.id, weight: tickedWeights[i] })),
      notes: notes.trim() || undefined,
    };

    // Remember the choice for the next expense on this trip (this device only)
    if (canSplit) {
      try {
        localStorage.setItem(splitMemoryKey(tripId), splitOn ? "on" : "off");
      } catch {
        /* storage unavailable — fine, the default is on */
      }
    }

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
  if (!splitOn)
    status = { ok: true, text: paidBy === myTravellerId ? "Just for you" : `Just for ${ticked[0]?.display_name ?? "them"}` };
  else if (ticked.length === 0) status = { ok: false, text: "Tick who it's for" };
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

  const noSpin =
    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  function switchCurrency() {
    if (inputCurrency === "local") {
      // Switch to MYR: convert current amount
      if (numericAmount > 0 && fxRate > 0) setAmount((numericAmount / fxRate).toFixed(2));
      setInputCurrency("myr");
    } else {
      // Switch to local: convert current amount
      if (numericAmount > 0) setAmount(Math.round(numericAmount * fxRate).toString());
      setInputCurrency("local");
    }
  }

  return (
    <>
      <Sheet
        open
        title={editing ? "Edit expense" : "Log expense"}
        onClose={onClose}
        footer={
          <>
            {/* Status line pinned above the buttons, so it stays visible however long the list is */}
            <p
              role="status"
              className={`mb-2.5 rounded-field px-3 py-2 text-[13px] font-medium text-center flex items-center justify-center gap-1.5 ${
                status.ok ? "bg-money-ok-soft text-money-ok" : "bg-money-warn-soft text-money-warn"
              }`}
            >
              {status.text}
              {status.ok && <Check size={14} strokeWidth={2.4} aria-hidden />}
            </p>
            <div className="flex gap-2.5">
              <Button variant="quiet" size="lg" full onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="lg"
                full
                onClick={handleSave}
                disabled={!amount || !title.trim() || numericAmount <= 0 || !splitValid || saving}
              >
                {editing ? "Save" : "Log"}
              </Button>
            </div>
            {/* Secondary action — only in edit mode */}
            {editing && (
              <div className="flex justify-center pt-2">
                <TextButton tone="danger" onClick={() => setConfirmDelete(true)} disabled={saving}>
                  Delete
                </TextButton>
              </div>
            )}
          </>
        }
      >
        <div className="space-y-3 pb-1">
          {/* Amount — large, centred, with currency switch */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={switchCurrency}
              aria-label={`Amount in ${inputCurrency === "local" ? localCurrency : "MYR"} — switch currency`}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-brand-soft text-brand text-xs font-semibold hover:bg-brand hover:text-brand-on transition-colors"
            >
              {inputCurrency === "local" ? localCurrency : "MYR"}
              <ArrowLeftRight size={12} strokeWidth={2.2} aria-hidden />
            </button>
            <input
              ref={amountRef}
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              aria-label="Amount"
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
              className={`w-full text-center text-[38px] font-bold text-fg placeholder:text-fg-faint bg-transparent outline-none mt-1 tabular-nums ${noSpin}`}
            />
            {numericAmount > 0 && (
              <p className="text-[13px] text-fg-muted">
                ≈ {inputCurrency === "local" ? `RM ${myrAmount.toFixed(2)}` : `${localCurrency} ${localAmount.toLocaleString()}`}
              </p>
            )}
          </div>

          {/* What for */}
          <input
            type="text"
            placeholder="What for?"
            aria-label="What for"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
          />

          {/* Paid by (D32) */}
          <FieldRow label="Paid by" htmlFor="expense-paid-by">
            <select id="expense-paid-by" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className={fieldClass}>
              {travellers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id === myTravellerId ? `You (${t.display_name})` : t.display_name}
                </option>
              ))}
            </select>
          </FieldRow>

          {/* Date */}
          <FieldRow label="Date" htmlFor="expense-date">
            <input id="expense-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
          </FieldRow>

          {/* Category */}
          <CategorySelect id="expense-category" value={category} options={CATEGORIES} onChange={setCategory} />

          {/* Split with others — the split section only shows when it's on */}
          {canSplit && (
            <button
              type="button"
              role="switch"
              aria-checked={splitOn}
              onClick={() => setSplitOn(!splitOn)}
              className="w-full flex items-center justify-between gap-3 h-11 pt-1"
            >
              <span className="text-sm font-medium text-fg">Split with others</span>
              <span
                aria-hidden
                className={`relative w-[46px] h-7 rounded-full transition-colors ${splitOn ? "bg-brand" : "bg-line"}`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-surface shadow-[0_1px_3px_rgba(23,32,51,0.25)] transition-all ${
                    splitOn ? "left-[20px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          )}

          {splitOn && (
            <>
            {/* Split as */}
            <div className="pt-1">
              <Eyebrow className="mb-1.5">Split as</Eyebrow>
              <Segmented label="Split as" options={SPLIT_TYPES} value={splitType} onChange={changeSplitType} />
            </div>

            {/* Split between — list (D32) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Eyebrow>
                  Split between · {ticked.length} of {travellers.length}
                </Eyebrow>
                <TextButton onClick={() => setTicked(allTicked ? new Set() : new Set(travellers.map((t) => t.id)))} className="py-0">
                  {allTicked ? "Clear" : "Select all"}
                </TextButton>
              </div>
              <div className="border border-line rounded-field divide-y divide-line">
                {travellers.map((t) => {
                  const on = included.has(t.id);
                  return (
                    <div key={t.id} className="flex items-center gap-2.5 px-3 min-h-[44px]">
                      <input
                        id={`split-${t.id}`}
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(t.id)}
                        className="w-[18px] h-[18px] accent-[#0071bc] shrink-0"
                      />
                      <label
                        htmlFor={`split-${t.id}`}
                        className={`flex-1 min-w-0 truncate text-sm py-2.5 ${on ? "text-fg font-medium" : "text-fg-muted"}`}
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
                          className={`${splitType === "amount" ? "w-24" : "w-14"} h-9 bg-page border border-line rounded-[10px] px-2 text-sm text-fg text-right outline-none focus:border-brand tabular-nums ${noSpin}`}
                        />
                      )}
                      {splitType !== "amount" && (
                        <span className={`w-20 text-right text-sm tabular-nums ${on ? "text-fg" : "text-fg-faint"}`}>
                          {on ? fmt(shareOf(t.id)) : "—"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            </>
          )}

          {/* Notes */}
          <textarea
            placeholder="Notes (optional)"
            aria-label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={textareaClass}
          />
        </div>
      </Sheet>

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
