# Fargo — Stamp library

> **v2.0 — 2026-10-10. Planned, not built — waiting on the style check (API keys).** Passport-stamp artwork for the **Passport stamp** share overlay (v0.5.7). **v2 replaces v1's on-demand generator** (queue, Edge Function, daily cap) with a **pre-made library**: stamps are generated in batches on the owner's machine, reviewed, and shipped with the app. No AI calls while people use Fargo. Ho Chi Minh City has hand-made art today; everywhere else shows a drawn ring until the library ships.

## Decisions (owner, 2026-10-10)

| # | Decision |
|---|---|
| 1 | **Pre-made library, not generated on demand.** Batches are made separately, reviewed, then added — no processing or waiting when a trip is created or shared. |
| 2 | **Per country: up to 6 city stamps + 2 generic country stamps.** (Fewer cities where a country has fewer destinations; city-states get the 2 country stamps only.) |
| 3 | **Which stamp a trip gets:** its Base city's stamp if the library has one → otherwise one of the country's **2 country stamps** (also used when no Base city is set) → otherwise the **fallback**. |
| 4 | **Two country stamps = two designs.** Each trip always gets the same one (picked from the trip id), so different trips vary but a trip's card never changes. |
| 5 | **Fallback:** today's drawn ring with **✈** in the middle — no country code. |
| 6 | **Batch 1 = Asia, including China and India. Batch 2 = popular countries further away.** |
| 7 | **Owner reviews every stamp** before it's added. Nothing is published automatically. |
| 8 | **Stamp names use the state or region name where that's what travellers say** (Penang, not George Town; Hokkaido, Kerala, Palawan). Where the city itself is the destination, the city name stays (Osaka, Bangkok). Matching is by map location, so a trip to George Town or Batu Ferringhi still gets the Penang stamp; the ring lettering keeps the trip's own place name. |
| 9 | **Style check first:** 5 test stamps on **Gemini and OpenAI** side by side; the owner picks the provider. (Gemini "Nano Banana" ≈ US$0.034/image; the Ho Chi Minh City sample was made with it.) |

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

- **Images:** `app/src/assets/stamps/<country code>/<slug>.png` — cream ink on transparent, 600 × 600, ≈ 100–150 KB each. Already bundled with the share-overlay route (`outputFileTracingIncludes` covers `src/assets/**`).
- **Manifest:** `app/src/lib/stamp-library.ts` (replaces the hard-coded list in `lib/stamp-art.ts`). One entry per stamp:

