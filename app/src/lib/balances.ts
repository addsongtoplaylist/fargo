// Balances and settle-up for group expenses (D12, D13, D22).
// Everything in cents to avoid float drift; results in local currency.

export type BalanceExpense = {
  id: string;
  title: string;
  date: string;
  kind: "expense" | "settlement";
  amount: string | number;
  paid_by: string;
  expense_participants: { traveller_id: string; share: string | number }[];
};

export type Payment = { from: string; to: string; amount: number };

const cents = (v: string | number) => Math.round(Number(v) * 100);

/** Balance per traveller: what they paid − their shares. Positive = owed. */
export function computeBalances(expenses: BalanceExpense[], travellerIds: string[]): Map<string, number> {
  const c = new Map<string, number>(travellerIds.map((id) => [id, 0]));
  for (const e of expenses) {
    c.set(e.paid_by, (c.get(e.paid_by) ?? 0) + cents(e.amount));
    for (const p of e.expense_participants) {
      c.set(p.traveller_id, (c.get(p.traveller_id) ?? 0) - cents(p.share));
    }
  }
  return new Map([...c].map(([id, v]) => [id, v / 100]));
}

/**
 * Fewest payments — Kittysplit's "middle of the table": the largest debtor
 * pays the largest creditor the smaller of the two amounts, repeat. At most
 * travellers − 1 payments. Ties follow traveller order, so it's stable.
 */
export function fewestPayments(balances: Map<string, number>, travellerIds: string[]): Payment[] {
  const order = (id: string) => {
    const i = travellerIds.indexOf(id);
    return i === -1 ? travellerIds.length : i;
  };
  const debt = [...balances].filter(([, v]) => v < 0).map(([id, v]) => ({ id, c: -Math.round(v * 100) }));
  const cred = [...balances].filter(([, v]) => v > 0).map(([id, v]) => ({ id, c: Math.round(v * 100) }));
  const byAmount = (a: { id: string; c: number }, b: { id: string; c: number }) => b.c - a.c || order(a.id) - order(b.id);
  const out: Payment[] = [];
  while (debt.length && cred.length) {
    debt.sort(byAmount);
    cred.sort(byAmount);
    const d = debt[0];
    const k = cred[0];
    const pay = Math.min(d.c, k.c);
    out.push({ from: d.id, to: k.id, amount: pay / 100 });
    d.c -= pay;
    k.c -= pay;
    if (d.c === 0) debt.shift();
    if (k.c === 0) cred.shift();
  }
  return out;
}

/** What makes up one traveller's balance: what they paid (+) and their shares (−). */
export function balanceLines(expenses: BalanceExpense[], travellerId: string) {
  const lines: { id: string; label: string; date: string; amount: number }[] = [];
  for (const e of expenses) {
    const settle = e.kind === "settlement";
    if (e.paid_by === travellerId) {
      lines.push({ id: `${e.id}-paid`, label: settle ? "You paid back" : `You paid · ${e.title}`, date: e.date, amount: cents(e.amount) / 100 });
    }
    const mine = e.expense_participants.find((p) => p.traveller_id === travellerId);
    if (mine) {
      lines.push({ id: `${e.id}-share`, label: settle ? "Paid back to you" : `Your share · ${e.title}`, date: e.date, amount: -cents(mine.share) / 100 });
    }
  }
  return lines.sort((a, b) => a.date.localeCompare(b.date));
}
