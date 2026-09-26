# Fargo — Changelog

---

## v0.3.7 — 2026-09-26 · Real weather & code tidy-up

- **Real temperature on Overview** — planner sets a **Base city** in Trip settings; Overview shows its current temperature (Open-Meteo, cached 30 min). Hidden when no base city is set — the hardcoded 32°C placeholder is gone. *Requires `20260926_trip_base_city.sql`.*
- **Faster timed-activity insert** — adding an activity mid-day renumbers the day in one atomic call instead of one call per activity.
- **Server "today" in home timezone** — trip status and the active-trip landing no longer use UTC (was a day behind for Malaysia before 8am).
- **Promote / demote can't half-finish** — if the second step fails, the first is undone, so items aren't duplicated between Ideas and Schedule.
- **Lint clean** — 0 errors, 0 warnings: typed trip list, unused code removed, dining constants moved out of the DB schema file, sign-in images use `next/image`.

---

## v0.3.6 — 2026-09-26 · Design consistency

Fixes from the design review.

- **One form layout** — Log expense now follows Add activity: labels beside fields, notes textarea, Cancel + primary button footer, Delete as a text link in edit mode.
- **One chip style** — Discover sections, Bites filters and dietary options now use the same chips as activity/expense categories.
- **Dining preferences save instantly** — like Home country; no Save button. Reverts with an error toast on failure.
- **Empty states** — Schedule, Money, Checklists and Ideas show a generic icon with guidance.
- **Budget card** — "Edit" hidden until a budget is set ("Set your budget" does the same job).
- **Dates** — one format everywhere ("17 Sep – 24 Dec 2026"), from a shared helper.
- **Accessibility** — labels added to icon-only buttons (close, clear, delete, options, dismiss).
- **Explore hidden** from the bottom nav until it ships.
- **DESIGN.md v0.7** — type scale, shadows, status colours, forms, chips and empty states documented.

---

## v0.3.5 — 2026-09-26 · Reliability fixes

Fixes from the code review.

- **Schedule "today" from dates** — jumping to today, the today marker and "you are here" now use the trip dates instead of the stored status, which only updated when a trip was created or edited.
- **Budget updates immediately** — saving the budget now refreshes the cached trip data (was stale for up to 30s).
- **Checklist error handling** — failures show an error toast instead of silently doing nothing; double-taps no longer create duplicates; ticks update instantly.
- **Budget save & reorder errors** — both now show an error toast; a failed reorder snaps back to the previous order.
- **Schedule hooks fix** — fixed React hook-order issue in the Schedule list (13 lint errors).

---

## v0.3.4 — 2026-09-26 · Security fixes

Fixes from the security review.

- **Locked-down database functions** — `get_my_trips`, `join_trip_by_invite`, `leave_trip` and `batch_reorder_activities` now identify the caller from their login instead of trusting a passed-in account ID, and can no longer be called signed-out. Reordering is planner-only.
- **No joining without an invite** — removed the travellers policy that let any signed-in user add themselves to any trip.
- **Share links show only what's meant to be shared** — shared trips are fetched by exact share code via `get_shared_trip`; invite code, account IDs, budgets and expenses are no longer exposed. The Money tab is removed from shared trips.
- **Shared checklists fixed** — titles and ticks now display (wrong column names before).
- **Sign-in redirect** — the auth callback only redirects to paths within Fargo.

---

## v0.3.3 — 2026-09-19 · Time picker & Today's plan

- **15-min time intervals** — time picker uses 00/15/30/45; new activities auto-fill the next 15-min mark.
- **Compact budget** — smaller font when amounts are 6+ digits (e.g. VND).
- **Today's plan redesign** — up to 3 timed activities: the current "Now" one plus the next two; untimed and past ones hidden; falls through to tomorrow.
- *Follow-ups (unversioned):* "you are here" highlights the current activity rather than the next; toasts default to success with a new info type, all error toasts tagged.

---

## v0.3.2 — 2026-09-12 · Faster tabs & leave trip

- **Performance** — functions pinned to Singapore (`sin1`); session read from cookie instead of an extra auth call; 30s cross-request caching for trip, activities, expenses and budget, busted on every change.
- **Splash screens** — iOS splash regenerated with the Fargo mascot.
- **Leave trip** — members can leave a trip (via the `leave_trip` function).

---

## v0.3.1 — 2026-09-09 · Polish & Currency UX

Five polish fixes plus a currency display overhaul from real-trip feedback on We Are Riize Singapore.

### Schedule & UI polish

