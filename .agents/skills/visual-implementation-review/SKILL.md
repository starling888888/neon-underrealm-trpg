---
name: visual-implementation-review
description: Use this skill after an approved UI implementation task when the agent should capture browser screenshots, compare them with shared design references, self-review visual differences, fix concrete visual mismatches within the approved issue scope, and update only the current issue's visual review section before human review.
---

# Visual Implementation Review Skill

Run after an approved UI implementation task.

Use when the user asks to visually review a completed UI, page, layout, component, or style change against shared design references.

Do not use for:

- branch setup
- issue creation
- plan updates
- human review note intake
- commit
- push
- canonical design image updates

Compare implementation screenshots against canonical design references. Do not turn screenshots into canonical design images.

---

## Preconditions

Before doing anything, verify all conditions.

1. You are on a dedicated task branch.
2. `docs/issue/<current-branch>.md` exists.
3. The user has approved implementation for the issue.
4. The implemented task includes UI, page, layout, component, or style work.
5. The issue file or user instruction identifies a design target under `docs/design/`.

Run:

```sh
git status --short --branch
git branch --show-current
```

If any condition is not met, stop and report the blocker.

---

## Responsibilities

This skill may:

- read the current issue file
- read design references under `docs/design/<design-target>/`
- run the local dev server when needed
- capture desktop and mobile screenshots
- compare screenshots with design references
- fix clear visual mismatches within the approved issue scope
- update only the current issue file's `## ビジュアルレビュー N` section
- run validation commands

This skill must not:

- create branches
- create new issue files
- update `docs/plan.md`
- read or import `.tmp/*.md`
- create `## レビュー指摘 N`
- modify `issue-first-development` or `review-to-issue`
- update canonical design images under `docs/design/`
- canonicalize actual screenshots as design source of truth
- hide Visual Review mismatches by changing design references
- commit
- push

If a reviewed implementation should become the new canonical design, stop and hand off to `.agents/skills/design-image-generation/SKILL.md` design fix mode.

---

## Design References

Design source files are stored by screen, layout, or component, not by issue.

Use:

```txt
docs/design/<design-target>/
```

Examples:

```txt
docs/design/site-layout/
docs/design/home/
docs/design/rule-page/
docs/design/components/
```

Record the referenced design target in the issue file.

Design references may include `notes.md`, `design-desktop.png`, `design-mobile.png`, or explicit state-specific images.

Do not replace design references from this skill.

---

## Artifacts

Visual Review artifacts are not Git-managed project deliverables.

Use Playwright's output conventions and keep artifacts out of Git:

```txt
test-results/
playwright-report/
```

Do not store Visual Review artifacts in `.tmp/`.

Do not create `docs/visual-review/<issue-slug>/` unless a future issue explicitly changes the policy.

Actual screenshots captured by this skill are comparison artifacts. They are not canonical design images.

Capture screenshots only through:

```sh
npm run visual:capture
```

Do not use `.tmp/*.mjs`, `node -e`, or another ad hoc Playwright command.

## Preview server selection

Use an existing 4321 preview when it is available. Set `VISUAL_TARGET_URL` for
the existing server when needed.

If a newly started server selects 4322 or another alternate port, stop that
server and report the port and process to the user. Do not retry startup, do not
use the alternate port, and do not create a fallback capture path.

---

## Review Workflow

1. Inspect the working tree.
2. Read `docs/issue/<current-branch>.md`.
3. Identify the design target from the issue or user instruction.
4. Read files under `docs/design/<design-target>/`.
5. Capture desktop and mobile screenshots with `npm run visual:capture`.
6. Compare reference and actual views.
7. Fix only obvious visual mismatches that are local, non-destructive, and inside issue scope.
8. Re-capture screenshots when fixes are made.
9. If the actual screenshot appears to be the desired new design, record that as a human-judgment item instead of updating `docs/design/`.
10. Update or append `## ビジュアルレビュー N` in the current issue file.
11. Run `npm run check`.
12. Run `npm run build`.
13. Stop and report. Do not commit or push.

Default viewports:

```txt
desktop: 1440px wide
mobile: 390px wide
```

Prefer full-page screenshots unless the design reference specifies otherwise.

---

## Allowed Self-Fixes

Only fix issues that meet all conditions:

- user has approved implementation
- the fix is inside the current issue scope
- the fix is local and non-destructive
- no new design decision is required
- no new dependency is required
- no unrelated files are changed

Examples:

- obvious spacing mismatch
- layout breakage
- mobile stacking failure
- text overflow
- unexpected horizontal scroll
- alignment errors
- missing existing CSS variable usage

Stop for human judgment when a change would affect information architecture, navigation structure, page text, URLs, global breakpoints, global design tokens, large component structure, canonical design images, or any out-of-scope file.

---

## Design Canonicalization Handoff

Use this section when actual screenshots differ from canonical design references, but the implementation may be the desired new design.

This skill may propose canonicalization, but must not perform it.

Record:

- source actual screenshot location
- design target
- reference image that would be replaced
- observed difference
- why implementation may be preferable
- risks of canonicalizing
- whether this should be handled by `design-image-generation` design fix mode

Canonicalization requires explicit user approval and must be performed through `.agents/skills/design-image-generation/SKILL.md` design fix mode or an equivalent approved process.

Do not canonicalize screenshots to make a Visual Review failure disappear.

---

## Issue Section Template

Use `## ビジュアルレビュー N`.

Do not use `## レビュー指摘 N`; that heading belongs to `review-to-issue`.

```md
## ビジュアルレビュー N

### デザイン参照

- design target:
- reference desktop:
- reference mobile:
- notes:

### 成果物

- actual desktop: Playwright output
- actual mobile: Playwright output
- report: Playwright output

### レビュー結果

| 領域                  | 判定                     | 差分 | 対応 |
| --------------------- | ------------------------ | ---- | ---- |
| レイアウト            | OK / 要修正 / 要人間判断 |      |      |
| 余白                  | OK / 要修正 / 要人間判断 |      |      |
| タイポグラフィ        | OK / 要修正 / 要人間判断 |      |      |
| 色                    | OK / 要修正 / 要人間判断 |      |      |
| 配置・整列            | OK / 要修正 / 要人間判断 |      |      |
| レスポンシブ          | OK / 要修正 / 要人間判断 |      |      |
| overflow / scroll     | OK / 要修正 / 要人間判断 |      |      |
| 既存デザインとの整合  | OK / 要修正 / 要人間判断 |      |      |
| 既存Componentとの整合 | OK / 要修正 / 要人間判断 |      |      |
| accessibility basics  | OK / 要修正 / 要人間判断 |      |      |

### 自己修正した項目

- [ ]

### 人間判断が必要な差分

-

### design-image-generation への引き継ぎ候補

- [ ] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ

### 対応完了チェックリスト

- [ ] desktop screenshot を取得した
- [ ] mobile screenshot を取得した
- [ ] reference と actual を比較した
- [ ] 明らかな visual mismatch を修正した、または修正不要と判断した
- [ ] design正本の更新が必要な場合は、人間判断項目として記録した
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る
```

Leave unchecked any item that was not performed, and record why.

---

## Final Report

Report:

```md
## Visual Review 結果

- 対象issue:
- design target:
- 取得したスクリーンショット:
- 自己修正した内容:
- 人間判断が必要な差分:
- design-image-generation への引き継ぎ候補:
- 実行したコマンド:
- 成功した確認:
- 失敗または未確認の項目:

## Git操作

- commit: 未実行
- push: 未実行
```
