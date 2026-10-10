# Fargo — Who can do what

> **v3.1 — 2026-10-10** (database guarantees for travellers added). **v3 draft — 2026-10-09.** The single reference for access rules. When a feature changes who can do something, update this table first, then the code (server actions + database policies), then the spec. v2: personal checklists, idea suggestions and the Schedule-only share link are live (v0.5.4). v3 draft: Explore rows added, marked *planned* (`EXPLORE.md`; Explore is shelved as of 2026-10-09).

## Roles

| Role | Who |
|---|---|
| **Planner** | Created the trip. One per trip. |
| **Member** | Joined the trip with an account (invite link). |
| **Name-only traveller** | Added by the planner by name (e.g. "Mom"). Never signs in — real for splits, can't act. |
| **Link viewer** | Opens the share link (`/s/…`). No account needed. |
| **Explore viewer** *(planned)* | Anyone signed in, browsing Explore. Not on the published trip. |

## Access

| Area | Action | Planner | Member | Name-only | Link viewer |
|---|---|:-:|:-:|:-:|:-:|
| **Trip** | View the trip | ✅ | ✅ | — | Header + Schedule only |
| | Edit trip settings, delete trip | ✅ | ❌ | — | ❌ |
| | Add / change / reposition / remove the cover photo | ✅ | ❌ | — | ❌ |
| | Copy share link | ✅ | ❌ | — | ❌ |
| | Share trip overlays (trip pass, stamp, photo ticket) | ✅ | ✅ | — | ❌ |
| **Travellers** | Invite, quick add, rename name-only, remove¹ | ✅ | ❌ | — | ❌ |
| | Leave trip, change owner (pick their name) | — | ✅ | — | ❌ |
| **Schedule** | Add, edit, move, delete, reorder activities | ✅ | View | — | View |
| **Ideas** | Add an idea (shown as "Ali suggested") | ✅ | ✅ | — | Hidden |
| | Edit / delete an idea | ✅ any | ✅ own only | — | ❌ |
| | Move an idea to Schedule | ✅ | ❌ | — | ❌ |
| **Checklists** | Create, edit, tick, delete lists and items | ✅ own only | ✅ own only | — | Hidden |
| | See other people's lists | ❌ | ❌ | — | ❌ |
| | My default lists (Profile) | ✅ | ✅ | — | — |
| **Money** | Log an expense | ✅ | ✅ | via others² | ❌ |
| | Edit / delete an expense | ✅ any | ✅ ones they logged | — | ❌ |
| | Set **default** shares for the trip (Split shares) | ✅ | ❌ | — | ❌ |
| | Change shares **on an expense they log** | ✅ | ✅ | — | ❌ |
| | Mark settled | ✅ any | ✅ if they owe | via planner | ❌ |
| | Unmark settled | ✅ any | ✅ if they paid | — | ❌ |
| | Set budget | ✅ own | ✅ own | — | ❌ |
| | See settle-ups | ✅ all | ✅ all | — | ❌ |
| **Discover** | Search places | ✅ | ✅ | — | ❌ |
| | Add a place to the schedule | ✅ | ❌ | — | ❌ |
| | Suggest a place as an idea | — | ✅ | — | ❌ |

| **Explore** *(planned)* | Publish, update or unpublish the trip (after it ends) | ✅ | ❌ | — | ❌ |
| | Choose whether the cover photo is shown | ✅ | ❌ | — | ❌ |
| | See the "On Explore" label | ✅ | ✅ | — | ❌ |
| | See that the trip was hidden or removed after reports | ✅ | ❌ | — | ❌ |

**Explore (planned)**: what an Explore viewer can do with someone else's published trip. Full spec: `EXPLORE.md`.

| Action | Explore viewer | Signed out |
|---|:-:|:-:|
| Browse Explore, open a published trip | ✅ | ❌ |
| **+ Idea**: add a place to Ideas of an upcoming or ongoing trip they're on, same country | ✅ (as a suggestion if they're a member) | ❌ |
| **Copy day** into a trip | ✅ only upcoming or ongoing trips they plan, same country | ❌ |
| **Use this trip**: new trip from the plan | ✅ | ❌ |
| Report a trip (once per trip; hidden for them straight away) | ✅ | ❌ |
| See expenses, checklists, ideas, notes, other travellers' names, exact dates | ❌ | ❌ |

¹ Remove works only for people with no expenses.
² Anyone with an account can log an expense a name-only traveller paid or shares in.

## Notes

- **Default shares are planner-only** because they pre-fill every "Shares" split for everyone, including name-only travellers. Anyone can still change the numbers on an expense they log.
- **The badge**: planner only — a number dot on the Prep tab for ideas added by others since they last opened Prep; clears when Prep opens. No badge for members, none on My trips cards. Full spec: `IDEAS.md`.
- **Ideas moved back from Schedule** keep the person who first suggested them.
- **Default checklists**: copied into a trip automatically the first time you open its Prep; editing a trip's copy doesn't change your defaults (use "Save to my defaults"). Full spec: `CHECKLISTS.md`.
- **Leaving a trip** keeps your checklists for it hidden; they return if you rejoin.
- **Nobody can put someone else on a trip.** A person's account is linked to a trip only when *they* use the invite link or claim their name (or the planner hands over ownership to an existing traveller). The planner adds people by name only. Enforced in the database since v0.5.11 (`travellers_guard_account_link`).
- **The invite page** shows the trip and travellers' names to anyone with the link, but never other people's account details.
- **Save this trip** (from a share link) copies activities only.
- **Reported trips** (planned): hidden for everyone at 3 reports. Only the app owner restores or removes them, in the Supabase dashboard; there's no in-app admin role yet. Full spec: `EXPLORE.md` → Reports.
- **Security boundary:** these rules are enforced by Supabase row-level security and database functions, not only by hiding buttons. The native app (`fargo-app`) shares the same database.
