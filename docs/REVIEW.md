# Fargo — Review

> Findings from real-world usage and code review. Newest first.

---

## 2026-09-05 — Money tab: post-trip feedback (We Are Riise Singapore)

Source: planner's own trip (31 Aug – 2 Sep 2026, 2 travellers, RM 1,300 budget, 24 expenses logged).

### MNY-1 · Currency display on budget summary — UX
**Severity:** Medium

**Finding:** Budget card shows "Spent: RM 1,072.02" and "Remaining: RM 227.98" — all in MYR. During the trip, the traveller thinks in destination currency (SGD). The mismatch is confusing: expenses are logged in SGD, but the summary only shows MYR.

**Current behaviour:** `money-view.tsx` lines 148–153 — spent and remaining both hardcoded to `RM`.

**Proposed fix:** Show total spent in dual currency — e.g. "Spent: SGD 332.76 (≈ RM 1,072.02)". Remaining stays MYR-only (that's the actual budget currency). Category breakdown stays MYR-only.

**Status:** ✅ Agreed — dual currency on total spent only.

**Open question:** None.

---

### MNY-2 · Fixed expenses logic — Correctness
**Severity:** High

**Finding:** The daily free budget formula uses activity costs from the schedule (`activities` table, `cost` field) as fixed expenses, not from actual logged expenses. If a cost is logged as an expense but not entered as an activity cost, it doesn't factor into the fixed cost deduction. Additionally, the current formula subtracts *both* fixed costs and total spent, causing daily free to shrink as you spend — the traveller expects a static daily allowance.

**Current behaviour:** `expense.ts` lines 287–308:
```
FIXED_CATEGORIES = ["flights", "accommodation", "activities"]
fixedCostsMyr = sum of activity.cost where category in FIXED_CATEGORIES
dailyFree = (budget - fixedCostsMyr - totalSpent) / tripDays
```

**Problems:**
1. Fixed costs pulled from activity costs, not from expenses table — mismatch with what's actually logged.
2. `totalSpent` is subtracted, so daily free shrinks every time you spend — should be a static number.
3. The "Hotel" expense in the Singapore trip was categorised as "misc" because there's no "accommodation" option in expense categories — only in activity categories.

**Proposed fix:**
1. Pull fixed expenses from the **expenses table**, filtered by category (flights, accommodation, activities).
2. Add "accommodation" to the expense category list if missing.
3. New formula: `dailyFree = (budget - fixedExpenses) / tripDays` — a **static** number that doesn't change with daily spending.

**Status:** ✅ Agreed.

**Confirmed decisions:**
- Add "flights" and "accommodation" to `EXPENSE_CATEGORIES` (currently missing — only in `ACTIVITY_CATEGORIES`).
- Fixed categories: **flights + accommodation + activities**.
- Pull fixed expenses from expenses table, not activity costs.

---

### MNY-3 · Solo expenses only tied to main user — Feature gap
**Severity:** Medium

**Finding:** The "Solo" toggle on expenses marks an expense as not shared, but it's always attributed to the logged-in user (`paid_by: travellerId` is always the current user's traveller ID). There's no way to record that a co-traveller paid for their own solo expense.

**Current behaviour:** `log-expense-panel.tsx` line 58 — `paidBy: travellerId` is always the current user's traveller record. The `paid_by` column exists in the schema but there's no UI to pick a different traveller.

**Proposed fix:** When "Solo" is selected, show a "Who paid?" picker listing all travellers on the trip. Default to the current user.

**Status:** ✅ Agreed — add traveller picker for solo expenses. No per-traveller budget summary.

---

### MNY-4 · Daily free budget shows home currency — UX
**Severity:** Low

**Finding:** The budget strip on the Schedule tab shows daily free in MYR (`RM 75.99`). During the trip, the traveller needs to know their daily allowance in the destination currency they're actually spending in.

**Current behaviour:** `budget-strip.tsx` lines 19, 30 — hardcoded `RM` prefix. `Spent today` also in MYR.

**Proposed fix:** Show daily free and spent today in destination currency primarily (e.g. `SGD 23.56`), with MYR equivalent shown smaller underneath.

**Status:** ✅ Agreed — destination currency primary, MYR secondary.

**Open question:** None.

---

### MNY-5 · Amount input doesn't show decimals — UX
**Severity:** Low

**Finding:** When logging an expense, entering "7" shows just "7" with no decimal indication. The traveller expects to see "7.00" to confirm the precision. This is especially important for currencies where cents matter (SGD 0.93 for a drink).

**Current behaviour:** `log-expense-panel.tsx` line 141 — plain `type="number"` input with placeholder "0".

**Proposed fix:** Auto-format the display to 2 decimal places on blur — typing "7" then tapping away shows "7.00". Input remains free-form while typing.

**Status:** ✅ Agreed — auto-format on blur.

**Open question:** None.

---

### MNY-6 · Daily budget recalculates with spending — Correctness
**Severity:** High

