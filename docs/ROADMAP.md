# Fargo — Roadmap

> **v0.9 — 2026-10-09.** Live: v0.5.7 (PWA, `fargotravel.vercel.app`). Phases 1–3 done; Phase 4 almost done. Since the last refresh: group expenses (v0.4), the redesign and cover photos (v0.5.0–0.5.1), personal checklists and idea suggestions (v0.5.4), Passport (v0.5.6) and share overlays (v0.5.7). Explore was specced and then **shelved**. Native app parked; all effort is on the PWA.
>
> v0.8 — 2026-09-26 · v0.7 — 2026-09-06 (history in the decision log and `STATUS.md`).

**Sequencing principle:** the planner working alone *is* the product. Multi-user is the most expensive thing in MVP, so it comes after the single-planner trip works end to end — not because it's optional, but because everything it multiplies must be right first.

---

## Done ✅

| Milestone | Release |
|---|---|
| **Phase 1 — Shell:** Next.js + Supabase, Google sign-in, trip CRUD, layout | Aug 22 |
| **Phase 2 — Plan:** schedule (drag to reorder), ideas → schedule, checklists | Aug 23 |
| **Phase 3 — Money + share:** budget, expenses, invite link, read-only share link | Aug 25 · v0.1 launched Aug 30 |
| Post-trip polish (Singapore) | v0.2 · Sep 5 |
| **Discover (Bites):** dining search, Google Places | v0.3 · Sep 6 |
| Polish, performance, full security / code / design / docs review, RLS audit | v0.3.1–0.3.6 · Sep 26 |
| **Group expenses:** everyone logs, split by participants, settle-ups, own budgets (`EXPENSES.md`) | v0.4.0–0.4.5 · Sep 27 |
| Weather follows your Stay | v0.4.6 |
| **New look** (`DESIGN.md` v0.8) and **cover photos** | v0.5.0–0.5.1 · Oct 1–3 |
| New logo | v0.5.2–0.5.3 |
| **Personal checklists + idea suggestions** (`CHECKLISTS.md`, `IDEAS.md`) | v0.5.4 |
| Cover position, invite cover, Discover for members | v0.5.5 |
| **Passport** tab with travel stats | v0.5.6 |
| **Share trip overlays:** trip pass, stamp, photo ticket | v0.5.7 · Oct 9 |
| **Landing page** (marketing site at `/`, install prompt, analytics; `LANDING.md`) + **security update** (Next.js 16.4.0, protective headers; `REVIEW.md`) | v0.5.8 · Oct 10 |
| Sign-out clears saved offline pages | v0.5.9 · Oct 10 |
| Google key kept private (place search via the server) | v0.5.10 · Oct 10 |
| Security check-up: only you can add yourself to a trip, invite links hide account details | v0.5.11 · Oct 10 |
| Content Security Policy, report-only | v0.5.12 · Oct 10 |

## In progress 🟡

- **AI stamp art per place** (`STAMPS.md`), v0.5.14. Waiting on the owner's Gemini / OpenAI API keys → style check → build.
- **Phase 4 — Real travellers.** Invite, join, leave, read-only members and the RLS audit are done. **Remaining:** upgrade a name-only traveller to an account, keeping their history.

## Parked ⏸

- **Explore** — specced, wireframed and planned (`EXPLORE.md`, `EXPLORE-PLAN.md`); shelved 2026-10-09 because the user base is too small. The tab stays with its placeholder.
- **Discover price filter** — keep in view.
- **Home currency per trip** — money is built around MYR; needs its own release, tested on staging.
- **Native iOS app** (`fargo-app`) — parked 2026-09-26. Before it resumes it must move to personal checklists so the old checklist tables can be dropped.

## Not scheduled

- **Map** — per-day pins (decided Aug 17, deferred in Phase 2).
- **Discover: Shop & Attractions.**
- **Proposals and approvals (old Phase 5)** — replaced 2026-09-26 by "members are read-only, the planner edits"; money is the exception.
- **Illustrations** for empty states and no-photo covers — need an identity guideline and an illustration library first.
- Co-planners · file attachments on bookings · duplicate a trip.

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
| 2026-09-06 | **Discover tab** (5th trip tab) — Bites dining discovery via Google Places; Shop & Attractions planned |
| 2026-09-26 | **Members are read-only; only the planner edits.** Confirmed as intentional (replaces the proposals model for now) |
| 2026-09-26 | **Security model:** RLS is the boundary; SECURITY DEFINER functions use `auth.uid()` and are closed to signed-out users unless needed; shared trips hide invite code and expenses |
| 2026-09-26 | **Design:** Add activity is the reference for forms and chips; generic-icon empty states (no mascot for now); shadows allowed on floating layers only |
| 2026-09-26 | **Explore hidden** from the bottom nav until it ships |
| 2026-09-26 | **Root `CLAUDE.md` (v2)** replaces `docs/CLAUDE.md` workflow (v1, sunset) |
| 2026-09-27 | **UI redesign before Explore** — HTML mockups first. My trips: Mozi-style cards (photo beside text). Overview: Qantas-style (photo header with bottom dark gradient, clean cards). Schedule: Tripsy-style timeline, one line per activity. Money: keep flows, fix hierarchy. Trip sections move to the bottom bar. Photos from Unsplash |
| 2026-09-27 | **Travel stats** grouped with the Explore milestone |
| 2026-09-28 | **Redesign design locked** — DESIGN.md v0.8 + canvas; feature checklist + build plan (v0.5.0–v0.5.6) in REDESIGN.md. Removed: "Turn into no account", trip type/length on cards, invite link in settings, claim counts on invite, Recently viewed (hidden). Personal checklists after the redesign |
| 2026-09-28 | **After the redesign (enhancements):** (1) personal checklists; (2) **Discover price filter** — multi-select price chips using all 4 Google levels ($–$$$$), "Fine dining" becomes a real upscale filter, places with no price info handled separately (needs a DB change to store several levels) |
| 2026-09-28 | **Cover photos are user-uploaded** (planner), no stock photos. No photo → colour + country code for now; switch to template illustrations once an identity guideline + illustration library exist |
| 2026-10-01 | UI redesign (DESIGN.md v0.8) ships as **v0.5.0** — same features, no SQL; cover photo upload follows as v0.5.1 (P10, staging Supabase first). Then personal checklists → Discover price filter → Explore + travel stats |
| 2026-10-09 | **Passport tab** (v0.5.6) and **Share trip overlays** (v0.5.7: trip pass, passport stamp card, photo ticket) — inspired by Strava, not a copy; save/copy flow because web apps can't post stickers to Instagram directly |
| 2026-10-09 | **AI stamp art per place** (`docs/STAMPS.md`): one per Base city, only after a trip starts, auto-published, ≤ 10/day; Gemini vs OpenAI decided by a style check. Parked: Discover price filter (KIV), home currency per trip (money change, own release) |
| 2026-10-10 | **One version for app + landing page.** They share one codebase and one deploy, so the landing page doesn't keep its own number; "Landing page v0.1" folded into v0.5.8. Separate numbers only if the marketing site ever moves to its own project |
| 2026-10-09 | **Explore shelved** — spec (`EXPLORE.md`), wireframes, reference study and build plan done; not built. Reason: user base too small for Explore to work yet; launching it near-empty could backfire. Tab stays in the nav with its "on its way" placeholder |

### Open

None blocking. Scoping is closed. Stack is chosen. Phases 1–3 built and deployed.
