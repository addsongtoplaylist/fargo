# Fargo — Scoping Phase

**Status:** ✅ complete · **Created:** 2026-08-16 · **Completed:** 2026-08-20 · **Focus:** product, not backend
**Target:** scoping finished in **one working session**, ~4 pages total.

## The cut rule

**If it doesn't change what we build, it doesn't get written.** No background, no market opportunity, no restating the same idea three ways. Every section earns its word budget or gets deleted.

## How we work (this is what makes it fast)

1. **Strawman first.** You give the two-minute version. I draft the full doc with specifics invented. You correct it. Reacting to something wrong is far faster than producing something right.
2. **Capped length.** Budgets below are limits, not targets.
3. **Living docs are one-liners.** Decisions and Status get *appended to*, never *composed*.

---

## The deliverables — 4 files

| # | File | Contains | Budget |
|---|---|---|---|
| 1 | `PRODUCT.md` | Foundation · Landscape · Principles · Requirements | ✅ **Done** 2026-08-16 |
| 2 | `EXPERIENCE.md` | User journey · Information architecture | ✅ **Done** 2026-08-17 |
| 3 | `ROADMAP.md` | Build phases · Decision log | ✅ **Done** 2026-08-17 |
| 4 | `STATUS.md` | Where things stand (opens when building starts) | ✅ **Done** 2026-08-20 |

All nine original topics survive as sections. Only the file count shrank.

---

## 1. `PRODUCT.md`

**§1 Foundation** *(~400 words)*
- One-line definition · who it's for · the one thing V1 must nail
- How you do this today, with real examples
- What specifically hurts
- Goals (numbered, each traceable to a pain) · Constraints · Non-goals

**§2 Landscape** *(~150 words — a paragraph, not a matrix)*
- Polarsteps / Day One / Google Maps lists / Notion / Instagram saves / plain notes
- One question only: **why aren't you just using one of these?** The answer is usually the sharpest definition of Fargo available.

**§3 Principles** *(~100 words — 4–6 bullets)*
- Opinionated rules, each falsifiable, each with a "so we won't ___" consequence.
- These pre-decide half of §4.

**§4 Requirements** *(~350 words)*
- Features as a table: name · one-line description · Must / Should / Could / Won't-in-V1
- Only the edge cases that change a screen (no signal, no photo, trip never ended)
- Success criteria — one or two lines
- Out of scope, explicit, with the reason

**Done when:** any "should we build X?" is answerable from §3 + §4.

## 2. `EXPERIENCE.md`

**§1 Journey** *(~400 words)* — your numbered flow in your own words, then screen by screen. Plus the states everyone forgets: empty, offline, error.

**§2 Information architecture** *(~400 words)*
- Content model — the core objects, their fields, how they relate
- Screen map and navigation
- Naming — the app's vocabulary, fixed once so it stays consistent

**Done when:** every journey step has a screen, every screen has a home, every object has a shape.

## 3. `ROADMAP.md`

Dependency-ordered phases, not dates. Each ends in something usable with an explicit **Done when**. Decision log appended at the bottom: **Locked** (dated, with reasoning) and **Open**.

**Done when:** Phase 1 is small enough to start immediately.

## 4. `STATUS.md`

Opens when building starts. What works · what's in flight · what's known-broken · what was deliberately not built.

---

## Not in this phase

Personas, glossary, metrics → folded into the above. **Visual/design direction** → a design pass after scoping. **Stack, storage, architecture** → after that. Scoping stays product-side.

## The plan

| Step | Who | Time |
|---|---|---|
| Two-minute version of Fargo | You | 10 min |
| Draft `PRODUCT.md` | Me | one pass |
| Correct it | You | 15 min |
| Draft `EXPERIENCE.md` from the corrected product | Me | one pass |
| Correct it | You | 15 min |
| `ROADMAP.md` | Me | one pass |

Then we build.
