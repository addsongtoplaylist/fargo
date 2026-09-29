# Fargo — UI redesign: feature list

> **v0.2 — 2026-09-27.** Every Tier 1 row drawn (canvas row 2); Tier 2 drawn in today's layouts with the new style (canvas row 3). v0.1: Everything the Tier 1 screens do **today** (read from the code), checked against the redesign mockups ([canvas](https://claude.ai/artifact/Sjur61seR63um25VMXhAhs)). The redesign changes **look and layout only** — database, money logic, permissions and saving stay as they are. Nothing is removed without the owner's OK.

**Status key**
- ✅ **Kept** — in the mockup
- ➡️ **Moved** — still there, in a new place
- 🔄 **Changed** — owner decided to change it
- ⚠️ **Missing** — in the app today, not in the mockup yet → must be added
- ❓ **Decide** — owner to choose

---

## 1. Navigation (all trip screens)

| # | Today | Status | Notes |
|---|---|---|---|
| N1 | Home bottom bar: My trips · Profile | 🔄 | My trips (map icon) · **Explore** · Profile (Explore is the next milestone) |
| N2 | Trip sections as tabs at the top (Overview · Schedule · Money · Prep · Discover), sticky | 🔄 | Move to the floating bottom bar |
| N3 | Sub-pages keep their section highlighted (Money → View expenses / Settle up) | ✅ | Settle up / Your expenses keep Money lit |
| N4 | **Swipe left/right to switch sections** (ignored on the date strip) | ✅ | Behaviour — keep with the bottom bar |
| N5 | Back arrow → My trips (without auto-jumping back into the trip) | ✅ | |
| N6 | Header shows trip name + destination on every section | ✅ | Caption on every section header |
| N7 | Planner: settings gear in the header | ✅ | Overview only (owner, 2026-09-27) |
| N8 | **Member: "Leave trip" button in the header** (with confirm) | ✅ | Board: Overview · member |
| N9 | Loading skeleton per section; error screen per section | ✅ | Board: Loading (errors use the same card style) |

## 2. My trips (Home)

| # | Today | Status | Notes |
|---|---|---|---|
| H1 | **Opening the app jumps straight into the active trip's Schedule** (tapping My trips doesn't) | ✅ | Behaviour — keep |
| H2 | Active trip: big card with "Day X of Y" | ✅ | Mozi card + "Day 11 of 14" tag |
| H3 | More than one active trip → extra compact cards (tap → Schedule) | ✅ | Same card, repeated under Travelling now |
| H4 | Upcoming trips: countdown ("N days to go") | ✅ | "In 76 days" tag (no trip length — owner) |
| H5 | **Trip type chip** (Free & easy, City break…) on every card | 🔄 | **Removed** — too cluttered (owner, 2026-09-28) |
| H6 | Traveller avatars on cards | ✅ | |
| H7 | Past trips: name, destination, dates, avatars + count | 🔄 | Count not needed (owner) |
| H8 | New trip button | ➡️ | Floating + button |
| H9 | Empty state "Where to?" with New trip button | ✅ | Board: My trips · empty (map icon) |
| H10 | Trip cards use colour blocks | 🔄 | Planner's cover photo; none → colour + country code (interim) |
| H11 | — | 🔄 | Plain list like today — no month headings, no 'See all' (owner) |

## 3. Overview

The screen has **three versions** depending on dates — the mockup only shows the first.

