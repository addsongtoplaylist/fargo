# Fargo — Technical Decisions

> **v0.1 — 2026-08-21.** Stack chosen. No code yet — this is the reference for implementation.
>
> Built on the locked decisions in [PRODUCT.md](PRODUCT.md), [EXPERIENCE.md](EXPERIENCE.md), and [DESIGN.md](DESIGN.md).

---

## Stack summary

```
Next.js (App Router) + Supabase (Postgres + Auth + Storage) + Drizzle + Tailwind + Mapbox + Vercel
```

One language (TypeScript) everywhere. One deployment target. One database with auth built in. Free-tier viable for development and early use.

---

## Framework: Next.js (App Router)

Full-stack in one project. Server Components for data-heavy pages (schedule, budget summaries), Server Actions for mutations (log expense, approve proposal), API routes for webhooks or anything custom.

### Why Next.js

- **SSR for shared views** — the public read-only trip link needs to render server-side for link previews (Open Graph) and SEO. Server Components handle this naturally.
- **File-based routing maps to the screen map** — `app/(app)/trips/page.tsx` (My trips), `app/(app)/trips/[id]/schedule/page.tsx` (Schedule tab), `app/s/[slug]/page.tsx` (shared view). The URL structure is the information architecture.
- **React ecosystem** — drag-to-reorder activities (dnd-kit), interactive maps (react-map-gl), and the component patterns from DESIGN.md translate directly to React components.
- **Vercel deployment** — zero-config, preview deployments for testing, edge functions for API routes.

### Why not alternatives

- **Remix** — similar strengths, smaller ecosystem, less community momentum.
- **SvelteKit** — faster runtime, but smaller library ecosystem for maps and drag-and-drop. Higher risk for a solo builder who might need help.
- **Rails/Django + separate frontend** — two codebases, two deployment targets. A solo builder pays the integration tax on every feature.

### Route structure

```
app/
├── (auth)/
│   ├── sign-in/page.tsx           # Landing + sign in
│   └── auth/callback/route.ts     # OAuth + magic link callback
├── (app)/                          # Authenticated layout (bottom nav)
│   ├── trips/page.tsx             # My trips (main)
│   ├── trips/new/page.tsx         # Create trip
│   ├── trips/[id]/
│   │   ├── layout.tsx             # Trip header + trip tabs
│   │   ├── overview/page.tsx
│   │   ├── schedule/page.tsx
│   │   ├── money/page.tsx
│   │   ├── prep/page.tsx
│   │   ├── people/page.tsx
│   │   ├── approvals/page.tsx     # Planner only
│   │   └── settings/page.tsx      # Planner only
│   ├── explore/page.tsx           # Explore (future)
│   └── profile/page.tsx           # Profile + recently viewed
└── s/[slug]/page.tsx              # Shared trip view (public, no auth)
```

---

## Database: PostgreSQL on Supabase

The data is deeply relational — trips have travellers, days have activities, activities have optional costs and places, expenses have shares across travellers. Postgres handles this with foreign keys, joins, and computed columns.

### Why Supabase

- **Managed Postgres** — no ops burden. Backups, scaling, connection pooling handled.
- **Built-in auth** — Google OAuth and magic link are first-party features. Same email via either method resolves to one account (exactly our requirement from PRODUCT.md).
- **Row-level security (RLS)** — the planner-vs-traveller permission model maps to RLS policies. Every trip resource is authorised server-side, as required.
- **Storage** — for booking attachment screenshots (a "Could" feature). Already there, no separate service.
- **Real-time** — subscriptions available if we want live updates later (e.g. travellers see expense approvals in real time). Not needed in MVP, but free to add.
- **Free tier** — generous enough for development and early real use. 500MB database, 1GB storage, 50K monthly active users.

### Why not alternatives

- **PlanetScale (MySQL)** — MySQL is less natural for the complex joins in budget calculations. No built-in auth.
- **Firebase/Firestore** — document model is a poor fit for relational expense-splitting data. Budget calculations across travellers and categories would be painful.
- **Self-hosted Postgres** — unnecessary ops burden for a solo build.

### Schema overview

The full schema is written during implementation. This is the entity map:

