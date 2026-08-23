# Fargo — Product

> **v0.6 — 2026-08-21.** Added app-level navigation, share trip, explore page, active trip auto-land, and illustration placement plan.
>
> **On the examples:** Vietnam, the September dates, VND, MYR amounts and the named travellers are **illustrative throughout these docs** — chosen to keep the writing concrete. There is no real trip and no deadline. The product decisions are real; the trip isn't.

---

## §1 Foundation

### What it is

**Fargo is a trip planner where the schedule and the money are the same artifact.**

You plan a trip — day-by-day schedule, bookings, checklists, ideas — and every piece of that plan can carry a cost: what you expected to pay, what you actually paid, and whose money it was. Wanderlog-shaped on the surface; the difference is underneath, where the planning and the spending are one record instead of two.

### Who it's for

**The planner** — the one person who organises the trip. Trips can be solo or group; the app is built for whoever is doing the organising.

Fellow travellers are real users too, with fewer rights: they can view the trip, log their own expenses, and propose schedule changes — but nothing they submit alters the plan until the planner approves it. **The planner keeps final say over the trip; everyone else contributes to it.**

### How it works today (as-is) ⚑

For a trip like Vietnam in September, the planning spreads across:

- **Wanderlog or similar** — the day-by-day schedule
- **A spreadsheet** — estimated costs, then the real ones, then the who-owes-what maths
- **Notes app** — packing, visa, data plan, the admin
- **Email / screenshots** — booking confirmations, scattered

Group discussion happens in WhatsApp and **stays there** — Fargo never tries to be the conversation.

### What hurts

**The planner runs three tools and reconciles them by hand.**

Every real trip decision is simultaneously a schedule decision and a money decision — *do we do the Ha Long cruise?* is "which day" and "how much, each" at once. But the schedule lives in one app and the money in another, so the planner is the integration layer, manually, for the whole trip.

It gets worse at the edges:

- **Group costs are invisible until the end.** Nobody knows where they stand mid-trip, so it all lands as one awkward reckoning afterwards.
- **Budget and actual never meet.** You estimated the trip at RM4,000. You have no idea what it really came to, or where the estimate broke.
- **Nothing survives.** Once the trip ends, the spreadsheet goes stale and the numbers stop being readable — including the exchange rate they were based on.

### Goals

1. **One place for the whole trip** — schedule, bookings, checklists, ideas.
2. **Any plan item can carry a cost** — budgeted while planning, actual once spent, variance visible.
3. **Every expense is tagged solo or shared**, with a headcount, so each traveller's true cost is knowable at any point.
4. **The trip's exchange rate is recorded** with it, so the figures still mean something years later.
5. **A finished trip stays browsable** — it becomes a record, not a dead spreadsheet.
6. **The group contributes without the planner losing control** — travellers log their own spend and propose changes; the planner approves what lands.

### Constraints

- **Desktop for planning, phone during the trip.** Responsive, with a **fixed-width centred column** that doesn't stretch on wide screens. Same layout at both widths — a trip reads as a document, not a dashboard. Visual language lands in the design phase.
- **Manual FX** — one rate per trip, entered by you. No rate API.
- **Home currency: MYR.** Expenses are entered in the **local currency** (₫, ฿, ¥) and converted to MYR by the trip's rate. Both amounts are stored — the local figure is what the receipt said, the MYR figure is what it cost you.
- **Hosted web app, server-side, always online.** Not a local tool — a real deployment with real accounts. No offline mode; patchy signal means an expense gets logged later, on hotel wifi. Accepted.
- **Multi-user from day one** — accounts, invites, roles, and an approval queue. This is the largest single build item in MVP; the roadmap must sequence it deliberately rather than absorb it.
- **Solo build, evenings and weekends.** Scope accordingly.

### Non-goals

