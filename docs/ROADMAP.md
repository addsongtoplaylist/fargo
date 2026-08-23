# Fargo — Roadmap

> **v0.4 — 2026-08-21.** Refined development phases: fully styled from Phase 1, active trip auto-land moved to Phase 2, share trip moved to Phase 3, Phase 6 is polish + explore.

**Sequencing principle:** the planner working alone *is* the product. Multi-user is the most expensive thing in MVP, so it comes after the single-planner trip works end to end — not because it's optional, but because everything it multiplies must be right first.

---

## Phase 1 — The shell

Project scaffold (Next.js + Supabase + Drizzle + Tailwind), auth (Google sign-in + magic link), the app layout (bottom nav, routing), trip CRUD (create/list/edit/delete), and the trip shell with its 5-tab structure. **Fully styled from day one** — design tokens (Sora font, cream ground, teal accent, shadowless cards), hero trip cards on My trips, the complete visual language.

**What gets built:**
- Next.js project with App Router, Tailwind config with all design tokens
- Supabase project, Drizzle schema for Account + Trip + Traveller (planner-only)
- Auth: Google OAuth + magic link, long-lived session, auth middleware
- App layout: bottom nav (My trips · Explore · Profile), centred column (480px)
- My trips page: hero trip cards (active + upcoming variants), past trips, "+ New trip"
- Create trip form: name, destination, dates, trip type, local currency, frozen rate
- Trip interior: header (name, destination, back arrow) + 5-tab bar (Overview · Schedule · Money · Prep · People) — tabs present but content is placeholder
- Profile page: account settings (display name, home currency), sign out

**Done when:** you sign in, see My trips with styled hero cards, create the Vietnam trip, and land inside it with all five tabs visible.

## Phase 2 — The plan

Schedule (day picker → activities with drag-to-reorder), ideas backlog with promote-to-schedule, checklists with full CRUD (••• menu, swipe-to-delete, inline add). The map (Mapbox, per-day pins in schedule order, search-and-pick places) — built last in this phase. Active trip auto-land on Schedule scrolled to today, "you are here" teal left-border marker, swipe-to-switch tabs on mobile.

**Done when:** a full itinerary lives in Fargo, plots on the day map in order, and you'd stop opening Wanderlog.

## Phase 3 — The money + share ⭐

The USP. Budget setup (single total), bookings (each owns an expense), expense logging (phone-first form with 3 essential fields, smart defaults, sticky submit), daily budget strip on Schedule, category breakdown, per-traveller cost view, post-trip summary in Overview tab. Plus **share trip** — public read-only link + save as own trip. Solo/shared expenses with explicit Shares — **name-only travellers arrive here**.

**Done when:** budget vs actual is correct for the whole trip with no spreadsheet anywhere, and you can share the trip with a link.

> **If time runs out before the trip, ship here.** Phases 1–3 are a complete, genuinely useful product for one planner — the thing no existing tool does. Phases 4–5 make it a group product, which is valuable but not what makes Fargo worth building.

## Phase 4 — Real travellers

Invites by email, accounts binding to existing Traveller slots, the **upgrade path** from name-only to account. Traveller's read-first view. Server-side authorisation (RLS) on every trip resource.

**Done when:** Biju signs in, sees the trip, and sees his own cost to date without asking you.

## Phase 5 — Proposals and approvals

Proposal model covering both schedule and expenses, the planner's approval queue with before/after, approve/reject with reason, and status visible to the submitter.

**Done when:** a traveller submits the airport Grab, you approve it, and it becomes real.

## Phase 6 — Polish + explore

Empty states with illustration placeholders, explore page (2-column grid, search, trip-type filters), final phone layout pass at 375px.

**Done when:** the trip is finished, readable, every empty state has a placeholder, and explore is browsable.

---

## Later — deliberately not scheduled

Settlement (who owes whom) · co-planners · publishing trips by trip type · file attachments on bookings · reusable checklist templates · duplicate a trip · illustrations (10 placements identified in DESIGN.md).

---

## No deadline

There's no trip to chase. Vietnam, the dates, the currency and the travellers throughout these docs are **illustrative** — they exist to keep the writing concrete, not because they're real.