| # | Today | Status | Notes |
|---|---|---|---|
| O1 | Local time + home time (home hidden if same timezone); only when the country is known | ✅ | |
| O2 | Temperature (follows the Stay; no label); hidden after the trip | ✅ | |
| O3 | **During trip:** Today's plan — "Now" + next 2 timed activities, with Now/Next tags | 🔄 | "Now" tag only (owner) |
| O4 | If nothing left today → shows **Tomorrow's plan** / next day with a label; else "No upcoming activities planned" | ✅ | Board: Overview · member (Tomorrow's plan) |
| O5 | "View schedule →" link | ✅ | |
| O6 | Place name under each plan item | ✅ | Added under each item |
| O7 | **Before trip:** "N activities planned" + first 3 (with date) + "+N more", or "No activities yet · Start planning →" | ✅ | Board: Overview · before trip |
| O8 | **After trip:** Trip summary — duration, destination, activities visited, stays | ✅ | Board: Overview · after trip |
| O9 | Travellers: avatars, planner crown, dashed avatar = no account, scrolls if > 6 | ✅ | Boards: Overview · travellers / member |
| O10 | Tap a traveller → details: role badge (Planner / Member / No account) | ✅ | Board: Overview · travellers |
| O11 | Planner: **Quick add traveller** (name only) | 🔄 | Only inside the **Invite** panel (with Share this link) — owner |
| O12 | Planner: **Invite traveller** → link + Copy | ✅ | Invite opens a panel: Quick add traveller + Share this link (Copy) |
| O13 | Planner: rename (no-account), **shares stepper**, turn into no account, remove (with confirm; blocked if they have expenses) | ➡️ | Rename / remove / turn into no account stay on Overview; **shares stepper moves to Money → Group split → Split shares** (owner) |
| O16 | Planner: "Turn into no account" for a member (unlink — D29) | 🔄 | **Removed** (owner, 2026-09-28): no real use case — anyone with expenses stays on the trip so they can see and settle up. Remove works only for people with no expenses (as today). No archived avatars, no DB change. `unlink_traveller` stays in the DB unused |
| O14 | Member: leave trip (own avatar); change owner ("I'm someone else on this list") | ✅ | Board: Overview · member |
| O15 | Member note: "Only the planner can invite or remove travellers." | ✅ | Board: Overview · member |

## 4. Schedule

