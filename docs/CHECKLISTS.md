# Fargo — Personal checklists

> **v1 — 2026-10-08. Built — released in v0.5.4 (2026-10-09).** Replaces the shared, planner-only checklists. Access rules: `PERMISSIONS.md` (Checklists rows). Shipped together with idea suggestions (`IDEAS.md`).

## What changes for people

- **Everyone has their own checklists on every trip**: the planner and every member with an account. Nobody else sees your lists or ticks, the planner included.
- **Prep** shows **"My checklists"** with a small "Only you can see these" note. Members get **New list** too.
- **Profile → My checklists**: your **default lists** (e.g. "Packing", "Before I fly").
- **Automatic copy**: the first time you open a trip's Prep, your defaults are copied into that trip, all unticked. It works the same for trips you create and trips you join, and happens once per trip. If you delete every list, they don't come back.
- **Editing a trip's copy doesn't change your defaults.** Each list's ⋯ menu has **Save to my defaults**. If a default with the same name exists, it asks "Replace?".
- **Share link (`/s/…`)**: header + Schedule only. The Prep tab is removed; no checklists or ideas are shown.

## Screens (phone)

| Where | What you see |
|---|---|
| Prep | "My checklists" + New list. Cards as today (tick, add item, × deletes an item). ⋯ menu: Rename · Save to my defaults · Delete |
| Prep, no lists | "No lists yet. Add one here, or set up default lists in Profile so they appear on every trip." + link to Profile |
| Profile | New row **My checklists** (count of default lists) |
| Profile → My checklists | Same cards, no tick circles (defaults are templates). New list, rename, delete, add/edit/remove items |
| Share page | Header + Schedule. No Schedule/Prep switch |

## Decisions (owner, 2026-10-08)

1. **Old shared lists** already in trips are copied to the **planner's** personal lists for that trip, ticks included, so nothing is lost. The old rows stay in the database untouched.
2. **New accounts start with no default lists.**
3. **Leaving a trip** keeps your lists for it, hidden; they come back if you rejoin. Deleting a trip removes everyone's lists for it.
4. **"Save this trip" from a share link** copies activities only. It no longer copies ideas, since link viewers can't see them.

## Database (additive: beside the old tables, not on top)

| New | What |
|---|---|
| `my_checklists` | `id`, `account_id` (owner), `trip_id` (null = a default list; deleted with the trip), `name`, `sort_order`, `created_at` |
| `my_checklist_items` | `id`, `list_id` (deleted with the list), `text`, `done`, `sort_order`, `created_at` |
| `my_checklist_setup` | `account_id` + `trip_id`: "defaults already copied into this trip" |
| `setup_my_checklists(trip_id)` | SECURITY DEFINER. Caller from `auth.uid()`, must be on the trip. Copies the caller's defaults once (a unique key on the setup row stops a double copy from two quick loads). |

**Security (row-level):** you can read and change only rows where you are the owner. A trip list also requires that you are on that trip. No one else can read them, the planner included.

**Changed on top (small):** `get_shared_trip` returns empty `checklists` and `ideas` lists. The keys stay, so the parked native app's code keeps working.

**Old tables untouched:** `checklists` and `checklist_items` and their policies stay. The PWA stops reading them. The parked native app (`fargo-app`: `api/checklist.ts`, `prep.tsx`, `AddChecklistSheet.tsx`) still uses them, so dropping them waits for its update.

**One-time copy (decision 1):** in the same SQL file. It inserts each old list and its items into `my_checklists` / `my_checklist_items` for the trip's planner. The trip's setup row is not marked, so the planner's defaults are still copied on first open.

**Undo:** `…_UNDO.sql` drops the three new tables and the function, and restores the previous `get_shared_trip`.

## App changes

- `lib/actions/checklist.ts` reads and writes the new tables. It adds `getMyDefaults`, `saveToDefaults` and `setupMyChecklists`, and the trip-list actions are no longer planner-only.
- Prep page calls `setupMyChecklists(tripId)` before loading lists, and shows checklists to everyone.
- `components/prep/checklist-section.tsx` gets a "My checklists" title, a note, the ⋯ "Save to my defaults" option, and a "template" mode without ticks for Profile.
- New `app/(app)/profile/checklists/page.tsx` + Profile row.
- `shared-trip-view.tsx` drops the Prep tab. `cloneTrip` stops copying ideas.

## Release order

1. Owner runs the SQL (adds only, plus the share-page function change).
2. Deploy the app.
3. If rolling back: deploy the previous app first, then run the undo.

## Test plan (Test trip only)

1. Profile → My checklists: create "Packing" with 3 items; rename; delete an item.
2. Test trip Prep (planner): the old lists appear as yours. Create a list, tick an item, Save to my defaults, accept Replace when the name is the same.
3. Second account (member): Prep shows only their own lists. Their defaults are copied on first open, and not again after deleting them.
4. Planner can't see the member's lists, and the member can't see the planner's (also checked by a direct database read).
5. Share link: header + Schedule only. "Save this trip" copies activities, no ideas.
6. 375px check, gates (tsc, eslint, build), clean up the test lists.
