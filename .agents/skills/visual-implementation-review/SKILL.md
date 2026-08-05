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

A full-page screenshot is an overview artifact only. Never use it as evidence
that a local acceptance condition is satisfied, including text wrapping,
control size or bounds, field alignment, clipping, or overflow. For every
changed section or Component state with a local display contract, capture and
open an original-pixel-resolution locator screenshot of its smallest owner
section or Component for every declared state and viewport. A positive visual
report requires those locator screenshots; a full-page screenshot cannot
substitute for them.

Use the project's test-owned capture path for locator screenshots. If the
current capture cannot provide a required locator screenshot, record the gap
in the current issue and stop for direction. Do not substitute a full-page
screenshot or create an ad hoc browser script.

If a positive visual report is later shown to be false, treat it as a material
reporting failure. Record the failure in `docs/agent-failure-log/active.md`, correct
the current issue review record, keep the issue active, and repeat actual
snapshot inspection before reporting again.

`docs/design/<design-target>/` is notes-only. The canonical visual baseline is
the matching Playwright snapshot under `canonical-snapshots/visual/`. Do not
copy a temporary `visual:capture` snapshot into a design document. Use
`visual:capture` only to hand changed-target snapshots to human review.

## Preconditions

Before doing anything, resolve the current implementation contract and verify:

1. A dedicated task branch exists. Use its issue only for a non-Gate task. For
   a Gate, identify the active `docs/issue/<child-issue>.md` from the parent
   Gate plan and read the corresponding `docs/issue/<parent-issue>/plan.md`.
   Do not infer the current issue from the branch name when a Gate child issue
   is active.
2. The user has approved implementation for that current issue.
3. The change is inside issue scope and affects a VRT-covered UI target.
4. The target's `docs/design/<design-target>/notes.md` and
   `tests/vrt/<target>.spec.ts` exist.

Stop and report a missing target, missing design note, or scope conflict. Do
not create a VRT test or modify implementation from this skill unless the user
already approved that work in the current issue.

## Workflow

1. Inspect the working tree and read the current issue.
2. Identify each changed VRT target from the changed UI and its design notes.
3. Read the referenced SSoT and derive the target tags, states, and viewports.
   Start with the VRT spec, then add every visible interactive state required
   by the current issue acceptance criteria or introduced by the final diff.
   For example, a tooltip change requires a representative open state as well
   as default state; do not silently omit it because the existing spec only
   has default scenarios. Record the complete state list before capture.
4. Build the VRT fixture and use the existing 4321 preview server.
5. Run `npm run visual:capture -- --grep` for each changed target.
6. Capture and open every required original-pixel-resolution locator
   screenshot for the smallest owner section or Component. For each declared
   route, state, and viewport, inspect the locator screenshot against the
   current issue acceptance criteria. Use a full-page screenshot only for
   page-level relationships; never use it to satisfy a local acceptance
   condition. Check at least alignment, wrapping, clipping, overflow, and
   interactive control bounds when they are relevant to the change.
   For fixed-width or inline responsive adjustments, confirm the total required
   row width (content, padding, and gaps), existing type scale, and minimum
   control height at the affected viewport before concluding that overflow is
   resolved.
7. Run only the changed target with `npm run visual:test -- --grep`.
8. Inspect Playwright's diff artifact when the target comparison fails.
9. Fix only clear, local mismatches that are inside the approved issue scope.
10. Repeat capture, actual snapshot inspection, and comparison after each
    accepted fix. Do not reuse a previous inspection result.
11. Update `## ビジュアルレビュー N` in the resolved current issue with the
    target, tags, complete declared states and viewports, comparison result,
    actual-inspection record, fixes, and unresolved human judgments.
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
  - full-page overview (page-level確認のみ):
  - locator screenshot（owner selector / original pixel resolution）:
  - checked acceptance criteria:
  - result:

### 自己修正した項目

- [ ]

### 人間判断が必要な差分

-

### 対応完了チェックリスト

- [ ] 変更targetだけをVRT比較した
- [ ] 変更targetだけの一時snapshotを取得した
- [ ] current issueの受入条件と最終diffから対象stateを列挙した
- [ ] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [ ] full-page screenshotを局所表示契約の確認根拠に使っていない
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
- locator screenshot inspection result for every declared route, state, and
  viewport, including the owner and checked local acceptance criteria
- any full-page overview result, clearly separated from local acceptance
  evidence
- self-fixes and unresolved human judgments
- commands and validation results
- checks skipped and why
- Git operations: not performed unless explicitly instructed
