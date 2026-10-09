# Fargo — Marketing site reference study

> **v1 — 2026-10-09.** Mobbin references for the marketing site, compared with our mockup (https://claude.ai/artifact/NY115jaupmfQiSwzXftfQq). Copy and IA: `LANDING.md`. Links go to Mobbin.

## Owner pick (2026-10-09)

Models to follow: **TravelPerk** (hero: one phone + floating snippets), **Klarna** ([section](https://mobbin.com/sites/sections/572fc6e4-c2cc-403f-aab6-e24d313f439e): feature switcher, picture on one side, list of features on the other with the selected one in full), **ClassPass** (centred numbered steps), **The Leap** (bold closing band, short headline, pill button). Not picked: QR code (L2), how-it-works snippets (L3). Applied to the Home mockup.

## Summary

- **Our structure matches the norm:** hero → features → how it works → closing button → footer.
- **Three ideas would lift it:**
  - A hero with **one phone plus small floating app details** that show all three core features at once
  - A **QR code on desktop**, so people open Fargo on their phone, where they can add it to the Home Screen
  - **How it works steps that show a bit of the app**, not just numbers
- **Travel booking sites** (Tripadvisor, Klook, Kayak, Kiwi) are search-led and photo-heavy. That's a different model from ours, so we don't follow them.

## Hero

| Site | What they do |
|---|---|
| [TravelPerk](https://mobbin.com/sites/sections/248d0038-1aa0-4aae-95fd-5dda4d1182ef) | Big centred headline; **one phone in a hand**, with small **floating cards** pulled from the app around it ("Set the budget", "Arriving on time", a boarding pass); ratings and logos below |
| [Flighty](https://mobbin.com/sites/sections/5d74747e-85d4-44fd-b176-72ca0e78b9cf) | Short centred headline, one-line sub, **one button**, devices underneath |
| [PamPam](https://mobbin.com/sites/sections/2a376a3a-39ed-4f8b-ade4-0c0de960a0d5) | Consumer trip planner: centred "Plan your dream trip.", **"Sign in with Google" in the header**, two choice chips (Plan trips / Share guides), playful objects around the edge |

**Ours:** headline on the left, two phones on the right.

**Learning:** TravelPerk's floating cards tell the story faster than a second phone. For us that would be one Schedule phone plus three floating snippets:
- **Planner:** "NOW · 09:30 Gardens by the Bay"
- **Travel buddies:** "Mei suggested Night Safari"
- **Budget:** "You get back S$86.40"

That shows all three things in one picture. PamPam showing "Sign in with Google" up front tells visitors there's no password to make.

## Feature sections

| Site | What they do |
|---|---|
| [VanMoof](https://mobbin.com/sites/sections/0da602e3-d286-4808-9ad9-fafb34fe9fd9) | One feature per row: phone on a **tinted panel**, short title, 2–3 lines, alternating sides |
| [Dropbox](https://mobbin.com/sites/sections/80ef1f83-4af7-4469-894e-49e4d60350fc) | Phone on a coloured panel on one half, text on the other |
| [Craft](https://mobbin.com/sites/sections/9b6c8749-e783-483c-a295-389a807b96d3) | The same alternating rows, with a longer paragraph |

**Ours:** alternating rows on `/planner`. They're right, but the phones float on the page background.

**Learning:** put each phone on a **soft tinted panel**, using our category tints (blue for Planner, orange for Discover, green for Travel buddies). Each section gets a colour, and the phones stand out.

## How it works

| Site | What they do |
|---|---|
| [Airtasker](https://mobbin.com/sites/sections/f826ae26-068d-4c62-a1a2-b7ee79a8ecbf) | Three cards; each shows **a small piece of the real app** (a title field, offers, "Assign · $170") on a brand-coloured panel, with a title and one line below |
| [Zipline](https://mobbin.com/sites/sections/7b0ca7a7-caf2-42a6-b315-53b86c8cd190) | Three numbered picture cards with one line each |
| [ClassPass](https://mobbin.com/sites/sections/193363c3-3373-49a5-a1d0-00ff01f07b4d) | Numbered circles + title + text, the same as ours |

**Ours:** numbered circles (ClassPass style).

**Learning:** Airtasker's cards with a small piece of the app make each step concrete:
1. The New trip form ("Singapore · 14–17 Nov")
2. The invite link
3. A logged expense
4. The trip card

## Closing call to action

| Site | What they do |
|---|---|
| [The Leap](https://mobbin.com/sites/sections/5a5e734d-0b06-4545-8131-5e421c4560be) | Coloured band, short headline, one button, the same as ours |
| [Shop](https://mobbin.com/sites/sections/3c2c0222-79e1-4a32-8b73-cbe33406f26d) · [DICE](https://mobbin.com/sites/sections/f3231b90-c895-47aa-855f-597c52ecfa09) · [Selfridges](https://mobbin.com/sites/sections/089a3e70-4e13-478f-91ff-089aa67468bd) | **"Get the app" with a QR code** on desktop |

**Learning:** our second goal is getting Fargo onto the Home Screen, which only works on a phone. On a **computer**, a QR code saying **"Scan to open Fargo on your phone"** in the closing band (and the install section) gets people there in one step. On a phone, the normal button shows instead.

## Recommendations

| # | Change | Where | Priority |
|---|---|---|---|
| L1 | **Hero: one phone + three floating snippets** (Now · Gardens by the Bay / Mei suggested Night Safari / You get back S$86.40), centred headline | Home | High |
| L2 | **QR code on desktop**: "Scan to open Fargo on your phone" | Home hero side, install section, closing band | High |
| L3 | **How it works cards with app snippets** instead of plain numbers | Home | Medium |
| L4 | **Tinted panels behind feature phones** (one tint per feature) | Feature pages, Home | Medium |
| L5 | **Header button reads "Continue with Google"** on the sign-in step, and the hero note says "Sign in with Google, no password" | Home | Low |

**Kept out:**
- **Ratings, review counts and customer logos** (TravelPerk): we have no real ones yet.
- **Photo-heavy, search-led heroes** (Klook, Tripadvisor): that's for booking sites, not ours.

## TravelPerk homepage, side by side (2026-10-09)

| TravelPerk section | Fargo today | Take? |
|---|---|---|
| [Hero](https://mobbin.com/sites/sections/248d0038-1aa0-4aae-95fd-5dda4d1182ef): headline, phone in hand, floating cards, ★ 4.6 rating | Same idea, no rating | ✅ done; the rating waits for real reviews |
| Floating **sticky header** (rounded bar, buttons always visible) | Header scrolls away | **Add:** sticky header with Start planning |
| Logo strip "Trusted by 1,000s of global teams" | — | Skip: no real logos |
| [Product pillars](https://mobbin.com/sites/sections/0e3573b7-0cf1-4b65-a96f-6a788cc39a26) (Book · Manage · Optimize tabs) with **bento cards**: illustration, photo, UI snippet | Switcher of 4 features | Optional: bento cards instead of the switcher |
| [Why users love TravelPerk](https://mobbin.com/sites/sections/7c0cba22-dccb-45cb-92d2-c019c5c15f0a): dark band of **big-number facts** (Instant, $0, < 1 min, 80%) | — | **Consider:** true facts only (1 link to invite, 0 passwords, 4 ways to split, any currency, free) |
| [Customer stories](https://mobbin.com/sites/sections/994d9f0e-62df-461a-911f-b46285f4b754) / [video testimonials](https://mobbin.com/sites/sections/200d6af5-d01e-471a-8eaa-81f88051812e) | — | Later, once real users can be quoted |
| [Guides, calculators, templates](https://mobbin.com/sites/sections/649623d8-b4b8-4fc5-b14e-581becd2a230) | — | Later: travel guides / packing templates for search traffic |
| [Integrations](https://mobbin.com/sites/sections/401894c2-a72a-4f29-947a-dd94ad71ca29), [press](https://mobbin.com/sites/sections/767703d7-5d20-40ff-9861-2300ccdd1783), [G2 / Capterra badges](https://mobbin.com/sites/sections/084c9361-700b-4cc9-a52b-2db7e3414445) | — | Skip |
| [Closing: three cards](https://mobbin.com/sites/sections/767703d7-5d20-40ff-9861-2300ccdd1783) (Get started · See it in action · Take a quick tour) | One blue band, one button | **Add:** "See a sample trip", a read-only share link of the demo trip (share links already exist), next to Start planning |
| Footer: Contact · Help center · socials · Get the app · language | Basic footer | Later: contact + Instagram once they exist |
