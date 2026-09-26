"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { createExpense, updateExpense, deleteExpense } from "@/lib/actions/expense";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { format } from "date-fns";
import type { Expense } from "@/lib/actions/expense";
import { EXPENSE_CATEGORIES as CATEGORIES } from "@/lib/categories";

type LogExpensePanelProps = {
  tripId: string;
  localCurrency: string;
  fxRate: number;
  travellerId: string;
  editing?: Expense | null;
  onClose: () => void;
};

export function LogExpensePanel({
  tripId,
  localCurrency,
  fxRate,
  travellerId,
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
  const amountRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setTimeout(() => amountRef.current?.focus(), 100);
  }, []);

  const numericAmount = parseFloat(amount) || 0;
  // Convert based on which currency the user is typing in
  const localAmount = inputCurrency === "local" ? numericAmount : numericAmount * fxRate;
  const myrAmount = inputCurrency === "local" ? (fxRate > 0 ? numericAmount / fxRate : 0) : numericAmount;

  function handleSave() {
    if (!amount || !title.trim() || numericAmount <= 0) return;

    // Always send the local currency amount to the server
    const payload = {
      date,
      title: title.trim(),
      category,
      amount: inputCurrency === "local" ? numericAmount : localAmount,
      fxRate,
      paidBy: travellerId,
      isShared: true,
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && amount && title.trim()) handleSave();
            }}
          />

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

          {/* Date */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted w-10">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-ground border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-accent transition-colors"
            />
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
              disabled={!amount || !title.trim() || numericAmount <= 0 || saving}
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