That makes the Phase 3 milestone more useful, not less. Without a deadline the risk isn't running out of time, it's building all six phases before anything gets used. **Phases 1–3 are a complete product for one planner** — plan a trip, track what it costs, see budget against actual. Ship there, put a real trip through it, and let what you learn shape Phases 4–6. Multi-user built on a money model that's never been used in anger is the expensive way to find out it's wrong.

---

## Decision log

### Locked

| Date | Decision |
|---|---|
| 2026-08-16 | Money scope: budget **and** actual, variance is the point |
| 2026-08-16 | Splitting: shares only in MVP; settlement is a later phase |
| 2026-08-16 | FX: manual, one rate per trip, frozen |
| 2026-08-16 | MVP modules: Schedule · Bookings · Checklists · Ideas |
| 2026-08-16 | Platform: desktop planning + phone logging, fixed-width centred column (Quotemark) |
| 2026-08-16 | No trip comparison in-app, ever |
| 2026-08-16 | Multi-user in MVP — cost raised and accepted |
| 2026-08-17 | Hosted, always online. No offline mode |
| 2026-08-17 | Auth: Google sign-in + email magic link. **No passwords anywhere** |
| 2026-08-17 | Name-only travellers, upgradeable to accounts, history preserved |
| 2026-08-17 | Everything a traveller submits needs approval; contribution is the exception, not the norm |
| 2026-08-17 | Budgets at both category and activity level → Budgeted / Planned / Actual |
| 2026-08-17 | Completed trips stay editable |
| 2026-08-17 | Home currency MYR; expenses entered in local currency, MYR derived |
| 2026-08-17 | **Map is in** — per day, pins in schedule order, search-and-pick places, bookings pinned. No routing or travel times |
| 2026-08-17 | An Activity may have no place at all |
| 2026-08-17 | Nav: **Home (ongoing / completed) → Trip**. A trip is never the landing page. Home stays minimal |
| 2026-08-17 | Budgets are **per person**, your share — not group total |
| 2026-08-17 | Activity estimates carry solo/shared, so Planned and Budgeted are both personal money |
| 2026-08-17 | Planned shown only where non-zero; for unscheduled categories the Budget is the plan |
| 2026-08-17 | Expense categories and trip types are **fixed lists** |
| 2026-08-17 | Approvals: own tab **and** a badge on Overview |
| 2026-08-17 | **Mapbox** for maps and geocoding. Weaker on small local POIs than Google Places — mitigated by manual pin drop |
| 2026-08-21 | **Stack:** Next.js (App Router) + Supabase (Postgres + Auth + Storage) + Drizzle + Tailwind + Mapbox + Vercel |
| 2026-08-21 | Nav: **Bottom nav (My trips · Explore · Profile)** replaces flat Home. Two nav layers (app-level + trip-level tabs) |
| 2026-08-21 | Budget model: **Single total budget** with three-layer subtraction. Replaces two-level category/item model |
| 2026-08-21 | Share trip: read-only public link + save as own trip. Share ≠ invite |
| 2026-08-21 | Active trip auto-land: opens to Schedule scrolled to today. No "done" state on activities |
| 2026-08-21 | **Active trip hero card** replaces persistent bar on My trips. Upcoming trips as compact hero cards below |
| 2026-08-21 | Schedule order: **day picker → budget strip → activities** (pick the day first, then see its budget) |
| 2026-08-21 | **Swipe-to-switch trip tabs** on mobile — primary navigation gesture inside a trip |
| 2026-08-21 | **Drag-to-reorder activities** via grip handle (⠿) using @dnd-kit |
| 2026-08-21 | Prep CRUD: **••• menu** on checklist headers (rename/delete list), **swipe-to-delete** on items, **inline add** inputs |
| 2026-08-21 | **Log expense phone-first**: 3 essential fields up top, smart defaults collapsed, sticky submit |
| 2026-08-21 | **Post-trip summary lives in Overview tab** — same tab transforms when trip status is "completed" |
| 2026-08-21 | No "Shared" badge on recently viewed cards — owner name is sufficient |

### Open

None blocking. Scoping is closed. Stack is chosen. Design lockdown in progress.
