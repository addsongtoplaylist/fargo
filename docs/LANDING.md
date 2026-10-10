# Fargo — Marketing site: IA + copysheet

> **v5 — 2026-10-09. One page (final structure).** Everything is on `/`: hero → "Your trip, your way" switcher → how it works → Add to Home Screen → FAQ → closing band. The /features page and the detailed Planner / Budget / Passport sections are dropped.

> **v2 — 2026-10-09. Step 1 of 3 ✅ IA and copy approved.** Step 2: visual mockup → step 3: build.
> Step 2 mockup (Home desktop + phone, /planner, demo app screens): https://claude.ai/artifact/NY115jaupmfQiSwzXftfQq
> v1 (single long page) replaced: the owner wants a page per feature, the tagline as the lead, and a personalised-itinerary angle.

## Brief

- **Goal:** **(1) sign up** and **(2) add Fargo to the Home Screen.** Every page ends with both.
- **Positioning:** a **personalised travel itinerary** you build with your travel buddies.
- **Features shown:** Planner · Travel buddies · Budget · Passport (switcher), plus Discover in the hero cards.
- **Tagline:** **Every trip starts here.** (already on the sign-in page and in the app description)
- **Audience:** friend groups in Malaysia first. The copy stays generic (no "Malaysia"). Money is shown in **Singapore dollars (S$)**.
- **Tone:** plain English, warm, short.
- **Rules:** only features that exist today; no testimonials, user counts or ratings until real ones exist.

## IA (site map)

```
/            #hero (headline + Start planning)
             → #features ("Your trip, your way", each with "Try it out")
             → #journey "One trip, start to finish." progress timeline:
               Before the trip · Plan it together (Plan the days, Share with buddies)
               → During the trip · Enjoy every day (Follow today's schedule, Discover where to eat)
               → After the trip · Square it up (Log the expenses, Settle up)
             → "Add an activity in 3 steps"
             → closing: app icon + wordmark, "Every trip starts here.", Start planning
             → #install → #faq → footer (no contact)
/home        Same page for anyone, incl. signed in (Profile → About Fargo); header shows "My trips →"; not indexed
/privacy     Privacy policy (placeholder)
/terms       Terms of use (placeholder)
```

