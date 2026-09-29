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

## 14. P4 plan — Overview (not started)

**Goal:** Overview looks like the canvas in all its versions. Same data, same rules, same actions. Rows: O1–O16.

| # | Change | Keeps (unchanged logic) |
|---|---|---|
| 4.1 | **Cover header** (no photo until P10 → trip colour + big faint country code, like the "No-photo covers" board): round back (→ My trips) and **gear (planner) / Leave (member)** on it; destination in caps, trip name, and "dates · **Day X of Y** / **In N days** / **Trip ended**". The generic header is hidden on Overview. | Leave-trip confirm + rules |
| 4.2 | **Time & temperature card**: local time + "home" time (home hidden when same timezone), temperature "Right now" | Shown only before/during the trip with a known country; weather follows the Stay |
| 4.3 | **Today card** (during the trip): time · category icon · title · place; **"Now"** tag only (no "Next"); "Schedule" link | Same pick: Now + next 2 timed; falls back to **Tomorrow's plan** / next day with plans; "No upcoming activities planned." |
| 4.4 | **Before the trip**: "N activities planned" + first 3 (date · place) + "+N more", or "No activities yet · Start planning" | Same sorting |
| 4.5 | **After the trip**: Trip summary — Duration, Destination, Activities list, Stay list (new card style, icons not emoji) | Same data |
| 4.6 | **Travellers card**: avatars (crown, dashed = no account, selected ring) + small **Invite** button. Tap **Invite** → panel: **Quick add** (name + Add) and **Share this link** (+ Copy). Tap **a person** → panel: **Name · badge · Remove** and **Name [ ] Save** (no-account only). Only one panel open at a time. | Same actions: add, rename, remove (blocked with expenses), invite link, leave, change owner; planner-only rules |
| 4.7 | Members: tap yourself → **Leave trip** and **Change owner**; note "Only the planner can invite or remove travellers." | Same |
| 4.8 | **"Turn into no account" removed** from the screen (decided). The database function stays, unused. | — |
| 4.9 | Loading skeleton matches the new Overview | — |

**Files:** `overview/page.tsx` (render only), new `overview-header.tsx`, `trip-header.tsx` (skip on Overview), `people/overview-people.tsx` (layout + panels; same actions and conditions), `overview/loading.tsx`. Guard: no `lib/` changes. **Risk: Medium** — the Travellers card has many role/self/no-account conditions; each is kept 1:1 and tested.

**Decisions for the owner**
1. **Shares stepper stays in the tap-a-person panel until P6** moves it to Money → Split shares, so the feature is never missing on the preview. OK?
2. Card titles keep today's wording **"Today's plan" / "Tomorrow's plan"** (canvas said "Today"). OK?
3. **Test data on Test trip:** add 3 activities for today (one earlier, two later) to see the Today card, quick-add a test name then remove it, rename it once — then delete all of it. OK?
4. **"Before the trip" view:** none of your trips is upcoming. May I create a throwaway trip dated next month ("P4 test – upcoming") and delete it after? Otherwise you check it on your next real upcoming trip.

**Tests:** Test trip (during) with the 3 test activities → Now + next; "after" view on **We are Riize** (read-only); "before" view (decision 4); Invite panel (link + copy, quick add + remove); tap-a-person (rename a name-only traveller, remove blocked for someone in expenses → message); member view on your second account (Leave in header, tap self → Leave/Change owner, planner-only note); 375px + desktop.

## 15. P4 log (2026-09-28) — built, awaiting owner test

Decisions: shares stepper kept in the tap-a-person panel until P6 ✅ · titles "Today's plan" / "Tomorrow's plan" ✅ · test data on Test trip ✅ · throwaway upcoming trip ✅.

Built: `overview-header.tsx` (cover header: trip colour + faint country code, back, gear / Leave with the same confirm), `trip-header.tsx` slimmed (skips Overview), `overview/page.tsx` render (all "now/next", tomorrow fallback, timezone and weather logic copied verbatim), `people/overview-people.tsx` (Invite panel vs tap-a-person panel; same actions and conditions; "Turn into no account" removed), `overview/loading.tsx`. `tintFor` exported from `trip-cover.tsx`.