```
Account
  ├── id, email, name, avatar, home_currency
  └── auth handled by Supabase Auth (links to auth.users)

Trip
  ├── id, name, destination, start_date, end_date, trip_type, 
  │   local_currency, fx_rate, status (planning/active/completed)
  ├── planner_id → Account
  ├── share_slug (nullable, for public link)
  └── share_visibility (JSON: which sections are visible)

Traveller
  ├── id, trip_id → Trip, display_name, role (planner/traveller)
  ├── account_id → Account (nullable = name-only traveller)
  └── budget_total (MYR, per person)

Activity
  ├── id, trip_id → Trip, date, time, title, notes, category
  ├── cost_local, cost_myr (nullable = no cost), cost_solo_shared
  ├── place_name, place_lat, place_lng (all nullable = no location)
  ├── sort_order (for drag reorder)
  └── expense_id → Expense (nullable)

Booking
  ├── id, trip_id → Trip, type (flight/hotel/tour), provider, 
  │   confirmation_no, start_date, end_date, cost_local, cost_myr
  ├── place_name, place_lat, place_lng (nullable)
  └── expense_id → Expense (auto-created)

Idea
  ├── id, trip_id → Trip, title, link, notes
  └── promoted_to → Activity (nullable)

Checklist
  ├── id, trip_id → Trip, name
  └── items: ChecklistItem[]

ChecklistItem
  ├── id, checklist_id → Checklist, text, done
  └── assigned_to → Traveller (nullable)

Expense
  ├── id, trip_id → Trip, date, title, category
  ├── amount_local, amount_myr, paid_by → Traveller
  ├── solo_or_shared
  └── linked to Activity or Booking (nullable)

Share
  ├── id, expense_id → Expense, traveller_id → Traveller
  └── amount_myr (derived: expense ÷ number of shares)

Proposal
  ├── id, trip_id → Trip, author → Traveller
  ├── target_type (activity/expense/etc), target_id
  ├── proposed_values (JSON), status (pending/approved/rejected)
  └── reason (nullable, for rejections)

RecentlyViewed
  ├── id, account_id → Account, trip_id → Trip (shared trip)
  └── viewed_at
```

### Budget calculation (derived, not stored)

The daily free budget is computed, never stored as a column:

```sql
-- Per traveller:
total_budget                                    -- from Traveller.budget_total
- SUM(booking shares for this traveller)        -- fixed costs (flights + hotel)
- SUM(activity cost shares for this traveller)  -- optional layer, only if non-zero
= free_budget
÷ trip_days                                     -- derived from Trip.start_date, end_date
= daily_free_budget
```

This runs as a database view or a server-side function — not stored, so it's always consistent when bookings or activity costs change.

---

## ORM: Drizzle

Type-safe SQL that stays close to the metal. The budget calculation above is real SQL — Drizzle lets you write it as a query and get TypeScript types back, without fighting an abstraction layer.

### Why not Prisma

- Prisma's query engine adds cold-start latency on serverless (Vercel).
- Drizzle generates zero runtime overhead — it's a query builder, not a client-server architecture.
- For the complex budget aggregation queries, Drizzle's SQL-like API is more natural than Prisma's nested object syntax.

---

## Auth: Supabase Auth

Google OAuth and email magic link are both first-party Supabase Auth features.

### Key behaviours (matching PRODUCT.md requirements)

- **Same email, two methods → one account.** Supabase Auth handles this natively — signing in with Google and then with a magic link on the same email resolves to one user.
- **Long-lived session.** Supabase uses refresh tokens; the session persists across browser restarts.
- **No passwords anywhere.** Google + magic link only. No password field, no hashing, no reset flow.
- **Invite links.** Generated with a unique token, single-use, expiring. Accepting binds the account to the existing Traveller slot. The token is the identity, not the email address.

---

## Maps: Mapbox GL JS

Already decided in PRODUCT.md. Implementation details:

- **Map component:** `react-map-gl` (React wrapper for Mapbox GL JS). One map instance per day on the Schedule tab, showing activity and booking pins connected in schedule order.
- **Geocoding:** Mapbox Geocoding API via `@mapbox/mapbox-sdk`. Powers the search-and-pick for places. Falls back to manual pin drop when search can't find the place.
- **Pin drop:** Long-press on the map to drop a pin manually. Stores lat/lng + a user-entered name.
- **Mapbox token:** stored as an environment variable, proxied through a Next.js API route to avoid exposing it client-side.

---

## Styling: Tailwind CSS

Utility-first CSS. The design tokens from DESIGN.md become a Tailwind theme:

