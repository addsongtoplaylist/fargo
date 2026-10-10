# Fargo — Landing page implementation plan

> **v2 — 2026-10-09. Approved scope; ready to build on the owner's go.** Builds the page in `LANDING.md` (v5 + reviews), in the voice of `BRAND.md`. Mockup: https://claude.ai/artifact/NY115jaupmfQiSwzXftfQq. **No SQL, no database changes**; the native app isn't affected.

## Owner decisions (2026-10-09)

1. **Ideas screenshot:** shows ideas **without** a "X suggested" name (no second account needed).
2. **Passport screenshot:** the owner's real stats are fine to show.
3. **Analytics:** add Vercel Web Analytics.
4. **Frog spots:** show the dashed placeholders at launch.
5. **Order:** ship **before** the stamp work. *(Updated 2026-10-10: the landing page is versioned on its own as **Landing page v0.1**; the app stays at v0.5.7 and stamps keep v0.5.8.)*

## What changes for people

- **Signed-out visitors** to `/` see the landing page (today they're sent straight to sign-in).
- **Signed-in people** going to `/` land on My trips, as today.
- **The Home Screen app** opens on My trips (`start_url: /trips`).
- **One-time "Add Fargo to your Home Screen" sheet** after the first sign-in.
- **`/privacy` and `/terms`** placeholder pages.

## Things the code already decides

- **Next.js 16.3:** "Middleware" is now called **Proxy** (`proxy.ts`), and the old `src/middleware.ts` still works. This release **keeps `src/middleware.ts`** and only edits its rules. Renaming it to `proxy.ts` is a separate clean-up, not mixed into this release.
- **Route group:** `app/(marketing)/page.tsx` serves `/` (Next's docs use this exact example). The existing `app/page.tsx` (a redirect to `/trips`) must be **deleted**, or the two routes clash.
- **Sign-in rules** live in `src/lib/supabase/middleware.ts` (`isPublicRoute`); `/sign-in`, `/auth`, `/s/` and `/invite/` are already public.
- **`app/manifest.ts`** has `start_url: "/"`.

## Batch 1: Routing (small)

**Tasks**
1. `lib/supabase/middleware.ts`:
   - Add public paths: exactly `/`, plus `/privacy` and `/terms`.
   - Add: **signed in + `/`** → redirect to `/trips` (next to the existing signed-in + `/sign-in` rule).
2. Delete `app/page.tsx`.
3. `app/(marketing)/layout.tsx`: header and footer shells (no bottom nav). `app/(marketing)/page.tsx`: a stub heading.
4. `app/(marketing)/privacy/page.tsx` and `terms/page.tsx`: plain text marked "Placeholder: final text coming soon".
5. `app/manifest.ts`: `start_url: "/trips"`.

**Done when** (tested on the dev server):

| Case | Expected |
|---|---|
| Signed out → `/` | Landing page |
| Signed out → `/trips` | Redirect to `/sign-in` (unchanged) |
| Signed out → `/privacy`, `/terms` | The pages |
| Signed out → `/s/<code>`, `/invite/<code>` | Unchanged |
| Signed in → `/` | Redirect to `/trips` |
| Signed in → `/sign-in` | Redirect to `/trips` (unchanged) |

Signed-out cases run in the browser pane's private window. **Signed-in cases need the owner to sign in in the browser pane.**

## Batch 2: Page sections (large)

**Files:** `app/(marketing)/page.tsx` plus `components/marketing/`:

| Component | What | Notes |
|---|---|---|
| `marketing-header.tsx` | Frog + wordmark · Features · Add to phone · FAQ · Sign in · **Start planning**; ☰ menu on phones | Anchor links; the ☰ menu opens a simple sheet |
| `hero.tsx` | "Every trip starts here." · **Start planning, it's free** · phone + 4 floating cards (2 on phones) · photo frame behind | Server component |
| `feature-switcher.tsx` | "Your trip, your way." with the frog · Planner · Travel buddies · Shared costs · Passport, each with **Try it out** · photo panel per feature | Client component (tabs); on phones, an open list |
| `journey-timeline.tsx` | "One trip, start to finish." three milestones on a track · dashed frog placeholders | Horizontal on desktop, vertical on phones |
| `add-activity-steps.tsx` | 3 steps with small app snippets | Built from real `components/ui` pieces where possible |
| `closing-cta.tsx` | "Every trip starts here." (one line) + frog + wordmark · **Start planning** · photo behind | |
| `install-steps.tsx` | iPhone / Android steps; shows the visitor's phone first | Client component (reads the user agent) |
| `faq.tsx` | 6 questions (BRAND.md wording) using `<details>` | |
| `marketing-footer.tsx` | Frog + white wordmark · Features · Add to Home Screen · FAQ · Sign in · Start planning · Privacy · Terms · © 2026 | No contact line |

**Rules**
- **Look:** v0.8 tokens (`page`, `surface`, `fg`, `line`, `brand`…) and `components/ui/` building blocks (DESIGN.md); Sora; icons from `lucide-react`, as in the app.
- **Copy:** exactly as in LANDING.md (brand pass applied).
- **Buttons:** every "Start planning" and "Try it out" links to `/sign-in`.
- **Placeholders for now:** drawn phones and photo/frog frames, until batch 3.
- **Responsive:** phone first; check 375, 390, 768 and 1280 wide with no sideways scrolling.
- **Accessibility:** real links and buttons, 44 px touch targets, text contrast AA.

**Done when:** the page matches the mockup at phone and desktop sizes, all anchor links scroll to their sections, and type check, lint and build pass.

## Batch 3: Demo trip, screenshots, photos (medium; needs the owner)

> **Demo trip created 2026-10-09** (by Claude, owner-approved): "Singapore long weekend", 13–16 Nov 2026, SGD (1 MYR = 0.30), City break, id `b370518d-e93d-414f-9c25-610c48bcc22f`. Kept for future screenshots; future dates, so it doesn't count in Passport stats.

1. **The owner signs in** in the browser pane and creates **"Singapore long weekend"** (Singapore · S$ · 4 days) as a kept demo trip. This is the agreed exception to "Test trip only".
2. **I fill it in:**
   - **Schedule:**
     - **Day 1:** Jewel Changi, Maxwell Food Centre, Chinatown, Lau Pa Sat
     - **Day 2:** Gardens by the Bay (Cloud Forest), Zam Zam, Haji Lane, Kampong Glam, Spectra light show
     - **Day 3:** Sentosa, Tiong Bahru Bakery, Clarke Quay
     - **Day 4:** Tiong Bahru Market
   - **Ideas:** Night Safari, Old Airport Road hawker crawl
   - **Travellers:** Aina, Daniel, Mei (name-only)
   - **Costs:** about 10 shared, in S$
   - **Checklist:** "Packing"
3. **Capture at 390 px wide:** Overview, Schedule (Day 2), Day map, Prep / Ideas (no suggester names), Money (group split), Passport (owner's real stats). Save as optimised WebP in `public/marketing/`.
4. **Photos:** I propose a **shortlist of Unsplash links** (6 spots: hand holding a phone, Gardens by the Bay, hawker centre, dinner table, passport flat-lay, friends on a trip). **The owner approves the set before anything is downloaded**; then they're resized to WebP.
5. **Swap** the drawn phones and photo frames for the real images. The frog spots stay as dashed placeholders.

**Done when:** no drawn phones remain, and every image has alt text and a fixed size (no layout jump while loading).

**Batch 3 status (2026-10-10):**
- **Demo trip filled in:** 4 travellers, 14 activities with places, Packing list, 2 ideas, 11 costs.
- **Screenshots** (`public/marketing/screen-*.webp`): schedule, prep, money, passport. The Passport capture hid two rows showing test names (on screen only).
- **Photos** (Unsplash licence, no credit required), in `public/marketing/`:

| File | Source |
|---|---|
| `hero-hand.webp` | the schedule screenshot composited onto [Lorin Both's hand + phone](https://unsplash.com/photos/a-hand-holds-up-a-smartphone--IeDL7Ud_e8) |
| `photo-planner.webp` | [Hanna Lazar, Supertrees](https://unsplash.com/photos/supertrees-at-gardens-by-the-bay-in-singapore-f-Wzz9Oq5A4) |
| `photo-buddies.webp` | [Annie Hatuanh, hawker centre](https://unsplash.com/photos/a-group-of-people-sitting-at-tables-in-a-restaurant-KDPchZyOhmk) |
| `photo-passport.webp` | [passport with stamps](https://unsplash.com/photos/passport-with-multiple-ink-stamps-htQznS-Rx7w) |
| `photo-closing.webp` | [friends watching the sunset](https://unsplash.com/photos/friends-watch-the-sunset-together-gDdSNJaBtV0) |

- **Shared costs:** both dinner-table picks (5jf7kzLBILE, 7wx1WznXcow) refused download (likely Unsplash+, paid). It shows a plain green panel until the owner picks another photo.

## Batch 4: "Add to Home Screen" prompt after sign-up (small)

1. `components/install-prompt.tsx` (client), shown on **My trips**:
   - **Show once**, on the first visit after sign-in. A device flag is stored in `localStorage`, wrapped in try/catch.
   - **Skip** if already installed (`display-mode: standalone`, or iOS `navigator.standalone`) or on a computer.
   - **Android:** catch `beforeinstallprompt` and show an **Install** button.
   - **iPhone:** show the Share → Add to Home Screen steps.
   - **Buttons:** "Not now" / "Don't show again".
2. Uses the existing bottom-sheet pattern from `components/ui/`.

**Done when:** the prompt shows once in a normal browser tab, never in the installed app, and never again after "Don't show again".

**Batch 4 status (2026-10-10):** done. `components/install-prompt.tsx` is mounted in `app/(app)/layout.tsx`, so it shows on whichever app screen loads first, not only My trips (returning users with an active trip skip My trips).
- **When it shows:** phones only, after 2 s, never in standalone mode.
- **Buttons:** "Not now" = 7-day snooze; "Don't show again" / "Got it" = never again.
- **Android:** an Install button when `beforeinstallprompt` fires.
- **Tested:** phone (Android user agent) shows it; Not now hides it on reload; desktop doesn't show it. The iPhone steps are code-reviewed only (the pane can't emulate iOS Safari).

## Batch 5: Analytics (small)

1. `npm i @vercel/analytics`; add `<Analytics />` to the **root** layout.
2. **Events:**
   - `start_planning_click` (prop: which button: hero, feature name, closing, header)
   - `signed_up` (first sign-in, sent once from the account-creation path in `getOrCreateAccount`)
   - `install_prompt` (shown / installed / dismissed)
3. **Owner:** turn on Web Analytics in the Vercel project settings (one click).

**Done when:** events show up in the Vercel Analytics dashboard after a test on the deployed site.

**Batch 5 status (2026-10-10):** done, **with a change**. Vercel's Hobby plan doesn't include custom events (Pro only), so:
- `@vercel/analytics` sends **page views only** (`<Analytics />` in the root layout; Hobby includes 50k events a month). No custom `track()` calls, since they'd do nothing on Hobby.
- **Sign-ups** are counted from the database: every first sign-in creates an `accounts` row. In the Supabase SQL editor (read-only):
  ```sql
  select date_trunc('day', created_at)::date as day, count(*) as sign_ups
  from accounts group by 1 order by 1 desc;
  ```
- **Conversion** ≈ sign-ups per day ÷ landing (`/`) visits per day in Vercel Analytics.
- **Owner:** turn on Web Analytics in the Vercel project (Analytics tab → Enable).

## Batch 6: Docs and release (small)

- `TECHNICAL.md` (marketing route group, public paths, manifest), `ROADMAP.md`, `STATUS.md`, `CHANGELOG.md`.
- **No app version bump** (owner, 2026-10-10): CHANGELOG entry "Landing page v0.1"; the app stays 0.5.7 and stamps keep v0.5.8.
- Commit; **push only when the owner says so.**

**After batch 6 (2026-10-10):** the owner wants signed-in people to reach the landing page too.
- **`/home`** serves the same page to anyone, linked from **Profile → About Fargo**, and is not indexed.
- **`/` still sends signed-in people to /trips.**
- **Header and footer:** section links stay on the current page, and show **My trips →** when signed in.

## Testing summary

| Area | How |
|---|---|
| Routing (6 cases) | Dev server; signed-out in a private window, signed-in with the owner |
| Page | 375 / 390 / 768 / 1280 wide; anchor links; switcher; FAQ open/close |
| Install prompt | Normal tab vs installed app; iPhone and Android user agents |
| Analytics | After deploy, on the live site |
| Checks | `npx tsc --noEmit`, `npx eslint src`, `npx next build` after every batch |

## Risks

1. **Redirect rules:** a mistake could lock people out or loop. Covered by the 6-case table in batch 1.
2. **Existing installs:** phones that already added Fargo keep `start_url: /` until re-added. Signed-in users at `/` get redirected to My trips, so it's harmless.
3. **Real data in screenshots:** only the demo trip and the owner's Passport. Nothing from real trips.
4. **Photos:** Unsplash licence allows commercial use without credit; nothing is downloaded before the owner approves the set.

## Owner to-dos

- Sign in in the browser pane for batch 1 (signed-in checks) and batch 3 (demo trip).
- Approve the Unsplash shortlist.
- Turn on Vercel Web Analytics.
- Later: real Privacy/Terms text, contact email, frog illustrations.