- **Not a booking engine** — no flight or hotel search, no payments. You book elsewhere and record it here.
- **Not a settlement app in MVP** — shares are shown; who-owes-whom is phase 2.
- **No trip-comparison feature, ever** — comparing 2026 to 2028 happens outside the app. The FX rate is stored so you *can*; the app never does it for you.
- **Not a general expense tracker** — everything is scoped to a trip. Everyday money is `finance-tracker`'s job.
- **Not a chat app** — no comments, no threads, no group messaging. Discussion stays in WhatsApp.
- **Not social in MVP** — publishing trips comes later, once the core is proven.

### If V1 nails only one thing

> **A planner runs the entire Vietnam trip inside Fargo — plans it, travels it, comes home knowing exactly what it cost and who spent what — without ever opening a spreadsheet.**

### Where it's headed (recorded, not built)

Once the core is mature: planners **publish** trips so others can see real costs and real itineraries, filtered by trip type — *free & easy, artsy, culture, mainstream*. Trip type gets captured from day one as a field, because it's free now and expensive to backfill.

---

## Decisions locked

| Decision | Call | Date |
|---|---|---|
| Money scope | Budget **and** actual, with variance | 2026-08-16 |
| Expense splitting | Shares only in MVP; settlement phase 2 | 2026-08-16 |
| FX | Manual, one rate per trip | 2026-08-16 |
| MVP modules | Schedule · Bookings · Checklists · Ideas backlog | 2026-08-16 |
| Platform | Desktop plan + phone log, fixed-width | 2026-08-16 |
| Trip comparison | Never in-app | 2026-08-16 |
| Multi-user | **In MVP** — accounts, roles, planner-approval queue. Cost was raised and accepted. | 2026-08-16 |
| Budget model | **Single total budget** with three-layer subtraction: total → minus fixed (flights + hotel) → minus planned activities → remaining ÷ days = daily free budget. Replaces the two-level category/item model. Category breakdown is read-only, not budgeted. | 2026-08-20 |
| Past trip editability | Completed trips **stay editable** — late-arriving expenses are normal | 2026-08-20 |
| Ideas → schedule flow | Confirmed: ideas pile first, then promote onto days | 2026-08-20 |
| App-level navigation | **Bottom nav: My trips · Explore · Profile.** Three app-level pages. Inside a trip, bottom nav stays visible; trip tabs handle intra-trip navigation. | 2026-08-21 |
| Share trip | Share ≠ invite. Sharing gives a read-only public link; inviting makes someone a traveller. "Save as my trip" copies schedule/places/ideas, not expenses/budget/travellers. No provenance badge on copies. | 2026-08-21 |
| Explore page | 2-column grid, search + trip-type filters, infinite scroll. Won't ship until publishing is ready — designed now, cold start accepted. | 2026-08-21 |
| Recently viewed | Lives in **Profile**, not on My trips page — avoids stacking problem with past trips. | 2026-08-21 |
| Active trip auto-land | App opens to Schedule tab scrolled to today when a trip is active. No "done" state on activities — schedule stays fully editable; only a "you are here" marker on the next activity. | 2026-08-21 |
| Hero upcoming cards | Large countdown number, trip type chip, traveller avatars on upcoming trip cards. Ticket feel, not list-item feel. | 2026-08-21 |

---

## §2 Landscape

**Why not just use one of these?**

- **Wanderlog** — best-in-class itinerary planning, and the reason this project exists: *you cannot log expenses in it.* So the trip's plan lives here and its money lives elsewhere, and the planner jumps between apps all trip.
- **Splitwise** — splits and settles group spending well, but knows nothing about the trip it belongs to. It can tell you Ali owes you RM240; it can't tell you that was the Ha Long cruise on day 3.
- **A spreadsheet** — does anything you want, maintained entirely by hand, unusable on a phone at a pho stall, and dead the moment the trip ends.
- **Notion / Sheets travel templates** — flexible but structureless. Every trip means rebuilding the scaffolding, and nothing enforces that an expense is tagged or a cost is captured.

**The gap:** no tool treats the itinerary and its cost as one record. Every existing option makes the planner the integration layer.

