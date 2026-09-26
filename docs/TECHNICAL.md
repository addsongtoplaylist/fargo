# Fargo — Technical

> **v0.3 — 2026-09-26.** Rewritten to describe what is actually built (v0.3.6). v0.2 described the original plan; the main divergences are listed under [Changed from the original plan](#changed-from-the-original-plan).
>
> Built on [PRODUCT.md](PRODUCT.md), [EXPERIENCE.md](EXPERIENCE.md) and [DESIGN.md](DESIGN.md).

---

## Stack

```
Next.js 16 (App Router) + React 19 + Supabase (Postgres + Auth) + Tailwind v4 + Vercel
Maps: Mapbox GL JS (tiles) · Google Places (place search, Bites) · Mapbox Geocoding (destination search)
```

TypeScript everywhere, one repo, one deploy target. PWA (manifest + service worker) — a native iOS app is planned separately.

---

## Project layout

```
WanderNote/
├── app/                      # Next.js app
│   ├── src/app/              # Routes (see below)
│   ├── src/lib/actions/      # Server actions — all reads/writes
│   ├── src/lib/              # Supabase clients, account helper, validations (zod), dates, categories
│   ├── src/components/       # UI, grouped by tab
│   ├── src/db/schema.ts      # Drizzle schema — reference only, not used at runtime
│   ├── public/sw.js          # Service worker (offline page + icon pre-cache)
│   └── vercel.json           # Functions pinned to sin1 (Singapore)
├── supabase/migrations/      # All SQL migrations — applied by hand in the SQL Editor
└── docs/
```

### Routes

```
app/src/app/
├── page.tsx                        # → redirects into the app
├── (auth)/
│   ├── sign-in/page.tsx            # Google sign-in
│   ├── auth/callback/route.ts      # OAuth callback (redirects to same-site paths only)
│   └── invite/[code]/page.tsx      # Invite preview + join
├── (public)/
│   └── s/[code]/page.tsx           # Shared trip, read-only, no auth
└── (app)/                          # Signed-in layout with bottom nav
    ├── trips/page.tsx              # My trips (auto-lands in the active trip unless ?noauto=1)
    ├── trips/new/page.tsx          # Create trip
    ├── trips/[id]/
    │   ├── layout.tsx              # Trip header + 5 tabs, TripProvider context
    │   ├── overview/ schedule/ money/ prep/ discover/
    │   ├── settings/page.tsx       # Planner only
    │   └── people/page.tsx         # Legacy — no tab links here (people live in Overview)
    ├── explore/page.tsx            # Placeholder; hidden from the bottom nav
    └── profile/page.tsx
```

`middleware.ts` refreshes the Supabase session and redirects signed-out users to `/sign-in`, except for `/sign-in`, `/auth`, `/s/` and `/invite/`.

---

## Data access

All queries go through **`@supabase/supabase-js`** (via `@supabase/ssr`) with the **anon key + the user's session**. There is no service-role key in the app. **Row-level security is the security boundary** — the server actions check sign-in and planner role for nicer errors, but RLS is what actually enforces access.

Drizzle was the original plan but direct Postgres connections failed (IPv6), so `src/db/schema.ts` is kept only as a readable schema reference. `DATABASE_URL` is only used by `drizzle-kit`.

### Tables

| Table | Key columns |
|---|---|
| `accounts` | `auth_id` (→ auth.users), email, name, avatar, `home_country_code`, dining prefs (`dining_budget`, `dietary_restrictions`, `cuisine_preferences`) |
| `trips` | name, destination (+ `destination_country`, `_country_code`, `_lat`, `_lng`), dates, `trip_type`, `local_currency`, `fx_rate`, `status`, `planner_id`, `share_code`, `invite_code` |
| `travellers` | `trip_id`, `account_id`, `display_name`, `role` (planner / member), `budget_total` (MYR) |
| `activities` | `trip_id`, date, time, title, notes, category, cost, place (name/lat/lng), `sort_order`, `idea_id` |
| `ideas` | `trip_id`, title, link, notes, time, category, place, `promoted`, `promoted_date`, `sort_order` |
| `checklists` / `checklist_items` | name / text, `done`, `assigned_to`, `sort_order` |
| `expenses` | `trip_id`, date, title, category, `amount` (local), `amount_myr`, `paid_by`, `is_shared` |

`trips.status` is set on create/edit only and can go stale — the UI derives "active" from the dates instead.

### Access model (RLS)

- **Planner-only writes.** Only the trip's planner can create, edit or delete trip content. Members (joined by invite) can read everything on the trip. Intentional.
- Accounts: users see and edit only their own row.
- Travellers: a user may insert themselves only into a trip they plan (used by create/clone trip). Joining someone else's trip goes through `join_trip_by_invite`.
- No public table access. Shared trips are served only by `get_shared_trip`.

### Database functions (SECURITY DEFINER)

All derive the caller from `auth.uid()` and set `search_path = public`.

| Function | Who can call | Purpose |
|---|---|---|
| `get_my_trips()` | signed in | Caller's trips with travellers, in one query |
| `join_trip_by_invite(code)` | signed in | Adds the caller as a member. Invite codes are reusable |
| `leave_trip(trip_id)` | signed in | Member removes themselves (planner can't) |
| `batch_reorder_activities(trip_id, ids)` | signed in, planner | Atomic reorder of a day's activities |
| `get_trip_by_invite(code)` | anyone | Invite preview: name, destination, dates, traveller names |
| `get_shared_trip(code)` | anyone | Shared view by exact share code: trip, activities, checklists, ideas. No invite code, account IDs, budgets or expenses |

Legacy signatures still accept a `p_account_id` argument, which is ignored.

### Migrations

`supabase/migrations/*.sql`, applied manually in the Supabase SQL Editor. When app code and SQL depend on each other, the release notes spell out the order (e.g. add a new function → deploy → drop the old policy). The original create-table SQL lives in `app/drizzle/`.

---

## Caching

- `getTrip` is wrapped in React `cache()` (per request) and `unstable_cache` (30s, keyed per user).
- `getActivities`, `getExpenses`, `getBudgetSummary` use `unstable_cache` (30s).
- Every mutation calls `revalidateTag` for what it changes: `trip-{id}`, `activities-{id}`, `expenses-{id}`. `getBudgetSummary` reads `budget_total` from `getTrip`, so budget changes bust `trip-{id}` too.
- Client components call `router.refresh()` after closing edit panels.

---

## Budget calculation

Computed in `getBudgetSummary`, never stored:

```
your share of each expense   = shared ? amount_myr ÷ travellers : amount_myr
fixed costs                  = your share of flights + accommodation + activities categories
daily free budget            = (budget_total − fixed costs) ÷ trip days     (static — doesn't move with daily spend)
remaining                    = budget_total − total spent
```

Home currency is MYR throughout (`amount_myr`, `budget_total`); the trip's single frozen `fx_rate` converts local ↔ MYR.

---

## External services

| Service | Used for | Where |
|---|---|---|
| Google Places API (New) | Activity/idea place search (autocomplete + details); Bites nearby search + photos | Client (`location-search`, `location-picker`) and server (`actions/bites.ts`). Key is `NEXT_PUBLIC_…` — **must be restricted by HTTP referrer and quota** in Google Cloud Console |
| Mapbox Geocoding | Destination (country) search on create/edit trip | Client (`destination-search`) |
| Mapbox GL JS | Day map on Schedule | Client (`day-map`) |
| Weather | **Not connected** — Overview shows a hardcoded placeholder | — |

---

## Auth

Supabase Auth, **Google OAuth only**. No passwords, no magic link. Sessions persist via refresh tokens. `getOrCreateAccount()` reads the session from the cookie (middleware already validated it) and creates the `accounts` row on first sign-in.

Invites: the planner generates an `invite_code`; anyone with the link can preview and join as a member. Share links use a separate `share_code` and are read-only.

---

## Styling

Tailwind v4 with tokens declared in `app/src/app/globals.css` (`@theme inline`) — there is no `tailwind.config.ts`. Font: Sora via `next/font/google`. No component library. See DESIGN.md for the system.

---

## Libraries

| Purpose | Library |
|---|---|
| Framework | `next` 16, `react` 19 |
| Data + auth | `@supabase/supabase-js`, `@supabase/ssr` |
| Validation | `zod` |
| Drag & drop | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Dates | `date-fns` (+ `lib/dates.ts` for the standard formats) |
| Maps | `mapbox-gl` |
| Icons | `lucide-react` |
| Schema reference | `drizzle-orm`, `drizzle-kit`, `postgres` (not used at runtime) |

---

## Hosting

Vercel Hobby, `fargotravel.vercel.app`, functions in `sin1`. Pushing `main` deploys. No preview-branch workflow in use.

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_PLACES_KEY=   # restrict by referrer + quota
NEXT_PUBLIC_MAPBOX_TOKEN=
DATABASE_URL=                    # drizzle-kit only
```

---

## Changed from the original plan

| Planned (v0.1) | Built |
|---|---|
| Drizzle ORM | Supabase JS client; Drizzle schema kept as reference |
| Mapbox geocoding for places, react-map-gl | Google Places for places; Mapbox Geocoding only for destinations; plain `mapbox-gl` |
| Google + magic link | Google only |
| React Hook Form, Headless UI | Not used — plain React state + zod |
| Bookings, Shares, Proposals, RecentlyViewed tables | Not built. Fixed costs come from expense categories; every expense is logged as shared (solo was removed in v0.2) |
| Travellers propose changes for approval | Not built. Members are read-only |
| Single-use invites bound to traveller slots | Reusable invite links; joining creates a member row |
| 4 trip tabs | 5: Overview · Schedule · Money · Prep · Discover |
| Resend for email | Not used; invites are copy-link |
