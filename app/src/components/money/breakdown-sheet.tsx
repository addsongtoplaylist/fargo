"use client";

import { Sheet } from "@/components/ui/sheet";
import { Eyebrow } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { categoryLabel } from "@/lib/categories";
import { categoryStyle } from "@/lib/category-style";
import type { MoneyCurrency } from "./currency-toggle";
import { formatLocal } from "./money-utils";

const FIXED_CATEGORIES = ["flights", "accommodation", "activities"];

/**
 * What you paid by category (D19/D27) — opened from "Breakdown" on Money
 * (v0.6.5: the expenses list comes first, the breakdown moved here).
 * Amounts are stored in MYR and shown in the chosen currency.
 */
export function BreakdownSheet({
  spendingByCategory,
  money,
  onClose,
}: {
  spendingByCategory: Record<string, number>;
  money: MoneyCurrency;
  onClose: () => void;
}) {
  const entries = Object.entries(spendingByCategory);
  const groups = [
    { label: "Fixed", items: entries.filter(([k]) => FIXED_CATEGORIES.includes(k)) },
    { label: "Daily", items: entries.filter(([k]) => !FIXED_CATEGORIES.includes(k) && k !== "settlement") },
    { label: "Settle-ups", items: entries.filter(([k]) => k === "settlement") },
  ].filter((g) => g.items.length > 0);
  const paidTotal = entries.reduce((sum, [, v]) => sum + v, 0);

  return (
    <Sheet open title="What you paid" onClose={onClose}>
      {groups.length === 0 ? (
        <p className="text-sm text-fg-muted pb-2">Nothing paid yet.</p>
      ) : (
        <div className="space-y-4 pb-1">
          <p className="text-[13px] text-fg-muted tabular-nums">
            Total {money.code} {formatLocal(Math.round(money.fromMyr(paidTotal)))}
          </p>
          {groups.map((g) => (
            <div key={g.label}>
              <Eyebrow className="mb-2">{g.label}</Eyebrow>
              <div className="space-y-3">
                {[...g.items]
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, amount]) => (
                    <div key={key} className="flex items-center gap-3">
                      <CategoryIcon category={key} size={32} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm text-fg truncate">{categoryLabel(key)}</span>
                          <span className="text-sm font-semibold text-fg tabular-nums shrink-0">
                            {money.code} {Math.round(money.fromMyr(amount)).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1 bg-page rounded-full overflow-hidden" aria-hidden>
                          <div
                            className={`h-full rounded-full ${categoryStyle(key).bar}`}
                            style={{ width: `${paidTotal > 0 ? Math.max(3, (amount / paidTotal) * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}
