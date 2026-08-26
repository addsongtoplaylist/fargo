# Fargo — Experience

> **v0.7 — 2026-08-26.** People tab merged into Overview (5 → 4 tabs). Auth simplified to Google-only (magic link removed). Overview redesigned: stat cards replaced with local time/weather card, upcoming plan with 2-day lookahead, people section with invite button. Invite flow built.
>
> The Vietnam walkthrough below is **illustrative** — a worked example to keep the flow concrete. There is no real trip behind it.

---

## §1 User journey

### The planner's flow, end to end

Vietnam, 30 Sept – 8 Oct 2026, five people.

1. **Create the trip** — name, destination, dates, trip type (*free & easy*), local currency **VND**, and the rate: 1 MYR = ₫5,600. The rate is typed once and frozen with the trip.
2. **Add the people** — myself and Biju as accounts, Ali and two others as **names only**. Nobody is blocked on signing up.
3. **Dump ideas as I find them** — Ha Long cruise, the egg coffee place, a Ninh Binh day trip. No dates yet, just a pile.
4. **Book the big things** — flights and the Hanoi hotel. Each booking records the confirmation number *and* becomes an expense with its real cost. Entered once.
5. **Build the days** — pull ideas out of the backlog onto 30 Sept, 1 Oct, and so on. Each item gets a time. Most activities don't carry a cost estimate — meals, walks, and cafes don't need one.
6. **Set the budget** — one number: RM4,000 total for the trip. Flights and hotel are already booked (RM1,600 in bookings), so the app shows: RM4,000 − RM1,600 = RM2,400 free budget ÷ 9 days = **RM267/day** for food, transport, souvenirs. Later, when the Ha Long cruise gets an estimated cost (RM600), the daily budget adjusts down to RM200/day — a helper text explains the change. Most users never add activity estimates; their daily budget stays at the two-layer figure.
7. **Handle the admin** — checklists for packing, e-visa, data plan, insurance.
8. **Invite the group** — Biju and Ali accept and become account travellers; the other two stay as names. The trip works identically either way.

**On the trip:**

9. **Log spend as it happens** — phone, one-handed. *Pho lunch, ₫2,500,000, food, paid by me, shared among 5.* The MYR figure appears automatically.
10. **Anyone can see where they stand** — each traveller's cost to date, any time, without asking me.
11. **Someone adds what I missed** — Ali logs the Grab to the airport. It lands in my approval queue; I approve it and it becomes real.

**After:**

12. **Budget vs actual** — total budget RM4,000 vs actual RM4,150. Daily free budget averaged RM191/day; actual daily spend averaged RM205/day — that's where the overspend came from. Category breakdown shows where the money went (food RM380, activities RM720, etc.).
13. **The trip closes** and stays browsable forever, with its frozen rate, ready to be read again in 2028.

### The traveller's flow

Deliberately thin. Accept the invite → see the whole trip → see my own cost to date → tick my own checklist items. Contributing is possible but never the thing the screen pushes me toward.

### Screens implied

**Planner:** trips list · create trip · trip overview · schedule (day view) · bookings · checklists · ideas backlog · expenses · budget vs actual · travellers & invites · approval queue · trip settings

**Traveller:** invite accept · trip overview · schedule (read) · expenses (read + own cost) · checklists (own items) · propose

**Account:** sign in (Google) · profile

### States that get forgotten

- **Brand new trip** — no days, no people, no money. What does the overview say when everything is zero?
- **Trip with one traveller** — solo/shared tagging and per-person breakdown must disappear entirely, not sit there greyed out
- **Planned but not travelled** — estimates exist, actuals don't. Budget vs actual must not read as "you're RM4,000 under budget"
- **Rejected proposal** — what Ali sees, and whether he can revise and resubmit
- **Past trip** — completed trips stay editable for late-arriving expenses
- **Signal drops** — the app is online-only, so this is an honest error state, not a silent failure

---

## §2 Information architecture

*Logical structure only. Storage and stack are a technical-phase decision.*

### Vocabulary — fixed here, used everywhere