**Worth stealing:** Wanderlog's day-by-day structure and its public trip guides (relevant to the publishing direction). Splitwise's share model — shares first, settlement second, which is exactly the MVP/phase-2 split already chosen.

## §3 Principles

Six rules. Each is falsifiable — point at a feature idea and check it against these.

1. **The plan and the money are never separate.**
   *So we won't* build a schedule view that can't show what the day costs, or an expense that can't point back at what it paid for.

2. **The planner has final say.**
   *So we won't* let any contribution change the plan silently. Every non-planner edit is a proposal until approved.

3. **Estimates are kept, not overwritten.**
   *So we won't* replace a budgeted figure with the actual one. Both persist, and the gap between them is a feature.

4. **Every expense knows whose it is.**
   *So we won't* accept an expense without a solo/shared tag — and if shared, who it's shared among.

5. **Plan on desktop, log on phone.**
   *So we won't* cram itinerary editing into a phone screen, and we won't bury expense entry more than one tap deep.

6. **A trip is a closed world.**
   *So we won't* aggregate across trips, compare them, or carry balances between them. Everything is scoped to one trip.

## §4 Requirements

**Must** = MVP is not MVP without it. **Should** = MVP is worse without it, but shippable. **Could** = if it's cheap. **Won't** = explicitly not now.

### Trip

| Feature | Priority |
|---|---|
| Create a trip: name, destination, dates, trip type (**fixed list**), local currency + manual FX rate | Must |
| **My trips** (main page) shows upcoming trips as hero cards (large countdown, traveller avatars, trip type) and past trips with "show all" link. A trip is navigated *into*, never the landing page | Must |
| Trip overview: dates, travellers, total budgeted vs spent | Must |
| Trip states — planning / active / completed | Must |
| **Active trip auto-land** — when a trip's dates include today, opening the app lands on that trip's Schedule tab scrolled to today, with a daily budget bar. No activities are marked "done" — the schedule stays fully editable; only a "you are here" marker highlights the next upcoming activity | Must |
| **Active trip bar on home** — if user navigates back to My trips during an active trip, a persistent bar with pulsing dot shows the active trip with "Open" button | Must |
| Past trips stay browsable with their frozen rate | Must |
| Duplicate a trip as a starting point | Could |

### Schedule

| Feature | Priority |
|---|---|
| Day-by-day itinerary; items carry time, title, place, notes | Must |
| A schedule item carries an **optional cost** — the known price (exact or rounded up), not an estimate. Most activities have no cost; only items with a known ticket/entry price get one | Must |
| A schedule item links to the **expense** that paid for it | Must |
| Reorder items, move between days | Should |
| **Map view, per day** — the day's activities as pins, connected in schedule order to show the route | Must |
| Place entry by **search and pick** (Mapbox autocomplete), storing name + coordinates | Must |
| **Manual pin drop** when search can't find the place — essential fallback, see note below | Must |
| Bookings appear on the map too — hotel pin, airport pin | Must |
| An Activity may have **no location** — "sunset at a roadside cafe" is a valid activity | Must |
| Real routing, directions or travel time between pins | Won't — lines follow schedule order, nothing more |

**Mapbox is the provider.** Cheaper and simpler than Google Maps, with one known weakness: its geocoder is thinner on small local businesses in Southeast Asia than Google Places. A backstreet bánh mì stall may not be findable by name. Two things absorb that: an Activity can have **no place at all**, and where a place matters but search fails, the planner **drops a pin manually**. Worth watching once real trips go in — if search misses constantly, the fallback becomes the primary flow and that's a design problem, not just an inconvenience.

### Bookings

| Feature | Priority |
|---|---|
| Booking records: type (flight / hotel / tour), provider, confirmation no., dates, cost | Must |
| A booking is automatically an expense — entered once, not twice | Must |
| Attach a file or screenshot to a booking | Could |
| Parse confirmation emails automatically | Won't |

### Checklists

| Feature | Priority |
|---|---|
| Named checklists with checkable items (packing, visa, data plan, insurance) | Must |
| Assign an item to a traveller | Should |
| Reusable templates across trips | Could |

