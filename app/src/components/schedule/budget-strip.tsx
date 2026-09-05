"use client";

type BudgetStripProps = {
  dailyFree: number;
  spentToday: number;
  localCurrency: string;
  fxRate: number;
};

export function BudgetStrip({ dailyFree, spentToday, localCurrency, fxRate }: BudgetStripProps) {
  if (dailyFree <= 0) return null;

  const dailyFreeLocal = Math.round(dailyFree * fxRate);
  const spentTodayLocal = Math.round(spentToday * fxRate);

  return (
    <div className="mx-4 mb-2 bg-accent-soft rounded-lg px-3 py-2.5 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-medium text-accent/70 uppercase tracking-wide">
          Daily free budget
        </p>
        <p className="text-lg font-semibold text-accent money">
          {localCurrency} {dailyFreeLocal.toLocaleString()}
        </p>
        <p className="text-[10px] text-accent/50 money">
          ≈ RM {dailyFree.toLocaleString()}
        </p>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-medium text-muted uppercase tracking-wide">
          Spent today
        </p>
        <p
          className={`text-base font-semibold money ${
            spentToday > dailyFree ? "text-money-over" : "text-accent"
          }`}
        >
          {localCurrency} {spentTodayLocal.toLocaleString()}
        </p>
        <p className="text-[10px] text-muted/60 money">
          ≈ RM {spentToday.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
