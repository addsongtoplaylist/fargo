// Share maths for group expenses — mirrors fx_compute_shares in
// supabase/migrations/20260926_group_expenses_p1a.sql so the form's preview
// matches what the database saves. Works in cents; leftover cents go to
// participants in list order (D26).

export type SplitType = "equal" | "shares" | "percent" | "amount";

const toCents = (n: number) => Math.round(n * 100);

/** Each participant's share (local currency), in the order given. */
export function computeShares(amount: number, splitType: SplitType, weights: number[]): number[] {
  const n = weights.length;
  if (n === 0 || !(amount > 0)) return weights.map(() => 0);
  const w = splitType === "equal" ? weights.map(() => 1) : weights.map((x) => Math.max(0, x || 0));
  const total = w.reduce((a, b) => a + b, 0);
  if (total <= 0) return weights.map(() => 0);

  const cents = toCents(amount);
  const base =
    splitType === "amount"
      ? w.map((x) => toCents(x))
      : w.map((x) => Math.floor((cents * x) / total));
  let left = cents - base.reduce((a, b) => a + b, 0);
  const out = [...base];
  for (let i = 0; i < n && left > 0; i++) {
    if (w[i] > 0) {
      out[i] += 1;
      left--;
    }
  }
  return out.map((c) => c / 100);
}

/** Even pre-fill for % (total 100) or Amounts (total = amount), 2 decimals (D33). */
export function evenWeights(n: number, total: number): number[] {
  if (n === 0) return [];
  const cents = toCents(total);
  const base = Math.floor(cents / n);
  const left = cents - base * n;
  return Array.from({ length: n }, (_, i) => (base + (i < left ? 1 : 0)) / 100);
}

/** How far the split is from adding up; 0 means it's valid. */
export function remaining(amount: number, splitType: SplitType, weights: number[]): number {
  if (splitType === "percent") return Math.round((100 - weights.reduce((a, b) => a + (b || 0), 0)) * 100) / 100;
  if (splitType === "amount") return (toCents(amount) - weights.reduce((a, b) => a + toCents(b || 0), 0)) / 100;
  return 0;
}