### Ideas backlog

| Feature | Priority |
|---|---|
| Unscheduled ideas: title, link, note | Must |
| Promote an idea into a schedule item | Must |

### Money

| Feature | Priority |
|---|---|
| Expense: date, title, local amount, converted MYR, category, paid-by, solo/shared | Must |
| Shared expense records **who it's shared among** (not just a count) | Must |
| Categories: flights, accommodation, food, transport, activities, shopping, misc — **fixed list**, not editable | Must |
| **Budgets are per person** — your own share, not the group's total spend | Must |
| **Single total budget** — one number per person. The app subtracts fixed costs (flights + accommodation from bookings) to derive a **daily free budget** for unplanned spending (food, transport, souvenirs). No per-category budgets | Must |
| **Default flow: two-layer subtraction.** Total budget → minus fixed costs (bookings) → remaining ÷ trip days = daily free budget. Most users stop here — their activities don't carry costs | Must |
| **Optional third layer:** when an Activity carries a cost (e.g. a pre-booked tour ticket at RM 600), it is subtracted before the daily split, adjusting the daily free budget downward. The "activities with costs" line appears only when non-zero — never shown as RM 0. A helper text explains: *"Adding costs to activities will adjust your daily budget"* | Must |
| **Activity cost is optional**, not prompted. Most activities (meals, walks, cafes) have no cost field filled — only items with a known ticket/entry price get one. The cost is the known price (exact or rounded up), not an estimate | Must |
| **Category breakdown** — read-only view of spending by category (not budgeted, just observed). Shows where the money went, not where it should go | Must |
| Activity costs carry solo/shared tagging, so planned costs are in personal money like the total budget | Must |
| Per-traveller cost to date — each person's share, any time mid-trip | Must |
| Editing the trip's FX rate recalculates every MYR figure | Must |
| Who-owes-whom settlement | Won't — phase 2 |

### Accounts & sign-in

**No passwords exist anywhere in Fargo.** That's a design rule, not a preference — it removes hashing, reset emails, and the entire "forgot password" surface from the build.

| Feature | Priority |
|---|---|
| Google sign-in | Must |
| Email magic link (for anyone without Google) | Must |
| Same email via either method resolves to **one account** | Must |
| Long-lived session — you don't re-authenticate every visit | Must |
| Sign out | Must |
| Profile: display name, avatar (from Google), home currency | Should |
| Delete account | Should |

### Travellers & membership

A trip's travellers are of two kinds, and both must work from day one:

- **Name-only traveller** — the planner types "Ali" and can split expenses with them immediately. No email, no account, no waiting.
- **Account traveller** — has signed in, can log their own spend and see the trip.

| Feature | Priority |
|---|---|
| Planner adds a name-only traveller instantly | Must |
| Invite by email → link; accepting binds that account to the existing traveller slot | Must |
| **Upgrade path** — a name-only traveller becomes an account traveller, keeping all history and every past share | Must |
| One person, many trips; one trip, many travellers | Must |
| Remove a traveller (only when they hold no expenses or shares) | Should |

### Roles & permissions

Two roles: **planner** (trip owner) and **traveller**.

| | Planner | Traveller |
|---|---|---|
| View the whole trip | ✅ | ✅ |
| Trip settings, dates, FX rate, budgets | ✅ | ❌ |
| Edit schedule, bookings, checklists, ideas | ✅ | propose only |
| Log an expense | ✅ | propose only |
| Edit someone else's expense | ✅ | ❌ |
| Tick their own checklist items | ✅ | ✅ |
| Invite / remove travellers | ✅ | ❌ |
| Approve or reject proposals | ✅ | ❌ |

Co-planners (a second owner): **Could**.

### Approvals

| Feature | Priority |
|---|---|
| Any traveller change — schedule **or** expense — becomes a **proposal**, never a direct write | Must |
| Approval queue showing the proposed change against the current value | Must |
| Approve applies the change atomically; reject leaves the plan untouched | Must |
| Traveller can see the status of what they submitted, including rejections | Must |
| Pending-count indicator for the planner | Should |
| Reject with a reason | Should |
| Email notifications | Won't |

