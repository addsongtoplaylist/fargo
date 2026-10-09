# Fargo — Stamp generation

> **v1.1 — 2026-10-09. Planned, not built — waiting on the style check (API keys).** How each place gets its own passport-stamp artwork for the **Passport stamp** share overlay (v0.5.7). Ho Chi Minh City has hand-made art today; every other place shows a drawn ring with the country code until its stamp is generated.

## Decisions (owner, 2026-10-09)

| # | Decision |
|---|---|
| 1 | **One stamp per Base city**, shared by every user and trip (e.g. "Penang, Malaysia"). A trip without a Base city uses its **country**. |
| 2 | **Generated only once the trip has started** (start date ≤ today), so changing a destination while planning never triggers extra generations. |
| 3 | **Published automatically.** A bad stamp can be regenerated. |
| 4 | **No limit on trips.** Generation runs through a **queue**; places waiting show as **pending**. |
| 5 | **Safety cap: 10 new stamps a day** in total. The rest wait in the queue for the next day. |
| 6 | **Style check first:** 5 test stamps (Penang, Bangkok, Tokyo, Paris, Bali) approved by the owner before the generator is switched on. |
| 7 | **Model: Google Gemini image** ("Nano Banana", `gemini-nano-banana-2.1`, the model behind the Gemini app, ≈ US$0.034 per image, billing required — no free tier). The Ho Chi Minh City sample was made with it, so new stamps match. |
| 8 | **OpenAI (GPT image) is tested alongside Gemini** in the style check; the owner picks the provider from a side-by-side comparison. Final model + price recorded here after the check. |

Claude can't generate images; it writes the prompts and builds everything around the image model.

## How it works

```
Trip started ─▶ daily sweep queues its Base city (if no stamp yet)
                        │
                        ▼
place_stamps row: pending ─▶ generator (Edge Function, one at a time, ≤ 10/day)
                                  │  1. prompt from the house template
                                  │  2. Gemini image
                                  │  3. clean-up: cream ink on transparent, cropped to the circle
                                  │  4. upload to storage
                                  ▼
                        ready  (or failed after 3 tries)
```

### 1. Stamp library (database)

New table **`place_stamps`** (additive):

| Column | What |
|---|---|
| `place_key` | Unique key: country code + normalised city, e.g. `VN:ho chi minh city`; country only: `VN` |
| `city`, `country_code`, `country` | For the prompt and display |
| `status` | `pending` → `making` → `ready` / `failed` |
| `path` | Image in the `place-stamps` storage bucket (when ready) |
| `attempts`, `error` | Retry count (max 3) and last error |
| `requested_at`, `ready_at` | Timestamps (queue order, daily cap) |

- **Storage:** public bucket `place-stamps`, PNG, ≤ 1 MB.
- **Who can do what:** anyone signed in can **read** the library (to show stamps). Only the generator (service role inside the Edge Function) **writes** rows and images. The app never holds the service key or the AI key.
- **Seed:** the Ho Chi Minh City art moves from `app/src/assets/stamps/` into the bucket as the first `ready` row.

### 2. Queueing (only trips that have started)

- A **daily scheduled job** (Supabase `pg_cron`, early morning MYT) looks for trips with `start_date ≤ today` whose Base city (or country) has no `place_stamps` row, and adds them as `pending`.
- Because it only looks at started trips, editing a destination while planning never queues anything. Existing trips that have started are picked up the same way, within the daily cap.

### 3. Generator (Supabase Edge Function `generate-stamps`)

- Runs on a schedule (e.g. every 10 minutes) and handles **one pending place per run**, oldest first, while fewer than **10** stamps have been made today.
- **Prompt:** the house template below, with the place filled in.
- **Clean-up** (automatic, same as the hand-made sample): turn the ink into cream `#f6f2e8` on a transparent background, crop to the stamp's circle, resize to 600 × 600.
- **Failure:** retries up to 3 times across runs, then `failed` (the overlay keeps the drawn ring).
- **Secrets** (Supabase function secrets, never in the app): `GEMINI_API_KEY` or `OPENAI_API_KEY` (whichever wins the style check); the service role key is provided to Edge Functions by Supabase.

### 4. In the app

- The stamp overlay looks up the trip's place in `place_stamps`:
  - **ready** → the stamp art, with Fargo's lettering around the ring
  - **pending / making** → drawn ring + country code; the Share trip sheet adds a small note: *"Your Ho Chi Minh City stamp is being made — check back soon."*
  - **failed / none** → drawn ring + country code, no note
- `lib/stamp-art.ts` (today a hard-coded list) is replaced by this lookup.

### 5. Fixing a bad stamp

- One SQL command resets a place to `pending` (and removes its image); the generator remakes it on its next run. A button for this can come later.

## Prompt (house template)

```
Single-colour rubber ink passport stamp, round, for {CITY}, {COUNTRY}. Double circular border ring with an empty band between the two rings (leave the band blank, no text). In the centre, a simple line illustration of {CITY}'s best-known landmark with one small local street detail beside it, small sun above. Bold, clean linework like a hand-carved rubber stamp, slightly uneven ink coverage with small worn gaps and light texture, as if stamped on paper. One flat ink colour: deep teal. Plain white background, stamp only, centred, no shadow.
```

Negative / avoid: `text, letters, numbers, words, multiple colours, gradients, 3D, photorealistic, paper texture background, frame, shadow, watermark`.

- The ring is left blank on purpose: image models misspell text. Fargo letters the ring itself (place · country on top, month at the bottom).
- The ink colour doesn't matter for the final look (the clean-up re-inks it cream); one dark colour on white keeps the clean-up reliable.

## Cost

About **US$0.03–0.04 per place, once** (Gemini ≈ US$0.034; OpenAI price confirmed during the style check). At most 10 a day → at most ≈ US$12 a month even at full cap; in practice far less, since each place is made only once.

## Rollout

1. **Style check:** generate the 5 test stamps with the template on **both Gemini and OpenAI**, run each through the same clean-up, and show a grid (place × provider, raw and cleaned). Owner picks the provider and approves (adjust the template if needed).
   - **Waiting on owner:** add `GEMINI_API_KEY` and `OPENAI_API_KEY` to `app/.env.local` (gitignored; never paste keys in chat). Gemini needs billing enabled; OpenAI needs credit/billing and may ask to verify the organisation before image models work. Either key alone is enough to start.
   - Run as a local script (scratchpad), not app code; costs well under US$1 for both.
2. **Owner:** add the chosen provider's API key as a Supabase function secret; run the SQL (table, bucket, policies, `pg_cron` jobs); deploy the Edge Function (or sign the Supabase CLI in so Claude can).
3. **Claude:** SQL + undo script, Edge Function, app lookup + pending note, seed Ho Chi Minh City; test on the Test trip.
4. Release (next version after v0.5.7).

## Not affected

The native app, the Passport tab (could use the art later), trip pass and photo ticket overlays, and all existing trip data.
