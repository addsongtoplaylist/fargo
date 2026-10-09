# Fargo — Explore

> **v1 — 2026-10-09. ⏸ Shelved (owner, 2026-10-09):** spec complete, not built. Reason: the user base is too small for Explore to work well yet, and launching it near-empty could backfire. The Explore tab stays in the nav with its "on its way" placeholder. Build plan: `EXPLORE-PLAN.md`.
>
> **Spec:** Planners publish a finished trip; anyone signed in can find it and copy a place, a day or the whole plan into their own trip. Access rules: `PERMISSIONS.md` (Explore rows). Lo-fi wireframes: https://claude.ai/artifact/JLvWhnwi4PaEJ9z3dqqcXV

## Why

People plan better from a real trip someone already did than from a blank page. Explore is a **library of real itineraries**, not a social feed: you search for what fits your trip, take what's useful and leave.

**Guardrail:** no likes, comments, followers or ranked feed. The only signal is "Inspired N trips" (how many trips were started or added to from it). If a feature makes Explore about attention rather than planning, it doesn't belong here.

## What changes for people

- **Explore tab** returns to the home bottom bar (My trips · Explore · Passport · Profile).
- **The planner can publish a trip after it ends.** Only the planner, only once per trip, so a 5-person trip appears once.
- **Explore shows a copy**, made when the planner publishes. Editing the trip later doesn't change Explore until the planner taps **Update published copy**.
- **Anyone signed in can browse** Explore and open a published trip. Signed-out visitors can't see Explore.
- **Copy into your own trip** in three sizes: one place → your Ideas, one day → a day in a trip you plan, or the whole plan → a new trip.
- **Members** of a published trip see an "On Explore · shared by Song" label on its Overview. Nothing else changes for them.

## Shared vs private

| Shared on Explore | Private: never leaves the trip |
|---|---|
| Trip name, destination, country | Exact dates |
| Number of days, month and year | Expenses, settle-ups, budgets, exact amounts |
| Day-by-day schedule: place, time, category | Activity notes and activity costs |
| Trip type (from the trip) | Checklists |
| Budget level ($ / $$ / $$$) and per-person range | Ideas |
| Planner's name ("by Song") | Other travellers' names |
| Number of travellers, shown as a group size | Invite code, share link, stamps |
| Cover photo, **only if the planner switches it on** (off by default) | |
| "Inspired N trips" | |

## Flows

### A. Browse (anyone signed in)

1. **Explore home**: title, search ("Where to?"), filter chips, then a list of trip cards.
2. **Filters** (bottom sheet): Days (1–3, 4–6, 7–10, 11+), Budget ($ / $$ / $$$, with "include trips with no budget info"), Group (Solo / Couple / 3–5 / 6+), Trip type, Sort (Newest / Most inspiring). The button shows the result count ("Show 9 trips").
3. **Published trip page** (read-only): cover or fallback, trip name, "Vietnam · by Song · 4 travellers", chips (7 days · Oct 2026 · trip type), "Inspired 12 trips", a budget card, then the schedule by day. Each day has **Copy day** and each place has **+ Idea**. **Use this trip** sits at the bottom, and **Report this trip** at the end of the page.

### B. Use it in my trip

| Action | Where it goes | Who can do it |
|---|---|---|
| **+ Idea** on a place | Ideas of one of your **upcoming or ongoing** trips **to the same country**; as a member it shows as your suggestion | Anyone on that trip with an account |
| **Copy day** | A chosen day of an **upcoming or ongoing** trip **to the same country** that **you plan** (only the planner edits the Schedule) | Planner of the target trip |
| **Use this trip** | A **new trip** with your dates; you're the planner | Anyone signed in |

- **Same country only:** when adding a place or copying a day, the trip list shows only your trips to the published trip's country (matched on `destination_country_code`) that are upcoming or happening now. Past trips and trips elsewhere aren't offered.
- **+ Idea**: tapping it opens "Add to my Ideas → Your Vietnam trips". The toast ("Added to Ideas in Test trip · View") shows **after** you pick a trip. The idea keeps the place and links back to the published trip. **No matching trip** (wireframe 4b): "No upcoming Vietnam trips" with **New Vietnam trip**, which opens New trip with the destination filled in; the place waits in the new trip's Ideas.
- **Copy day**: pick the trip, then the day. **Keep original times** is on by default. Copied places go after that day's existing activities. If any clash, the clash flow (below) runs before anything is saved.
- **Use this trip**: trip name (pre-filled, editable), start and end dates (the end date defaults to the same length). If you pick **fewer days**, places from the extra days go to Ideas. If you pick **more**, the extra days start empty. **Comes with it:** schedule with times, destination, local currency. **You add your own:** travellers, budget, expenses, checklists, cover photo.
- **Dates clash** (Use this trip): if the dates overlap another trip of yours, a warning names it ("Overlaps with Seoul with family, 5–10 Dec 2026") with **Create anyway** / **Change dates**. It's a warning, not a block.
- **Based on**: a trip made with Use this trip shows **"Based on Song's trip · View"** on its Overview, and the same label on Explore if it's published later.

