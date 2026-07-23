---
name: visual-implementation-review
description: Use this skill after an approved UI implementation task when changed VRT targets must be compared with their canonical Playwright baselines before PR review.
---

# Visual Implementation Review Skill

Review approved UI changes with target-limited Playwright VRT.

Use when the user asks to:

- visually review an approved UI, CSS, layout, page, or Component change
- compare changed screens with their VRT baselines before PR review
- investigate a VRT difference inside the current issue scope

Do not use for:

- Markdown-only work
- branch setup, issue creation, commit, push, or PR creation
- baseline creation or update
- VRT baseline creation or update
- review note intake

## Core Rule

Run VRT only when the approved implementation changed UI, CSS, layout, a page,
or a Component. Run it immediately before PR review and limit it to changed
screen targets. Do not run VRT after each edit or run the full local suite as a
normal review step.

`docs/design/<design-target>/` is notes-only. The canonical visual baseline is
the matching Playwright snapshot under `canonical-snapshots/visual/`. Do not
run `visual:capture`, create screenshots for `docs/design/`, or copy an actual
artifact into a design document.

## Preconditions

Before doing anything, verify:

1. A dedicated task branch and `docs/issue/<current-branch>.md` exist.
2. The user has approved implementation for the current issue.
3. The change is inside issue scope and affects a VRT-covered UI target.
4. The target's `docs/design/<design-target>/notes.md` and
   `tests/visual/vrt/<target>.spec.ts` exist.

Stop and report a missing target, missing design note, or scope conflict. Do
not create a VRT test or modify implementation from this skill unless the user
already approved that work in the current issue.

## Workflow

1. Inspect the working tree and read the current issue.
2. Identify each changed VRT target from the changed UI and its design notes.
3. Read the referenced SSoT and note the target tags, states, and viewports.
4. Build the VRT fixture and use the existing 4321 preview server.
5. Run only the changed target with `npm run visual:test -- --grep`.
6. Inspect Playwright's diff artifact only when the target comparison fails.
7. Fix only clear, local mismatches that are inside the approved issue scope.
8. Repeat the changed target comparison after each accepted fix.
9. Update `## ビジュアルレビュー N` in the current issue with the target,
   tags, comparison result, fixes, and unresolved human judgments.
10. Run `npm run check` and `npm run build` when source, style, test, or
    configuration files changed.
11. Stop and report. Do not commit or push.

Use the target tags from the matching VRT spec. For example:

```sh
npm run visual:test -- --grep '@vrt.*@site-layout'
```

Do not run a full local VRT suite unless the user explicitly asks or the work is
to investigate VRT infrastructure.

## Allowed Self-Fixes

Fix only a mismatch that meets every condition:

- the user approved implementation
- the fix is inside current issue scope
- the fix is local and non-destructive
- no new design decision or dependency is required
- no unrelated file is changed

Stop for human judgment when a change affects information architecture,
navigation structure, page text, URLs, global breakpoints, global design
tokens, large Component structure, or a VRT baseline.

## Issue Section Template

Use `## ビジュアルレビュー N`.

```md
## ビジュアルレビュー N

### VRT対象

- design target:
- VRT test / tags:
- route / states / viewports:

### レビュー結果

| 対象 | 判定                     | 差分 | 対応 |
| ---- | ------------------------ | ---- | ---- |
|      | OK / 要修正 / 要人間判断 |      |      |

### 自己修正した項目

- [ ]

### 人間判断が必要な差分

-

### 対応完了チェックリスト

- [ ] 変更targetだけをVRT比較した
- [ ] VRT差分を修正した、または修正不要と判断した
- [ ] baseline更新が必要な差分を人間判断として記録した
- [ ] `npm run check` が通る（該当する場合）
- [ ] `npm run build` が通る（該当する場合）
```

Leave unchecked any item that was not performed, and record why.

## Required Report

Report:

- target and executed tags
- VRT comparison result
- self-fixes and unresolved human judgments
- commands and validation results
- checks skipped and why
- Git operations: not performed unless explicitly instructed
