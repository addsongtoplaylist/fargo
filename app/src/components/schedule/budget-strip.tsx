"use client";

import { format, parseISO } from "date-fns";

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
 * as before; hidden when there's no budget.
 */
export function BudgetStrip({ dailyFree, spentToday, localCurrency, fxRate, date, isToday }: BudgetStripProps) {
  if (dailyFree <= 0) return null;

  const dailyFreeLocal = Math.round(dailyFree * fxRate);
  const spentLocal = Math.round(spentToday * fxRate);
  const over = spentToday > dailyFree;
  const leftLocal = Math.abs(dailyFreeLocal - spentLocal);
  const pct = Math.min(100, (spentToday / dailyFree) * 100);
  const cur = localCurrency ? `${localCurrency} ` : "";

  return (
    <div className="bg-surface rounded-card p-4">
      <p className="text-[13px] text-fg-muted">Spent on {format(parseISO(date), "EEE d")}</p>
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
