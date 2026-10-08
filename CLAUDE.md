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

Docs map: `PRODUCT.md` / `EXPERIENCE.md` = original vision (not everything is built) · `DESIGN.md` = design system · `PERMISSIONS.md` = who can do what (update it first when access changes) · `CHECKLISTS.md` / `IDEAS.md` = personal checklists / idea suggestions specs · `TECHNICAL.md` = how it's actually built · `ROADMAP.md` = phases + decision log · `STATUS.md` = milestone log (newest first) · `REVIEW.md` = review findings.

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

- **Never mutate real trips** (e.g. "We are Riize", "Xin Cao"). Test only on **"Test trip" (Vietnam)**; clean up afterwards. Read-only views of real trips are fine.
- **Databases:** production Supabase `ejduelwzdsompgemmxeh` (PWA + native production build); **staging** `lpiadmuojfbktajvcfzy` (native staging build). Try risky SQL on staging first.
- The PWA and the planned native app share one Supabase instance — test writes hit production data.
- Claude can't sign in (Google OAuth): ask the owner to sign in in the browser pane, then browse.

## Releasing

1. Bump `version` in `app/package.json` (shown on the Profile page).
2. Add a `CHANGELOG.md` entry at the top.
3. Commit and push `main` → Vercel deploys automatically. Push only when the owner says so.
4. If there's SQL: the owner runs it in the Supabase SQL Editor. When app code depends on new SQL (or SQL removes something old code uses), spell out the order.

## Rules the code depends on

- **Shared database:** the native app (`~/Desktop/fargo-app`, repo `addsongtoplaylist/fargo-app`) uses the same Supabase project. Before changing any table, policy or database function, grep `fargo-app/packages/core/src/api` for how it's used and keep it working (or plan its update).
- **Data access:** Supabase JS client with the anon key + user session; **RLS is the security boundary**. No service-role key in the app. Drizzle schema (`app/src/db/schema.ts`) is reference only.
- **Planner-only writes — except money, ideas and checklists.** Only the planner edits activities and trip settings; members are read-only there. **Ideas** (`docs/IDEAS.md`): anyone on the trip suggests; the author or planner edits/deletes (`add_idea`, `update_idea`, `delete_idea`); only the planner moves an idea to Schedule. **Checklists** are personal (`docs/CHECKLISTS.md`, `my_checklists` tables) — owner-only, nobody else sees them; the old `checklists` tables stay for the parked native app. **Expenses are the exception** (group expenses, `docs/EXPENSES.md`): any traveller with an account can log; you edit what you logged, the planner edits anything; settle-ups by the person who owes or the planner; each traveller sets their own budget. All money writes go through database functions (`save_expense`, `delete_expense`, `mark_settled`, `unmark_settled`, `set_my_budget`).
- **Travellers without an account** (`account_id` null) are real travellers for splits. Invite links require picking an unclaimed name when any exist.
- **SECURITY DEFINER functions** must identify the caller with `auth.uid()` (never trust an account-ID parameter), set `search_path = public`, and `REVOKE EXECUTE … FROM PUBLIC, anon` unless signed-out access is truly needed.
- **Shared trips** (`/s/[code]`) are read only through `get_shared_trip(code)` — no invite code, account IDs, budgets or expenses.
- **Caching:** `getTrip`, `getActivities`, `getExpenses`, `getBudgetSummary` use `unstable_cache` (30s). Every mutation must `revalidateTag` the tags it affects (`trip-…`, `activities-…`, `expenses-…`).
- **"Today"** in client components uses the device's local date; trip "active" state is derived from dates, not the stored `status` column.
- **Design:** follow `docs/DESIGN.md` (v0.8 redesign) — floating bottom bar for trip sections, floating + for the main add, category icons (no emoji), shadows only on floating layers; Add activity is the form reference. New screens use the v0.8 tokens (`page`, `surface`, `fg`, `line`, `brand`…) and `components/ui/` building blocks; `docs/REDESIGN.md` records what each screen must still do — no feature is removed without the owner's OK.