| # | Today | Status | Notes |
|---|---|---|---|
| S1 | Date strip: weekday, date, **"Day N"** under each, today marked, prev/next arrows, scrolls to selected | ✅ | Arrows, Day N, today dot |
| S2 | Opens on today (active trip) or first day; **jumps back to today** when you return to the app | ✅ | Behaviour — keep |
| S3 | Daily budget per selected day: daily free vs spent that day; red when over; hidden if no budget | ✅ | Own card, scrolls away |
| S4 | Day heading (e.g. "Saturday, 27 Sep") | ✅ | |
| S5 | Day map: pins for activities with a place; tap a pin → title, time, place; **hidden when no places** | ✅ | Pin popups + hidden state not shown |
| S6 | Activity: category, title, time, place | ✅ | Emoji → icon circles |
| S7 | **Activity notes** (one line) | 🔄 | Owner: hide notes on the list (still in the edit panel) |
| S8 | Activity cost shown on the card (leftover field — can't be entered any more) | 🔄 | **Remove** — cost is not tied to activities (owner). DB column stays unused, no SQL |
| S9 | Untimed activities sit in the list in dragged order, no time | ✅ | |
| S10 | "You are here" marker on the current activity | ✅ | Blue "Now" row |
| S11 | Planner: **drag to reorder** (handle) | ✅ | Added |
| S12 | Planner: tap activity → edit panel; member: read-only | ✅ | Behaviour — keep |
| S13 | Planner: Add activity | ➡️ | Floating + button |
| S14 | Empty day: "No activities yet. Tap below to add one." (member: "No activities planned for this day.") | ✅ | Board: Schedule · empty day |
| S15 | Sticky date strip | 🔄 | Only the date strip sticks (owner) |

## 5. Money

| # | Today | Status | Notes |
|---|---|---|---|
| M1 | Order: settle-up card → My budget → Breakdown → Log expense | 🔄 | My budget → Group split → What you paid (owner) |
| M2 | Settle-up card, **4 states**: you owe / you're owed / you're settled up (N open in group) / All settled ✓ | 🔄 | "Group split": "You get back" / "You pay back" / "All square"; keep "You're settled up · N payments still open in the group" (owner) |
| M3 | Settle-up card only shows with 2+ travellers and at least one expense | ✅ | Behaviour — keep (noted on board) |
| M4 | My budget: **"left" amount (green/red)** big + **daily free** on the right, bar, "Spent … · what you paid" | 🔄 | Lead with **spent** (owner); daily free on the right ✅ |
| M5 | Edit budget: amount in **RM**, shows ≈ local, explainer of daily free formula | ✅ | Board: Money · edit budget |
| M6 | No budget: shows spent + "Set a budget" | ✅ | Board: Money · no budget |
| M7 | Breakdown grouped **Fixed / Daily / Settle-ups**, sorted by amount | ✅ | Fixed / Daily / Settle-ups |
| M8 | "View expenses" with count | ✅ | "All expenses · 12" |
| M9 | Log expense (anyone with an account) | ➡️ | Floating + button |
| M10 | Empty breakdown: "Nothing paid yet." | ✅ | Board: Money · no budget |

## 6. Settle up

| # | Today | Status | Notes |
|---|---|---|---|
| U1 | Your payments first; "You're settled up" / "All settled ✓" when none | 🔄 | **One "How to settle up" list** (owner, 2026-09-29, Kittysplit-style): open payments first, then settle-ups newest first; rows with you marked with a blue bar + bold "You"; "All settled" when nothing is open |
| U2 | Amounts with ≈ RM | ✅ | |
| U3 | Mark as settled — only the person who owes or the planner; else "Waiting for X to mark it settled" | ✅ | |
| U4 | Confirm dialog explaining it's added to the payer's expenses | ✅ | Board: Settle up · everyone + confirm |
| U5 | Everyone (collapsed): all payments + each person's balance (+/−, RM) | 🔄 | **Removed** (owner, 2026-09-29): all payments are now in the one list; per-person balances dropped |
| U6 | Settled list (planner sees all; others see their own); Unmark by payer or planner, with confirm | 🔄 | **Everyone sees all settle-ups** (owner, 2026-09-29); Unmark rules + confirm unchanged |
| U7 | "Group split" on the Money card, this screen stays "Settle up" | 🔄 | Owner OK |

(Your expenses moved to Tier 2 below.)

---

## Summary

| | Count |
|---|---|
| ✅ Kept / drawn | 48 |
| ➡️ Moved | 4 |
| 🔄 Changed (decided) | 15 |
| ⚠️ Missing in mockup | **0** |
| ❓ Open | 0 |

All former ⚠️ items are now drawn (canvas row 2) or marked as behaviour to keep.


---

# Tier 2 — feature list

**Owner decision (2026-09-27):** keep today's layouts for all Tier 2 screens; only apply the new design system. All rows below are drawn on the canvas (row 3). Same rule: keep all of it unless the owner decides otherwise.

## 8. Add / Edit activity (sheet, planner only)

| # | Today | Notes |
|---|---|---|
| A1 | Title ("What's the plan?") — required | |
| A2 | Time (optional) with a clear (×) button | |
| A3 | Date — limited to trip dates (lets you move an activity to another day) | |
| A4 | Category chips: Food, Transport, Activities, Shopping, Flights, Stay, Other | **Dropdown** with the category icon beside it (owner, 2026-09-29) — same 7 options |
| A5 | Place search (Google Places, biased to the destination + home country) | |
| A6 | Notes (optional) | |
| A7 | Cancel / Add (Save when editing); "Saving…" state; error toast | |
| A8 | Edit only: **Move to ideas** (confirm — keeps time, place, notes) | |
| A9 | Edit only: **Delete** (confirm) | |
| A10 | No cost field | Stays that way — cost removed from rows too (S8) |

## 9. Log / Edit expense (sheet, anyone with an account)

| # | Today | Notes |
|---|---|---|
| E1 | Amount, with **VND ⇄ MYR** switch and "≈" conversion under it | |
| E2 | What for? — required | |
| E3 | Paid by (dropdown, defaults to you) | |
| E4 | Date (defaults to today) | |
| E5 | Category chips (same set as activities) | **Dropdown** with icon, like Add activity (owner, 2026-09-29) |
| E6 | Split as: Equal · Shares · % · Amounts | Behind a **"Split with others"** switch (owner, 2026-09-29): off = just for the payer ("Just for you"); on = today's split section. New expense remembers the last choice on the trip (this device), first one on; editing restores what was saved; hidden on a solo trip. Replaces D10's always-tick rule |
| E7 | Split between: list of travellers with tick boxes, "N of M", **Select all / Clear** | |
| E8 | Per-person share / % / amount fields when not Equal | |
| E9 | Status line: "Tick who it's for" · "N% left to allocate" · "VND x over" · "split N ways" | **Pinned above Cancel / Log** so it stays visible with long traveller lists (owner, 2026-09-29) |
| E10 | Notes (optional) | |
| E11 | Save disabled until valid; error toast | |
| E12 | Edit only: Delete (confirm) | |
| E13 | Someone else's expense opens **read-only detail** instead (title, amount, paid by, split type, each share, notes) | |

## 10. Your expenses (Money → All expenses)

| # | Today | Notes |
|---|---|---|
| X1 | Grouped by day, newest first, **day total** (what you paid) | |
| X2 | Row: category, title, notes icon, "Logged for X", number of people, amount + ≈ RM | |
| X3 | Settlements shown as "You paid X" with 🤝 | Needs an icon (no emoji) |
| X4 | Tap: edit if yours (or planner), read-only detail otherwise; settlements change only from Settle up | |
| X5 | Log expense link | → floating + |
| X6 | Empty: "Nothing you've paid or logged yet. What others paid shows under Settle up." | |

## 11. Prep

> **Separate feature (not part of the redesign):** checklists become **personal** (per traveller), not shared by the group — needs a database change. To be specced with the owner before building. Open: any shared lists too? can others see yours?


| # | Today | Notes |
|---|---|---|
| P1 | **Checklists**: create list (planner), "N of M" done count | |
| P2 | Tick / untick items (**everyone**) | |
| P3 | Planner: add item, edit item text, delete item | |
| P4 | Planner: list menu → Rename, Delete list (confirm) | |
| P5 | Empty: "No checklists yet. Create one to start packing." | |
| P6 | **Ideas**: add (title, link, notes), edit, delete (confirm) — planner | |
| P7 | Idea link opens in a new tab | |
| P8 | Planner: **Schedule** an idea → pick a day; scheduled ideas show struck through "→ Promoted to {date}" with **Reschedule** | |
| P9 | Empty: "No ideas yet. Add things you find along the way." | |
| P10 | Members: read-only (can still tick checklist items) | |

## 12. Discover

| # | Today | Notes |
|---|---|---|
| B1 | **Planner only** — members see "Only the trip planner can use Discover." | Kept for now; revisit (members browse?) later |
| B2 | Categories: Dining (live), Shop and Attractions ("Soon") | |
| B3 | Location: **Near me** (GPS) or search a place near the destination | |
| B4 | "Search nearby" start state; loading "Finding the best spots near you…"; error + retry | |
| B5 | Filter chips after searching (re-search on change) | |
| B6 | Result card: photo, name, cuisine · price · distance · Open/Closed, rating | Uses profile dining preferences |
| B7 | Show more / "That's all we found nearby"; empty with "clear filter" | |
| B8 | Spot detail: photo, details, rating, **View on Google Maps**, **Navigate**, **Add to schedule** | |
| B9 | Add to schedule: Day (Day N — date, defaults to today), Time, Category → toast "Added to schedule" | |

---

# Tier 3 — feature list

Same approach as Tier 2: **keep today's layouts, apply the new design system.** All drawn on the canvas (row 4), 2026-09-28. Small additions to confirm: trip photo on the invite card; icons instead of emoji on error pages; Profile labels shortened to "Country" / "Currency"; share-link line now says "— no money shown".

## 13. Sign in

| # | Today | Notes |
|---|---|---|
| SI1 | Mascot + Fargo logo, tagline "Every trip starts here." | |
| SI2 | **Continue with Google** (shows "Signing in…" while loading) | Only sign-in method |
| SI3 | "No passwords. Sign in with your Google account." | |
| SI4 | Error message above the button when sign-in fails | |

## 14. Invite link (`/invite/…`)

| # | Today | Notes |
|---|---|---|
| I1 | Bad or expired link: "This invite link is expired or doesn't exist." + Go to sign in | |
| I2 | Signed out: "You've been invited to a trip" — trip name, destination, traveller count, Continue with Google | Returns to the invite after sign-in |
| I3 | Signed in: same card with a close (×) → My trips | |
| I4 | **"Which one are you?"** — unclaimed names with what's attached ("paid 1 · in 2"); must pick one when any exist | 🔄 Names only — counts hidden (owner, 2026-09-28; changes D23's "shows what's attached") |
| I5 | **Join trip** (disabled until a name is picked, when required); error message | |
| I6 | Already a member → goes straight to the trip | Behaviour — keep |

