# Fargo — Explore implementation plan

> **v1 — 2026-10-09. ⏸ Shelved with Explore. Approved and ready to start at batch 1 when picked up.** Owner answers: (1) activity titles shared as written; (2) OK to create a temporary "Test trip (past)" for testing and delete it after; (3) one release, v0.6.0.
>
> **Plan:** Builds what `EXPLORE.md` (decisions E1–E20) describes. Access rules: `PERMISSIONS.md` v3. Wireframes: https://claude.ai/artifact/JLvWhnwi4PaEJ9z3dqqcXV

## What already exists (and we reuse)

| Exists | Used for |
|---|---|
| `/explore` page (placeholder "Explore is on its way") and the Explore tab in the home bar | Replaced by the real Explore home |
| `cloneTrip(shareCode)` in `lib/actions/trip.ts` ("Save as my trip" from a share link) | Pattern for **Use this trip**; the new version adds dates and "Based on" |
| `add_idea` database function (anyone on the trip, shows as their suggestion) | **+ Idea** goes through the same rules |
| `trips.destination_country_code` | Same-country trip lists (E19) and the country-code fallback |
| `trips.trip_type`, `cover_path`, `cover_position` | Trip type on Explore; cover photo when switched on |
| `expenses.amount_myr` + `category` (`flights`) | Budget level and range, leaving out flights (E14) |
| `accounts.home_currency` | Viewer's currency for amounts (E15) |
| `get_shared_trip` | Pattern for a read-only function that leaves private fields out |

**Native app check:** `fargo-app/packages/core/src/api/trip.ts` reads trips with `select("*")` and inserts with named columns. Two new nullable columns on `trips` don't break it. No other table it uses changes.

## How it's built (plain version)

- **A separate "published copy" table.** Publishing makes a snapshot of the trip with only the shareable parts: name, country, days, month, trip type, schedule (time, title, place, category), group size, budget level and band. Expenses, notes, checklists, ideas and names never go into it, so they can't leak from Explore even by mistake.
- **Everything goes through database functions**, like money does today. Explore pages never read the `trips`, `activities` or `expenses` tables directly. Each function checks who is calling (`auth.uid()`) and is blocked for signed-out users.
- **Explore screens read the snapshot only.** A published trip page loads one row, which keeps it fast.
- **Currency conversion** uses a free daily exchange-rate service (Frankfurter, ECB rates, no account needed), cached for a day. If it's down, amounts show in MYR.

## Database: one SQL file, run before the code

`supabase/migrations/2026MMDD_explore.sql`, plus `_UNDO.sql` and `_CHECK.sql`, like previous features. **Additive only.** It's safe to run before the app code ships, because nothing uses it until then. Try it on **staging** first.

| New | What |
|---|---|
| `explore_trips` | One row per published trip (unique `trip_id`): planner account + first name, snapshot (name, destination, country code, days, month/year, trip type, schedule as JSON), `traveller_count`, `budget_level` (0 = none, 1–3), `budget_band_low` (MYR), `show_cover`, `inspired_count`, `status` (`live` / `hidden` / `removed`), `published_at`, `updated_at`. No direct table access, functions only |
| `explore_reports` | `explore_trip_id`, `reporter_account_id`, `reason`, `created_at`; one per person per trip |
| `trips.based_on_explore_id`, `trips.based_on_planner_name` | The "Based on Song's trip" label; the name survives an unpublish |
| `publish_trip(trip_id, show_cover)` | Planner only, trip must have ended, not `removed`. Builds or rebuilds the snapshot; works out the budget (no flights) |
| `unpublish_trip(trip_id)` | Planner only. Deletes the row; copies keep their label |
| `get_my_explore_status(trip_id)` | For Trip settings / Overview: live / hidden (+ reasons) / removed / not published. Members get only "on Explore" |
| `search_explore_trips(query, days, budget, group, trip_type, sort, page)` | Live trips only, minus ones the caller reported. Sorts: newest, most inspiring |
| `get_explore_trip(id)` | One published trip for the trip page |
| `report_explore_trip(id, reason)` | One per person; sets `hidden` at 3 reports |
| `copy_explore_place(id, day, index, target_trip)` | Adds an idea (same rules as `add_idea`); target must be upcoming or ongoing, same country; +1 inspired |
| `copy_explore_day(id, day, target_trip, target_date, keep_times, choices)` | Planner of the target only; same country; applies the clash choices (keep / move to Ideas); +1 inspired |
| `create_trip_from_explore(id, name, start, end)` | New trip with you as planner; schedule shifted to your dates; extra days go to Ideas; sets "Based on"; +1 inspired |
| Storage policy | Signed-in users can read the cover of a trip that is `live` on Explore with `show_cover` on. Nothing else changes for covers |