**Trip** · **Traveller** (never "member" or "user") · **Planner** (the owner) · **Day** · **Activity** (a scheduled thing) · **Booking** · **Checklist** · **Idea** (unscheduled) · **Expense** · **Share** (one traveller's portion) · **Budget** · **Proposal** · **Rate**.

### Content model

**Trip** — name, destination, dates, trip type, local currency, **rate** (frozen), status *(planning / active / completed — completed stays editable)*, planner.

**Traveller** — a person *on a trip*. Display name, role, and an optional link to an **Account**. No account link = name-only traveller; adding the link later is the upgrade path, and every past Share follows automatically.

**Account** — email, name, avatar, home currency (MYR). One account, many Travellers across many Trips.

**Activity** — date, time, title, notes, category, **optional cost** (local, the known price — exact or rounded up, not an estimate) with solo/shared tagging, and an **optional Place** (name + coordinates, chosen by search-and-pick). No place is fine — "sunset at a roadside cafe" is a real activity. No cost is fine — most activities don't have one. Optionally links to the **Expense** that paid for it.

**Booking** — type, provider, confirmation number, dates, cost, and an optional Place so it pins on the map. **Always owns an Expense** — entered once, counted once.

**Idea** — title, link, note. Promoting it creates an Activity and marks the Idea used.

**Checklist** → **Checklist item** — text, done, optionally assigned to a Traveller.

**Expense** — date, title, category, **amount in local currency**, MYR equivalent derived from the Trip's rate, **paid by** (a Traveller), and either solo or shared. Shared expenses hold explicit **Shares** — one per Traveller, by name, not a headcount. May link back to an Activity or Booking.

**Budget** — a single total in MYR, **per person** (your own share, not the group's spend). The app derives the daily free budget in two or three layers:

- **Fixed costs** — sum of your share of Booking costs (flights + accommodation). Always subtracted.
- **Activities with costs** *(optional layer)* — sum of your share of Activity costs (the known price, not an estimate). Only appears when at least one Activity carries a cost. Most activities (meals, walks, cafes) have no cost — the field is optional, not prompted. Only items with a known ticket/entry price (tours, museum tickets, theme parks) get one.
- **Daily free budget** — (Total − Fixed − Activity costs if any) ÷ trip days. This is the number that matters day-to-day: your unplanned spending allowance for food, transport, souvenirs. When an activity cost is added, a helper text explains the adjustment.

Category breakdown (food, transport, activities, etc.) is **read-only** — it shows where money went, not where it should go.

**Proposal** — author, target, proposed values, status *(pending / approved / rejected)*, reason. Every traveller-originated change is one of these until the Planner approves it.

**Days are derived from the trip's dates**, never stored — so an empty day is simply a day with no Activities.

### Screen map

**Signed out** — Landing · Sign in (Google) · Invite preview · Shared trip view (read-only, no auth required)

**Signed in** — three app-level pages via bottom nav:

| Page | Holds |
|---|---|
| **My trips** (main) | Active trip as a **hero card** (pulsing "Active now" dot, Day N counter as hero number, traveller avatars, "Open →" button) — the loudest element on the page. Upcoming trips sit below as **compact hero cards** (two-column layout with countdown number). Past trips with "show all" link + "+ New trip" button |
| **Explore** | 2-column card grid of published trips. Search bar + trip-type filter chips. Infinite scroll. *Won't ship until publishing is ready — empty state or hidden tab at launch* |
| **Profile** | Recently viewed shared trips (with owner name), account settings (display name, home currency), sign out |

A trip is always something you navigate *into* from My trips (or from recently viewed in Profile).

**Active trip auto-land:** when a trip's dates include today and the user opens the app fresh, the app lands directly on that trip's Schedule tab scrolled to today, with a daily budget bar showing daily free budget and today's spend. No activities are marked "done" — the schedule stays fully editable throughout; only a "you are here" teal left-border highlights the next upcoming activity. If multiple trips are active simultaneously (rare), stay on My trips with both marked "Active now." The bottom nav remains visible inside the active trip for escape.

**Inside a Trip** (four tabs):

| Tab | Holds |
|---|---|
| **Overview** | Local time/weather card (country code → timezone mapping, 30+ countries), upcoming plan with 2-day lookahead (today/tomorrow/next day with activities), **people section** (traveller avatars + invite button — merged from former People tab). **Transforms for completed trips** — shows post-trip summary (total spent, budget vs actual, category breakdown, per-traveller costs) in the same tab, not a separate screen |
| **Schedule** | **Day picker** at top → **daily budget strip** below it → **day-by-day Activities** with drag handles (⠿) for reorder and "+ Add activity" buttons. Per-day map with pins connected in schedule order. Day picker scrolled to today when active |
| **Money** | Expenses, budgets, per-traveller cost to date. **Log expense** is phone-first: 3 essential fields (amount, title, category) up top, smart defaults collapsed below, sticky submit button |
| **Prep** | Bookings · Checklists · Ideas. Each section has "+ Add" buttons. Checklists: inline "+ Add item…" input, ••• menu on list headers (rename/delete), swipe-to-delete on items. Ideas: "→ Schedule" promote button, swipe-to-delete |

**People tab removed** — merged into Overview (Aug 25). Traveller avatars and invite button now live directly in the Overview tab, reducing tab count from 5 to 4 and keeping people visible on the landing tab.

Planner-only: **Approvals** (deferred to Phase 5) and **Trip settings** (includes share/invite link generation). Travellers see the four tabs, read-first.

**Share trip flow:**

1. Planner opens Trip settings → Share trip → generates a public read-only link
2. Visibility toggles control what's shown (schedule, spending by category, budget vs actual)
3. Anyone with the link sees the **Shared view** — read-only, no auth required. Owner name visible. "Save as my trip" button at the top
4. Saving creates a full copy (schedule, places, bookings as references, ideas, checklists). Does **not** copy expenses, budget, or travellers — user sets those fresh in a save dialog (trip name, dates, currency, rate)
5. Saved copy is a normal trip — no "based on" badge, fully editable, fully yours
6. Share ≠ invite — different URLs, different purpose

### Navigation

**Two navigation layers:**

1. **App-level** — bottom nav with three items: My trips · Explore · Profile. Fixed at the bottom on phone, could sit as a top bar on desktop.
2. **Trip-level** — four tabs (Overview · Schedule · Money · Prep) inside a trip. **Swipe left/right on mobile** to switch between tabs — the primary navigation gesture inside a trip. Back arrow returns to My trips.

Both layers coexist — when inside a trip, the bottom nav stays visible so the user can always escape to app-level. The trip tabs handle movement within the trip.

Fixed-width centred column throughout, so desktop and phone are the same layout at different widths. Everything in a trip is two taps from anywhere. The approval queue surfaces as a badge on **Overview** — visible to the Planner, invisible to everyone else.

### Illustration placement plan

Warm, hand-drawn-style illustrations (à la BlaBlaCar / Headspace) in key empty and emotional states. These are **placeholder positions** — the actual illustrations are a future design task, not MVP. Positions identified:

| Position | When shown | Illustration mood |
|---|---|---|
| **My trips — empty state** | New user, no trips yet | Inviting: open suitcase, world map, "where to?" energy |
| **Explore — empty state** | Before publishing ships, or no results for search | Discovery: binoculars, compass, "trips coming soon" |
| **Explore — search no results** | Search returns nothing | Friendly miss: empty map, "try another destination" |
| **Trip created — overview empty** | Brand new trip, nothing added yet | Excitement: boarding pass, countdown feeling |
| **Schedule — empty day** | A day with no activities yet | Open possibility: sunrise, blank canvas, "what's the plan?" |
| **Ideas — empty backlog** | No ideas added yet | Inspiration: lightbulb, travel magazine collage |
| **Post-trip summary — header** | Overview tab when trip is completed | Accomplishment: suitcase with stickers, journey complete |
| **Shared view — header** | Top of read-only shared trip | Social: postcard, "check out my trip" energy |
| **Sign-in / landing page** | Unauthenticated landing | Brand hero: warm travel scene, people planning together |
| **Profile — no recently viewed** | User hasn't opened any shared trips | Curiosity: telescope, "explore trips from friends" |

**Rules for illustrations:**
- Flat, warm, consistent with the cream + teal palette — no photographic images
- Small and contained — sit within a card or section, not full-bleed backgrounds
- Never block content or require scrolling past — they enhance empty states, they don't fill them
- One illustration style across the app — commission or generate as a set, not piecemeal