## 15. Shared trip page (`/s/…`, no account needed)

| # | Today | Notes |
|---|---|---|
| SH1 | Header: destination, trip name, dates, "N days", "N travellers" | No expenses, budgets or invite code (security rule) |
| SH2 | Signed in: **Clone this trip** → copies it to your trips; signed out: sign-up link | |
| SH3 | Tabs: **Schedule · Prep** (read-only) | |
| SH4 | Schedule grouped by day | "No activities planned yet." |
| SH5 | Prep: checklists and ideas (read-only) | "No prep items yet." |
| SH6 | Footer credit "Fargo" | |

## 16. New trip

| # | Today | Notes |
|---|---|---|
| NT1 | Back · "New trip" | |
| NT2 | Trip name (e.g. Vietnam 2026) | Required |
| NT3 | Destination search (e.g. Vietnam) — country only | Required |
| NT4 | Start date · End date | Required |
| NT5 | **Trip type** chips (Free & easy, City break, Road trip, Beach & resort, Adventure, Business) | Stays required (T1) |
| NT6 | Local currency (dropdown) | Required |
| NT7 | FX rate to MYR (e.g. 5600) | Required |
| NT8 | Create trip → opens the new trip; error toast | |

## 17. Trip settings (planner, from Overview's gear)

| # | Today | Notes |
|---|---|---|
| TS1 | Trip name, Destination, **Base city** (weather), Start / End date, Local currency, FX rate to MYR | |
| TS2 | Save changes → toast "Trip updated" → Overview | |
| TS3 | **Copy share link** (view-only page) and **Copy invite link** (join as member) + link box with Copy + one-line explainer | 🔄 Share link only — invite lives in Overview (T2) |
| TS4 | Danger zone: **Delete trip** with confirm ("…permanently remove all activities, expenses, checklists, and traveller data") | |

