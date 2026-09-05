# Fargo — Roadmap

> **v0.6 — 2026-09-05.** Phases 1–3 complete and deployed. Phase 4 partially done (invite flow). v0.1 launched Aug 30. v0.2 shipped Sep 5 — post-trip polish from Singapore trip (money logic, schedule UX, post-trip summary). Auth simplified to Google-only. People tab merged into Overview (5 → 4 tabs).

**Sequencing principle:** the planner working alone *is* the product. Multi-user is the most expensive thing in MVP, so it comes after the single-planner trip works end to end — not because it's optional, but because everything it multiplies must be right first.

---

## Phase 1 — The shell ✅

Project scaffold (Next.js + Supabase + Tailwind), auth (Google sign-in), the app layout (bottom nav, routing), trip CRUD (create/list/edit/delete), and the trip shell with its 4-tab structure. **Fully styled from day one** — design tokens (Sora font, cream ground, teal accent, shadowless cards), hero trip cards on My trips, the complete visual language.

**What was built:**
- Next.js 16 project with App Router, Tailwind v4 with `@theme inline` design tokens
- Supabase project with SQL-managed schema for Account + Trip + Traveller
- Auth: Google OAuth only (magic link removed — unnecessary complexity for v0.1)
- App layout: bottom nav (My trips · Explore · Profile), centred column (480px)
- My trips page: hero trip cards (active + upcoming variants), past trips, "+ New trip"
- Create trip form: name, destination (Mapbox search), dates, trip type, local currency, frozen rate
- Trip interior: header + 4-tab bar (Overview · Schedule · Money · Prep) — People merged into Overview
- Profile page: account settings, sign out

**Completed:** Aug 22, 2026.

## Phase 2 — The plan ✅

Schedule (day picker → activities with drag-to-reorder), ideas backlog with promote-to-schedule, checklists with full CRUD (••• menu, swipe-to-delete, inline add). Active trip auto-land on Schedule scrolled to today, swipe-to-switch tabs on mobile. Map deferred to future phase.

**Completed:** Aug 23, 2026.

## Phase 3 — The money + share ✅ ⭐

Budget setup (single total), expense logging (phone-first form with optimistic UI), daily budget strip on Schedule, category breakdown, solo/shared expenses. Plus **invite flow** — planner generates invite link, unauthenticated users see trip preview, sign in via Google, join as traveller. Share trip as read-only public link.

**Completed:** Aug 25, 2026.

> Phases 1–3 are a complete, genuinely useful product for one planner + invited travellers.

## Phase 4 — Real travellers 🟡

Invite flow is built (via SECURITY DEFINER RPCs that bypass RLS safely). **Remaining:** traveller's read-first view restrictions, full RLS policy audit, account binding/upgrade path for name-only travellers.

**Partially done** — invite + join works end-to-end.

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

## Launch deadline

**v0.1 internal launch: Aug 30, 2026.** Target: the planner + 1 invited traveller on a real trip.

Phases 1–3 are complete. The remaining days (Aug 26–29) are hardening, UAT, and bug buffer — no new features. Platform strategy: PWA on Vercel Hobby plan (`fargotravel.vercel.app`) as the beta, with a native iOS app planned for maturity.

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
| 2026-08-17 | Auth: Google sign-in only. **No passwords anywhere.** *(Magic link removed Aug 23 — unnecessary for v0.1)* |
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

| 2026-08-25 | **People tab merged into Overview** — traveller avatars + invite button live in Overview. Trip tabs reduced from 5 → 4 (Overview · Schedule · Money · Prep) |
| 2026-08-25 | **Overview redesign** — stat cards and progress bar removed (felt stressful). Replaced with: local time/weather card, upcoming plan with 2-day lookahead, people section with prominent invite button |
| 2026-08-25 | **Invite flow via SECURITY DEFINER RPCs** — `get_trip_by_invite` and `join_trip_by_invite` bypass RLS safely for unauthenticated invite preview + join |
| 2026-08-26 | **Destination search** — structured display names from Mapbox context, country code extraction for timezone/currency mapping |
| 2026-08-26 | **Launch deadline set** — Aug 30, 2026. PWA on Vercel as beta, native iOS planned for maturity |

### Open

None blocking. Scoping is closed. Stack is chosen. Phases 1–3 built and deployed.
