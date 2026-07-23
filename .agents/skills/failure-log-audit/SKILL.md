---
name: failure-log-audit
description: Use this skill when the user asks to audit docs/agent-failure-log.md, identify failure categories with three or more occurrences, summarize risks, propose where permanent countermeasures should be added, discuss a plan with the user, and only implement approved countermeasures after explicit confirmation.
---

# Failure Log Audit Skill

Audit `docs/agent-failure-log.md` and propose permanent countermeasures.

Use when the user asks to:

- audit the agent failure log
- check whether the same failure category has happened three or more times
- identify repeated agent failures
- propose permanent rule, SKILL, checklist, or docs updates for repeated failures
- move handled failure entries to `docs/agent-failure-log-done.md` after approved countermeasures are complete
- move entries the user judges to need no permanent countermeasure to `docs/agent-failure-log-no-action.md`

Do not use for:

- ordinary TODO cleanup
- post-merge plan updates
- review item intake
- implementing failure-log countermeasures before user approval

## Core Rule

Audit first. Report and discuss before changing rules or skills.

Do not implement permanent countermeasures until the user explicitly approves the proposed action.

Do not move entries to `docs/agent-failure-log-done.md` until:

- the permanent countermeasure is implemented
- the countermeasure location is recorded
- the user has confirmed the entry can be treated as handled
- the user has given a commit or cleanup instruction that includes the move

## Audit Workflow

1. Inspect the current branch and working tree.
2. Read `docs/agent-failure-log.md`.
3. Read `docs/agent-failure-log-done.md` if it exists.
4. Identify failure categories and occurrence counts.
5. Identify categories with three or more active occurrences.
6. For each repeated category, summarize:
   - category name
   - occurrence count
   - representative affected tasks or files
   - observed risk
   - likely permanent countermeasure location
   - possible countermeasure
7. Report the audit result to the user.
8. Stop and wait for user direction.

If no category has three or more active occurrences, say so clearly and stop.

## Countermeasure Planning

Possible countermeasure locations:

- `AGENTS.md`
- `.agents/rules/*.md`
- `.agents/skills/*/SKILL.md`
- `docs/agent-failure-log.md`
- issue templates
- review checklists
- other project docs when the failure is about documented workflow

Prefer the smallest durable update that prevents repetition.

Do not add broad restrictions that would block valid work.

Do not update README for agent-only workflow failures unless the user explicitly asks.

## Approval Boundary

The user must explicitly approve implementation before countermeasure edits.

Approval examples:

```txt
その方針で恒久対応して
この対応案で反映して
承認、ルールを更新して
```

Without approval, stop after the audit report or planning discussion.

## Done Movement

Move entries from `docs/agent-failure-log.md` to `docs/agent-failure-log-done.md` only after approved countermeasures are implemented and the user confirms the entries are handled.

When moving an entry:

- preserve the original occurrence details
- add the permanent countermeasure location
- add the move date
- do not delete history
- do not move partially handled categories

Use the format in `docs/agent-failure-log-done.md`.

## User-No-Action Movement

When the user explicitly judges an entry to need no permanent countermeasure, move it from `docs/agent-failure-log.md` to `docs/agent-failure-log-no-action.md`.

- preserve the original occurrence details
- record the user-no-action disposition and move date
- exclude the moved entry from active audit counts
- do not require a permanent countermeasure or post-fix observation
- do not move an entry automatically merely because it is self-reported or has one occurrence; wait for the user's judgment

## Required Report

Report:

- audited file
- repeated categories found, or no repeated categories
- proposed countermeasure location
- proposed countermeasure summary
- whether implementation was performed
- whether any done movement was performed
- validation commands and results if files were edited

If implementation was not approved, explicitly state that no countermeasure was implemented.