```js
// tailwind.config.ts (excerpt)
theme: {
  extend: {
    colors: {
      ground: '#f7f2ee',
      card: '#ffffff',
      ink: '#2d2a27',
      muted: '#6b6560',
      border: '#e2dad3',
      accent: { DEFAULT: '#1a8a6e', hover: '#157a60', on: '#ffffff', soft: '#e6f5f0' },
      money: {
        ok: { DEFAULT: '#1a7a42', soft: '#e6f4ec' },
        warn: { DEFAULT: '#b8860b', soft: '#fef6e0' },
        over: { DEFAULT: '#c44a4a', soft: '#fce8e8' },
      },
    },
    fontFamily: {
      sans: ['Sora', 'system-ui', '-apple-system', 'sans-serif'],
    },
    maxWidth: {
      column: '480px',
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
    },
  },
},
```

### Component library

No external component library (no shadcn, no Radix primitives). The design is simple enough — cards, buttons, inputs, money rows — that custom components built with Tailwind are faster than configuring and overriding a library. The design system has specific opinions (no shadows, warm cream ground, Sora font) that would fight a generic library's defaults.

**Exception:** `@headlessui/react` for accessible dropdowns, modals, and dialogs — unstyled, so they don't conflict with the design system.

---

## Hosting: Vercel

Next.js on Vercel. Zero-config deployment.

- **Preview deployments** — every git push gets a preview URL. Test on phone before merging.
- **Edge functions** — API routes run at the edge for low latency.
- **Free tier** — sufficient for development and early use. 100GB bandwidth, serverless function invocations.
- **Custom domain** — `fargo.app` (or similar) pointed at Vercel.

---

## Email: Resend

For magic link emails and (later) invite emails. Simple API, generous free tier (100 emails/day), good deliverability.

Supabase Auth uses its own email sending for magic links by default, but Resend can be configured as a custom SMTP provider for branded emails.

---

## Key libraries

| Purpose | Library | Why |
|---|---|---|
| Map | `react-map-gl` + `mapbox-gl` | React wrapper for Mapbox GL JS |
| Geocoding | `@mapbox/mapbox-sdk` | Mapbox Geocoding API client |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` | Activity reorder on schedule |
| Date handling | `date-fns` | Lightweight, tree-shakeable, no moment.js |
| Forms | React Hook Form + Zod | Type-safe form validation |
| Icons | `lucide-react` | Outlined icons, matches DESIGN.md |
| Dialogs/dropdowns | `@headlessui/react` | Accessible, unstyled |
| Currency formatting | `Intl.NumberFormat` | Native, no library needed |

---

## Development setup

```bash
# Prerequisites
node >= 20
pnpm (package manager)

# Create project
pnpm create next-app@latest fargo --typescript --tailwind --app --src-dir
cd fargo

# Install core dependencies
pnpm add @supabase/supabase-js @supabase/ssr drizzle-orm postgres
pnpm add -D drizzle-kit

# Install UI/map dependencies
pnpm add react-map-gl mapbox-gl @mapbox/mapbox-sdk
pnpm add @dnd-kit/core @dnd-kit/sortable
pnpm add @headlessui/react lucide-react
pnpm add date-fns react-hook-form zod @hookform/resolvers

# Install dev tools
pnpm add -D @types/mapbox-gl
```

### Environment variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mapbox
MAPBOX_ACCESS_TOKEN=

# Resend (email)
RESEND_API_KEY=
```

---

## Decisions locked

| Decision | Call | Date |
|---|---|---|
| Framework | Next.js (App Router) — full-stack, SSR for shared views, file-based routing | 2026-08-21 |
| Database | PostgreSQL on Supabase — relational data, managed, free tier | 2026-08-21 |
| Auth | Supabase Auth — Google + magic link, same-email resolution, no passwords | 2026-08-21 |
| ORM | Drizzle — type-safe SQL, low overhead on serverless | 2026-08-21 |
| Maps | Mapbox GL JS via react-map-gl — already decided, cheapest option | 2026-08-21 |
| Styling | Tailwind CSS — design tokens as theme config, no component library except Headless UI | 2026-08-21 |
| Hosting | Vercel — zero-config Next.js deployment, preview URLs, free tier | 2026-08-21 |
| Email | Resend — magic links and invite emails | 2026-08-21 |
| Package manager | pnpm — fast, disk-efficient | 2026-08-21 |
| No component library | Custom components with Tailwind. Design is opinionated enough that a library would fight it | 2026-08-21 |
