# Fargo — Design System

> **v0.6 — 2026-08-27.** Accent colour swapped to Electric Blue (#0085D9) — passes WCAG AA Large. Bright Cyan (#22B8E0) reserved for frog mascot assets only. Trip card tints lightened (Soft Sky). Sign-in page now shows frog mascot + wordmark logo. Favicon uses full mascot on cyan background.
>
> Built on the locked decisions in [PRODUCT.md](PRODUCT.md) and [EXPERIENCE.md](EXPERIENCE.md).

---

## Inspiration

Headspace's visual language: warm, shadowless, confident use of colour and whitespace. Depth comes from background shifts and borders, never drop shadows. The app should feel like a well-typeset document, not a dashboard.

---

## Colour

### Core palette

| Token | Hex | Usage |
|---|---|---|
| `ground` | `#f7f2ee` | Page background — warm cream, never pure white |
| `card` | `#ffffff` | Card / elevated surface background |
| `ink` | `#2d2a27` | Primary text — warm near-black |
| `muted` | `#6b6560` | Secondary text, timestamps, labels |
| `border` | `#e2dad3` | Dividers, card edges, input borders |
| `accent` | `#0085d9` | Primary action, active tab, links — Electric Blue |
| `accent-hover` | `#0070b8` | Accent on hover/press — slightly darker |
| `accent-on` | `#ffffff` | Text on accent backgrounds |
| `accent-soft` | `#e0effa` | Accent tint for backgrounds (selected states, chips) |

### Money states

These are **independent of accent** — they carry meaning and must never be confused with the teal.

| Token | Hex | Usage |
|---|---|---|
| `money-ok` | `#1a7a42` | On track — budget healthy |
| `money-ok-soft` | `#e6f4ec` | On-track background tint |
| `money-warn` | `#b8860b` | Warning — approaching limit or over-allocated |
| `money-warn-soft` | `#fef6e0` | Warning background tint |
| `money-over` | `#c44a4a` | Over budget — exceeded |
| `money-over-soft` | `#fce8e8` | Over-budget background tint |

### Secondary palette

| Token | Hex | Usage |
|---|---|---|
| `navy` | `#1b2d50` | Secondary accent for depth, headings (optional) — from mascot legs |
| `navy-soft` | `#e8edf4` | Navy tinted background |

### Trip card rotation

Soft Sky tints for upcoming trip cards (active trip always uses `accent` Electric Blue):

| Token | Hex | Usage |
|---|---|---|
| `trip-blue-1` | `#5baed6` | Upcoming trip card 1 — soft blue |
| `trip-blue-2` | `#6ab8c9` | Upcoming trip card 2 — sky cyan |
| `trip-green-1` | `#6dc4a8` | Upcoming trip card 3 — mint |

### Rules

- **No drop shadows anywhere.** Depth is communicated through `ground` → `card` background shift and `border` lines.
- **Money colours are semantic, not decorative.** Green/amber/rose appear only on money states — never on buttons, tabs, or decoration.
- **Accent blue is never used for money.** Even when the budget is healthy, use `money-ok` green, not `accent` blue.
- **Trip card rotation is Soft Sky tints.** Lighter than accent, clearly secondary. White text on all three. Never use warm colours (yellow, rose) for trip cards.
- **Hybrid colour rule:** Electric Blue (#0085D9) for all app UI. Bright Cyan (#22B8E0) reserved for frog mascot assets only (favicon, app icon PNGs).

---

## Branding

### Logo

The Fargo logotype is set in Bright Cyan (#22B8E0). Available in:
- Full word mark: `branding/Logo-white-bg.png` (white background), `branding/Logo-blue-bg.png` (cyan background)
- Cropped transparent version: `app/public/logo.png` — used on sign-in page
- Usage: sign-in page, marketing, brand guidelines

### Mascot

The Fargo frog is a playful character with a Bright Cyan body and navy legs. The character is used to give the app personality without cluttering everyday UI.

**Placement:**
- **Favicon & app icon** — full mascot on cyan background, multiple sizes (16px → 512px) for browser tabs, Android PWA, iOS home screen
- **Onboarding / sign-in** — full mascot + wordmark logo stacked vertically — first brand impression
- **Empty states** — frog appears when there's nothing to show — adds warmth to blank screens
- **Not in everyday UI** — no mascot in cards, headers, buttons, nav, or lists

**Style:** flat, vector illustration. Bright Cyan (#22B8E0) body, navy (#1b2d50) legs. No animation in V1.

**Assets:**
- `app/public/mascot.png` — cropped, transparent background (for sign-in page)
- `branding/Mascot-white-bg.png` — full size, white background
- `branding/Mascot-blue-bg.png` — full size, cyan background (source for all favicons/icons)

### Favicon & app icon

Full mascot on cyan background, resized to each target size:
- 16×16, 32×32, 48×48, 64×64, 128×128 — favicon (browser tabs, pinned tabs)
- 180×180 — `apple-touch-icon.png` (iOS home screen)
- 192×192, 512×512 — PWA manifest icons (Android home screen, splash)

Location: `app/public/favicon-*.png`, `app/public/icon-*.png`, `app/public/apple-touch-icon.png`

---

## Typography

### Font

**Sora** — Google Fonts, free. Slightly square proportions give it a recognisable, modern feel. Strong numerals with tabular figure support for money column alignment.

```
font-family: 'Sora', system-ui, -apple-system, sans-serif;
```

### Type scale

| Token | Size | Weight | Line height | Usage |
|---|---|---|---|---|
| `display` | 24px | 600 | 1.25 | Trip name on overview |
| `heading` | 18px | 600 | 1.3 | Section headings, tab titles |
| `subheading` | 15px | 600 | 1.35 | Card titles, day headers |
| `body` | 15px | 400 | 1.5 | Body text, descriptions, notes |
| `label` | 13px | 500 | 1.4 | Form labels, table headers, metadata |
| `caption` | 11px | 500 | 1.4 | Timestamps, helper text |

### Numerals

```css
.money {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  text-align: right;
}
```

All money figures use **tabular numerals** so columns align. Weight 500 (medium) gives them enough presence without competing with headings.

### Currency rendering

The app must handle: **RM** (MYR), **₫** (VND), **¥** (CNY/JPY), **฿** (THB), **₱** (PHP), **$** (USD/SGD), **€**, **£**.

Sora covers Latin and common currency symbols. For currencies using symbols outside Sora's glyph set, the `system-ui` fallback handles them — test ₫ and ₱ specifically during development.

---

## Spacing

Base-4 scale. Use the smallest value that gives the element room to breathe.

| Token | Value | Typical use |
|---|---|---|
| `space-1` | 4px | Inline gaps, icon-to-text |
| `space-2` | 8px | Tight padding (tags, pills, dense rows) |
| `space-3` | 12px | Card internal padding, list item gaps |
| `space-4` | 16px | Standard padding, section gaps |
| `space-6` | 24px | Between content blocks |
| `space-8` | 32px | Between major sections |
| `space-12` | 48px | Page-level vertical rhythm |
| `space-16` | 64px | Top/bottom page margins |

---

## Border radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 4px | Tags, chips, small inputs |
| `radius-md` | 8px | Cards, buttons, input fields |
| `radius-lg` | 12px | Modals, bottom sheets |
| `radius-full` | 9999px | Avatars, circular indicators |

Corners are **gentle, not pill-shaped**. Buttons use `radius-md` (8px), not `radius-full`.

---

## Layout

### The centred column

```
max-width: 480px
margin: 0 auto
padding: 0 space-4 (16px)
```

**Same layout on desktop and phone.** The column is the document — it doesn't stretch on wide screens. On a phone it fills the viewport minus padding. On desktop it sits centred with `ground` extending to the edges.

480px was chosen because:
- Comfortable reading width for body text at 15px
- Fits money tables without horizontal scroll
- Maps are readable at this width
- Matches the "trip reads as a document" principle

### Content stacking

Everything inside the column stacks vertically. No multi-column grids, no sidebars, no floating panels. Cards are full-width within the column.

---

## Navigation

### Two navigation layers

**1. App-level bottom nav** — three items: **My trips · Explore · Profile**

- Fixed at the bottom on phone; could sit as a top bar on desktop
- Each item has an icon + label (Lucide: plane / compass / user)
- Active item uses `accent` colour + weight 500; inactive uses `muted`
- **Always visible**, even inside a trip — this is how the user escapes back to app-level
- Explore tab is hidden or shows an empty state until publishing ships

**2. Trip-level tab bar** — four tabs inside a trip: **Overview · Schedule · Money · Prep**

- Sits below the trip header, above the content — **not** at the bottom (bottom is reserved for app-level nav)
- Active tab uses `accent` colour; inactive tabs use `muted`
- No icons in V1 — text labels only, keeping it simple
- **Swipe to switch tabs** — on mobile, swiping left/right on the content area switches between tabs. The tab bar highlight follows the swipe. This is the primary navigation gesture inside a trip
- **People tab removed** (Aug 25) — traveller avatars and invite button now live in Overview, reducing visual clutter and keeping people visible on the landing tab
- Planner sees **Trip settings** accessible from the trip header — not as a tab

### Trip header

Above the trip tabs: trip name, destination flag, back arrow (returns to My trips), settings gear icon. This header is persistent within a trip — you always know which trip you're in.

---

## Components (patterns, not code)

### Cards

- Background: `card` (#ffffff)
- Border: 1px solid `border`
- Radius: `radius-md` (8px)
- Padding: `space-3` (12px)
- No shadow. Ever.

### Buttons

- **Primary:** `accent` background, `accent-on` text, `radius-md`
- **Secondary:** transparent background, `accent` text, 1px `accent` border
- **Destructive:** `money-over` background, white text — used only for delete/remove actions
- Height: 44px minimum (touch target)
- Full-width within the column on phone; auto-width on desktop

### Input fields

- Border: 1px solid `border`, `radius-md`
- Focus: border becomes `accent`
- Background: `card`
- Height: 44px (same as buttons, consistent touch target)

### Money rows

A money row is a horizontal line showing a label and an amount:

```
[Category label]                    [RM 1,240.00]
```

- Label: `body` weight 400, left-aligned
- Amount: `body` weight 500, `tabular-nums`, right-aligned
- Colour: `ink` by default; `money-ok` / `money-warn` / `money-over` when showing variance
- Background tint: the soft variant of the money colour, applied to the row when over-budget or warning

### Hero trip card (My trips page)

Full-width within the column. Solid colour background (accent teal, amber, purple — varies per trip). Two variants based on trip state:

**Active trip (hero treatment):** the loudest element on the page.

- **"Active now" indicator** — pulsing dot + label at top of card
- **Trip type chip** — `rgba(255,255,255,0.2)` background, `radius-sm`, `caption` size
- **Destination + flag** — `heading` size, weight 600, white
- **Dates + duration** — `caption` size, white at 80% opacity
- **Day counter as hero number** — `42px`, weight 500, white, tabular-nums — "Day 5" not "5 days to go"
- **"day of N" label** — `body` size, white at 80% opacity
- **Traveller avatars** — row of circles (26px), overlapping with -6px margin
- **"Open →" button** — right-aligned, `rgba(255,255,255,0.2)` background

**Upcoming trip (compact hero):** sits below the active card, smaller.

- Same solid colour background, `radius-lg`, padding `space-3` (14px)
- **Layout:** two-column — left holds chip + destination + dates, right holds countdown number + label
- **Countdown number** — `28px` (smaller than active card), weight 500, tabular-nums
- **Traveller avatars** — smaller (22px), below the content row
- No "Open" button — tapping the card opens the trip

Common to both:
- Radius: `radius-lg` (12px)
- No border, no shadow

### Explore trip card (2-column grid on Explore page)

Half-width within the column (2-column grid, 8px gap). Solid colour background. Contains:

- **Trip type chip** — top-left, same treatment as hero card
- **Destination + flag** — `subheading` size, white
- **Duration + total spend** — `caption`, white at 85% opacity
- **Owner name + avatar** — `caption`, white at 80% opacity, small avatar circle (12px)
- Height: ~150px fixed
- Overlay: linear gradient from bottom (black at 60% opacity) to transparent at 55% — ensures text readability
- Radius: `radius-md` (8px)

### Daily budget strip (Schedule tab, active trip)

Full-width, `accent-soft` background (#e6f5f0), `radius-md`, padding `space-3`. Sits **below the day picker**, not above it — pick the day first, then see the budget for that day. Contains:

- **Left:** "Daily free budget" label (`caption`, `accent` dark shade) + amount (`heading` size, `accent`)
- **Right:** "Spent today" label (`caption`, muted) + amount (`subheading`, `accent`)

### Activity cards on Schedule

Each activity card shows a **drag handle** (⠿ grip dots, `border` colour) on its left edge to signal reorderability. Drag-to-reorder uses `@dnd-kit` — the handle is the touch target, not the whole card (tapping the card body opens it for editing).

An **"+ Add activity"** button (dashed border, `accent` text) sits at the bottom of each day's activity list.

### "You are here" activity marker

When a trip is active, the next upcoming activity (based on current time) gets a **3px left border in `accent`** on its card. No other activities are modified — no strikethrough, no greying, no "done" state. The schedule is a living plan, not a checklist.

### Prep interactions (Bookings, Checklists, Ideas)

Each section has a **"+ Add" / "+ New list" button** in the section header (right-aligned, `accent` text, no border).

**Checklists:**
- Each list card shows a **progress counter** ("2 of 4") in `caption` size next to the list name
- A **"+ Add item…" inline input** (dashed bottom border, placeholder text) sits at the bottom of each list
- Tapping the checkbox toggles done; tapping the text opens inline edit
- **Swipe left on an item** reveals a red "Delete" strip
- The list header has a **••• menu** (three-dot icon, `muted` colour) that opens: Rename list, Delete list
- Deleting a list requires confirmation ("Delete 'Packing' and all its items?")

**Bookings:** tapping a booking card opens it for editing. Swipe left to delete (with confirmation for bookings that have linked expenses).

**Ideas:** each idea row has a **"→ Schedule" promote button** (`accent` text, right-aligned). Promoted ideas show struck through with "→ Promoted to Day N" in `accent`. Swipe left to delete.

### Log expense form (phone-first layout)

Designed for one-handed phone use. Three essential fields are front-loaded at the top:

1. **Amount** — large centred number (`36px`, weight 600), currency label above, MYR conversion below
2. **What for** — single text input, no label (placeholder "What for?")
3. **Category** — chip row, single-select (🍜 Food / 🚕 Transport / 🏛 Activities / 🛒 Shopping / 📦 Other)

Below a "Defaults — tap to change" divider, **smart defaults** are shown pre-filled:
- **Paid by** (defaults to you) + **Solo/Shared toggle** — side by side
- **Date** (defaults to today) + **Notes** (optional) — side by side

The **"Log expense" submit button** is **sticky at the bottom** of the screen — always visible, never requires scrolling. Padding: `space-2` top, `space-3` bottom, with a `border` top line separating it from the scroll area.

### Post-trip summary (Overview tab, completed trip)

When a trip's status is "completed", the **Overview tab transforms** to show the post-trip summary. No separate screen — same tab, different content:

- **Dates card** shows "Completed" badge (muted background) instead of "Active now"
- **Illustration placeholder** — suitcase with stickers, journey complete
- **Summary hero card** — `accent` background, centred layout: total spent (large), budget vs actual comparison, three-column stat row (daily avg / budget per day / trip days)
- **Category breakdown** — colour bar + rows with category emoji and actual amounts
- **Per traveller** — avatar + name + total cost, coloured by budget status (green = under, red = over)

### Shared trip cards (recently viewed in Profile)

Same as standard trip cards but with:
- **Owner name + avatar** — small avatar circle (11px) + name in `caption`, below dates
- No "Shared" badge — the owner name itself communicates that this is someone else's trip

### Status indicators

- **Pending approval:** small dot in `money-warn` amber
- **Budget healthy:** no indicator (absence of colour = fine)
- **Over budget:** `money-over` text colour + `money-over-soft` row background
- **Unallocated budget:** shown as a readable state ("RM150 unallocated"), not an error

---

## Motion

- **Transitions:** 200ms ease-out for colour, background, border changes
- **Trip tab transitions:** horizontal swipe gesture on mobile; the content slides and the tab indicator follows. On desktop, tabs switch instantly (click, no animation)
- **Loading states:** skeleton screens using `border` colour on `ground` background — pulsing at a calm pace
- **No decorative animation.** Every motion serves a state change.

---

## Iconography

- **No custom icon set in V1.** Use a standard icon library (Lucide or similar) — outlined style, 20px default size, `ink` colour, `muted` when inactive.
- Icons are supplementary — every icon-only button must have an accessible label.

---

## Illustrations

**Not in V1 build — positions are reserved, placeholders used during development.** The illustration set is commissioned or generated as a batch once the product is stable.

### Style

Flat, warm, hand-drawn-feel vector illustrations (à la BlaBlaCar / Headspace). Consistent with the cream + teal palette — no photographic images, no 3D renders. One cohesive style across all placements.

### Rules

- Small and contained — sit within a card or section header, not full-bleed backgrounds
- Never block content or require scrolling past — they enhance empty states, they don't fill them
- Max height: 120px on phone, 160px on desktop — decorative, not dominant
- Transparent background — they sit on `ground` or `card` naturally

### Placement map

| Position | Trigger | Mood / subject |
|---|---|---|
| My trips — empty state | New user, no trips | Open suitcase, world map, "where to?" |
| Explore — empty / pre-launch | No published trips yet | Binoculars, compass, "trips coming soon" |
| Explore — search no results | Search returns nothing | Empty map, "try another destination" |
| Trip overview — new trip | Trip just created, nothing added | Boarding pass, countdown energy |
| Schedule — empty day | A day with no activities | Sunrise, blank canvas |
| Ideas — empty backlog | No ideas yet | Lightbulb, travel magazine collage |
| Post-trip summary — header | Top of budget vs actual page | Suitcase with stickers, journey complete |
| Shared view — header | Top of read-only shared trip | Postcard, "check out my trip" |
| Sign-in / landing | Unauthenticated landing page | Brand hero: people planning a trip together |
| Profile — no recently viewed | No shared trips opened | Telescope, "explore trips from friends" |

---

## Dark mode

**Not in V1.** The warm cream palette is the identity. Dark mode is a future consideration once the light palette is proven. When it arrives, `ground` becomes a warm dark grey (not pure black), and the token system makes it a palette swap.

---

## Design checklist before development

- [ ] Wireframes reviewed and approved (flat artboards, all screens)
- [ ] Sora font tested for currency symbols (₫, ₱, ฿, ¥)
- [ ] Money row alignment verified with real data (5-digit MYR, 7-digit VND)
- [ ] Touch targets validated (44px minimum on all interactive elements)
- [ ] Empty states designed for every screen
- [ ] Ground-to-card contrast passes WCAG AA for text
