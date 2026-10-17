"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ArrowLeftRight } from "lucide-react";

type BudgetStripProps = {
  dailyFree: number;
  spentToday: number;
  localCurrency: string;
  fxRate: number;
  /** The selected day (yyyy-MM-dd) */
  date: string;
  isToday: boolean;
};

/**
 * Daily budget card for the selected day (DESIGN.md v0.8 → Schedule):
 * spent vs daily free, thin bar, what's left (red when over). Same numbers
 * as before; hidden when there's no budget. The pill switches the amounts
 * between the trip currency and MYR (what they're stored in), display only.
 */
export function BudgetStrip({ dailyFree, spentToday, localCurrency, fxRate, date, isToday }: BudgetStripProps) {
  const [showHome, setShowHome] = useState(false);
  if (dailyFree <= 0) return null;

  const canSwitch = !!localCurrency && localCurrency !== "MYR" && fxRate > 0;
  const home = showHome && canSwitch;
  const rate = home ? 1 : fxRate;
  const shownCur = home ? "MYR" : localCurrency;

  const dailyFreeLocal = Math.round(dailyFree * rate);
  const spentLocal = Math.round(spentToday * rate);
  const over = spentToday > dailyFree;
  const leftLocal = Math.abs(dailyFreeLocal - spentLocal);
  const pct = Math.min(100, (spentToday / dailyFree) * 100);
  const cur = shownCur ? `${shownCur} ` : "";

  return (
    <div className="bg-surface rounded-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-fg-muted">Spent on {format(parseISO(date), "EEE d")}</p>
        {canSwitch && (
          <button
            type="button"
            onClick={() => setShowHome(!showHome)}
            aria-label={`Amounts in ${shownCur} — switch to ${home ? localCurrency : "MYR"}`}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-brand-soft text-brand text-xs font-semibold hover:bg-brand hover:text-brand-on transition-colors"
          >
            {shownCur}
            <ArrowLeftRight size={12} strokeWidth={2.2} aria-hidden />
          </button>
        )}
      </div>
      <p className="mt-0.5 tabular-nums">
        <span className={`text-[20px] font-bold ${over ? "text-money-over" : "text-fg"}`}>
          {cur}
          {spentLocal.toLocaleString()}
        </span>
        <span className="text-[13px] text-fg-muted"> of {dailyFreeLocal.toLocaleString()}</span>
      </p>
      <div className="mt-2.5 h-1.5 rounded-full bg-page overflow-hidden" aria-hidden>
        <div className={`h-full rounded-full ${over ? "bg-money-over" : "bg-brand"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`mt-2 text-[13px] font-medium tabular-nums ${over ? "text-money-over" : "text-fg-muted"}`}>
        {cur}
        {leftLocal.toLocaleString()} {over ? "over" : isToday ? "left for today" : "left"}
      </p>
    </div>
  );
}