**Finding:** Daily free budget changes every time an expense is logged because the formula subtracts total spent. The traveller expects daily free to be a **fixed** daily allowance calculated once from the budget and fixed expenses. This is the same root cause as MNY-2 but called out separately because it's the most impactful UX confusion.

**Current behaviour:** `expense.ts` line 308:
```
dailyFree = (budgetTotal - fixedCostsMyr - totalSpent) / tripDays
```

**Intended formula:**
```
fixedExpenses = sum of expenses where category in [flights, accommodation, activities]
remainingPool = budgetTotal - fixedExpenses
dailyFree = remainingPool / tripDays
```

Daily free is **static** — it doesn't change when you spend. The "Spent today" indicator on the schedule strip compares against this fixed daily free to show whether you're over or under for the day.

**Status:** ✅ Agreed — daily free should be static.

**Open question:** None — same fix as MNY-2.

---

### Summary

All open questions resolved — all 6 findings confirmed.

| ID | Finding | Severity | Status |
|---|---|---|---|
| MNY-1 | Destination currency on spent + categories | Medium | ✅ Implemented |
| MNY-2 | Fixed expenses from expenses table + add categories | High | ✅ Implemented |
| MNY-3 | All expenses are shared (solo removed) | Medium | ✅ Implemented (revised — solo tracking dropped, all expenses shared) |
| MNY-4 | Daily free in destination currency | Low | ✅ Implemented |
| MNY-5 | Decimal display on amount input | Low | ✅ Implemented |
| MNY-6 | Static daily budget (same root as MNY-2) | High | ✅ Implemented |

---

### Impact · Effort · Risk analysis

#### MNY-2 + MNY-6 — Fixed expense logic + static daily budget
> These share the same root cause and should be implemented together.

| Dimension | Rating | Notes |
|---|---|---|
| **Impact** | 🔴 High | Core money logic — changes what the traveller sees every day. Incorrect daily free caused real confusion on the Singapore trip. |
| **Effort** | 🟡 Medium | 3 changes: (1) add "flights" + "accommodation" to `EXPENSE_CATEGORIES` in `categories.ts`, (2) rewrite `getBudgetSummary()` in `expense.ts` to pull fixed costs from expenses table instead of activity costs, (3) remove `totalSpent` from the daily free formula. Also need to update `budget-strip.tsx` to stop subtracting spent from daily free. |
| **Risk** | 🟡 Medium | Changes the budget numbers everyone sees — existing trips' daily free will shift. The Singapore hotel was logged as "misc" and won't retroactively become "accommodation" (data migration needed or manual re-categorisation). Need to verify the formula doesn't break when there are zero fixed expenses. |

**Files touched:** `categories.ts`, `expense.ts` (`getBudgetSummary`), `budget-strip.tsx`, `money-view.tsx`
**Suggested order:** Implement first — highest impact, and MNY-1/MNY-4 depend on getting the numbers right.

---

#### MNY-1 — Dual currency on total spent

| Dimension | Rating | Notes |
|---|---|---|
| **Impact** | 🟡 Medium | Removes daily confusion during the trip. Traveller can see "I've spent SGD X" at a glance. |
| **Effort** | 🟢 Low | Compute `totalSpentLocal = totalSpent * fxRate` in `getBudgetSummary()` or in the component. Update 1 line in `money-view.tsx` to show dual currency. |
| **Risk** | 🟢 Low | Display-only change — no logic change, no data change. |

**Files touched:** `money-view.tsx` (budget card section)
**Suggested order:** After MNY-2/6 since the spent number may change.

---

#### MNY-4 — Daily free in destination currency

| Dimension | Rating | Notes |
|---|---|---|
| **Impact** | 🟡 Medium | During the trip, "SGD 23.56 left today" is immediately actionable vs "RM 75.99" which requires mental conversion. |
| **Effort** | 🟢 Low | Pass `fxRate` and `localCurrency` to `BudgetStrip`, multiply daily free by fxRate for display. 1 component change. |
| **Risk** | 🟢 Low | Display-only. Need to pass trip context (fxRate, localCurrency) down to the strip — check if it's already available via `useTrip()`. |

**Files touched:** `budget-strip.tsx`, possibly `schedule` page that renders it
**Suggested order:** After MNY-2/6 since daily free value changes.

---

#### MNY-3 — Solo expense traveller picker

| Dimension | Rating | Notes |
|---|---|---|
| **Impact** | 🟡 Medium | Without this, co-traveller solo expenses can't be tracked accurately. Less critical for 2-person trips but important for group trips. |
| **Effort** | 🟡 Medium | (1) Fetch travellers list and pass to `LogExpensePanel`, (2) add a "Who paid?" picker UI (radio or chips) that appears when Solo is selected, (3) pass selected traveller ID as `paidBy` instead of always using current user. |
| **Risk** | 🟢 Low | The `paid_by` column already exists and works. Just need UI to select a different value. No schema change needed. |

