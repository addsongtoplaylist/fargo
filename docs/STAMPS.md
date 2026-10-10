# Fargo — Stamp library

> **v2.1 — 2026-10-11. Style agreed (OpenAI); batch 1 list ready for owner review (`STAMPS-BATCH1.md`).** v2.0 — 2026-10-10: Passport-stamp artwork for the **Passport stamp** share overlay (v0.5.7). **v2 replaces v1's on-demand generator** (queue, Edge Function, daily cap) with a **pre-made library**: stamps are generated in batches on the owner's machine, reviewed, and shipped with the app. No AI calls while people use Fargo. Ho Chi Minh City has hand-made art today; everywhere else shows a drawn ring until the library ships.

## Decisions (owner, 2026-10-10)

| # | Decision |
|---|---|
| 1 | **Pre-made library, not generated on demand.** Batches are made separately, reviewed, then added — no processing or waiting when a trip is created or shared. |
| 2 | **Per country: up to 6 city stamps + 2 generic country stamps** — **Malaysia (home market) up to 8**. (Fewer cities where a country has fewer destinations; city-states get the 2 country stamps only.) |
| 3 | **Which stamp a trip gets:** the stamp whose area contains the Base city, if any (never a neighbouring place's stamp) → otherwise one of the country's **2 country stamps** (also used when no Base city is set) → otherwise the **fallback**. |
| 4 | **Two country stamps = two designs.** Each trip always gets the same one (picked from the trip id), so different trips vary but a trip's card never changes. |
| 5 | **Fallback:** today's drawn ring with **✈** in the middle — no country code. |
| 6 | **Batch 1 = Asia, including China, plus Turkey (2 places + 2 country stamps). India removed (owner, 2026-10-11).** Batch 2 = popular countries further away. |
| 7 | **Owner reviews every stamp** before it's added. Nothing is published automatically. |
| 8 | **Stamp names use the state or region name where that's what travellers say** (Penang, not George Town; Hokkaido, Kerala, Palawan). Where the city itself is the destination, the city name stays (Osaka, Bangkok). Matching is by map location, so a trip to George Town or Batu Ferringhi still gets the Penang stamp; the ring lettering keeps the trip's own place name. |
| 9 | **Collecting comes later.** The owner wants users to **collect stamps** eventually (e.g. in the Passport tab). Not part of v0.5.16, but the library is built for it: every stamp has a **permanent id** that never changes or gets reused, and both country designs are distinct stamps (a second trip to a country can earn the other one). |
| 10 | ~~Style check on Gemini and OpenAI~~ **Done 2026-10-11: OpenAI `gpt-image-2.5-flare` (medium quality). Gemini dropped.** Flare was picked over `gpt-image-2` after a same-prompt comparison: the owner preferred its look, and it uses **~4× fewer output tokens** (439 vs 1,756 per 1024² stamp at the same US$30 per 1M) → ≈ **US$0.014 vs 0.054 a stamp**, and ~14 s vs ~35 s. Risk: the codename suggests a preview model — stamps already made are kept for good, but batch 2 could look slightly different if it's withdrawn. Three rounds: round 1 (all round, all with a sun, similar layouts), round 2 (owner feedback below), lettering tests. |
| 11 | **Style (owner, 2026-10-11):** one teal rubber-stamp ink style for the whole set; **no sun or moon**; a **different shape** per stamp from **8 friendly shapes** — circle, rounded square, tall arch, hexagon, wide oval, tall rectangle, postage stamp and **dome** — rotating so neighbours never repeat. **Not used:** shield (looks odd), triangles pointing up (hazard sign) or down (awkward pennant), octagon (stop sign), diamond (road sign); ticket, scalloped circle, cloud edge and pill were considered and declined; a **different composition** per stamp (close-ups, views through arches, panoramas, steep perspective — not the same landmark-in-the-middle layout). |
| 12 | **Lettering in the art** (gpt-image-2 spelled every test correctly): city stamps alternate **city + country** and **city only**; country stamps show the **country**. Placement follows the shape: **curved** along round borders, **header bar** on squares, **vertical** on tall rectangles, **big postcard letters** on wide ovals, **ribbon** or **band** on the rest, and a **hanging luggage tag** on about 1 in 10 — drawn **large** (about a quarter of the stamp's width) so its lettering stays readable. "Part of the scene" was tried and dropped (too small to read). |
| 13 | **No date** anywhere — not in the art, not on the card. |
| 14 | ~~White share card~~ **Superseded 2026-10-11:** the owner tried a boarding-pass redesign, then **removed the Passport stamp card** from Share trip (v0.5.16). Stamps stay teal on transparent, one version each, and are kept for **collecting in Passport**. They won't go on the Trip pass or Photo ticket. |

Claude can't generate images; it writes the prompts and the scripts around the image model.

## How it works

```
Owner's machine (script, key in app/.env.local)        Fargo app
─────────────────────────────────────────────          ───────────────────────────────
city list ─▶ prompt ─▶ image model ─▶ clean-up            share overlay asks the library:
        ─▶ review sheet ─▶ owner approves                 Base city near a stamp? ─▶ city stamp
        ─▶ PNGs + manifest into the app ─▶ release        else country stamp (1 of 2)
                                                          else drawn ring + ✈
```

### 1. Library (inside the app)

- **Images (built 2026-10-11):** `app/src/assets/stamps/<CC>/<slug>.png` — **124 stamps** (60 place + 64 country), one exact teal **#065E6B** (the median ink of the approved set) on transparent, cropped to the stamp's shape, long side 800 px, 32-level palette PNG ≈ 50 KB each (6.6 MB in total). Made by `scripts/stamps/clean.py`. Already bundled with the share-overlay route (`outputFileTracingIncludes` covers `src/assets/**`).
- **Manifest:** `app/src/lib/stamp-library-data.ts`, generated by `scripts/stamps/build-library.py` (place areas + aliases live there); lookup `stampFor()` in `app/src/lib/stamp-library.ts`. Tested by `scripts/stamps/test-library.sh` (26 real places: George Town→Penang, Lawas→Sarawak, Semporna→Sabah, Nara→Japan country stamp, …). (`lib/stamp-art.ts` and the old cream art were deleted in v0.5.16.) One entry per stamp:

| Field | What |
|---|---|
| `id` | **Permanent** id, e.g. `MY-penang`, `MY-country-1` — never renamed or reused (collections will point to it) |
| `country` | ISO code, e.g. `MY` |
| `kind` | `city` or `country` |
| `name`, `aliases` | e.g. "Penang" · ["George Town", "Pulau Pinang", "Batu Ferringhi"] — for review and as a name match (the ring lettering uses the trip's own place name) |
| `areas` | One or more circles `[lat, lng, km]` — cities use one; states and long islands use several (Sarawak 6, Sabah 3, Hokkaido 3, Palawan 3) so a stamp follows the real area and never covers a neighbour |
| `file` | Path to the PNG |

- **Matching:** trips already store the Base city's coordinates (`base_lat`, `base_lng`). A city stamp is used **only if the Base city is inside that stamp's own area** (its radius); if two areas overlap, the closer centre wins. **A stamp never stands in for a different place** — e.g. a trip in Sabah with no Sabah stamp gets the **Malaysia country stamp**, never Sarawak's. If there are no coordinates, it tries the name and aliases. No database change.
- **Why in the app, not Supabase storage:** simplest (no table, bucket or policies), and stamps ship with normal releases. ~100 stamps ≈ 12–15 MB, fine for the server bundle. Move to storage only if the library passes ~200 stamps.

### 2. Making a batch (owner's machine)

1. `scripts/stamps/generate.mjs` (to be written) reads the batch list, calls the chosen model with the template below, saves raw images to a gitignored `stamps-review/` folder.
2. **Clean-up** (automatic): white paper → transparent, ink → one exact Fargo teal so every stamp matches, crop to the stamp's shape. (`clean.py` currently re-inks cream for the old navy card; switch to teal when building v0.5.16.)
3. **Review sheet:** an HTML contact sheet (raw + cleaned, per place). The owner approves or marks "redo"; redos are regenerated (a few tries per place).
4. Approved stamps are copied into the library and the manifest is updated; ships in the next release.
5. **Later batches:** a read-only query lists Base cities from real trips that have no stamp — the owner picks which to add. No background jobs.

- **Key:** `GEMINI_API_KEY` / `OPENAI_API_KEY` in `app/.env.local` only (gitignored). Never in Vercel, Supabase or the browser.

### 3. In the app

- The stamp overlay uses the library lookup above on a **white** card; the fallback draws a plain ring with **✈** (no country code).
- The place name is part of the artwork now, so Fargo no longer letters a ring around it; no month or year is shown.

## Batch 1 — Asia (proposed, owner to edit)

| Country | City stamps (up to 6) | + 2 country stamps |
|---|---|---|
| Malaysia (up to 8) | Kuala Lumpur · Penang · Langkawi · Melaka · Sabah · Sarawak · Ipoh · *(8th slot open, e.g. Cameron Highlands or Johor Bahru)* | ✓ |
| Singapore | — (city-state) | ✓ |
| Thailand | Bangkok · Phuket · Chiang Mai · Krabi · Pattaya · Koh Samui | ✓ |
| Indonesia | Bali · Jakarta · Yogyakarta · Bandung · Lombok · Komodo (Labuan Bajo) | ✓ |
| Vietnam | Ho Chi Minh City (hand-made, kept) · Hanoi · Da Nang · Hoi An · Nha Trang · Ha Long Bay | ✓ |
| Philippines | Manila · Cebu · Boracay · Palawan · Bohol · Siargao | ✓ |
| Cambodia | Siem Reap · Phnom Penh | ✓ |
| Japan | Tokyo · Osaka · Kyoto · Hokkaido · Fukuoka · Okinawa | ✓ |
| South Korea | Seoul · Busan · Jeju · Gyeongju · Incheon · Gangneung | ✓ |
| Taiwan | Taipei · Taichung · Tainan · Kaohsiung · Hualien · Jiufen | ✓ |
| Hong Kong | — (city) | ✓ |
| China | Beijing · Shanghai · Chengdu · Chongqing · Xi'an · Guilin | ✓ |
| Turkey | Istanbul · Cappadocia | ✓ |

≈ 64 city + 26 country stamps ≈ **90 stamps** (89 new; 90 with an 8th Malaysian place). Possible additions: Macau, Maldives, Sri Lanka, Nepal, Myanmar, Laos.

## Next — collecting stamps (after v0.5.16; being designed)

- A traveller "earns" a stamp from a trip they were on (planner or member), probably once the trip has ended.
- To decide when we build it: **work it out from trips each time** (simple, no new data, but changing a stamp's area could change what someone has) **or save each stamp when earned** (a small table; collections never change). Leaning: save when earned.
- Ideas: a stamp book in Passport, "7 of 8 Malaysia stamps", sharing a page of stamps.

## Batch 2 — further away (later)

**Agreed 2026-10-11: 19 countries, 2 country stamps each (no city stamps) = 38 stamps.** Review table: `STAMPS-BATCH2.md` (built by `build-batch-2.py`).

- **Round E — Asia + Oceania:** Maldives · Brunei · Macau · Sri Lanka · Australia · New Zealand
- **Round F — Europe, Americas, Africa:** United Kingdom · France · Italy · Switzerland · Spain · Netherlands · Greece · Germany (castle + cuckoo clock, no alcohol imagery) · Iceland · United States · Canada · Egypt · Morocco
- **Not included (owner):** India, Kazakhstan, Uzbekistan, Saudi Arabia, UAE, Nepal, Jordan.

## Prompt (house template, `scripts/stamps/generate.mjs`)

```
Single-colour rubber ink travel stamp for {NAME}, {COUNTRY}.
Shape: {SHAPE}, with a bold double-line border that follows that shape.
Inside the border, a line illustration of {SUBJECT}.
Composition: {COMPOSITION}. Everything stays inside the border.
Style: bold, clean linework like a hand-carved rubber stamp, slightly uneven ink coverage with small worn
gaps and light texture, as if stamped on paper.
One flat ink colour: deep teal. Plain white background, the stamp only, centred, no shadow, no paper texture.
No sun, no moon. Lettering: the text "{LINE 1}" and "{LINE 2}" in bold capital letters, spelled exactly as
given, {PLACEMENT}, in the same ink. No other text, letters or numbers.
```

Preview any prompt without calling OpenAI: `node scripts/stamps/generate.mjs scripts/stamps/batch-1.json --dry-run --only MY-penang`. Per-stamp fields live in `scripts/stamps/batch-1.json`, built by `build-batch-1.py` (shape rotation, lettering alternation, placement by shape, hanging tag ≈ 1 in 10). Review table: `docs/STAMPS-BATCH1.md`.

## Cost

≈ **US$0.014 per stamp** (`gpt-image-2.5-flare`, medium: ~230 prompt tokens + ~440 image tokens). Batch 1 (89 stamps + ~30 % redos ≈ 115 images) ≈ **US$1.60**, paid once. Every call's token usage is logged to `stamps-review/usage.jsonl`. Nothing is spent while people use Fargo.

## Rollout and timeline

Elapsed time is mostly the owner's review; Claude's work is about three sessions. Dates assume the keys go in on **Sat 11 Oct 2026**.

| # | Step | Who | Effort | Target |
|---|---|---|---|---|
| 0 | Add `GEMINI_API_KEY` and/or `OPENAI_API_KEY` to `app/.env.local` (billing on; never paste in chat) | Owner | 15 min | Sat 11 Oct |
| 1 | ✅ **Style check (done 2026-10-11, OpenAI):** script + clean-up; **10 stamps** × 2 providers = 20 images, raw + cleaned, side by side — 7 place stamps (Penang · Bangkok · Tokyo · Bali · Agra · Hokkaido · Sarawak) + 3 country stamps (Malaysia · Japan · China), covering buildings, fine detail, nature/regions and the country style | Claude | 1 session, ≈ US$1–1.5 | Sat 11 Oct |
| 2 | Pick provider, approve or tweak the template | Owner | 30 min | Sun 12 Oct |
| 3 | Confirm batch 1 list + the 2 country symbols per country (Claude proposes the symbols) | Owner | 30 min | Sun 12 Oct |
| 4 | **Generate batch 1 in 4 review rounds**, so feedback from each round improves the next: **A** Malaysia + Singapore (11) → **B** Thailand, Indonesia, Vietnam, Philippines, Cambodia (36) → **C** Japan, South Korea, Taiwan, Hong Kong (26) → **D** China + India (16). One review sheet per round | Claude | ≈ 30 min run in total, ≈ US$1.60 | Mon 13 Oct |
| 5 | Review: approve or mark redo; 1–2 redo rounds | Owner + Claude | 1–2 days | Tue 14 – Wed 15 Oct |
| 6 | **Build in the app:** library manifest, nearest-stamp matching, country stamp by trip id, ✈ fallback; test every country on the Test trip with a local production build | Claude | 1 session | Wed 15 Oct |
| 7 | ✅ **Released v0.5.16 (2026-10-11):** library in the app; the stamp card was removed from Share trip instead of redesigned | Owner + Claude | — | Sat 11 Oct |
| 8 | Batch 2 (further away): list → generate → review → release | Both | ≈ 2–3 days | After ~2 weeks of batch 1 in use |

## Not affected

The native app, the Passport tab (could use the art later), trip pass and photo ticket overlays, all trip data. **No database or Supabase changes** at all.