### C. Clash flow (Copy day)

A **clash** is a copied place whose time is **within an hour** of an existing activity on that day. Places with no time never clash.

Clashes are shown **one at a time** (wireframe 5d):

1. "Clash 1 of 2 · Day 3", progress bars, "Select what to do with your schedule", and why ("Both are at 07:30.").
2. Three options. Each says what happens to the other one:
   - **Current plan**: keep yours; the copied place goes to Ideas.
   - **From Song's trip**: keep the copied place; yours moves to Ideas.
   - **Keep both**: both stay on the day.
3. **Next clash** is disabled until you choose. Later clashes have **Back**.
4. **Ready to copy** summary lists every choice, with **Copy to Day 3** / **Change my choices**.

**Nothing is deleted:** whatever isn't kept moves to Ideas.

### D. Publish (planner only)

1. **Overview, after the end date:** a **Share this trip on Explore** card ("Only the plan is shared. Money, checklists and ideas stay private."), with **Preview and publish** / **Not now**. "Not now" hides the card; Trip settings always has the option.
2. **Publish screen:**
   - A preview of the card and a link to preview the full page
   - Trip type, shown from the trip
   - A **Show cover photo** switch, off by default, with "check everyone in the photo is happy for it to be on Explore"
   - The budget level and range, worked out automatically
   - The full **Shared on Explore / Never shared** list
   - **Publish**
3. **Trip settings → Explore:** "On Explore · Published 18 Oct 2026 · Inspired 3 trips", then **View on Explore**, **Update published copy** and **Unpublish**.
4. **Unpublish** removes the trip from Explore. Trips already copied keep their copy and their "Based on" label, without the link.
5. **Delete trip** also removes it from Explore.

## Card (Explore home)

One large card per row (wireframe 1):

- **Cover photo**, or the **no-photo fallback**: trip colour + country code, the same as My trips.
- **Line 1:** trip name, with the **group icon** on the right.
- **Line 2:** country · days · **budget level**.

**Not on the card:** month and year, trip type, planner name. All of these are on the trip page, and trip type is also a filter.

**Group icons**, from the number of travellers (including name-only travellers):

| Icon | Travellers |
|---|---|
| One person | Solo (1) |
| Two people | Couple (2) |
| Three people | Small group (3–5) |
| Three people + | Big group (6+) |

## Budget

Worked out when the planner publishes or updates, from the trip's expenses in MYR:

- **Flights are left out.** Expenses in the Flights category don't count, because flight costs depend on where you fly from.
- **Per person per day** = total expenses (excluding flights) ÷ number of travellers ÷ number of days
- **Level** (on cards and filters):

| Level | Per person per day |
|---|---|
| `$` | under MYR 300 |
| `$$` | MYR 300–500 |
| `$$$` | over MYR 500 |

- **Range** (trip page only): total per person, rounded to a 500-wide band. For example, MYR 1,750 shows as **MYR 1,500–2,000 per person**.
- **No expenses logged** shows "No budget info" on the trip page and "–" on the card.
- The exact total is never stored on the published copy. Only the level and the band are.
- **Shown in the viewer's home currency.** The level is always worked out in MYR, so `$$` means the same for everyone. Amounts (the range on the trip page, the cut-offs under each level in Filters) are converted to the viewer's home currency, rounded, and marked "≈". For example, MYR 1,500–2,000 shows as "≈ SGD 450–600" for a viewer whose home currency is SGD. This needs a daily exchange-rate source; today each trip's rate is typed in by the planner.

## Reports

Published trips hold little free text (trip name, Google place names, times, categories, optional cover photo), so the realistic problems are a bad **cover photo**, an offensive **trip name** or a **fake trip**. No admin screen in v1.