**Decided:** approval applies to everything a traveller submits, expenses included.

The reasoning matters more than the rule. **The planner is meant to do the work.** Traveller contribution is a pressure valve — it exists so nobody is stuck waiting on the planner to get to their phone, not because it's the normal way things get entered. Because it's the exception, approval volume stays low and blanket approval costs little.

**Design consequence:** a traveller's view is **read-first**. Contribution is deliberately secondary — reachable, never the prominent call to action. If the traveller UI ever nudges people to start logging their own spend, it's working against the product.

### Auth & permission edge cases

- **Same human, two sign-in methods** — Google and magic link on the same address must land in one account, not two
- **Invited to one address, signs up with another** — binding follows the invite token, never the email string
- **Invite links** — single-use and expiring
- **Planner deletes their account mid-trip** — ownership must transfer, or the trip is orphaned
- **Someone opens a trip URL without an invite** — sees nothing, not a 404 that confirms the trip exists
- **Every trip resource is authorised server-side.** Role is never trusted from the client.

### Share trip

| Feature | Priority |
|---|---|
| **Share link** — planner generates a public read-only link from trip settings. Visibility toggles control what's shown (schedule, spending by category, budget vs actual, per-traveller breakdown, individual expenses) | Must |
| **Shared view** — read-only page showing trip schedule, map, and spending summary (as permitted by visibility toggles). Owner name visible. "Save as my trip" button at the top, below the trip header | Must |
| **Save as my trip** — creates a full copy of the shared trip. Copies schedule, places, bookings (as references), ideas, checklists. Does **not** copy expenses, budget, or travellers — the user sets those fresh. No "based on" badge; saved copies are just trips | Must |
| **Deactivate link** — planner can turn off sharing at any time | Must |
| Share ≠ invite — sharing gives a read-only public link; inviting makes someone a traveller on your trip. Different URLs, different purpose | Must |

### Explore

| Feature | Priority |
|---|---|
| **Explore page** — separate app-level page with 2-column card grid showing published trips. Search bar + trip-type filter chips (popular, free & easy, culture, mainstream, artsy). Infinite scroll. Each card shows: destination, flag, duration, total spend, trip type chip, owner name + avatar | Won't — ships when publishing is ready. Designed now, built later. Cold start accepted: section doesn't appear until content exists. |
| Tapping an explore card opens the shared read-only view with "Save as my trip" at top | Won't — same timeline as above |

### Publishing

| Feature | Priority |
|---|---|
| Publish a trip publicly; browse others' trips by trip type | Won't — later phase. Trip type is captured now so it isn't backfilled. Explore page is designed and ready for when this ships. |

### Edge cases that change a screen

- **Solo trip** — solo/shared tagging and per-traveller breakdown must vanish, not sit there as noise
- **Traveller joins mid-trip** — earlier shared expenses don't include them
- **The payer isn't the planner** — every expense records who actually paid
- **Most expenses have no schedule item**, and most schedule items have no cost — both are normal, neither is an error state
- **FX rate entered or corrected after expenses exist** — recalculate, don't strand old rows
- **A rejected proposal** — the traveller must be able to see it was rejected

### Success criteria

1. A real trip runs start to finish in Fargo, with no spreadsheet anywhere.
2. At any moment mid-trip, every traveller's cost to date is correct without manual maths.
3. After the trip, total budget vs actual is clear, with daily free spending average and category breakdown.

### Out of scope, with reasons

| Not building | Why |
|---|---|
| Booking or payments | Commercial complexity, no benefit to the planner |
| In-app chat | WhatsApp already does it |
| Settlement | Phase 2 — shares first proves the model |
| Trip comparison | Done outside the app, by you |
| **Offline support** | Decided: Fargo is a hosted, always-online app. No signal means logging that expense a few hours later. Accepted trade-off, not an oversight. |