My checks (375px, local → production DB, Test trip only):
- **During:** cover header VN "Day 12 of 99" + gear; time "Local · home 22:38" + 26°C; Today's plan = 12:00 NOW + 2 test activities (23:00, 23:30) with icons ✅
- **Invite panel:** link generated + Copy; Quick add "P4 test person" → toast, count 6, dashed avatar; bar hid while typing ✅
- **Tap a person:** invite panel closes; "NO ACCOUNT · Remove"; Name + Save (disabled until changed); rename → "Renamed" ✅; shares stepper present ✅
- **Remove rule:** Mei (in expenses) → server message "This traveller is part of expenses on this trip, so they can't be removed." — Mei kept ✅; test person removed → back to 5 ✅
- **After:** We are Riize (read-only) — "Trip ended", Duration / Destination / Activities / Stay ✅
- **Before:** throwaway "P4 test – upcoming" (Japan) — JP cover, "In 22 days", "No activities yet · Start planning", then "1 activity planned" list ✅ → **trip deleted** ✅
- **Cleanup:** both test activities deleted; trip list back to the original four ✅
- guard ✅ tsc ✅ lint ✅ build ✅

**Found (existing, not from P4) → fix in P5:** Schedule's drag-and-drop gives each row a screen-reader label ID that differs between server and browser (hydration warning in dev). Harmless to users; fix = give the drag area a fixed `id`.

Still for the owner: member view on the second account; real phone look.

## 16. P5 plan — Schedule + Add/Edit activity

**Goal:** Schedule looks like the canvas; Add/Edit activity becomes the form reference on the new Sheet. Same data, same server actions (`createActivity`, `updateActivity`, `deleteActivity`, `demoteActivity`, `reorderActivities`), same behaviours. Rows: S1–S15 + the Add activity form.

**Build order (one piece at a time, check each at 375px before the next):**
1. **Date strip** — restyled cells (weekday / date / "Day N", selected = blue fill, today = dot), ‹ › arrows kept; **sticky** at the top while the page scrolls; fix scroll-to-today on open (measure relative to the strip, not the page).
2. **Daily budget card** — "Spent on Sat 27 · VND 450,000 of 1,230,000", thin bar, "VND 780,000 left" (red when over); hidden with no budget. Same numbers as today.
3. **Map card** — rounded card, pins in category colours with their number, current stop haloed; Show/Hide toggle and pin popups kept; hidden with no places.
4. **Day card + timeline** — "Today · Saturday, 27 Sep"; rows: time · category icon on a thin line · bold title + place · drag handle (planner). NOW row blue-soft. **Notes and cost removed from rows** (S7, S8 — notes stay in the edit sheet). Empty day uses the new empty state.
5. **Drag** — same library, same handle-only drag, same touch delay; fixed `id` on the drag area (fixes the hydration warning).
6. **Floating +** (planner only) replaces the dashed "Add activity" button.
7. **Add/Edit sheet** on the shared Sheet: title → Time (HH : MM, 15-min) → Date → Place → category chips with icons → Notes; Cancel + Add/Save; edit adds Move to ideas · Delete (same confirms).
8. **Loading skeleton** matching the new layout.

**Risks + checks:** drag on a real phone (R5); sticky strip vs swipe between sections; map resize inside the rounded card (R7); place search dropdown inside the sheet; keyboard on iPhone with the sheet open.

**Test on Test trip only:** add (timed + untimed, with and without a place), edit, change day, move to ideas, delete, reorder; day with/without budget and places; member view read-only (no +, no handles, rows not tappable); clean up afterwards.

## 17. P5 log (2026-09-28) — owner tested ✅

Decisions: empty day reads "No activities yet. Tap + to add one." ✅ · map keeps Show/Hide, no full-screen map ✅ · budget line "left for today" on today, "left" on other days ✅ · time stays HH : MM dropdowns (15-min) ✅.

