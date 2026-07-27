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

A successful `visual:capture` only means that a snapshot was written. It is
not visual confirmation. Do not report a visual result as confirmed until you
open and inspect the actual snapshot for every declared route, state, and
viewport against the current issue acceptance criteria.

If a positive visual report is later shown to be false, treat it as a material
reporting failure. Record the failure in `docs/agent-failure-log.md`, correct
the current issue review record, keep the issue active, and repeat actual
snapshot inspection before reporting again.

`docs/design/<design-target>/` is notes-only. The canonical visual baseline is
the matching Playwright snapshot under `canonical-snapshots/visual/`. Do not
copy a temporary `visual:capture` snapshot into a design document. Use
`visual:capture` only to hand changed-target snapshots to human review.

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
5. Run `npm run visual:capture -- --grep` for each changed target.
6. Open every captured actual snapshot. Inspect each declared route, state,
   and viewport against the current issue acceptance criteria. Check at least
   alignment, wrapping, clipping, overflow, and interactive control bounds
   when they are relevant to the change.
7. Run only the changed target with `npm run visual:test -- --grep`.
8. Inspect Playwright's diff artifact when the target comparison fails.
9. Fix only clear, local mismatches that are inside the approved issue scope.
10. Repeat capture, actual snapshot inspection, and comparison after each
    accepted fix. Do not reuse a previous inspection result.
11. Update `## ビジュアルレビュー N` in the current issue with the target,
    tags, comparison result, fixes, and unresolved human judgments.
12. Run `npm run check` and `npm run build` when source, style, test, or
    configuration files changed.
13. Stop and report. Do not commit or push.

Use the target tags from the matching VRT spec. For example:

```sh
npm run visual:test -- --grep '@vrt.*@site-layout(?:\s|$)'
```

Use the same tag with `npm run visual:capture` to produce temporary snapshots.

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

### 実画面確認

- route / state / viewport:
  - actual snapshot:
  - checked acceptance criteria:
  - result:

### 自己修正した項目

- [ ]

### 人間判断が必要な差分

-

### 対応完了チェックリスト

- [ ] 変更targetだけをVRT比較した
- [ ] 変更targetだけの一時snapshotを取得した
- [ ] 宣言したすべてのroute / state / viewportのactual snapshotを開いて確認した
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
- actual snapshot inspection result for every declared route, state, and viewport
- self-fixes and unresolved human judgments
- commands and validation results
- checks skipped and why
- Git operations: not performed unless explicitly instructed
