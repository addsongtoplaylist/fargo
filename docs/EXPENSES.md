# Fargo — Group Expenses (planning)

> **Working doc — 2026-09-26. Planning only, nothing built.** Separates the group-expense feature from the rest of the trip features so we can think it through before building. Decisions move from *Open questions* to *Decided* as we agree them.

---

## Why

A 7-person trip showed the current model breaks down: one planner can't log everyone's spending, and "split equally among everyone" doesn't match reality — not everyone joins every dinner. Kittysplit handled it well: everyone logs what they paid, picks who it was for, and the app works out who owes whom.

**Guardrail:** Fargo stays a travel app, not a split app. Expense features hang off the trip (days, activities, travellers), never a standalone ledger. If splitting starts to overshadow trip planning, we invest in trip features to rebalance.

---

## How money works today (v0.3.7)

- Only the **planner** can add, edit or delete expenses; members can only view.
- **Paid by** is always the planner. Every expense is split **equally among all travellers**.
- **Budget** is per person (`travellers.budget_total`, MYR). "Spent" = your equal share of every expense. Daily free budget = (budget − fixed costs) ÷ trip days.
- One frozen FX rate per trip; everything stored in local currency + MYR.
- No balances, no settle-up.

---

## Decided

| # | Decision | Date |
|---|---|---|
| D1 | **Every traveller can add and edit money** — an exception to "only the planner edits". (A planner-only version was rejected: one person can't log for seven.) | 2026-09-26 |
| D2 | **Split by participants:** each expense picks who it's for, from the group. | 2026-09-26 |
| D3 | **Split types:** equal among participants, by percentage, or custom amounts. | 2026-09-26 |
| D4 | **Budget counts what you actually paid out**, not your share. | 2026-09-26 |
| D5 | **Budget is optional, per traveller** — each person decides whether to set one. | 2026-09-26 |
| D6 | **Budget stays personal**, not a group budget. | 2026-09-26 |
| D7 | **Budget = cash out of your pocket.** Paying for others counts in full; repayments you receive do **not** reduce your spent. Settle-up is tracked separately from budget. | 2026-09-26 |

---

## Open questions

To go through one by one.

1. **Edit rights.** Can a traveller edit/delete *anyone's* expense, or only ones they logged? Can the planner override?
2. **Payers.** One payer per expense, or can an expense have several payers (e.g. two people split the hotel card payment)?
3. **Default participants.** When adding an expense, is everyone ticked by default, or no one?
4. **Setting your own budget.** Today only the planner's database rules allow editing traveller rows — members will need to set their own `budget_total`. Confirm each traveller sets only their own.
5. **Settle-up.** Show the fewest transfers ("Ali pays Song RM240")? Can anyone mark a transfer as paid, or only the person receiving?
6. **Currency for balances.** Settle in MYR, or the trip's local currency? What if travellers have different home currencies?
7. **Existing trips.** Old expenses are "split equally among all". Convert them to "participants = everyone"?
8. **Link to the schedule.** Log an expense from an activity (participants pre-filled)? v1 or later?
9. **People without an account.** Kittysplit doesn't need sign-up. Do all travellers have Fargo accounts, or do we need name-only travellers?
10. **Where it lives.** Money tab sections — e.g. *Expenses · Balances* — rather than a new tab?

---

## Out of scope (for now)

Payment integrations (DuitNow, bank links) · payment reminders/nudges · groups or ledgers outside a trip · receipts/photo attachments.