- ✅ Sticky date strip (restyled cells, today dot, ‹ ›); scroll-to-today now measured from the strip itself. The "Days 1–5" seen at baseline was the strip waiting for the page's scripts to load (slow in local dev) — it centres on today once they run.
- ✅ Daily budget card (spent · of daily free · bar · left / over in red); same numbers.
- ✅ Map card: pins in category colours with their order number, today's current stop haloed; popups + Show/Hide kept.
- ✅ Day card + timeline (time · icon on a line · title + place · handle); NOW row; notes and cost off the rows (S7, S8).
- ✅ Drag reorder (same handle/sensors) — reordered on Test trip, order kept after reload. **Hydration warning fixed** (fixed `id` on the drag area).
- ✅ Floating + (planner only) replaces the dashed button.
- ✅ Add/Edit activity on the shared Sheet: title → Time → Date → Place → chips with icons → Notes; Move to ideas + Delete with confirms.
- ✅ Loading skeleton matches.
- Tested on Test trip, then cleaned up: added "P5 test – museum" (timed, place) + "P5 test – untimed"; reordered; moved museum to the next day; deleted it; moved untimed to ideas; deleted the idea in Prep. Nothing left behind.
- Read-only check on We are Riize: budget card over-budget state, 5-place map, long timeline under the sticky strip.
- Gates: type-check ✅ lint ✅ production build ✅ · logic-file guard ✅ · 375px browser check ✅.
- **Owner to check on a phone:** drag with a finger (hold the ⋮⋮ handle), sticky strip while scrolling, keyboard with the sheet open, member view (no +, no handles, rows not tappable).

## 18. P6 plan — Money (not started)

**Goal:** Money, Your expenses, Settle up, Log/Edit expense and Expense detail in the new design. Same numbers, same database functions (`save_expense`, `delete_expense`, `mark_settled`, `unmark_settled`, `set_my_budget`), no change to `lib/balances` / `lib/split` / `lib/actions`. Rows: M1–M10, U1–U7, E1–E13, X1–X6, O13 (shares stepper moves here).

**Split into two pushes (lower risk, each tested on the preview):**

**P6a — Money page + Split shares**
1. Order: **My budget → Group split → What you paid**; Log expense becomes the floating + (anyone with an account).
2. **My budget:** spent is the big number, "spent of VND 6,000,000", daily free on the right, bar, "VND x left · N days to go" (red when over). Edit budget (RM, ≈ local, explainer) and "Set a budget" unchanged in behaviour.
3. **Group split** (2+ travellers and ≥1 expense, as today): "You get back" / "You pay back" / "All square", amount + ≈ RM, to/from names, **Settle up ›**; keep "You're settled up · N payments still open in the group".
4. **Split shares · Edit** row (planner) → sheet listing every traveller with − n + (same `updateTraveller` call as today). The stepper leaves the Overview person panel.
5. **What you paid:** FIXED / DAILY / SETTLE-UPS, category icon + amount + thin bar, "All expenses · N"; empty "Nothing paid yet."
6. Loading skeleton.

