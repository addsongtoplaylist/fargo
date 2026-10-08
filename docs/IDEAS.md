# Fargo — Idea suggestions

> **v1 — 2026-10-08. Built — released in v0.5.4 (2026-10-09).** Members can suggest ideas; the planner decides what goes on the Schedule. Access rules: `PERMISSIONS.md` (Ideas rows). Shipped together with personal checklists (`CHECKLISTS.md`).

## What changes for people

- **Everyone with an account adds ideas** on Prep. There's no approval step.
- **Every idea shows who suggested it**: "Ali suggested", or "You" for your own. Ideas from before this change show no name.
- **Edit / delete**: the author can change or remove their own ideas, and the planner can change or remove any idea.
- **Move to Schedule is planner-only.** After the move, everyone sees "In schedule", as today.
- **Moving back from Schedule to Ideas keeps the original author.** A scheduled activity remembers who suggested it. An activity the planner added directly counts as the planner's when moved to Ideas.
- **Badge (planner only)**: a number dot on the **Prep** tab of the bottom bar. It counts ideas added by others since the planner last opened Prep, and clears when Prep is opened. Edits don't count. Members get no badge. There's no dot on the My trips cards.
- **Share link**: ideas are hidden (covered by `CHECKLISTS.md`).

## Decisions (owner, 2026-10-08)

1. Moving back to Ideas shows the **original suggester**.
2. With no "last opened" record yet, the badge counts only ideas added **from then on**, never the backlog.
3. The badge goes to the **planner only**, on the **Prep tab only**.

## Database (additive)

| New | What |
|---|---|
| `ideas.created_by` | Account that suggested it (null for old ideas) |
| `activities.suggested_by` | Carried over from the idea on Move to Schedule and back on Move to Ideas |
| `prep_seen` | `account_id` + `trip_id` + `seen_at`: when the planner last opened Prep |
| `add_idea`, `update_idea`, `delete_idea` | SECURITY DEFINER, caller from `auth.uid()`. Add: anyone on the trip with an account. Edit/delete: the author or the planner. They can't change `promoted` |
| `mark_prep_seen(trip_id)`, `prep_badge_count(trip_id)` | Planner only. The count is ideas with `created_by` ≠ the planner and `created_at` > `seen_at` |

- Author names come from the trip's travellers list (members can already read it), matched on `created_by`.
- The existing planner-only policies on `ideas` and `activities` stay untouched, so promoting and the parked native app keep working. The planner's promote and demote paths also copy `created_by` ↔ `suggested_by`.
- **Undo:** drops the new columns, table and functions.

## App changes

- `lib/actions/idea.ts`: `createIdea`, `updateIdea` and `deleteIdea` call the new functions. `getIdeas` adds the author's name. `promoteIdea` passes `suggested_by`.
- `lib/actions/activity.ts`: `demoteActivity` passes `suggested_by` back as `created_by`.
- `components/prep/ideas-section.tsx`: "Add idea" for everyone, the "X suggested" line, edit/× shown only to the author or planner, Move to Schedule shown only to the planner.
- Tab bar: Prep badge for the planner. Prep page calls `mark_prep_seen`.

## Test plan (Test trip only)

1. Member (second account) adds an idea → the planner's Prep tab shows "1" → opening Prep clears it.
2. The member edits and deletes only their own idea. The planner's ideas show no edit/× for the member. A direct database call to edit someone else's idea is refused.
3. The member has no Move to Schedule button. The planner moves the member's idea → Schedule → moves it back → it still shows "Mei suggested".
4. The planner's own new ideas don't badge the planner. Members see no badge.
5. 375px check, gates, clean-up.
