# Fargo — Changelog

---

## v0.2 — 2026-09-05 · Post-trip polish

First feedback round after the Singapore trip (We Are Riise Singapore, 31 Aug – 2 Sep 2026). Fixes real-world pain points from 3 days of daily use with 2 travellers, 24 expenses, and a RM 1,300 budget.

### Money tab (MNY-1 → MNY-6)

- **MNY-1 · Dual currency on budget summary** — Total spent now shows destination currency first with MYR equivalent (e.g. "SGD 332.76 ≈ RM 1,072.02"). Category breakdown also shows destination currency.
- **MNY-2 · Fixed expenses from actual expenses** — Fixed costs (flights, accommodation, activities) are now pulled from the expenses table instead of activity cost estimates. Removes the mismatch between logged and projected.
- **MNY-3 · Solo expenses removed** — Solo/shared toggle dropped; all expenses are shared equally among travellers. Simplifies the model for small groups.
- **MNY-4 · Budget strip in destination currency** — Daily free and "spent today" on the Schedule tab now show in destination currency (e.g. SGD) instead of MYR.
- **MNY-5 · Decimal formatting on amount input** — Expense amount auto-formats to 2 decimal places on blur (typing "7" → "7.00").
- **MNY-6 · Static daily budget** — Daily free is now a fixed number: `(budget − fixed expenses) / trip days`. No longer shrinks as you spend — the traveller gets a consistent daily allowance.

### Schedule & Overview (SCH-1 → SCH-4)

- **SCH-1 · Demote activity to ideas** — New "↓ To ideas" button in the activity edit panel moves an activity back to the ideas backlog, preserving time, location, category, and notes. Round-trip (demote → promote) retains all data. Requires DB migration (`docs/migrations/sch1-ideas-extra-columns.sql`).
- **SCH-2 · Schedule defaults to today** — Active trips now reset to today's date when the Schedule tab regains focus (via `visibilitychange`), instead of staying on whichever day was last viewed.
- **SCH-3 · "Latest" badge on overview** — When all of today's activities have passed, the last one shows a "Latest" badge instead of leaving the plan card with no highlight.
- **SCH-4 · Post-trip summary dashboard** — Ended trips show a dashboard-style summary on Overview: duration, destination, numbered attractions list, and hotel stay. No budget/expense numbers.

### UI polish

- **ConfirmDialog** — New `destructive` prop. Non-destructive confirmations (e.g. "Move to ideas") use blue accent styling instead of red delete styling.
- **Ideas section** — Demoted ideas now display their preserved time and location metadata.
- **Expense categories** — Added "✈️ Flights" and "🏨 Stay" to expense category list (previously only in activity categories).

### Files changed

| File | What |
|---|---|
| `lib/actions/expense.ts` | Fixed expense logic, static daily budget formula |
| `lib/actions/activity.ts` | New `demoteActivity()` server action |
| `lib/actions/idea.ts` | Extended `Idea` type, rewrote `promoteIdea()` for full data round-trip |
| `lib/categories.ts` | Added flights + accommodation to expense categories |
| `components/money/money-view.tsx` | Dual currency display on budget summary |
| `components/money/log-expense-panel.tsx` | Decimal formatting, solo toggle removed |
| `components/schedule/budget-strip.tsx` | Destination currency on daily free + spent today |
| `components/schedule/activity-list.tsx` | Visibilitychange listener for active-trip date reset |
| `components/schedule/add-activity-panel.tsx` | "To ideas" demote button + confirm dialog |
| `components/confirm-dialog.tsx` | Destructive/non-destructive variants |
| `components/prep/ideas-section.tsx` | Time + location display for demoted ideas |
| `app/(app)/trips/[id]/overview/page.tsx` | Post-trip summary dashboard, "Latest" badge logic |

### Migration required

```sql
-- Run in Supabase SQL Editor before deploying
-- docs/migrations/sch1-ideas-extra-columns.sql
ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS time text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'misc',
  ADD COLUMN IF NOT EXISTS place_name text,
  ADD COLUMN IF NOT EXISTS place_lat text,
  ADD COLUMN IF NOT EXISTS place_lng text;
```

---

## v0.1 — 2026-08-30 · Internal launch

First working version. Planner + 1 invited traveller on a real trip.

- Google OAuth sign-in
- Trip CRUD with hero cards, active trip auto-land
- Schedule with day picker, drag-to-reorder activities, location search (Google Places)
- Ideas backlog with promote-to-schedule
- Checklists with full CRUD
- Budget setup, expense logging with optimistic UI
- Daily budget strip on Schedule
- Category breakdown, solo/shared expenses
- Invite flow via share link, read-only shared view
- Overview: local time card, upcoming plan with 2-day lookahead, traveller avatars
- Swipe-to-switch trip tabs on mobile
- PWA deployed at `fargotravel.vercel.app`
