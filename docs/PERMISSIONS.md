# Fargo — Who can do what

> **v2 — 2026-10-09.** The single reference for access rules. When a feature changes who can do something, update this table first, then the code (server actions + database policies), then the spec. v2: personal checklists, idea suggestions and the Schedule-only share link are live (v0.5.4).

## Roles

| Role | Who |
|---|---|
| **Planner** | Created the trip. One per trip. |
| **Member** | Joined the trip with an account (invite link). |
| **Name-only traveller** | Added by the planner by name (e.g. "Mom"). Never signs in — real for splits, can't act. |
| **Link viewer** | Opens the share link (`/s/…`). No account needed. |

## Access

| Area | Action | Planner | Member | Name-only | Link viewer |
|---|---|:-:|:-:|:-:|:-:|
| **Trip** | View the trip | ✅ | ✅ | — | Header + Schedule only |
| | Edit trip settings, delete trip | ✅ | ❌ | — | ❌ |
| | Add / change / reposition / remove the cover photo | ✅ | ❌ | — | ❌ |
| | Copy share link | ✅ | ❌ | — | ❌ |
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

¹ Remove works only for people with no expenses.
² Anyone with an account can log an expense a name-only traveller paid or shares in.

## Notes

- **Default shares are planner-only** because they pre-fill every "Shares" split for everyone, including name-only travellers. Anyone can still change the numbers on an expense they log.
- **The badge**: planner only — a number dot on the Prep tab for ideas added by others since they last opened Prep; clears when Prep opens. No badge for members, none on My trips cards. Full spec: `IDEAS.md`.
- **Ideas moved back from Schedule** keep the person who first suggested them.
- **Default checklists**: copied into a trip automatically the first time you open its Prep; editing a trip's copy doesn't change your defaults (use "Save to my defaults"). Full spec: `CHECKLISTS.md`.
- **Leaving a trip** keeps your checklists for it hidden; they return if you rejoin.
- **Save this trip** (from a share link) copies activities only.
- **Security boundary:** these rules are enforced by Supabase row-level security and database functions, not only by hiding buttons. The native app (`fargo-app`) shares the same database.
