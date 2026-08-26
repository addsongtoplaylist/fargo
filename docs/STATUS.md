# Fargo — Status

> Append-only. Newest entry first.

---

**2026-08-26 — Phases 1–3 complete, UAT done, 4 days to launch**

All three core development phases are built, deployed, and tested on production (`fargotravel.vercel.app`). Two rounds of UAT completed (Aug 25 + Aug 26). Pass rate: 93% (41/44 testable cases). Launch target: **Aug 30, 2026** — v0.1 internal launch with 1 invited traveller on a real trip.

**What's built and shipped:**

- **Phase 1 (The shell)** ✅ — Google OAuth (magic link removed), app layout with bottom nav, trip CRUD with hero cards, full design system
- **Phase 2 (The plan)** ✅ — Schedule with day picker, activities with drag-to-reorder, ideas backlog with promote-to-schedule, checklists with full CRUD, swipe-to-switch tabs (4 tabs: Overview · Schedule · Money · Prep), active trip auto-land
- **Phase 3 (The money + share)** ✅ — Budget setup, expense logging with optimistic UI, daily budget strip, category breakdown, solo/shared expenses, invite flow via SECURITY DEFINER RPCs, share link for read-only view
- **Phase 4 (partial)** — Invite flow works end-to-end: planner generates invite link → unauthenticated user sees trip preview → signs in via Google → joins as traveller. Implemented via `get_trip_by_invite` and `join_trip_by_invite` SECURITY DEFINER RPCs to bypass RLS safely
- **Perf review 1** ✅ — Loading skeletons, Suspense streaming for trip layout

**Key changes since design docs (Aug 21):**

- **Auth:** Google OAuth only — magic link removed per user request
- **Tabs:** 4 tabs, not 5 — People tab merged into Overview as a traveller section with avatars + prominent invite button
- **Overview redesign:** Stat cards and progress bar removed (felt stressful). Replaced with: local time/weather card (30+ country timezone mapping, placeholder weather), upcoming plan with 2-day lookahead, people section
- **Destination search:** Structured display names from Mapbox context ("Tokyo, Japan" not "Tokyo, Tokyo Prefecture, Japan"), deduplication, country code extraction for timezone/currency
- **ORM:** Supabase JS client used for all queries instead of Drizzle (IPv6 resolution fails from dev machine). Drizzle schema exists for reference only
- **Package manager:** npm, not pnpm
- **Domain:** `fargotravel.vercel.app` (Vercel Hobby plan)

**UAT results (artifact):** https://claude.ai/code/artifact/d16b1a7c-270b-4bcd-aa7f-a6a4feb20167

**Remaining before launch (Aug 27–29):**

- Edge case sweep: deleted trip, expired session, bad network, empty states
- Error feedback audit
- Mobile UX pass on real phone (keyboard, touch targets, PWA install)
- Final UAT on 2-3 devices (iPhone Safari, Android Chrome, desktop)
- Bug buffer day (Aug 29) — no new features

| Doc | Version | Last updated |
|---|---|---|
| `PRODUCT.md` | v0.7 | 2026-08-26 |
| `EXPERIENCE.md` | v0.7 | 2026-08-26 |
| `DESIGN.md` | v0.4 | 2026-08-26 |
| `TECHNICAL.md` | v0.2 | 2026-08-26 |
| `ROADMAP.md` | v0.5 | 2026-08-26 |
| `STATUS.md` | — | now |

**Next:** hardening pass (Aug 26-27), final UAT (Aug 28), bug buffer (Aug 29), launch (Aug 30).

---

**2026-08-21 — Development phases finalised, ready to build**

Design lockdown complete. Development phases refined and locked in ROADMAP.md v0.4:

- **Phase 1 (The shell):** Auth, app layout, trip CRUD, fully styled from day one
- **Phase 2 (The plan):** Schedule, ideas, checklists, map (last), active trip auto-land, swipe tabs
- **Phase 3 (The money + share):** Budget, expenses, post-trip summary, share trip
- **Phase 4 (Real travellers):** Invites, account binding, RLS
- **Phase 5 (Proposals & approvals):** Proposal model, approval queue
- **Phase 6 (Polish + explore):** Empty states, explore page, phone layout pass

| Doc | Version | Last updated |
|---|---|---|
| `PRODUCT.md` | v0.6 | 2026-08-21 |
| `EXPERIENCE.md` | v0.6 | 2026-08-21 |
| `DESIGN.md` | v0.3 | 2026-08-21 |
| `TECHNICAL.md` | v0.1 | 2026-08-21 |
| `ROADMAP.md` | v0.4 | 2026-08-21 |
| `STATUS.md` | — | now |

**Next:** initialise git repo, scaffold Next.js project, begin Phase 1.

---

**2026-08-21 — Design lockdown in progress**

High-fidelity screen mockups built (14+ screens in a phone-frame gallery). Two rounds of design review completed with the following decisions locked:

- **Active trip hero card** replaces the persistent bar on My trips — "Day 5 of 9" as hero number, pulsing "Active now" dot
- **Upcoming trips** sit below as compact hero cards with countdown numbers
- **Schedule order:** day picker → daily budget strip → activities (pick the day first)
- **Drag-to-reorder** activities via grip handle (⠿)
- **Swipe-to-switch** trip tabs on mobile
- **Prep CRUD:** ••• menu on checklist headers (rename/delete list), swipe-to-delete on items, inline "+ Add item…" inputs, "→ Schedule" promote button on ideas
- **Log expense phone-first:** 3 essential fields (amount, title, category) up top, smart defaults collapsed below, sticky submit
- **Post-trip summary** lives in Overview tab — same tab transforms when trip status is "completed"
- **No "Shared" badge** on recently viewed cards — owner name is sufficient

