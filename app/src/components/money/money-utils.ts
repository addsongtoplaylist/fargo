import type { SplitTraveller } from "./log-expense-panel";

type RawTraveller = {
  id: string;
  display_name: string;
  default_shares?: number | null;
  created_at?: string;
};

/** Everyone on the trip in join order — the database's list order for splits. */
export function tripTravellers(travellers: RawTraveller[] | undefined): SplitTraveller[] {
  return [...(travellers ?? [])].sort(
    (a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? "") || a.id.localeCompare(b.id)
  );
}

/** Local-currency amount: no decimals needed for whole numbers, else 2. */
export function formatLocal(n: number): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