- **Time selector** — Replaced `<input type="time">` with HH / MM dropdowns (30-min intervals) in both the activity edit panel and the Bites "Add to schedule" sheet.
- **Toast color** — Demoting an activity to ideas now shows a green success toast instead of red.
- **Button layout** — Activity edit footer: Cancel/Save as equal-width primary row, "Move to ideas · Delete" as centered secondary row below.
- **Date dedup** — Removed redundant date text label next to the date picker in the activity edit panel.
- **Stay dedup** — Overview trip summary deduplicates accommodation names (check-in + check-out no longer shows the hotel twice).

### Money — destination currency display

- **Budget card in destination currency** — Total budget and remaining now show in destination currency (e.g. SGD 403) instead of home currency (RM 1,300). All numbers on the card are in one currency.
- **Budget edit preview** — Live destination currency equivalent shown while editing (e.g. "≈ SGD 403 in Singapore") with formula explainer: "(Total budget − fixed costs) ÷ 3 days = Daily free budget".
- **Fixed / Daily category groups** — Category breakdown split into Fixed (flights, accommodation, activities) and Daily (food, transport, shopping) sections.
- **Daily expense totals** — Each date group in the expense list shows the day's total (e.g. "Wednesday, 2 Sep — SGD 108.10").
- **Budget strip simplified** — Schedule's daily budget strip shows destination currency only (removed ≈ RM secondary lines).
- **Individual expenses** — Keep dual currency display (SGD + ≈ RM) for per-expense home currency reference.

### Other

- **Version on Profile** — "Fargo v0.3.1" shown at the bottom of the Profile page, sourced from `package.json`.

### Shelved

- **Schedule timesheet** — Google Calendar-style drag-to-time view was prototyped and discussed. Shelved: travel planning is too loosely structured for rigid time slots — most activities have no fixed time, and the UX adds complexity without clear benefit for the typical planning style.

---

## v0.3 — 2026-09-06 · Smart Meal Discovery

New **Discover** tab inside trips with the Bites dining discovery feature. Find nearby restaurants, cafes, and bars powered by Google Places API, filtered by type, scored by rating and proximity.

### Discover tab (Bites)

- **Discover tab** — New 5th tab in the trip view. Category chips: Bites (active), Shop and Attractions (coming soon).
- **Location picker** — "Near me" (GPS) or search a custom location using Google Places Autocomplete, restricted to the trip's destination country.
- **Google Places search** — Nearby Search (New) with 2km radius, 20 max results, scored by `rating × log(reviews) × distance_factor × open_boost`.
- **Filter chips** — Single-select inline filter chips appear after results load: All, Cafe, Restaurant, Bakery, Fast Food, Bar, Japanese, Chinese, Korean, Thai, Indian, Italian, Seafood. Tapping a chip re-searches Google with the matching `includedTypes`.
- **Client-side pagination** — All results fetched in one API call, displayed 5 at a time with "Show more".
- **Cuisine dedup** — When "All" is selected, soft-deduplicates by cuisine type (max 2 per cuisine) for variety. Specific filters show all matches.
- **Spot detail sheet** — Bottom sheet with photo, rating, address, Google Maps link. "Add to schedule" creates a food activity on a chosen trip day/time. "Navigate" opens Google Maps directions.
- **Budget filter** — Hard-filters results by the user's dining budget preference (set in Profile).
- **Planner-only** — Non-planners see a locked state.

### Profile — Dining preferences

- **New section** — Budget dropdown (Any / $ / $$ / $$$) and dietary restriction chips (Halal, Vegetarian, Vegan, Gluten-free, Nut-free, Dairy-free, Pescatarian). Save button only enabled when changes are detected.
- **Cuisine preferences removed** — Replaced by inline filter chips on the Discover page for more direct, in-context filtering.

### Files added

| File | What |
|---|---|
| `components/bites/discover-view.tsx` | Main Discover view with filter chips, search, pagination |
| `components/bites/dining-card.tsx` | Compact dining spot card |
| `components/bites/location-picker.tsx` | GPS / custom location with Google autocomplete |
| `components/bites/spot-detail.tsx` | Bottom sheet with spot info + actions |
| `components/bites/add-to-schedule.tsx` | Day/time picker to add spot as food activity |
| `components/dining-preferences.tsx` | Budget + dietary preferences in Profile |
| `lib/actions/bites.ts` | Server action: Google Places search, scoring, dedup |
| `lib/bites-filters.ts` | Shared filter type definitions |
| `app/(app)/trips/[id]/discover/page.tsx` | Discover route |
| `app/(app)/trips/[id]/discover/error.tsx` | Error boundary |

### Migration required

```sql
-- Run in Supabase SQL Editor before deploying
-- supabase/migrations/20260905_dining_preferences.sql
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS dining_budget text NOT NULL DEFAULT 'moderate',
  ADD COLUMN IF NOT EXISTS dietary_restrictions text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cuisine_preferences text[] NOT NULL DEFAULT '{}';
```

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