- **Header:** logo · Features (#features) · Add to phone (#install) · FAQ (#faq) · Sign in · **Start planning**. On phones: logo · Start planning · ☰.
- **Footer:** Features · Add to Home Screen · FAQ · Sign in · Start planning · Privacy · Terms · contact (placeholder) · © 2026 Fargo.

## Demo trip for screenshots

A separate **demo trip**, kept for future screenshots. It isn't anyone's real trip or spending.

- **Trip:** "Singapore long weekend" · 4 days · **S$**
- **Travellers:** you as planner (shows your account name), plus Aina, Daniel and Mei as name-only travellers
- **Schedule:**
  - **Day 1:** Jewel Changi (Rain Vortex) · Maxwell Food Centre (Tian Tian chicken rice) · Chinatown Heritage walk · Lau Pa Sat satay street
  - **Day 2:** Gardens by the Bay (Cloud Forest) · Haji Lane · Kampong Glam · Marina Bay light show
  - **Day 3:** Sentosa · Tiong Bahru Bakery · Clarke Quay
  - **Day 4:** Tiong Bahru Market breakfast · flight home
- **Ideas:** "Hawker crawl in Old Airport Road", "Night Safari"
- **Money:** about 10 shared expenses in S$ (hotel, Grab rides, hawker meals, Cloud Forest tickets), split between the four
- **Checklists:** "Packing" and "Before we fly"

**Screens needed** (phone size):

| Code | Screen |
|---|---|
| S1 | Overview |
| S2 | Schedule, day 2 |
| S3 | Add activity |
| S4 | Discover, Bites |
| S5 | Overview, people / invite |
| S6 | Prep, ideas with "Mei suggested" |
| S7 | Money, group split |
| S8 | Log expense |
| S9 | My budget |
| S10 | Checklists |
| S11 | Passport |
| S12 | Share card |

## Copysheet

Each page has a **title** (browser tab / Google) and a **description** (Google / link previews).

---

### `/` Home

**Title:** Fargo — Every trip starts here
**Description:** Build a personalised itinerary with your travel buddies, find where to eat, and keep the group budget in check. Free.

**Hero**
- **H1:** Every trip starts here.
- *(No subline or buttons in the hero, owner 2026-10-09, TravelPerk style. "Start planning" stays in the header.)*
- **Visual:** one Schedule phone (cropped) on a light background with floating cards: Planner "NOW · 09:30 Gardens by the Bay", Travel buddies "Mei · suggested Night Safari", Discover "Zam Zam · 4 min walk", **Passport stats "7 countries · 12 trips · 9 buddies"**, Group split "You get back S$86.40", "Furthest from home · Tokyo". A feature strip underneath: Planner · Discover · Travel buddies · Budget · Checklists · Passport

**`#features`: "Your trip, your way."** Sub: "The plan, the places and the people in one trip. Here's what's inside." A switcher (Klarna style): phone on a tinted panel, and a list of four; tapping one shows its line and switches the phone.
- **Planner:** A day-by-day itinerary built around what you want to do, not a tour package. During the trip it opens on today.
- **Travel buddies:** Invite your friends with one link. They suggest ideas, you decide what makes the schedule.
- **Budget:** Everyone logs what they paid. Fargo works out who owes who and how to settle up.
- **Passport:** Every trip earns a stamp. See your countries, trips and travel buddies add up, then share a trip card.

**How it works**
1. **Create a trip:** where, when, and the local currency.
2. **Build your days:** add places, times and ideas.
3. **Invite your buddies** with a link.
4. **Travel, log, settle up,** then share your trip card.

**Closing band** (standard)

---

### `/#install`: Add to Home Screen

**Title:** Add Fargo to your Home Screen
**Description:** Fargo works like an app, no App Store needed. Here's how to add it on iPhone and Android.

- **H1:** Put Fargo on your Home Screen.
- **Sub:** No App Store needed. Add it once and Fargo opens full screen, just like an app.

| iPhone (Safari) | Android (Chrome) |
|---|---|
| 1. Open **fargotravel.vercel.app** in **Safari** | 1. Open **fargotravel.vercel.app** in **Chrome** |
| 2. Tap **Share** (square with an arrow) | 2. Tap **Install app**, or ⋮ → **Add to Home screen** |
| 3. Tap **Add to Home Screen** → **Add** | 3. Tap **Install** |

- **The page detects the phone** and shows those steps first; the other platform sits on a tab.
- On Android, an **Install Fargo** button appears when the browser allows a one-tap install.
- **On a computer:** "Open this page on your phone", with the address.

**Closing:** **Start planning, it's free**

---

### `/#faq`: FAQ

**Title:** FAQ — Fargo
**Description:** Answers about pricing, phones, travel buddies and privacy.

- **Is Fargo free?** Yes.
- **Do I need to download an app?** No. It runs in your browser. Add it to your Home Screen for the full-screen app feel.
- **iPhone or Android?** Both.
- **Do my travel buddies need to sign up?** No. Add them by name and include them in the plan and the split. They can join with the invite link any time.
- **Who can change the plan?** The planner edits the schedule. Buddies can suggest ideas and log what they paid.
- **Which currencies?** Any. Log spending in the local currency; Fargo converts it with the rate you set for the trip.
- **Who can see our spending?** Only people on the trip. Share links never show money.
- **How do I sign in?** With Google. No passwords.

**Closing band**

---

### `/privacy` and `/terms`

The owner supplies the text. Google sign-in also expects a privacy policy URL, so these are worth having anyway.

## Conversion review (owner, 2026-10-09)

Goal: introduce Fargo and get sign-ups. Applied:
1. **Hero:** a big **Start planning, it's free** button under "Every trip starts here." (no subline).
2. **Trust strip under How it works:** Free to use · No password: sign in with Google · Works on iPhone and Android · Spending stays private to the trip.
3. **Add to Home Screen moved below the FAQ.** The install steps are also shown **inside the app right after sign-up** (build item).
4. **Phones:** headline and button first, the phone with 2 floating cards, and all four features shown open as a list (no switcher).
5. **The same button repeats** after the features and after How it works (4 in total, plus the header).
6. **No link preview image** (not needed).
7. **Floating cards on desktop cut from 6 to 4:** Planner, Mei, passport, split.
8. **Sign-up tracking** (e.g. Vercel Analytics): build item.

## Second review (owner, 2026-10-09)

1. The button under the features is replaced by a **"Try it out"** button under each feature's description (in the switcher and in the phone list).
2. **Trust strip removed**, along with its button.
3. **New order:** how it works → closing band "Every trip starts here." → Add to Home Screen → Questions (FAQ) → footer.

## Third review, TravelPerk side by side (owner, 2026-10-09)

1. **Journey strip** under the hero, where TravelPerk has its logo strip: one trip from before (plan, share with buddies) to during (schedule, discover) to after (log expenses, settle up).
2. **Closing: three cards**, TravelPerk style: **See a sample trip** (a read-only share link of the demo trip) · **Every trip starts here.** + Start planning (main card) · **Put it on your phone** (→ #install). This replaces the single blue band.
3. **No contact in the footer.**
4. **"Here's how it works" replaced by "Add an activity in 3 steps":**
   1. Pick the day, tap +
   2. Say what and where (search the place)
   3. Pick a time, save. It lands on the day and on the map.

   Each step shows a small piece of the app.

## Fourth review (owner, 2026-10-09)

1. **The journey moves** between "Your trip, your way" and "Add an activity in 3 steps", redesigned as a **progress timeline**: three milestones on a track, filled up to "During"; it runs vertically on phones.
2. **No "See a sample trip"**: showing too much could remove the reason to sign up.
3. **The closing is a single call to action**: app icon + wordmark, "Every trip starts here.", **Start planning**. "Put it on your phone" is dropped, since the install section follows right after.

## Brand copy pass (2026-10-09, per `BRAND.md`)

- **Hero headline** stays "Every trip starts here.".
- **Hero card:** "Group split · You get back S$86.40" → **"Shared costs · Costs shared · All square ✓"**.
- **Switcher:** "Budget" → **"Shared costs"**: "Everyone adds what they paid along the way. Fargo keeps it fair, with no awkward chat at the end."
- **FAQ:** "Who can see our spending?" → **"Who can see the costs we add?"** ("Share links show the plan, never the costs.") Money words are softened in the other answers.
- **Journey "After the trip"** keeps both lines.

## Photos and illustrations (2026-10-09, TravelPerk study)

Photos give the travel feel, frog illustrations explain ideas, app snippets prove it's real.

| Spot | Visual | Status |
|---|---|---|
| Hero | Photo: a hand holding the phone (app on screen) | Placeholder in mockup |
| Your trip, your way | Photo behind the phone per feature: Gardens by the Bay · friends at a hawker centre · group around a dinner table · passport with stamps | Placeholder in mockup |
| Closing band | Photo of friends on a trip, darkened behind the text | Placeholder in mockup |
| One trip, start to finish | Frog illustrations per milestone (planning with a map · exploring with a camera · home with its suitcase) | Placeholder in mockup; art later via the AI image pipeline, in one locked style |
| Add to Home Screen | Frog holding a phone | Later |

**Photo source:** Unsplash (free commercial use), favouring Asian friend groups in Southeast Asian places. The DESIGN.md "no stock photos" rule applies to **trip covers** only, not marketing images.

## Owner decisions (2026-10-09)

1. **Contact email:** a free Gmail later. Use a dummy (`hello@example.com`, marked as a placeholder) until the owner supplies it.
2. **Privacy and Terms:** dummy placeholder pages for now; the owner supplies the text later.
3. **Discover copy** ("filtered to your taste") is correct.
4. **Demo trip:** separate kept demo trip "Singapore long weekend" in S$ (from the earlier answer). Creating it in the app still needs a go-ahead, and the "Mei suggested" shot needs a second account.