**P6b — sub-screens + sheets**
7. **Log / Edit expense** on the shared Sheet, same field order and rules (amount with currency switch, What for, Paid by, Date, category chips with icons, Split as segmented, Split between with Select all / Clear, per-person fields, status line, Notes; Delete when editing).
8. **Expense detail** (read-only sheet for other people's expenses).
9. **Your expenses:** day groups with totals, rows with category icon, "Logged for X", people count, amount + ≈ RM; settlements get an icon instead of 🤝; + button.
10. **Settle up:** Your payments → Everyone (collapsed) → Settled; Mark as settled / Waiting for X / Unmark with the same confirms.

**Test on Test trip only (re-run the money UAT):** equal / shares / % / amounts splits; logged for someone else; edit + delete; settle + unmark; budget set / edit / over; member view; then remove all test expenses and settlements.

## 19. P6a log (2026-09-28) — built, awaiting owner test

Decisions: two pushes (P6a / P6b) ✅ · Split shares saves on each tap ✅ · "N days to go" (during: days left incl. today; before: "N days trip"; after: hidden) ✅ · budget test on Test trip, restored to none ✅.

- ✅ Order My budget → Group split → What you paid; Log expense is the floating + (the Log expense sheet itself is restyled in P6b).
- ✅ My budget: spent as the hero (red when over), "spent of …", daily free right, bar, "x left / x over · N days to go". Edit (RM + ≈ local + explainer) and Set a budget unchanged.
- ✅ Group split: You get back / You pay back (amount + ≈ RM + names) · You're settled up (N open) · All square; Settle up ›. **Split shares · Edit** (planner, 2+ travellers — shown even before the first expense) → sheet with − n + per traveller (same `updateTraveller`). Shares stepper removed from the Overview person panel.
- ✅ What you paid: FIXED / DAILY / SETTLE-UPS with category icon, amount and a thin bar (share of what you paid); "All expenses · N"; "Nothing paid yet."
- ✅ Loading skeleton.
- Tested on Test trip: Raj shares 1→2→1; budget RM 1,000 (over, red) → RM 5,000 (left, green) → 0 (back to "Set a budget", as before). Read-only: We are Riize (past trip: no days-to-go, All square, fixed + daily groups).
- Gates: type-check ✅ lint ✅ production build ✅ · logic-file guard ✅ · 375px check ✅.

## 20. P6b log (2026-09-29) — built, awaiting owner test

- ✅ **Log / Edit expense** on the shared Sheet — same fields, order and rules; split maths and save code untouched (only imports + render changed). Currency pill, big amount, fields, category chips with icons, Split as segmented, Split between list with Select all / Clear, status line with ✓, Notes; Delete (confirm) when editing.
- ✅ **Expense detail** (read-only sheet): category icon (settle-up icon for settlements), amount + ≈ RM + date, paid by, split list, notes.
- ✅ **Your expenses:** day groups with totals, rows with category icon, "Logged for X · N people", amount + ≈ RM; settle-ups get an icon (no 🤝); floating +.
- ✅ **Money sub-pages header:** the trip header shows "‹ Your expenses" / "‹ Settle up" and goes back to Money (no second back arrow).
- 🔄 **Settle up redesigned (owner, 2026-09-29, Kittysplit-style):** one "How to settle up" list — open payments first, then settle-ups newest first; your rows get a blue bar + bold "You"; everyone sees all settle-ups (was: members only their own); per-person balances ("Everyone") removed. Mark / unmark permissions + confirms unchanged. REDESIGN.md U1/U5/U6 + DESIGN.md updated.
- Tested on Test trip: equal split (300 ÷ 5 = 60), shares split logged for Ali (You 1 : Mei 2 = 100 / 200), % and Amounts warnings with Log disabled, edit 300 → 500, mark Mei settled → unmark (back to original). The two test expenses were deleted outside this session (owner's phone?) — nothing left behind. Read-only: We are Riize settle-up (All settled + history).
- **Not reachable as planner:** Expense detail (opens only for expenses you can't edit) — owner to check with the member account.
- Gates: type-check ✅ lint ✅ production build ✅ · logic-file guard ✅ · 375px check ✅.

## 21. P6c log (2026-09-29) — built, awaiting owner test (with P6b)

- ✅ **Category dropdown** on Log/Edit expense **and** Add/Edit activity (new `ui/category-select.tsx`): "Category" label, coloured category icon that follows the choice, native select with the same 7 options.
- ✅ **Long traveller lists:** split status line pinned in the sheet footer above Cancel / Log; Split between rows 48 → 44px; one scroll for the whole sheet. Checked with 10 rows (5 demo rows added on screen only, nothing saved).
- Docs: DESIGN.md form reference + REDESIGN.md A4 / E5 / E9 updated.
- Gates: type-check ✅ lint ✅ production build ✅ · logic-file guard ✅ · 375px check ✅.
