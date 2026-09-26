# Fargo — CLAUDE.md (v2)

> **v2 — 2026-09-26.** Replaces `docs/CLAUDE.md` (v1, sunset). Loaded automatically at the start of every session — keep it short and current.

Fargo is a trip planner where the plan and the spending are one record: schedule, prep, money and dining discovery for a trip, shared with invited travellers. Live as a PWA at `fargotravel.vercel.app`; a native iOS app is planned.

## Where things live

| Path | What |
|---|---|
| `app/` | The Next.js app (all code lives here — run commands from `app/`) |
| `app/src/lib/actions/` | Server actions — all data reads/writes |
| `app/src/components/` | UI components, grouped by tab (`schedule/`, `money/`, `prep/`, `bites/`, …) |
| `supabase/migrations/` | **All** SQL migrations. Applied by hand in the Supabase SQL Editor |
| `docs/` | Product, experience, design, technical, roadmap, status, review docs |
| `CHANGELOG.md` | Per-release changes — the most reliable "what shipped" record |

Docs map: `PRODUCT.md` / `EXPERIENCE.md` = original vision (not everything is built) · `DESIGN.md` = design system · `TECHNICAL.md` = how it's actually built · `ROADMAP.md` = phases + decision log · `STATUS.md` = milestone log (newest first) · `REVIEW.md` = review findings.

## Commands

```bash
cd app
npm run dev        # localhost:3000
npx tsc --noEmit   # type check
npx eslint src     # lint
npx next build     # production build
```

## How we work

- **Discuss and plan before coding.** For bugs or reviews: list findings with severity and effort, propose priority batches, and wait for approval before writing code. "Go ahead" on docs means talk it through first, not hand over a finished draft.
- **Plain English.** The owner isn't a security/infra specialist — explain impact, not jargon.
- **Model split (optional):** Opus for planning, architecture and review; Sonnet for routine implementation.

## Testing rules

- **Never mutate real trips** (e.g. "We are Riize", "Xin Cao"). Use **Test Trip Singapore** / **Test trip** or a new test trip; clean up afterwards. Read-only views of real trips are fine.
- The PWA and the planned native app share one Supabase instance — test writes hit production data.
- Claude can't sign in (Google OAuth): ask the owner to sign in in the browser pane, then browse.

## Releasing

1. Bump `version` in `app/package.json` (shown on the Profile page).
2. Add a `CHANGELOG.md` entry at the top.
3. Commit and push `main` → Vercel deploys automatically. Push only when the owner says so.
4. If there's SQL: the owner runs it in the Supabase SQL Editor. When app code depends on new SQL (or SQL removes something old code uses), spell out the order.

## Rules the code depends on

- **Data access:** Supabase JS client with the anon key + user session; **RLS is the security boundary**. No service-role key in the app. Drizzle schema (`app/src/db/schema.ts`) is reference only.
- **Planner-only writes.** Only the trip's planner can create/edit/delete trip content; members are read-only. This is intentional — new write paths must check planner, not membership.
- **SECURITY DEFINER functions** must identify the caller with `auth.uid()` (never trust an account-ID parameter), set `search_path = public`, and `REVOKE EXECUTE … FROM PUBLIC, anon` unless signed-out access is truly needed.
- **Shared trips** (`/s/[code]`) are read only through `get_shared_trip(code)` — no invite code, account IDs, budgets or expenses.
- **Caching:** `getTrip`, `getActivities`, `getExpenses`, `getBudgetSummary` use `unstable_cache` (30s). Every mutation must `revalidateTag` the tags it affects (`trip-…`, `activities-…`, `expenses-…`).
- **"Today"** in client components uses the device's local date; trip "active" state is derived from dates, not the stored `status` column.
- **Design:** follow `docs/DESIGN.md` — Add activity is the reference for forms and chips; generic-icon empty states (`EmptyState`); shadows only on floating layers.