## 18. Profile

| # | Today | Notes |
|---|---|---|
| PR1 | Avatar initial, name, email | |
| PR2 | Home country, Home currency | |
| PR3 | Dining preferences: Budget (dropdown today), Dietary restrictions (chips) — "Used by Discover…" | 🔄 Budget becomes **single-select chips** (owner, 2026-09-28) — still one saved value, no DB change |
| PR4 | **Recently viewed** — placeholder text only, never built | 🔄 Hidden until built (T3) |
| PR5 | Sign out | |
| PR6 | "Fargo v0.4.6" | |

## 19. Small shared pieces

| # | Today | Notes |
|---|---|---|
| G1 | Toasts: success / error / info, with dismiss | |
| G2 | Confirm dialog: title, message, Cancel + Confirm (red when destructive), "Working…" | Already drawn on Settle up |
| G3 | Section error: "Something went wrong loading this tab." + Try again | |
| G4 | App error page + "Page not found" page, both with a way back to My trips | |
| G5 | Explore placeholder: "Explore is on its way" | Replaced when Explore ships |
| G6 | App icon, splash, Home Screen name (manifest) | |
| G8 | Offline page: "You're offline" · "Check your internet connection and try again." · Retry | |
| G7 | **People page** (`/trips/…/people`) — nothing links to it (Overview replaced it) | **Delete** during the build |

## Tier 3 decisions (owner, 2026-09-28)

- **T1 — Trip type:** stays **required** on New trip; not shown on cards (H5) or in Trip settings.
- **T2 — Invite:** Trip settings keeps only **Copy share link** (view-only). Inviting happens in Overview → Invite.
- **T3 — Recently viewed:** hidden on Profile until it's built.


---

# Build plan

Moved to **[REDESIGN-PLAN.md](REDESIGN-PLAN.md)** — phases P0–P10, risks, test gates. Each phase ticks its rows in this file.

**Cover photos (decided 2026-09-28):** planner uploads their own; no stock photos (Explore will show many users' trips). No photo → colour + country code until an illustration library exists.
