I want you to adopt the following development workflow for this project.

# DEVELOPMENT WORKFLOW

The project should use a documentation-driven workflow where the Markdown files in `/docs` are the source of truth.

The goal is to:
1. Use Opus primarily for planning, architecture, complex reasoning, and review.
2. Use Sonnet primarily for implementation, testing, and routine debugging.
3. Keep project knowledge in Markdown files rather than relying on conversation history.
4. Keep implementation focused and avoid unnecessary rewrites.
5. Make it easy to start a new Claude Code session without losing important project context.

---

# DOCUMENTATION STRUCTURE

Create and maintain these files:

/docs/PLAN.md
/docs/PROGRESS.md
/docs/DECISIONS.md
/docs/REVIEW.md

If `/docs` does not exist, create it.

## PLAN.md

Contains the intended solution.

Include:
- Project/feature goal
- Requirements
- User flows
- Technical requirements
- Architecture
- Implementation approach
- Constraints
- Edge cases
- Acceptance criteria
- Tasks/subtasks

PLAN.md should describe WHAT we are building and HOW it should work.

Do not unnecessarily modify PLAN.md during implementation unless the plan genuinely changes.

---

## PROGRESS.md

Contains the current implementation state.

Include:
- Completed work
- Current task
- Files/components changed
- Tests performed
- Known issues
- Blockers
- Deviations from PLAN.md
- Next steps

Keep this concise and up to date.

---

## DECISIONS.md

Contains important project decisions.

For each meaningful decision, record:

### Decision
What was decided.

### Context
Why the decision was necessary.

### Alternatives considered
What other approaches were considered.

### Reason
Why the chosen approach was preferred.

Only record meaningful architectural, technical, product, or UX decisions. Do not fill this file with trivial changes.

---

## REVIEW.md

Contains findings from architectural/code reviews.

Include:
- Bugs
- Architecture concerns
- Edge cases
- Security concerns
- Performance concerns
- UX concerns
- Maintainability concerns
- Technical debt
- Recommended fixes

Mark findings as:
- Critical
- High
- Medium
- Low

Remove or mark findings as resolved once they have been addressed.

---

# MODEL RESPONSIBILITIES

When operating as OPUS:

Prioritize:
- Understanding the problem
- Architecture
- Complex reasoning
- Planning
- Identifying edge cases
- Challenging assumptions
- Reviewing implementation
- Finding difficult bugs
- Assessing maintainability and scalability

Do NOT unnecessarily implement large amounts of routine code.

When operating as SONNET:

Prioritize:
- Implementation
- UI development
- API integration
- Tests
- Routine debugging
- Refactoring
- Small improvements
- Following the existing architecture and PLAN.md

Do NOT redesign the architecture unless you discover a genuine conflict or problem.

If you discover an architectural issue while implementing, document it in PROGRESS.md and, when appropriate, DECISIONS.md rather than silently changing the architecture.

---

# DEVELOPMENT CYCLE

Use this general cycle:

## PHASE 1 — PLAN

OPUS:

1. Understand the requirements.
2. Inspect the relevant existing code.
3. Identify architectural implications.
4. Identify edge cases and risks.
5. Create/update PLAN.md.
6. Define clear acceptance criteria.
7. Do not start implementation unless explicitly asked.

---

## PHASE 2 — IMPLEMENT

SONNET:

1. Read PLAN.md.
2. Read relevant sections of PROGRESS.md and DECISIONS.md.
3. Inspect the existing implementation.
4. Implement the planned solution.
5. Make the smallest reasonable changes.
6. Do not modify unrelated files.
7. Avoid unnecessary rewrites.
8. Run relevant tests/checks.
9. Update PROGRESS.md.

At the end, briefly report:
- What changed
- What was tested
- Any remaining issues

Do not provide lengthy explanations unless requested.

---

## PHASE 3 — DEBUG

SONNET should handle normal debugging first.

When encountering an error:

1. Reproduce the problem.
2. Identify the root cause.
3. Fix the smallest necessary part.
4. Run the relevant tests/checks.
5. Update PROGRESS.md with the root cause and solution.

Escalate to OPUS when:
- The root cause is unclear after reasonable investigation.
- Multiple architectural components are involved.
- The fix requires significant architectural changes.
- The same problem keeps recurring.
- There is a difficult performance, security, concurrency, or data-integrity issue.

---

## PHASE 4 — REVIEW

OPUS:

1. Read PLAN.md.
2. Read PROGRESS.md.
3. Read DECISIONS.md.
4. Inspect the actual implementation.
5. Compare implementation against the intended requirements.
6. Look for:
   - Incorrect assumptions
   - Architectural problems
   - Bugs
   - Edge cases
   - Security issues
   - Performance problems
   - UX problems
   - Maintainability issues
   - Unnecessary complexity
7. Record findings in REVIEW.md.
8. Do not immediately rewrite the implementation unless explicitly asked.

The review should challenge the implementation rather than simply confirm that it works.

---

## PHASE 5 — FIX REVIEW FINDINGS

SONNET:

1. Read REVIEW.md.
2. Fix the identified issues.
3. Do not blindly implement recommendations that are unnecessary.
4. Verify each fix.
5. Update PROGRESS.md.
6. Mark resolved issues in REVIEW.md.

If a review finding requires substantial architectural reasoning, stop and escalate to OPUS.

---

# CONTEXT MANAGEMENT

The Markdown documentation is the project's persistent memory.

Do not depend unnecessarily on previous conversation history.

Before starting a task:
1. Read the relevant documentation.
2. Inspect the actual code.
3. Use the documentation and code as the source of truth.

If the conversation becomes very long or a major milestone is completed, update the relevant Markdown files so the project can safely continue in a new Claude Code session.

Do not duplicate large amounts of code or conversation history inside Markdown files.

Keep documentation concise and useful.

---

# MINIMAL CHANGE PRINCIPLE

Unless explicitly asked otherwise:

- Make the smallest change that correctly solves the problem.
- Preserve existing working behavior.
- Do not rewrite unrelated code.
- Do not introduce dependencies without justification.
- Do not refactor merely for stylistic reasons.
- Do not change architecture without documenting the decision.
- Do not modify files unrelated to the task.

---

# COMMUNICATION STYLE

Keep responses concise.

After implementation, normally report:

1. Done — what changed.
2. Tested — what was verified.
3. Issues — anything remaining.

Do not repeatedly explain code that was not requested.

When you need clarification, ask before making a major assumption.

---

# IMPORTANT

Do not treat this workflow as a rigid requirement when it would make development unnecessarily inefficient.

Use judgment.

The primary goals are:

- High-quality implementation
- Efficient use of model context
- Clear project memory
- Separation between planning and implementation
- Strong architectural review
- Minimal unnecessary code generation
- Ability to continue work across fresh Claude Code sessions

From now on, follow this workflow for this project.