**Files touched:** `log-expense-panel.tsx`, `money-view.tsx` (pass travellers), possibly `money/page.tsx` (fetch travellers)
**Suggested order:** Independent — can be done in any position.

---

#### MNY-5 — Decimal display on amount input

| Dimension | Rating | Notes |
|---|---|---|
| **Impact** | 🟢 Low | Nice polish — prevents ambiguity on amounts like "7" vs "7.00" vs "0.70". |
| **Effort** | 🟢 Low | Add `onBlur` handler that formats to 2 decimal places. ~5 lines of code. |
| **Risk** | 🟢 Low | Purely cosmetic. Edge case: user types "7.5" → shows "7.50" on blur, which is expected. |

**Files touched:** `log-expense-panel.tsx`
**Suggested order:** Last — lowest impact, can be done anytime.

---

### Recommended implementation order

```
1. MNY-2 + MNY-6  (fixed expense logic + static daily budget)  — foundation
2. MNY-1           (dual currency on spent)                     — depends on correct spent number
3. MNY-4           (daily free in destination currency)          — depends on correct daily free
4. MNY-3           (solo expense traveller picker)              — independent
5. MNY-5           (decimal display)                            — polish
```

**Total estimated scope:** ~2–3 focused sessions. No schema migration needed (categories are app-level constants, `paid_by` column already exists). Main risk is MNY-2 changing budget numbers on existing trips.

**Platform:** PWA first. Port to mobile app later — these findings will carry forward as requirements for the native implementation.

---

## 2026-09-05 — Schedule & Overview: post-trip feedback (We Are Riise Singapore)

Source: same trip as the Money tab feedback above.

### SCH-1 · Demote activity back to ideas — Feature gap
**Severity:** Medium

**Finding:** Ideas can be promoted to scheduled activities, but there's no reverse. If an activity couldn't make it during the trip, the only option is to delete it — the info is lost forever.

**Proposed fix:**
1. Add columns to ideas table: `time`, `category`, `place_name`, `place_lat`, `place_lng` — so a demoted activity preserves all its data.
2. New server action `demoteActivity()` — creates an idea from the activity's full data, then deletes the activity.
3. Add "Demote to ideas" button in the activity edit panel, next to Delete.

**Status:** ✅ Implemented — migration run, demote + promote round-trip preserves all data.

---

### SCH-2 · Schedule defaults to day 1 instead of today — UX
**Severity:** Medium

**Finding:** During the Singapore trip on day 2, the schedule tab showed day 1 instead of today. The `defaultDate` logic in `activity-list.tsx` correctly computes today's date, but `useState(defaultDate)` only runs on the first render. Client-side navigation can preserve stale state.

**Proposed fix:** Reset `selectedDate` to today when the component mounts or when the trip tab becomes visible. Use a `key` or `useEffect` to force recalculation.

**Status:** ✅ Implemented — `visibilitychange` listener resets to today for active trips.

---

### SCH-3 · Overview "Today's plan" doesn't show current/next — UX
**Severity:** Medium

**Finding:** The overview's upcoming-activity logic finds activities with `time >= now` to label as "Next". But if all today's activities have passed, no "Next" badge shows. The card may appear stale or empty late in the day.

**Proposed fix:** When all today's activities have passed, show the last one as "Latest" or fall through to tomorrow's first activity as "Next up tomorrow".

**Status:** ✅ Implemented — shows "Latest" badge on last passed activity.

---

### SCH-4 · Post-trip overview shows nothing — Feature gap
**Severity:** Medium

**Finding:** After a trip ends, the overview page is essentially blank — the local-time card and today's-plan card both hide when `tripEnded = true`. Only the People section remains.

**Proposed fix:** Add a post-trip summary card showing:
- Trip duration ("3 days in Singapore")
- Activities visited (numbered list of attractions)
- Hotel stayed (from accommodation-category activities, showing place name)

No budget/expense numbers, no spending categories.

**Status:** ✅ Implemented — dashboard grid layout with Duration, Destination, Activities (numbered), Stay cards.

---

### Summary — Schedule & Overview

| ID | Finding | Severity | Status |
|---|---|---|---|
| SCH-1 | Demote activity to ideas (preserve all data) | Medium | ✅ Implemented (pending DB migration) |
| SCH-2 | Schedule defaults to today for active trips | Medium | ✅ Implemented |
| SCH-3 | Overview shows current/next activity properly | Medium | ✅ Implemented |
| SCH-4 | Post-trip summary card | Medium | ✅ Implemented |

### Implementation order

```
1. SCH-1  (demote activity)     — schema migration needed first
2. SCH-2  (active day default)  — quick state fix
3. SCH-3  (today's plan next)   — overview UX polish
4. SCH-4  (post-trip summary)   — new card, needs data fetch
```

**Platform:** PWA first. Port to mobile app later.
