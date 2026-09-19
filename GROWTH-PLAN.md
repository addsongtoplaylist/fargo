# Fargo Growth Plan

> Living document — strategy for distribution, user growth, and platform decisions.
> Last updated: 19 Sep 2026

---

## 1. Why PWA (not native)

Fargo ships as a Progressive Web App. This is a deliberate choice, not a compromise.

**Reasons:**

- **Solo dev, one codebase.** A native app means maintaining two platforms (or a full rewrite to React Native/Expo). Every feature ships once, not twice.
- **Pre-product-market-fit.** We're still learning what Fargo needs to be. Iteration speed > native polish. The Vietnam trip (Sep 2026) generated 5+ UX fixes in one session — that feedback loop must stay fast.
- **Zero friction to try.** Users tap a share link → they're in. No App Store download, no 200MB install. This matters for the invite-based growth loop.
- **Cross-platform from day one.** Travellers use a mix of iOS and Android. PWA works on both without separate builds.
- **PWA covers the use case.** Installable to home screen, offline-capable (service worker), push notifications (web push), full-screen mode. The core experience — planning, scheduling, budgeting — doesn't need native APIs.

**What we give up:**

- App Store / Play Store discoverability
- Native push notification reliability (especially iOS)
- Some native APIs (NFC, background location, advanced camera)
- The "it's a real app" perception some users have about App Store apps

---

## 2. When to go native

Not a date — a set of triggers. When **two or more** of these fire, start the native build:

| Trigger | Threshold |
|---------|-----------|
| Users asking "is this on the App Store?" | 10+ separate requests |
| Monthly active users | 100+ |
| PWA limitation blocks a core feature | e.g. reliable offline sync, background location tracking |
| Revenue or funding | Enough to sustain a second codebase (or hire) |
| Invite conversion rate plateaus | Users drop off at the "add to home screen" step despite education |

**First native step:** Consider a thin wrapper (Capacitor or TWA) before a full rewrite. Gets App Store presence with days of work, not months. Full native (Expo) only when the wrapper hits its limits.

---

## 3. Distribution — Intro Page (future milestone)

The current landing page is a login screen. Users who receive a share link see a Google sign-in button with no context — no pitch, no screenshots, no reason to continue.

**Goal:** A public intro page at `/` that converts visitors into users.

### Content sections:

- **Hero** — one-liner + "Start planning" CTA (Google sign-in built into the page, not a separate `/login` route)
- **Feature showcase** — 3-4 screenshots: schedule view, budget with local currency, discover/bites, trip sharing
- **How to install** — platform-specific PWA install instructions with visuals (see section 5)
- **What's new** — update log / changelog feed showing recent releases
- **Footer** — about, contact, maybe a "Built by Song" personal touch

### Auth flow:

- `/` — public intro page, no auth required
- "Start planning" button → Google sign-in → redirect to `/trips`
- Already signed in + visit `/` → show "Go to my trips" button (or auto-redirect)
- All app routes (`/trips/*`) require auth → redirect to `/` if not signed in

### Not in scope for intro page:

- Separate marketing site or subdomain (one codebase, one deploy)
- Blog or content marketing (too early)
- Pricing page (Fargo is free for now)

---

## 4. Ops Dashboard (`/backstage`)

A lightweight internal dashboard to track usage without building a full admin system.

### Access control:

- Email allowlist via environment variable: `FARGO_OPS_EMAILS=songyuen95@gmail.com`
- Middleware checks session email against the list
- No user role system needed until there's a team
- Unauthenticated or unauthorised visits → 404 (don't reveal the route exists)

### Dashboard content (v1):

- **User count** — total accounts, recent signups (last 7 / 30 days)
- **Trip stats** — total trips, active vs completed, avg travellers per trip
- **Activity stats** — total activities, most-used categories
- **Recent signups** — list with name, email, signup date
- **Data health** — orphaned records, trips with no activities

### Not in scope:

- User management (edit/delete users) — use Supabase dashboard
- Feature flags or config — use env vars
- Analytics / charts — just numbers for now

---

## 5. PWA Install Education

Users don't know what a PWA is. They need to be taught to "install" it — and the flow is different on iOS vs Android.

### When to prompt:

- **After first trip creation** — they've experienced value, now offer the install
- **On the invite landing page** — after a friend joins via share link
- **NOT on first visit** — they haven't seen the app yet, don't ask

### iOS instructions:

1. Tap the **Share** button (bottom bar in Safari)
2. Scroll down and tap **"Add to Home Screen"**
3. Tap **Add**

> Note: Only works in Safari. Chrome/Firefox on iOS don't support PWA install.

### Android instructions:

- Use the native `beforeinstallprompt` API when available (Chrome shows a native install banner)
- Fallback: manual instructions — tap the **⋮ menu** → **"Add to Home Screen"** or **"Install app"**

### Implementation:

- Build instructions into the intro page (section 3) with device-specific visuals
- In-app prompt component: dismissible card that appears at the right moment
- Detect platform (iOS Safari vs Android Chrome) and show the relevant instructions
- Track dismissals — don't show again for 7 days after dismiss

---

## Growth Loop

The core growth engine is trip sharing:

```
You plan a trip
  → invite friends as travellers (share link)
    → friends open the link, see intro page, sign up
      → friends use Fargo during the trip
        → friends plan their own trip
          → invite their friends → repeat
```

**Key metric:** invite-to-signup conversion rate. Every friction point in this loop costs users.

**Priority order:**
1. Make the share/invite flow smooth (intro page + onboarding)
2. Make the trip experience good enough that travellers want to plan their own trip
3. PWA install education (retention — they come back if it's on their home screen)
4. Ops dashboard (understand what's happening)
5. Iterate based on data
