# Fargo — Redesign implementation plan

> **v0.1 — 2026-09-28.** How we build the v0.8 design safely. Design: [DESIGN.md](DESIGN.md) + [canvas](https://claude.ai/artifact/Sjur61seR63um25VMXhAhs). What each screen must still do: [REDESIGN.md](REDESIGN.md). **Nothing here starts until the owner approves this plan.**

---

## 1. What changes and what doesn't

| Changes (UI) | Does **not** change |
|---|---|
| Colours, type, shapes, icons (`globals.css`, components) | Database tables, rules (RLS), database functions |
| Navigation: top tabs → floating bottom bar; headers; + button | Server actions (`lib/actions/*`) — all reads/writes |
| Layout of every screen per the canvas | Money maths (`lib/split.ts`, `lib/balances.ts`), budget, caching |
| Delete the unused People page | Permissions (planner vs member), invite/claim rules |

**Two exceptions that touch data, isolated in their own phases:**
- **Cover photo upload** — new Storage bucket + one nullable field on `trips` (SQL; owner runs it).
- **Invite picker hides counts** — UI only (the data is still sent; we just don't show it).

**Guard:** every phase's diff is checked — if it touches `lib/actions/`, `lib/split.ts`, `lib/balances.ts` or `supabase/` outside the photo phase, it stops for review.

## 2. What the codebase looks like (measured 2026-09-28)

- **82 screen/component files, ~9,000 lines.** The redesign touches most of them.
- **Colour/shape classes are everywhere:** `text-muted` 241 uses, `text-ink` 163, `border-border` 145, `text-accent` 125, `rounded-lg`/`md` 161. Changing a token's value repaints **every screen at once**.
- **Emoji in 14 files** (54 uses) — categories, errors, empty trips, map pins.
- **Fixed/floating layers in 15 files** (sheets, toasts, dialogs, bottom nav, map). Three sheets pad themselves for today's 56px bottom nav.
- **No automated tests.** Everything is verified by type-check, lint, build and hands-on testing.
- **Branch previews work on Vercel** (7 previous preview deploys) — we can test on a real URL before production.

## 3. How we work (the safety net)

1. **One branch: `redesign`.** Production (`main`) is untouched until the very end. Urgent fixes can still ship on `main`; `redesign` pulls them in.
2. **Every phase is tested on the branch's preview URL** — on your phone, as planner and as member — before the next phase starts.
3. **One release to production at the end** (v0.5.0), after a full regression test. Users never see a half-redesigned app. **Rollback = one revert** of the merge.
4. **Before/after proof:** before each phase I screenshot today's screens; after it, the new ones next to the canvas board.
5. **Checklist:** each phase ticks its rows in [REDESIGN.md](REDESIGN.md). A phase isn't done with any row unticked.
6. **Gates before every push to the branch:** type-check, lint, production build (never while the dev server runs), my browser check, diff guard (§1).
7. **Pushing:** you approve each push, as today — including branch pushes for previews.

## 4. Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Changing token values repaints everything at once** — old layouts with new colours/radii look broken mid-way | High | Medium | Add **new** tokens beside the old ones; screens switch to the new ones in their own phase. Old tokens removed only at the end. |
| R2 | **Navigation rebuild breaks moving around** — bottom bar overlapping sheets, toasts, map, keyboard; safe areas; back behaviour; swipe | High | High | Its own phase (P2) with a device matrix: iPhone Home Screen app, iPhone Safari, Android Chrome, desktop. Sheets' bottom padding and layer order reviewed together. |
| R3 | **A feature quietly disappears** | Medium | High | REDESIGN.md rows per phase; both roles tested; before/after screenshots. |
| R4 | **Money logic accidentally changed** while restyling forms | Low | Very high | Logic files are off-limits (guard); Log expense UAT cases from the group-expenses UAT re-run in P6. |
| R5 | **Drag-to-reorder breaks** with the new timeline (touch sensors, sticky strip, handle) | Medium | Medium | Kept the same library and handle pattern; tested on a real phone in P5. |
| R6 | **Sticky date strip / scroll quirks on iPhone** | Medium | Low | Tested in the iPhone Home Screen app specifically. |
| R7 | **Map card** clipping/resizing inside the rounded card | Low | Low | Map resize on layout; checked in P5. |
| R8 | **Sign-in fails on the preview URL** (Google/Supabase only allow listed addresses) | High | Blocks testing | **Before P1:** you add the preview address to Supabase's allowed redirect URLs (I'll give the exact line). |
| R9 | **Photo upload** — iPhone HEIC photos, big files, storage rules, who can see | Medium | Medium | Separate phase **after** the redesign ships (P10); fallback covers work without it. |
| R10 | **Native app** shares the database | Low | Medium | Only P10 touches the DB (nullable field, new bucket) — checked against `fargo-app` before SQL. |
| R11 | **Branch drifts from `main`** during a long build | Medium | Low | Merge `main` into `redesign` at the start of every phase. |
| R12 | **My consistency** — design details drift from the canvas | Medium | Medium | Each phase starts by listing its canvas boards + rows; ends with side-by-side screenshots you approve. |

## 5. Phases

Effort: **S** ≈ one short session · **M** ≈ one session · **L** ≈ two sessions. Every phase ends with the gates in §3 and your OK on the preview.

| Phase | What | Effort | Risk | You test on the preview |
|---|---|---|---|---|
| **P0 · Setup** | Create `redesign` branch; preview URL + sign-in allow-list; **baseline screenshots of every screen today**; UAT checklist per phase | S | Low | Sign in works on the preview |
| **P1 · Building blocks** | New tokens (beside old), shared components: card, button, chip, segmented control, field, category icon, avatar, sheet, dialog, toast, empty state, skeleton, FAB, bottom bar. Shown on a **hidden preview-only page** — no screen changes yet | M | Low | The components page looks like the canvas tokens board |
| **P2 · Navigation shell** | Floating bottom bars (home + trip), new headers, remove top tabs, swipe kept, sheets/toasts/map layering, keyboard hiding, safe areas; delete People page | L | **High** | Move through every section and sub-page on 3 devices; open every sheet; swipe; back buttons; member view |
| **P3 · My trips** | Cards, past rows, empty state, **no-photo covers** (colour + country code) | M | Low | Your real trip list (read-only), empty state |
| **P4 · Overview** | Photo/colour header, time & temperature, Today / Tomorrow / before / after, Travellers (Invite panel, tap-a-person, member view) | L | Medium | All 3 trip states; invite; rename; remove blocked with expenses; member leave/change owner |
| **P5 · Schedule** | Date strip (sticky), daily budget card, map card, timeline, drag, + button, Add/Edit activity sheet | L | **High** | Add/edit/move/delete/reorder on Test trip; days with/without budget and places; member read-only |
| **P6 · Money** | My budget, Group split + Split shares sheet, breakdown groups, Your expenses, Log expense, Expense detail, Settle up | L | **High** | Re-run the money UAT cases (split types, logged-for-others, settle/unmark, budget) on Test trip |
| **P7 · Prep + Discover** | Checklists, ideas, Discover, Spot detail, Add to schedule | M | Medium | Tick/add/rename/delete; schedule an idea; search + add a spot |
| **P8 · Everything else** | Sign in, Invite (names only), Shared trip, New trip, Trip settings (share only), Profile, error/404/offline, Explore placeholder | M | Medium | Invite with a second account; shared link signed-out; create + delete a test trip |
| **P9 · Regression + release** | Remove old tokens/components, full pass of every REDESIGN.md row, both roles, 3 devices → merge to `main` → **v0.5.0** | M | Medium | Full checklist; then production smoke test |
| **P10 · Cover photo upload** (after release) | Storage bucket + field (SQL), upload on New trip / Trip settings, resize on phone, remove photo | M | Medium | Upload from iPhone (HEIC) and Android; shared page shows it; member can't change it → **v0.5.1** |

**Order logic:** P1–P2 first because every screen depends on them; P5–P6 (highest risk) come after the easier P3–P4 so the building blocks are proven first; photo upload is last and separate because it's the only data change.

**Rough total:** ~12–14 sessions before release, plus P10.

## 6. Decisions (owner, 2026-09-28)

1. **One release at the end** — v0.5.0 after P9.
2. **OK to push the `redesign` branch** after each phase for preview testing (production untouched).
3. **Owner adds the preview address** to Supabase's allowed redirect URLs in P0.
4. **Photo upload after the release** — P10 → v0.5.1.

## 7. Test environment

- **P0–P9 (UI only):** the `redesign` branch's **Vercel preview is the UAT server**. It uses the production database — same rule as always: write only to **Test trip (Vietnam)**; real trips read-only. Safe because these phases change no data structures.
- **P10 and future database work** (photo storage, personal checklists, Explore): set up a **new staging Supabase project** first (the old one, `lpiadmuojfbktajvcfzy`, is gone), so new SQL is tried there before production.

## 8. P0 log (2026-09-28)

- ✅ Branch `redesign` pushed; preview **https://fargo-git-redesign-songs-projects-50dc68e0.vercel.app** — Google sign-in works (Supabase redirect URL added by owner).
- ✅ Baseline ("before") captured in the browser pane at 375px on Test trip: My trips, Overview, Schedule, Money, Your expenses, Settle up, Prep, Discover, Trip settings, Profile, New trip. (Captured in-session, not saved as files.)
- **Baseline vs canvas — follow today's wording/controls in the build:**
  - Discover's first category is **"Bites"** (not "Dining"); start state reads **"Find your next meal"**.
  - Profile: **Budget is a dropdown** (canvas drew chips) — keep a dropdown unless the owner prefers chips; Home country shows a **flag** in the dropdown; Sign out is a red outlined button.
  - New trip: the rate field is labelled **"1 MYR ="**, beside Local currency.
  - Trip settings: Base city field has an inline **"Place"** label.
- **To check during P5:** on the baseline, Schedule showed "Today" but the date strip displayed Days 1–5 (today is Day 12) — confirm whether the strip fails to scroll to today on a real phone (possible existing bug; not caused by the redesign).

## 9. P1 log (2026-09-28)

- ✅ New tokens **beside** the old ones in `globals.css` (`page`, `surface`, `fg`, `fg-muted`, `fg-faint`, `line`, `brand*`, `cat-*`, `rounded-card/field/bar/sheet`, `shadow-float/fab/dialog`). No existing screen uses them yet → no visual change to the app.
- ✅ Building blocks in `components/ui/`: Card/CardHeader/Eyebrow, Button/TextButton, Chip, Segmented, fields (FieldRow/FieldStack), CategoryIcon (+ `lib/category-style.ts`), Avatar/AvatarStack, Sheet, Confirm, ToastCard, Empty, Bone, Fab, TabBar.
- ✅ Preview-only page **`/dev/ui`** (404 in production; delete in P9).
- 🐛 **Found + fixed:** the offline service worker also ran in local dev and served **stale CSS/JS** (cache-first, dev file names don't change). Now it never runs in dev and removes old registrations. Production unchanged. Likely the real cause of the earlier "stale Money tab highlight" glitch.
- Gates: type-check ✅ lint ✅ production build ✅ (dev stopped) · logic-file guard ✅ (no changes to `lib/actions`, `split`, `balances`, `supabase/`) · browser check at 375px ✅ (colours, type, buttons, chips, segmented, fields, icons, avatars, sheet over bar/FAB, confirm on top, toasts, empty, skeleton).

## 10. P2 plan — Navigation shell (not started)

**Goal:** replace how you move around, without changing any screen's content. After P2 every screen still shows today's cards and forms, inside the new frame.

### In scope

| # | Change | Files | Risk |
|---|---|---|---|
| 2.1 | **Home bar** (My trips `Map` · Explore `Compass` · Profile `User`) replaces today's bottom nav on My trips, Explore, Profile | `(app)/layout.tsx`, `bottom-nav.tsx` → uses `ui/tab-bar` | Medium |
| 2.2 | **Trip bar** (Overview · Schedule · Money · Prep · Discover) on every trip section + Money sub-pages (Your expenses, Settle up keep **Money** active) | `trips/[id]/layout.tsx` | **High** |
| 2.3 | **Remove the top tab row** | `trip-tabs.tsx` (deleted) | Medium |
| 2.4 | **New trip header**: round back (→ My trips) · trip name caption · section title; planner gear / member Leave on the right (Overview gets the photo header in P4) | `trip-header.tsx` | Medium |
| 2.5 | **Swipe between sections** kept; still ignored on the date strip and chip rows | `swipe-tabs.tsx` (unchanged logic) | Low |
| 2.6 | **Bottom space** so the last item clears the floating bar (~130px + phone safe area) | layouts | Low |
| 2.7 | **Layering fix:** Spot detail + Add to schedule move above the bar (z-50 → z-60); re-check the 3 sheets' bottom padding | `bites/spot-detail.tsx`, `bites/add-to-schedule.tsx`, 3 sheets | Medium |
| 2.8 | **Bar hides while typing** (keyboard open) so it never sits on the keyboard | `ui/tab-bar.tsx` | Medium |
| 2.9 | **New look for toasts + confirm dialogs** everywhere (same behaviour) | `toast.tsx`, `confirm-dialog.tsx` → `ui/*` | Low |
| 2.10 | Loading skeleton for trip pages matches the new frame | `trips/[id]/layout.tsx` | Low |
| 2.11 | **Delete the unused People page** + its component | `trips/[id]/people/`, `people/people-list.tsx`, one `revalidatePath` line | Low |
| 2.12 | Page background → new `page` grey (`#F3F5F9`, barely different) | `layout.tsx` body | Low |

### Out of scope (later phases)
Screen content (cards, lists, forms), the + button, Overview photo header, sticky date strip, category icons in lists, photos.

### Decisions for the owner
1. **Home bar only on My trips, Explore, Profile** — hidden on New trip (it has its own back). OK?
2. **Trip bar hidden on Trip settings** (a full-screen form with back + Save). OK?
3. **Explore tab visible now**, opening today's "Explore is on its way" page until Explore ships. OK?
4. **Back arrow always goes to My trips** from any section (as today). OK?
5. **Phone status-bar colour** (Home Screen app): today accent blue `#0085D9`; switch to the page grey so the top blends in? (Recommended.)

### Tests (preview, before push approval)
- **Every route** reaches and highlights correctly: 5 sections, Your expenses, Settle up, Settings; My trips, Explore, Profile, New trip.
- **Every sheet/pop-up** opens fully above the bar with its buttons reachable: Add/Edit activity, Log/Edit expense, Expense detail, Spot detail, Add to schedule, confirm dialogs, checklist ••• menu, toasts.
- **Typing** in a sheet / Trip settings / Profile: bar hidden, nothing covered.
- **Swipe** left/right through all 5 sections; swiping the date strip scrolls days instead.
- **Member view** (second account): Leave trip in header; read-only screens.
- **Devices:** iPhone Home Screen app (notch + home bar), iPhone Safari, Android Chrome, desktop browser.
- **Shared trip page and sign-in/invite** unaffected (no bars).

### Rollback
One commit on the branch → revert it; production untouched.

## 11. P2 log (2026-09-28) — built, awaiting owner test

Decisions: home bar only on My trips / Explore / Profile ✅ · trip bar hidden on Trip settings ✅ · Explore tab visible (placeholder) ✅ · back arrow → My trips (kept the ← arrow; a house or map icon would clash with the bar's My trips) ✅ · status-bar colour → page grey ✅.

Built: home bar + trip bar (`ui/tab-bar`, `bottom-nav.tsx`, new `trip-bar.tsx`), top tab row deleted, new trip header (round back, trip caption, section title; gear/Leave on Overview only), bottom space for the floating bar, Spot detail + Add to schedule raised above the bar (z-60), bar hides while typing, toasts + confirm dialogs in the new look (same props), new trip-page skeleton, People page deleted, page background + status bar → grey. The unused `revalidatePath(.../people)` line in `lib/actions/trip.ts` is left as is (harmless; guard keeps actions untouched).

My checks (375px + desktop): home bar on My trips/Explore/Profile, none on New trip ✅ · trip bar on all sections, **Money stays active on Settle up** ✅ · none on Trip settings ✅ · Log expense sheet fully above the bar, Cancel/Log reachable ✅ · confirm dialog on top; cancelled (nothing marked) ✅ · bar hides while typing (real tap) and returns ✅ · swipe Overview → Schedule ✅ · shared page `/s/…` has no bars ✅ · desktop bar centred ✅ · guard ✅ tsc ✅ lint ✅ build ✅.

Still for the owner on the preview: iPhone Home Screen app (notch + home bar), iPhone Safari, member view (Leave trip), Spot detail / Add to schedule (need a Discover search), the checklist ••• menu. Android not available — covered by emulation only.

## 12. P3 plan — My trips (not started)

**Goal:** My trips looks like the canvas (Mozi-style cards). Same data, same links, same auto-jump into an active trip. Rows: H1–H11.

| # | Change | Keeps |
|---|---|---|
| 3.1 | Header = "My trips" title only; **New trip → floating +** | — |
| 3.2 | **Current trip card** (first active): 104px cover, name, "destination · dates", filled **"Day X of Y"** chip, traveller avatars, blue outline | Links to **Overview** (as today) |
| 3.3 | Other active trips (rare): same card | Links to **Schedule** (as today) |
| 3.4 | **Upcoming cards**: 92px cover, soft **"In N days"** chip ("In 1 day"), avatars | Links to Overview |
| 3.5 | **Past trips**: heading + compact rows in one card — 52px cover, name, destination · dates, › | Links to Overview; order unchanged |
| 3.6 | **Empty state**: map icon, "Where to?", same text, **New trip** button | — |
| 3.7 | **No-photo covers** (all trips until P10): one of 8 soft colours fixed per trip (from its ID) + **2-letter country code**; unknown country → map icon | — |
| 3.8 | Removed per decisions: trip type chip, trip length, month headings, "See all", past-trip traveller count | — |
| 3.9 | Unchanged behaviour: auto-jump into an active trip's Schedule on open (`/trips` without `?noauto`), date format ("17 Sep – 24 Dec 2026"), sorting | ✅ |

**Country code without a database change:** destinations are country names (the destination search is country-only), so the app turns the name into a code with the browser's built-in country list (e.g. "Vietnam" → VN). Older text like "Hanoi, Vietnam" uses the last part. No match → map icon. In **P10** (which already changes `get_my_trips` for the cover photo) the function will also return the stored country code, and this lookup can retire.

**Files:** `trips/page.tsx` (render only — data + day maths untouched), new `trip-card.tsx`, `trip-cover.tsx`, `lib/country-code.ts`; `empty-trips.tsx` restyled; delete `hero-trip-card.tsx`, `compact-trip-card.tsx`, `traveller-avatars.tsx` (only used here). **Risk: Low.** No data or logic changes.

**Decisions for the owner**
1. **Past trips: no traveller avatars** (canvas) — OK, or keep small avatars?
2. **Floating + hidden on the empty screen** (it already has a big New trip button) — OK?
3. **Country code from the destination name now** (no SQL), stored code in P10 — OK?

**Tests:** your real trip list (read-only): current card + Day X of Y, Test 123 (second active) → Schedule, past trips → Overview; + → New trip; opening `/trips` still jumps into the active trip; empty state (checked in the browser by simulating no trips — no data changed); covers show VN / MY / SG in different colours; 375px + desktop.

## 13. P3 log (2026-09-28) — built, awaiting owner test

Decisions: no avatars on past trips ✅ · floating + hidden on the empty screen ✅ · country code from the destination name (no SQL), stored code in P10 ✅.

Built: new `trip-card.tsx` (TripCard + PastTripRow), `trip-cover.tsx` (8 colours fixed per trip + country code / map icon), `lib/country-code.ts`, restyled `empty-trips.tsx`, `trips/page.tsx` render (data, auto-jump and day maths unchanged). Deleted `hero-trip-card`, `compact-trip-card`, `traveller-avatars`.

🐛 Found + fixed during the check: the country list includes **retired codes** (VD = old "North Vietnam") so Vietnam first showed "VD". Retired codes are now skipped; added aliases (Türkiye/Turkey, Hong Kong, Myanmar/Burma, USA, UK…).

My checks (375px): Test trip = VN, current card with "Day 12 of 99" + outline → Overview ✅ · Test 123 (2nd active) "Day 4 of 6" → Schedule ✅ · past trips SG / VN rows → Overview ✅ · + → New trip ✅ · opening `/trips` still jumps into the active trip's Schedule ✅ · unknown country → map icon, KR in its own colour, empty "Where to?" screen (on `/dev/ui`) ✅ · guard ✅ tsc ✅ lint ✅ build ✅.