All `SECURITY DEFINER`, `search_path = public`, `REVOKE … FROM PUBLIC, anon`, matching the rules in `CLAUDE.md`.

**Clash detection runs in the app**, not the database. The app compares times (within 60 minutes), shows 5b, then sends the choices to `copy_explore_day`.

## Build batches

Each batch ends with a type check, lint and build, then a test on the dev server.

| Batch | What | Main files | Size |
|---|---|---|---|
| **1. Database** | The SQL above + UNDO + CHECK; run on staging, then production | `supabase/migrations/…_explore*.sql` | Large |
| **2. Publish (planner)** | Overview "Share this trip on Explore" card; Publish screen (preview, cover switch, budget, shared/never-shared list); Trip settings → Explore (status, update, unpublish, hidden/removed); member "On Explore" label | `lib/actions/explore.ts` (new), `components/explore/publish-*`, `trips/[id]/overview`, `trips/[id]/settings` | Medium |
| **3. Browse** | Explore home (search, filter sheet, sort, Card D, "No budget info"); published trip page (budget card, days, Inspired N); report sheet + "Thanks" toast; exchange rates | `app/(app)/explore/page.tsx`, `explore/[id]/page.tsx` (new), `components/explore/*`, `lib/fx.ts` (new) | Large |
| **4. Copy** | + Idea sheet (same country, 4b empty state); Copy day + clash flow (5b); Use this trip (dates, overlap warning) + "Based on" label on Overview | `components/explore/copy-*`, `components/explore/clash-*`, overview header | Large |
| **5. Wrap-up** | `TECHNICAL.md`, `PERMISSIONS.md` (planned → live), `ROADMAP.md`, `STATUS.md`, `CHANGELOG.md`, version bump | docs | Small |

**Caching:** Explore lists use a short cache (`explore` tag). Publish, update, unpublish and report clear it. Copies clear the target trip's `activities-…` / `trip-…` tags as usual.

## Release

- **One release, v0.6.0,** after batches 1–5. Explore without copying feels half-done, so it's not worth shipping in pieces.
- **Order:**
  1. You run the SQL on **staging**, then **production**. It's harmless on its own.
  2. Then I push the code.
- **Undo:** revert the code first, then run `_UNDO.sql`.

## Testing

| What | How |
|---|---|
| Publish | Needs a trip that has **ended**. Our only test trip, "Test trip" (Vietnam), is upcoming, so see question 2 |
| Viewer side, copy, report | Needs a **second account** signed in (as in the expenses UAT) |
| 3-report threshold | Needs 3 reporters. I'd test it on **staging** with SQL rather than with 3 real accounts |
| Privacy | After publishing, check the snapshot row has no notes, costs, names or exact dates (`_CHECK.sql` does this) |
| Native app | Open `fargo-app` against staging after the SQL and check trips still load |

## Risks to agree on

1. **Activity titles are shared as written.** Titles are free text ("Dinner with Mom's friends"), so a title can carry something personal. The Publish preview shows every title. Is that enough, or should titles be replaced by the place name when there is one?
2. **Copied places lose their map pin.** Ideas only store a title, link and notes, not a location. A copied place becomes an idea titled with the place name plus a Google Maps link. Adding a location to ideas is a separate, bigger change (the native app uses ideas too).
3. **Exchange rates come from an outside service.** If it fails, amounts fall back to MYR. No API key or cost.

## Questions for you before batch 1

1. **Titles (risk 1):** share activity titles as written (my recommendation, since the planner sees them in the preview), or use place names only?
2. **Testing an ended trip:** may I create a second test trip with past dates, e.g. "Test trip (past)", and delete it afterwards? Or shall we temporarily move Test trip's dates into the past?
3. **One release (v0.6.0)** for the whole of Explore: OK?
