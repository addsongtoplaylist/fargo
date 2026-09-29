# Fargo — Design System

> **v0.8 — 2026-09-28.** UI redesign. Trip sections move to a floating bottom bar; planner-uploaded cover photos (colour + country code when there's none); cooler ink, darker accent, rounder cards; category icons replace emoji; one main thing per screen; floating **+** for the main add action. Every screen is drawn on the [redesign canvas](https://claude.ai/artifact/Sjur61seR63um25VMXhAhs); the per-screen feature checklist is [REDESIGN.md](REDESIGN.md).
>
> **v0.7 — 2026-09-26.** Design review: type scale, shadow rule and status colours matched to the app. Add activity became the form reference; generic-icon empty states.
>
> **v0.6 — 2026-08-27.** Electric Blue accent; Bright Cyan reserved for mascot assets; sign-in shows mascot + wordmark.

---

## Principles

1. **One main thing per screen.** Each screen leads with one clear element (a trip card, today's plan, the budget number); everything else steps down in size and weight.
2. **Show only what the current tap needs.** Panels open in place for one job at a time — never two text boxes for different jobs side by side. Keep *add* and *manage* apart (e.g. Travellers: **Invite** vs **tap a person**).
3. **Photos carry the emotion, the rest stays calm.** Destination photos on trip cards and the Overview header; white cards on a cool grey ground everywhere else. No photos inside lists (Schedule, Prep).
4. **Quiet by default.** No explanatory notes on screens, no decorative chips (trip type and trip length are gone from cards). Numbers and titles do the talking.
5. **Same features, new look.** The redesign never removes a feature without the owner's OK — see [REDESIGN.md](REDESIGN.md).

---

## Colour

### Core palette

| Token | Hex | Usage |
|---|---|---|
| `ground` | `#F3F5F9` | Page background |
| `card` | `#FFFFFF` | Cards, sheets, bottom bar |
| `ink` | `#172033` | Primary text — cool navy (replaces warm `#2d2a27`) |
| `muted` | `#5B6475` | Secondary text, labels, inactive icons (5.9:1 on white) |
| `faint` | `#8A93A3` | Non-essential only: drag handles, delete ×, version line — never text a user must read |
| `border` | `#E4E8EF` | Dividers, field borders |
| `accent` | `#0071BC` | Primary actions, active tab, links — darker than v0.7 (`#0085D9`) so small blue text passes AA |
| `accent-hover` | `#005A96` | Pressed / hover |
| `accent-on` | `#FFFFFF` | Text on accent |
| `accent-soft` | `#E3F0FA` | Selected states, active tab pill, secondary buttons, "Now" row |

### Money states (unchanged meaning)

| Token | Hex | Usage |
|---|---|---|
| `money-ok` / `-soft` | `#1A7A42` / `#E6F4EC` | Owed to you, under budget, "covered" split line, settled ticks |
| `money-warn` / `-soft` | `#B8860B` / `#FEF6E0` | Split not fully allocated |
| `money-over` / `-soft` | `#C44A4A` / `#FCE8E8` | Over budget, destructive actions |

### Category colours

Each category has a soft circle and an icon colour. Used for category icons, breakdown bars and map pins.

| Category | Soft bg | Icon | Lucide icon |
|---|---|---|---|
| Stay | `#EEE8FB` | `#6446C2` | `BedDouble` |
| Food | `#FDEEE3` | `#A9531A` | `Utensils` |
| Transport | `#E2F4F2` | `#1F7068` | `Car` |
| Activities | `#E3F0FA` | `#0071BC` | `Landmark` |
| Shopping | `#FBE7EF` | `#A8365F` | `ShoppingBag` |
| Flights | `#E4EEFB` | `#2D5DA8` | `Plane` |
| Other | `#EEF0F4` | `#4A5264` | `Package` |
| Settle-ups | `#E6F4EC` | `#1A7A42` | `ArrowRightLeft` |

### Rules

- **Money colours are semantic.** Green/amber/red only for money meaning or destructive actions — never decoration.
- **Accent is never used for money health.** Healthy budget bars use accent (progress), not green; green means "owed to you / covered / settled".
- **Contrast:** body and label text ≥ 4.5:1. `faint` is for icons and non-essential text only.
- **Hybrid brand rule (unchanged):** accent blue for UI; Bright Cyan `#22B8E0` only in mascot/logo assets.
- **Retired:** `trip-blue-1/2`, `trip-green-1` (trip cards now use photos), `navy` tokens.

---

## Branding

Unchanged from v0.7: logo `app/public/logo.png`, mascot `app/public/mascot.png`, favicons/app icons from `branding/Mascot-blue-bg.png`. Mascot appears on **Sign in** only (and app icon/splash) — not in everyday UI or empty states.

---

## Cover photos

- **Source: the planner's own photo.** No stock photos — Explore will show many people's trips, and shared stock images would make them look alike.
- **Upload (planner only):** optional **Add cover photo** on New trip; **Change / Remove cover photo** in Trip settings. Resized on the phone (~1600px wide) before upload; stored in Supabase Storage. Visible to the trip's travellers, the shared trip page, and Explore later.
- **Where it shows:** My trips cards (thumbnail beside the text — 104px current / 92px upcoming / 52px past), Overview header (300px, full-bleed), invite card (130px).
- **Overview header text sits on a bottom-up dark gradient** (`rgba(12,18,32,0.82)` → transparent over the bottom ~190px). Nowhere else puts text on a photo.

### No photo (interim — option A)

- Each trip gets **one of 8 soft colours**, fixed per trip (picked from the trip ID, never changes), so a grid of photo-less trips still looks varied.
- **Thumbnail:** the colour + the **2-letter country code** in the deeper shade (e.g. "JP", "VN").
- **Overview header:** shorter (190px), same colour, trip name in `ink` (no gradient), the country code huge and faint in the corner.

| Soft | Deep | | Soft | Deep |
|---|---|---|---|---|
| `#DCEBFA` | `#0B5C94` | | `#FBE4EC` | `#8E2D51` |
| `#DDF3EA` | `#1A6A4B` | | `#F6EEDC` | `#7A5A12` |
| `#FDE8D8` | `#8F4414` | | `#DDF1F3` | `#1B6159` |
| `#ECE6FB` | `#553AA8` | | `#E6EAF1` | `#3B4556` |

**Later:** once Fargo has an **identity guideline with an illustration library**, the no-photo cover switches to **template illustrations** (the same slot, so it's a swap, not a redesign).

---

## Typography

**Sora** (unchanged), `font-family: 'Sora', system-ui, -apple-system, sans-serif`. All numbers use `tabular-nums`.

| Role | Size / weight | Usage |
|---|---|---|
| Screen title | 30 / 700, −0.5 tracking | My trips, Profile, Explore |
| Photo title | 28 / 700 | Trip name on the Overview header |
| Section header | 22 / 700 | Screen title under a back button (Schedule, Money…) |
| Hero number | 26–32 / 700 | One per screen — budget spent, sheet amount (40) |
| Card title | 16 / 600 | Card headings, trip names, day heading |
| Row title | 14–15 / 600 | Activity, expense, traveller rows |
| Body | 14 / 400–500 | Fields, text |
| Label / meta | 12–13 / 400–500 | Places, dates, "≈ RM", captions — `muted` |
| Eyebrow | 11 / 600, 0.6 tracking, caps | FIXED / DAILY / SPLIT AS / DANGER ZONE |
| Tab label | 10 / 500 (600 active) | Bottom bar only |

**Floor: 10px**, only for bottom-bar labels and the "LEFT"-style micro badges. Anything a user must read to act is ≥ 12px.

**Currency:** local amount first ("VND 1,828,800"), RM hint underneath in `muted` 11–12px.

---

## Spacing & shape

Base-4 spacing (unchanged). Screen side padding **16px**; card padding **16–18px**; gap between cards **12px**.

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 8px | Small badges |
| `radius-md` | 12px | Fields, thumbnails in rows, segmented controls |
| `radius-lg` | 18px | Cards |
| `radius-xl` | 24–26px | Sheets (top corners), bottom bar, photo cards |
| `radius-full` | 9999px | Buttons, chips, avatars, FAB |

**Buttons and chips are pills.** Cards are rounded rectangles, never pills.

### Shadows

Floating layers only (unchanged rule): bottom bar, FAB, sheets, dialogs, toasts, dragged row. Page cards have **no border and no shadow** — the white-on-`ground` shift is enough.

---

## Layout

- **Centred column** 480px max (unchanged); screens are designed at 390px.
- **Safe areas:** content clears the iPhone notch/home bar (`env(safe-area-inset-*)`).
- **Bottom clearance:** every scrolling screen ends with ~130px of space so the last item clears the bottom bar and FAB.
- **Sticky elements:** only the Schedule **date strip** sticks; headers scroll away.

---

## Navigation

### Bottom bar (floating)

- Floating rounded bar: 14px from the sides, 22px from the bottom, 66px tall, `radius 24`, white at 96%, 1px `border`, shadow.
- Items: icon (21px) + label (10px). **Active item:** `accent` text/icon inside an `accent-soft` **rounded rectangle** (radius 14, padding 0 10px, 48px tall).
- **Home (outside a trip):** My trips (`Map` icon) · Explore (`Compass`) · Profile (`User`).
- **Inside a trip:** Overview (`LayoutDashboard`) · Schedule (`CalendarDays`) · Money (`Wallet`) · Prep (`ListChecks`) · Discover (`Compass`). Sub-pages (Your expenses, Settle up) keep their section active.
- **Swipe left/right** on content still switches trip sections (ignored on the date strip and chip rows).
- Hidden while the keyboard is open.

### Headers

- **Overview:** photo header with round back (→ My trips) and, for the planner, settings gear; members see **Leave trip** instead.
- **Other trip sections:** round back button + trip name caption + section title (22/700). No gear.
- **Home screens:** big screen title (30/700), no back.

### Floating + button (FAB)

- 56px accent circle, white plus, shadow; bottom-right, 20px from the edge, sitting just above the bottom bar.
- One per screen, for that screen's main add: **New trip** (My trips), **Add activity** (Schedule, planner only), **Log expense** (Money, Your expenses — anyone with an account).
- Hidden when the user can't add (e.g. members on Schedule).

---

## Components

### Cards
White, `radius-lg` (18), padding 16–18, no border, no shadow. Card title row: title left, one text link right (e.g. "Schedule", "All expenses · 12", "Settle up ›").

### Buttons
Pills, 44px tall (50px for full-width screen actions).
- **Primary:** `accent` fill, white text.
- **Secondary (soft):** `accent-soft` fill, `accent` text — "Set a budget", "Mark as settled", "Schedule".
- **Quiet:** white, 1px `border`, `ink` text — Cancel, Show more, Sign out.
- **Destructive:** text-only `money-over` in panels ("Remove", "Delete"); red-filled only inside the confirm dialog; outlined red in Trip settings' Danger zone.

### Chips
One style everywhere (categories, filters, dietary, trip type, Discover sections). Pill, 34px tall, 13px/500, optional 14px icon.
- **Off:** white, 1px `border`, `ink` text (category icon in its colour).
- **On:** `accent-soft` fill, 1px `accent` border, `accent` text.
- **Disabled / "Soon":** off style at 55% opacity.

### Segmented control
Grey track (`ground` or `#E6EAF1`), white raised thumb for the selected option — "Split as" (Equal · Shares · % · Amounts), shared trip Schedule / Prep.

### Fields
`ground` fill, 1px `border`, radius 12, 44px tall. Short fields use a **label beside the field** (13px `muted`, 64px wide). Focus: `accent` border.

### Category icon
Soft circle in the category's colours (32–36px in rows, 44px in details) with the Lucide icon at ~50% size. **Replaces all category emoji.**

### Avatars
Initial in a circle. Stacks overlap by −7px with a 2px white ring.
- **Has an account:** `accent-soft` fill, `accent` initial.
- **Name only (Quick add / never joined):** white with a dashed `faint` border, `muted` initial.
- **Selected:** accent fill, white initial, 2px ring gap + accent ring.
- **Planner:** small amber crown under the name.

### Sheets (bottom)
Dimmed backdrop (`ink` at 42%), white sheet with 26px top corners, grab handle, title (18/700) left, round × right. Content scrolls inside; actions at the bottom: **Cancel (quiet) + primary** side by side. Edit-only actions (Move to ideas, Delete) sit below as small text buttons. Used for Add/Edit activity, Log expense, Expense detail, Spot detail, Add to schedule, Split shares.

**Add activity stays the form reference** (field order: title → Time → Date → Place → Category → Notes). Log expense keeps its current order (amount → What for → Paid by → Date → Category → Split as → Split between → Notes), with the split status line pinned above Cancel / Log. Split as + Split between sit behind a **"Split with others"** switch (off → "Just for you"; remembers the last choice per trip). **Category is a dropdown** in both forms (label beside, coloured category icon next to it) — chips stay for filters and multi-select (owner, 2026-09-29).

### Confirm dialog
Centred white card (radius 22) over the dim backdrop: title (18/700), one sentence in `muted`, Cancel + confirm (red when destructive). "Working…" while saving.

### Toasts
Dark `ink` pill-card near the top: coloured round status icon (green ✓ / red × / blue info), text, dismiss ×.

### Empty states
64px `accent-soft` circle with a 28px Lucide icon, optional title (17/600), one line of `muted` text, optional button. Full-screen pages centre it vertically. **Icons, never emoji** (the old 🗺️ / 😵 pages move to `Map` / `X` icons).

### Loading
Skeleton blocks in `#E6EAF1` matching the real layout (header, date strip, cards, rows).

---

## Screen patterns

### My trips
Plain list: the **current trip** first (104px photo, blue outline, "Day 11 of 14" filled chip), then upcoming (92px photo, "In 76 days" soft chip), then **Past trips** as compact rows inside one card (52px photo, name, place · dates, chevron). Avatars on current/upcoming cards. No trip type, no trip length, no month headings.

### Overview
Photo header → **time & temperature** card (local + home time; temperature only, no place label) → **Today** card (up to 3 timed items; time, category icon, title, place; "NOW" tag) → **Travellers** card. Three versions:
- **During the trip:** as above. When today is done the card becomes **Tomorrow's plan** (or the next day with plans).
- **Before the trip:** header says "In 76 days"; card shows "12 activities planned" + first 3 (with dates) + "+9 more".
- **After the trip:** **Trip summary** — Duration, Destination, Activities list, Stay. No time/weather.

**Travellers card:** avatars + small **Invite** button.
- Tap **Invite** → panel with **Quick add traveller** (name + Add) and **Share this link** (link + Copy).
- Tap **a person** → panel with **Name · badge · Remove** and **Name [field] Save** (rename, name-only travellers). Remove only works for people with no expenses.
- Members: tap themselves → Leave trip / Change owner; note "Only the planner can invite or remove travellers."

### Schedule
Back header → **sticky date strip** (‹ · five day cells with weekday / date / "Day N", selected = accent fill, today dot · ›) → **daily budget card** for the selected day ("Spent on Sat 27 · VND 450,000 of 1,230,000", thin bar, "VND 780,000 left for today"; red when over; hidden with no budget) → **map preview** (pins in category colours, current stop haloed, "Map" button; hidden when no places) → **day card**: "Today · Saturday, 27 Sep", then the timeline.

**Timeline row:** time column (42px, `muted`; blank when untimed) · category icon on a thin vertical line · **bold title** + one `muted` place line · drag handle (planner). Current activity: `accent-soft` row, accent time, "NOW". No notes, no cost, no photos on rows.

### Money
Back header → **My budget** (spent as the hero number, "spent of 6,000,000", **daily free** on the right, progress bar, "left · days to go") → **Group split** ("You get back / You pay back / All square", amount + ≈ RM, **Settle up ›**, and a **Split shares · Edit** row for the planner) → **What you paid** (grouped **FIXED / DAILY / SETTLE-UPS**, category icon + amount + thin bar, "All expenses · N"). Log expense is the FAB.

### Settle up
One **"How to settle up"** card for the whole group (Kittysplit-style): open payments first (amber clock, "Ali pays you", amount + ≈ RM, Mark as settled / "Waiting for X to mark it settled"), then settle-ups newest first (green tick, "Mei paid you", "Settled 29 Sep · Unmark"). Rows with you get a blue left bar and a bold "You". "All settled" when nothing is open. Everyone sees every row; mark/unmark permissions unchanged.

### Tier 2 & 3 screens
Keep today's layouts; apply the components above (Prep, Discover, Spot detail, Add to schedule, Your expenses, Expense detail, Sign in, Invite, Shared trip, New trip, Trip settings, Profile, error/offline pages). Details per screen are on the canvas and in [REDESIGN.md](REDESIGN.md).

---

## Motion

- 200ms ease-out for colour/background changes; sheets slide up; dialogs fade + scale slightly.
- Swipe between trip sections; no page-transition animation otherwise.
- Skeletons pulse calmly. No decorative animation.

---

## Iconography

Lucide, outlined, stroke ~1.8–2. 20–21px in navigation, 14–18px inline. Every icon-only button has an `aria-label`. **No emoji in the UI.**

---

## Illustrations & dark mode

Unchanged: no illustration set yet (empty states use icons), no dark mode in this version.

---

## Retired in v0.8

Top tab bar · solid-colour hero/compact trip cards and their colour rotation · trip type chip on cards · category emoji · dashed "Add activity / Log expense" buttons (→ FAB) · hero day-counter numbers on trip cards · "Turn into no account" (removed) · invite link in Trip settings (→ Overview) · Profile "Recently viewed" (hidden until built) · the unused People page (to delete).
