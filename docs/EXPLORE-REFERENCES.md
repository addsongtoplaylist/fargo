# Fargo — Explore reference study

> **v1 — 2026-10-09.** Our Explore wireframes compared with real iOS apps on Mobbin, before the technical plan. Spec: `EXPLORE.md`. Wireframes: https://claude.ai/artifact/JLvWhnwi4PaEJ9z3dqqcXV. Links go to the Mobbin screen.

## Summary

- **Our direction holds up.** The closest products (Wanderlog, Trip.com, Tripadvisor, Polarsteps) all let you copy or save someone's itinerary. Most of them add likes, views and follows, which we've deliberately left out.
- **Three gaps worth considering** (details at the end):
  - A **map** on the published trip page
  - A **starting view** on Explore before you search
  - A private **Save for later**
- **Small fixes:**
  - Show "Already in Ideas" in the add-to-trip sheet
  - Add an "Other" report reason with an optional note
  - Add a reassurance line on Use this trip

## 1. Browse (wireframes 1–2)

| App | What they do |
|---|---|
| [Wanderlog home](https://mobbin.com/screens/92a5d94b-9b23-43b4-8e3d-6f5413a6b328) | Search ("place or user"), then curated rows: **Featured guides from users**, **Weekend trips**, **Popular destinations**. Cards show author avatar and view count |
| [Wanderlog guide list](https://mobbin.com/screens/cb0c7bdc-014f-4623-a15f-25240214b117) | Guides per city: thumbnail, title, author, ♥ likes, 👁 views, share |
| [Wanderlog in-trip Explore](https://mobbin.com/screens/5e062717-24d3-4721-9fea-d5009cb09570) | Inside a trip, an Explore tab already filtered to the trip's city ("New York") |

**How we compare**
- **Same:** large photo cards, search first, author shown.
- **Different on purpose:** no likes, views or follows. "Inspired N trips" is our only signal.
- **Gap:** Wanderlog never opens on a blank list. It shows rows of guides before you type anything. Our Explore home opens straight to "Newest", which will look thin while there are few trips.
- **Idea worth stealing:** Wanderlog's **in-trip Explore filtered to the trip's city**. Fargo already knows your upcoming trips, so Explore could open with "For your Vietnam trip" at the top. This fits our same-country rule (E19).

## 2. Published trip page (wireframe 3)

| App | What they do |
|---|---|
| [Trip.com itinerary](https://mobbin.com/screens/6829121a-b641-4e80-bd26-c4f5be973891) | **Map with numbered pins** on top; **day tabs** (Overview · Day 1 · Day 2 · Day 3); numbered places with photos; sticky **Copy to My Itineraries** with a tooltip "You can edit it after copying"; ♥ save |
| [Wanderlog itinerary](https://mobbin.com/screens/a500ad7b-6877-4a44-af5c-e201275c8fa2) | Day chips across the top, numbered places, rich place details |

**How we compare**
- **Same:** a sticky main action at the bottom (our **Use this trip**) and day-by-day places.
- **Gap, map:** both apps lead with a map. We already store each place's location, so a small map with numbered pins per day is cheap and helps people judge whether a day is realistic.
- **Gap, day tabs vs scrolling:** we stack Day 1, Day 2 and collapse the rest. Tabs make a 7-day trip easier to scan, and Copy day would sit naturally on each tab.
- **Small fix:** Trip.com's tooltip ("You can edit it after copying") takes the fear out of copying. Add a similar line under **Use this trip**.
- **Gap, save for later:** Trip.com has a ♥ to keep a trip without copying it. Today our only options are to copy it or lose it.

## 3. Add a place to my trip (wireframes 4, 4b)

| App | What they do |
|---|---|
| [Mindtrip "Add to trip"](https://mobbin.com/screens/ad7c2b08-cf7f-4e5c-94e2-5dcd528c2725) | Trip rows with photo, name, "Bangkok · Oct 19–23" and a ⊕ per row; **Create a trip** pinned at the bottom |
| [Tripadvisor "Select a trip to save to"](https://mobbin.com/screens/dea33fe6-41f8-48c9-9564-0015cfde3e68) | Trip photo, "6 saves" count, checkboxes (pick several), **Create a trip** + **Done** |
| [AllTrails "Save to a list"](https://mobbin.com/screens/a1d4957b-b21d-4a3e-ba23-6aeeb9b376d3) | Create new list at top; ticked lists show where it's already saved |

**How we compare**
- **Same:** our sheet is close to Mindtrip's: trip, place and date, plus a new-trip option.
- **Small fix:** AllTrails and Tripadvisor **show where the item is already saved** (ticked). We should show **"Already in Ideas"** on a trip that has this place, so nobody adds it twice.
- **Validated:** our same-country filter makes the list shorter than either app's, which is a plus.

## 4. Clashes (wireframe 5b)

| App | What they do |
|---|---|
| [Zocdoc "You have a similar appointment booked"](https://mobbin.com/screens/3ae545ce-a65f-457d-b54d-a2fc387d9952) | Shows the **existing** booking as a card, one plain sentence explaining the clash, then **Replace existing appointment** / **Continue anyway** |

**How we compare**
- **Validated:** Zocdoc names the existing item and explains it in one sentence, which is what 5b does. Our third choice (Keep both) and the one-at-a-time steps suit a trip where several clashes can happen at once.
- **No change needed.** Few apps handle this at all, so this is a point of difference for Fargo.

## 5. Publish and privacy (wireframes 8–10)

| App | What they do |
|---|---|
| [Polarsteps "Who can see this trip?"](https://mobbin.com/screens/a9c9df48-9f07-4426-964a-1cea4a58ff41) | Only me / Followers / Everyone; picking Everyone explains the consequence ("visible to anyone… may be featured…; live location will be public") |
| [Tripadvisor "Who can view"](https://mobbin.com/screens/83250885-12cd-447f-a486-6fa88b6a1887) | **Make visible to all** "for inspiration", plus a **Hide trip dates** switch |

**How we compare**
- **Validated:** both explain what going public means. Tripadvisor letting you hide dates matches our rule, and we hide exact dates always.
- **Ours is stronger:** our **Shared on Explore / Never shared** list is more explicit than either app.
- **No change needed.**

## 6. Reporting (wireframes 12–13)

| App | What they do |
|---|---|
| [Linktree](https://mobbin.com/screens/7720b121-0d31-4c8f-b176-fe0d884c0617) | Radio reasons + **Other** + optional "Tell us more…"; **Submit** disabled until a reason is picked |
| [Deepstash](https://mobbin.com/screens/a34e0dc7-1e32-4bef-acb5-b5f65ac19e0c) | "Why are you reporting this?", 6 reasons including **Something else**; **Not interested** is a separate, lighter action |
| [Bump](https://mobbin.com/screens/e19d9a2b-a391-404c-8c71-86a20d3ad7c9) | Includes **"Just not for me"**, which hides the item without a real report |
| [Hypelist](https://mobbin.com/screens/6e582f3c-ca23-4c29-8135-4cbef18153a0) · [Meta AI](https://mobbin.com/screens/16638fb3-ac46-4fde-957e-1a1deafd1e2c) | Long lists (9–10 reasons); Meta adds a safety line |

**How we compare**
- **Validated:** a short sheet of reasons is the norm. Our five are tighter than most and fit our limited content.
- **Small fixes:**
  - Add **Other** with an optional note
  - Keep **Send report** disabled until a reason is picked
- **Consider:** a lighter **"Hide this trip"** (Deepstash's "Not interested", Bump's "Just not for me") that hides the trip for you without counting toward the 3-report threshold. People often report just to make something go away, which would hide good trips for everyone.

## Recommendations

| # | Change | Why | Size | Priority |
|---|---|---|---|---|
| R1 | **"For your Vietnam trip" row** at the top of Explore when you have an upcoming trip; Newest below | Explore never opens empty; ties into our same-country rule (Wanderlog) | Small | High |
| R2 | **Map with numbered pins** on the published trip page, per day | Both leading apps do it; we already store locations | Medium | High |
| R3 | **"Already in Ideas"** state in the add-to-trip sheet | Prevents duplicates (AllTrails, Tripadvisor) | Small | High |
| R4 | **Day tabs** instead of stacked days on the trip page | Easier to scan long trips; Copy day sits on each tab (Trip.com, Wanderlog) | Small | Medium |
| R5 | **"Hide this trip"** separate from Report | Stops "report to hide" from wrongly hiding trips (Deepstash, Bump) | Small | Medium |
| R6 | **Report: Other + optional note; Send disabled until a reason is picked** | Standard pattern (Linktree) | Small | Medium |
| R7 | **Line under Use this trip:** "It's your copy. Change anything after." | Lowers hesitation (Trip.com) | Tiny | Low |
| R8 | **Save for later** (private ♥) on a published trip | Keep a trip without copying it (Trip.com, Tripadvisor). Private, so not social, but it's a new list to build | Medium | Later |

**Owner decision (2026-10-09):** none of R1–R8 adopted for v1. The spec stays as it is; these remain ideas for later.

**Kept out on purpose:** likes, views, follows, author profiles, comments (Wanderlog shows all of these). They conflict with E1.

## Limits of this study

- Mobbin had no screens of Polarsteps' or Tripadvisor's public trip **browse** pages, so section 1 relies on Wanderlog.
- Screens are iOS only.