Design mockup artifact: https://claude.ai/code/artifact/22afd89f-7689-4080-a540-a4bb6278c342

| Doc | Version | Last updated |
|---|---|---|
| `PRODUCT.md` | v0.6 | 2026-08-21 |
| `EXPERIENCE.md` | v0.6 | 2026-08-21 |
| `DESIGN.md` | v0.3 | 2026-08-21 |
| `TECHNICAL.md` | v0.1 | 2026-08-21 |
| `ROADMAP.md` | v0.3 | 2026-08-21 |
| `STATUS.md` | — | now |

**Next:** finish design review (user may have more feedback), then initialise git repo, scaffold Next.js project, and begin Phase 1 implementation.

---

**2026-08-21 — Stack chosen**

`TECHNICAL.md` v0.1 written. All technical decisions locked:

- **Framework:** Next.js (App Router) — full-stack TypeScript, SSR for shared views
- **Database:** PostgreSQL on Supabase — relational data, managed, free tier
- **Auth:** Supabase Auth — Google + magic link, same-email resolution, no passwords
- **ORM:** Drizzle — type-safe SQL, low overhead on serverless
- **Maps:** Mapbox GL JS via react-map-gl
- **Styling:** Tailwind CSS — design tokens as theme config, no component library (except Headless UI for accessible dropdowns/modals)
- **Hosting:** Vercel — zero-config Next.js deployment
- **Email:** Resend — magic links and invite emails

Route structure, schema overview, budget calculation approach, and key libraries documented. Development setup commands ready.

| Doc | Version | Last updated |
|---|---|---|
| `PRODUCT.md` | v0.6 | 2026-08-21 |
| `EXPERIENCE.md` | v0.5 | 2026-08-21 |
| `DESIGN.md` | v0.2 | 2026-08-21 |
| `TECHNICAL.md` | v0.1 | 2026-08-21 |
| `ROADMAP.md` | v0.2 | 2026-08-21 |
| `STATUS.md` | — | now |

**Next:** initialise git repo, scaffold Next.js project, set up Supabase, write Drizzle schema, and begin Phase 1 implementation (sign in + a trip exists).

---

**2026-08-21 — Wireframes complete, all screens designed**

All wireframe phases complete. Screens cover the full user journey from sign-in through post-trip summary, plus share and explore flows.

**Phases wireframed:**
- Phase 1: Trip creation, schedule, map, approvals, settings, invite flow
- Phase 2: Budget setup, money tab, expense logging, expenses list, post-trip summary
- Phase 3: Share trip (share link, shared read-only view, save as own trip)
- Home screen: My trips (hero cards), Explore (2-col grid), Profile (recently viewed)
- Active trip: auto-land on Schedule, daily budget strip, "you are here" marker

**Key design decisions made during wireframing:**

- **App-level navigation:** bottom nav — My trips · Explore · Profile. Two navigation layers (app-level + trip-level tabs) coexist
- **Hero upcoming cards:** large countdown number, trip type chip, traveller avatars. Ticket feel, not list-item feel
- **Active trip auto-land:** opens to Schedule scrolled to today. No "done" state on activities — schedule stays editable, only a teal left-border "you are here" marker on next activity
- **Share ≠ invite:** sharing = read-only public link; inviting = traveller on your trip. "Save as my trip" at top of shared view. No "based on" badge on copies
- **Explore page:** 2-column grid, search + trip-type filters, infinite scroll. Won't ship until publishing — designed now, cold start accepted
- **Recently viewed:** lives in Profile, not My trips — avoids stacking problem with accumulated past trips
- **Illustrations:** 10 placement positions identified for warm vector illustrations (empty states, headers, landing). Style: flat, warm, Headspace/BlaBlaCar-inspired. Not built in V1 — positions reserved with placeholders

| Doc | Version | Last updated |
|---|---|---|
| `PRODUCT.md` | v0.6 | 2026-08-21 |
| `EXPERIENCE.md` | v0.5 | 2026-08-21 |
| `DESIGN.md` | v0.2 | 2026-08-21 |
| `ROADMAP.md` | v0.1 | 2026-08-17 |
| `STATUS.md` | — | now |

**Next:** stack and technical decisions — framework, database, hosting, auth provider. Then Phase 1 implementation.

**Not started:** no code, no git repo, no stack chosen.

---

**2026-08-20 — Design tokens locked**

`DESIGN.md` v0.1 written. All visual tokens decided:

- **Font:** Sora (Google Fonts) — square proportions, strong tabular numerals
- **Accent:** teal `#1a8a6e` on warm cream `#f7f2ee` ground
- **Depth model:** shadowless — border + background shift only (Headspace-inspired)
- **Money states:** green/amber/rose, independent of accent
- **Layout:** fixed-width centred column, 480px max-width
- **Spacing:** base-4 scale, radii 4/8/12px

**Next:** flat wireframe artboards covering all screens from EXPERIENCE.md screen map, with flow arrows between screens.

---

**2026-08-20 — Scoping complete**

All four scoping docs finished and open questions resolved.

| Doc | Version | Last updated |
|---|---|---|
| `PRODUCT.md` | v0.4 | 2026-08-20 |
| `EXPERIENCE.md` | v0.3 | 2026-08-20 |
| `ROADMAP.md` | v0.1 | 2026-08-17 |
| `STATUS.md` | — | now |

**What's decided:** two-level budgets (category ceiling + item allocation), past trips stay editable, ideas → schedule flow confirmed. Quotemark visual references removed — design is its own phase with nothing pre-committed.

**Next:** design phase — visual language, tokens, components, money-specific rules. Then stack and technical decisions, then Phase 1 (sign in + a trip exists).

**Not started:** no code, no git repo, no stack chosen.