| Field | What |
|---|---|
| `country` | ISO code, e.g. `MY` |
| `kind` | `city` or `country` |
| `name`, `aliases` | e.g. "Penang" · ["George Town", "Pulau Pinang", "Batu Ferringhi"] — for review and as a name match (the ring lettering uses the trip's own place name) |
| `lat`, `lng`, `radiusKm` | Centre and reach, e.g. 50 km for a city, larger for islands/regions (Bali, Hokkaido) |
| `file` | Path to the PNG |

- **Matching:** trips already store the Base city's coordinates (`base_lat`, `base_lng`). Fargo picks the **nearest city stamp in the same country within its radius**; if there are no coordinates, it tries the name and aliases. No database change.
- **Why in the app, not Supabase storage:** simplest (no table, bucket or policies), and stamps ship with normal releases. ~100 stamps ≈ 12–15 MB, fine for the server bundle. Move to storage only if the library passes ~200 stamps.

### 2. Making a batch (owner's machine)

1. `scripts/stamps/generate.mjs` (to be written) reads the batch list, calls the chosen model with the template below, saves raw images to a gitignored `stamps-review/` folder.
2. **Clean-up** (automatic, same as the hand-made sample): ink → cream `#f6f2e8` on transparent, crop to the circle, 600 × 600.
3. **Review sheet:** an HTML contact sheet (raw + cleaned, per place). The owner approves or marks "redo"; redos are regenerated (a few tries per place).
4. Approved stamps are copied into the library and the manifest is updated; ships in the next release.
5. **Later batches:** a read-only query lists Base cities from real trips that have no stamp — the owner picks which to add. No background jobs.

- **Key:** `GEMINI_API_KEY` / `OPENAI_API_KEY` in `app/.env.local` only (gitignored). Never in Vercel, Supabase or the browser.

### 3. In the app

- The stamp overlay uses the library lookup above; the fallback draws the ring with **✈** (the country code is no longer printed in the middle).
- Fargo still letters the ring itself (place · country on top, month at the bottom) — the art leaves the ring blank.

## Batch 1 — Asia (proposed, owner to edit)

| Country | City stamps (up to 6) | + 2 country stamps |
|---|---|---|
| Malaysia | Kuala Lumpur · Penang · Langkawi · Melaka · Kota Kinabalu · Ipoh | ✓ |
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
| India | Delhi · Mumbai · Jaipur · Agra · Goa · Kerala | ✓ |

≈ 63 city + 26 country stamps ≈ **89 stamps** (88 new). Possible additions: Macau, Maldives, Sri Lanka, Nepal, Myanmar, Laos.

## Batch 2 — further away (later)

Popular long-haul destinations, e.g. Australia, New Zealand, United Kingdom, France, Italy, Spain, Switzerland, Turkey, the US, the UAE. List to be agreed after batch 1 ships.

## Prompt (house template)

```
Single-colour rubber ink passport stamp, round, for {CITY}, {COUNTRY}. Double circular border ring with an empty band between the two rings (leave the band blank, no text). In the centre, a simple line illustration of {CITY}'s best-known landmark with one small local street detail beside it, small sun above. Bold, clean linework like a hand-carved rubber stamp, slightly uneven ink coverage with small worn gaps and light texture, as if stamped on paper. One flat ink colour: deep teal. Plain white background, stamp only, centred, no shadow.
```

Negative / avoid: `text, letters, numbers, words, multiple colours, gradients, 3D, photorealistic, paper texture background, frame, shadow, watermark`.

- The ring is left blank on purpose: image models misspell text. Fargo letters the ring itself (place · country on top, month at the bottom).
- The ink colour doesn't matter for the final look (the clean-up re-inks it cream); one dark colour on white keeps the clean-up reliable.

**Country stamp variant:** same template, but the centre shows *"one simple, widely recognised national symbol or landmark of {COUNTRY}"*; the two designs use different symbols (e.g. Japan: Mount Fuji · torii gate). Symbols are agreed in the review sheet.

## Cost

About **US$0.03–0.04 per image**. Batch 1 (≈ 88 stamps, allowing redos) ≈ **US$5–8**, paid once. The style check is well under US$1. Nothing is spent while people use Fargo.

## Rollout and timeline

Elapsed time is mostly the owner's review; Claude's work is about three sessions. Dates assume the keys go in on **Sat 11 Oct 2026**.

| # | Step | Who | Effort | Target |
|---|---|---|---|---|
| 0 | Add `GEMINI_API_KEY` and/or `OPENAI_API_KEY` to `app/.env.local` (billing on; never paste in chat) | Owner | 15 min | Sat 11 Oct |
| 1 | **Style check:** script + clean-up; 5 places (Penang, Bangkok, Tokyo, Seoul, Bali) × 2 providers, raw + cleaned, side by side | Claude | 1 session, < US$1 | Sat 11 Oct |
| 2 | Pick provider, approve or tweak the template | Owner | 30 min | Sun 12 Oct |
| 3 | Confirm batch 1 list + the 2 country symbols per country (Claude proposes the symbols) | Owner | 30 min | Sun 12 Oct |
| 4 | **Generate batch 1** (≈ 88 stamps, ≈ 30–45 min run) + review sheet | Claude | 1 session, ≈ US$4 | Mon 13 Oct |
| 5 | Review: approve or mark redo; 1–2 redo rounds | Owner + Claude | 1–2 days | Tue 14 – Wed 15 Oct |
| 6 | **Build in the app:** library manifest, nearest-stamp matching, country stamp by trip id, ✈ fallback; test every country on the Test trip with a local production build | Claude | 1 session | Wed 15 Oct |
| 7 | Owner looks at the Share trip overlays; **release v0.5.16** | Owner + Claude | 30 min | Thu 16 Oct |
| 8 | Batch 2 (further away): list → generate → review → release | Both | ≈ 2–3 days | After ~2 weeks of batch 1 in use |

## Not affected

The native app, the Passport tab (could use the art later), trip pass and photo ticket overlays, all trip data. **No database or Supabase changes** at all.