1. **Report this trip** (end of the trip page) opens a sheet with one reason: **Inappropriate photo** · **Offensive name** · **Spam or advertising** · **Personal information** · **Not a real trip**. Then **Send report**. *(Wireframe 12)*
2. **The reporter stops seeing that trip straight away**, everywhere in Explore. Confirmation: "Thanks. You won't see this trip again." *(Wireframe 12b)*
3. **One report per person per trip.** Reporting again does nothing.
4. **Hidden at 3 reports** from different people: the trip disappears from Explore for everyone until it's reviewed. Copies already made aren't affected.
5. **The planner is told**: Trip settings → Explore shows "Hidden while we check a report" with the reasons given (never who reported), and the Overview shows "Hidden from Explore · see Trip settings". The planner can still **Update published copy** (e.g. after changing the name or turning the photo off) or **Unpublish**. Updating doesn't unhide it; only a review does. *(Wireframe 13)*
6. **The owner reviews** in the Supabase dashboard (the reports table) and either **restores** the trip (reports cleared) or **removes** it. A removed trip shows "Removed from Explore" to the planner and can't be published again without the owner's OK.
7. **Later**, if Explore grows: an admin page in Profile, visible only to the owner, replaces the dashboard.

The threshold (3) is easy to change. Drop it to 2 if early reports go unanswered too long.

## Decisions (owner, 2026-10-09)

| # | Decision |
|---|---|
| E1 | Explore is a library, not social media: no likes, comments or follows; the only signal is "Inspired N trips" |
| E2 | Only the planner publishes, once per trip, after the trip ends |
| E3 | Explore holds a copy made at publish; changes need **Update published copy** |
| E4 | The trip name is shared; the planner's name is shown ("by Song"); the number of travellers is shown as a group icon |
| E5 | Expenses, checklists, ideas, activity notes and costs, other travellers' names and exact dates stay private |
| E6 | Cover photo is the planner's choice, off by default |
| E7 | Budget is shown as a level ($ / $$ / $$$) from per-person-per-day cost: under 300 / 300–500 / over 500 MYR. The trip page also shows a 500-wide range |
| E8 | No expenses → "No budget info" |
| E9 | No "tips from the planner" field |
| E10 | Copied trips show "Based on Song's trip" |
| E11 | Card layout: one large card per row; line 1 name + group icon, line 2 country · days · budget level |
| E12 | A clash is within an hour; clashes are resolved one at a time with Current plan / From Song's trip / Keep both; whatever isn't kept goes to Ideas |
| E13 | Overlapping dates on Use this trip give a warning, not a block |
| E14 | Flights are left out of the budget |
| E15 | Amounts are converted to the viewer's home currency (marked "≈"); levels stay worked out in MYR |
| E16 | "Trip ended" = after the end date, by the planner's device date |
| E17 | Explore is for signed-in users only |
| E18 | Wording: "Inspired N trips"; sort option "Most inspiring" |
| E19 | Adding a place or copying a day only offers your upcoming or ongoing trips to the same country |
| E20 | Reports: 5 reasons; reporter stops seeing it; one report per person; hidden for everyone at 3 reports; planner told; owner restores or removes via the Supabase dashboard |

## Open questions

None. Everything above is decided; the database section still needs a technical review before building.

## Database (proposed, to confirm before building)

Additive only. The native app (`fargo-app`) shares the database, so check `fargo-app/packages/core/src/api` first.

| New | What |
|---|---|
| `explore_trips` | One row per published trip: `trip_id` (unique), `planner_account_id`, `planner_name`, a snapshot of the trip (name, destination, country, days, month/year, trip type, schedule), `traveller_count`, `budget_level`, `budget_band_low`, `show_cover`, `inspired_count`, `published_at`, `updated_at` |
| `trips.based_on_explore_id` | The published trip it was copied from (null if none) + `based_on_planner_name` so the label survives an unpublish |
| `publish_trip(trip_id, show_cover)` | SECURITY DEFINER, planner only (from `auth.uid()`), trip must have ended. Builds or rebuilds the snapshot |
| `unpublish_trip(trip_id)` | Planner only |
| `copy_explore_place`, `copy_explore_day`, `copy_explore_trip` | SECURITY DEFINER; caller from `auth.uid()`; follow the Ideas and Schedule rules above; increase `inspired_count` |

- `explore_trips` is readable by signed-in users only, through RLS or a `get_explore_*` function. It never holds expenses, notes, names other than the planner's, or exact dates.
- `copy_explore_trip` can build on the existing `cloneTrip` ("Save as my trip" from a share link), adding date choice and "Based on".
- `explore_reports`: `explore_trip_id`, `reporter_account_id`, `reason`, `created_at`; unique per (trip, reporter). `explore_trips` gains `status` (`live` / `hidden` / `removed`). A `report_explore_trip(id, reason)` function (caller from `auth.uid()`) inserts the report and sets `hidden` at 3. Explore queries skip trips that aren't `live` and trips the caller reported. Restore and remove are done by the owner in the dashboard.
- **Undo:** drops the new tables, columns and functions.
