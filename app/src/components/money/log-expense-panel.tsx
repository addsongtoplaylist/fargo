"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { createExpense } from "@/lib/actions/expense";
import { format } from "date-fns";

const CATEGORIES = [
  { value: "food", label: "🍜 Food" },
  { value: "transport", label: "🚕 Transport" },
  { value: "activities", label: "🏛 Activities" },
  { value: "shopping", label: "🛒 Shopping" },
  { value: "misc", label: "📦 Other" },
] as const;

type LogExpensePanelProps = {
  tripId: string;
  localCurrency: string;
  fxRate: number;
  travellerId: string;
  onClose: () => void;
};

export function LogExpensePanel({
  tripId,
  localCurrency,
  fxRate,
  travellerId,
  onClose,
}: LogExpensePanelProps) {
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("food");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isShared, setIsShared] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => amountRef.current?.focus(), 100);
  }, []);

  const numericAmount = parseFloat(amount) || 0;
  const myrAmount = fxRate > 0 ? numericAmount / fxRate : 0;

  async function handleSave() {
    if (!amount || !title.trim() || numericAmount <= 0) return;
    setSaving(true);

    try {
      await createExpense(tripId, {
        date,
        title: title.trim(),
        category,
        amount: numericAmount,
        fxRate,
        paidBy: travellerId,
        isShared,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
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
      <div className="fixed inset-x-0 bottom-0 z-[60] bg-card rounded-t-2xl border-t border-border max-w-[var(--max-width-column)] mx-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-ink">Log expense</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Amount — large centered */}
          <div className="text-center">
            <p className="text-xs text-muted mb-1">{localCurrency}</p>
            <input
              ref={amountRef}
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-center text-4xl font-semibold text-ink bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {numericAmount > 0 && (
              <p className="text-xs text-muted mt-1">
                ≈ RM {myrAmount.toFixed(2)}
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
                  px-2.5 py-1 rounded-full text-xs font-medium transition-colors
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

          {/* Defaults section */}
          <div className="pt-2 border-t border-border space-y-3">
            <p className="text-xs text-muted">Defaults — tap to change</p>

            <div className="flex gap-3">
              {/* Solo/Shared toggle */}
              <div className="flex-1">
                <p className="text-xs text-muted mb-1">Type</p>
                <div className="flex rounded-md border border-border overflow-hidden">
                  <button
                    onClick={() => setIsShared(false)}
                    className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                      !isShared ? "bg-accent text-accent-on" : "bg-ground text-muted"
                    }`}
                  >
                    Solo
                  </button>
                  <button
                    onClick={() => setIsShared(true)}
                    className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                      isShared ? "bg-accent text-accent-on" : "bg-ground text-muted"
                    }`}
                  >
                    Shared
                  </button>
                </div>
              </div>

              {/* Date */}
              <div className="flex-1">
                <p className="text-xs text-muted mb-1">Date</p>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-ground border border-border rounded-md px-2 py-1.5 text-xs text-ink outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Notes */}
            <input
              type="text"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-ground border border-border rounded-md px-3 py-2 text-xs text-ink placeholder:text-muted/50 outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Sticky submit — pb clears the bottom nav */}
        <div className="px-4 pt-3 pb-[calc(0.75rem+56px)] border-t border-border">
          <button
            onClick={handleSave}
            disabled={!amount || !title.trim() || numericAmount <= 0 || saving}
            className="w-full py-2.5 bg-accent text-accent-on text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Log expense"}
          </button>
        </div>
      </div>
    </>
  );
}
