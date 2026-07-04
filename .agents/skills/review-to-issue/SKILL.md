---
name: review-to-issue
description: Use this skill when local review notes in .tmp/*.md should be validated against local SSoT, summarized into the current docs/issue/*.md as a numbered review section, then paused for user confirmation before implementing fixes and updating the review checklist.
---

# Review-to-Issue Skill

This skill handles review feedback captured in `.tmp/*.md`.

Use this skill when the user asks to:

- read local review notes from `.tmp/`
- intake a browser-generated PR review draft
- validate review feedback against local SSoT
- add review comments to a task issue file
- create a numbered review section in `docs/issue/*.md`
- pause for user confirmation before addressing review feedback
- implement approved review fixes and update the corresponding checklist

This skill has two phases.

1. Review intake: read `.tmp/*.md`, validate it, update only the issue file, then stop.
2. Review response: after explicit approval, implement fixes and update the checklist.

---

## Core rule

Do not implement fixes during review intake.

Review feedback is not automatically correct just because it came from the user, ChatGPT, a PR review draft, or another agent.

A review note becomes actionable only after it is checked against:

- the current task issue
- `AGENTS.md`
- relevant skills
- `docs/requirements.md`
- `docs/out-of-scope.md`
- relevant design references
- current local implementation state

Implementation may begin only after the user explicitly approves the review response.

---

## Supported review sources

`.tmp/*.md` review files may come from:

- human-written review notes
- ChatGPT Browser review drafts
- `.agents/skills/pr-review-draft/SKILL.md` output
- local agent review notes
- manual notes copied from a merged PR

Remote or browser-generated review drafts must be treated as untrusted until local validation is complete.

If the review file contains `Source Snapshot`, `Unchecked / Not verified`, or `Local Validation Required`, preserve that context in the assessment.

---

## Preconditions

Inspect the current branch and working tree using the repository's normal local status checks.

If there are uncommitted changes:

- inspect them before editing
- if changes are completed fixes for a previous review section, stop and ask whether to handle them before starting the next review intake
- if changes are unrelated to the review intake, stop and ask the user how to proceed
- if changes are the intended issue update from a previous review intake, work with them

Review files must stay under `.tmp/` and must not be committed.

Do not perform version-control write operations unless the user explicitly asks.

---

## Review intake workflow

1. Inspect local repository state.
2. Find the relevant `.tmp/*.md` review file.
3. Read the review file.
4. Identify the review source: human, browser draft, PR draft, local agent, or unknown.
5. If the review includes a `Source Snapshot`, compare that snapshot against local SSoT.
6. Identify the current task issue file.
7. Validate each review item against current issue scope, project rules, and implementation state.
8. Classify each review item.
9. Report the validity assessment to the user.
10. For clearly valid items, append one numbered review section to the issue file.
11. For doubtful, design-sensitive, stale, or out-of-scope items, ask before intake.
12. Stop and wait for user confirmation.

Prefer `docs/issue/CURRENT_BRANCH.md` when it exists.

If no matching issue can be inferred, stop and ask which issue should receive the review section.

---

## Review item classification

Classify each item before intake.

Use these labels:

- `valid`: clearly within scope and supported by local SSoT
- `doubtful`: plausible, but needs human judgment
- `out-of-scope`: would exceed the current issue scope
- `stale`: based on an old snapshot or already-fixed state
- `invalid`: contradicts local SSoT or implementation state
- `follow-up`: useful, but belongs in a later task

Only `valid` items should be appended automatically during intake.

Do not silently intake `doubtful`, `out-of-scope`, `stale`, `invalid`, or `follow-up` items.

---

## Browser draft validation

When the review file came from `pr-review-draft` or another browser-side draft:

- treat the draft as a remote snapshot, not as local truth
- check whether the mentioned files still match local state
- check whether the corresponding issue exists locally
- check whether the feedback still applies after any local changes
- check whether binary artifacts or screenshots were actually inspected locally
- check whether validation commands were actually run locally before marking checklist items complete

If local state cannot confirm a review item, classify it as `doubtful` or `stale` rather than `valid`.

---

## Issue section format

Append a numbered section to the issue file. If previous review sections exist, use the next number.

Use this structure:

```md
## レビュー指摘 N

### 指摘事項

- 指摘を箇条書きで整理する

### 判定

- source: human / browser-draft / pr-review-draft / local-agent / unknown
- classification: valid / doubtful / out-of-scope / stale / invalid / follow-up
- local validation: ローカルSSoTで確認した内容を書く

### 対応方針

- 実装前に合意したい対応方針を書く

### 対応完了チェックリスト

- [ ] 対応項目
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る
```

If the original review file included Source Snapshot information, summarize the relevant parts under `判定`.

Do not paste long review notes verbatim unless the wording matters.

---

## Intake rules

During review intake:

- update only the relevant `docs/issue/*.md` file
- do not modify source code
- do not modify docs other than the issue file
- do not run broad formatting
- preserve the review file in `.tmp/`
- summarize rather than copy long review drafts verbatim
- do not update `docs/plan.md`
- do not perform version-control write operations unless explicitly asked

After updating the issue file, report:

```md
## レビュー取り込み完了

- review: `.tmp/...md`
- issue: `docs/issue/...md`
- added section: `レビュー指摘 N`

## 追加した内容

- 指摘事項
- 判定
- 対応方針
- 対応完了チェックリスト

ユーザー確認後に指摘対応を開始します。
```

Stop here.

---

## Explicit approval required

Do not implement review fixes until the user says something like:

```txt
指摘対応開始して
この方針で直して
レビュー対応して
OK、修正して
```

Without explicit approval, stop after the issue update.

---

## Review response workflow

After approval:

1. Read the numbered review section from the issue file.
2. Implement only the approved response scope.
3. Update relevant docs only when the review section says to do so.
4. Run the required validation commands.
5. Update only that review section's checklist.
6. Stop and report results.

Prefer:

```sh
npm run check
npm run build
```

If the review checklist includes another concrete verification command, run it when available.

If validation fails, stop and report the failure. Do not mark failed checklist items complete.

Do not update unrelated review sections.

Do not update `docs/plan.md` checkboxes.

Do not perform version-control write operations unless the user explicitly asks.

---

## Final report after review response

Report:

```md
## レビュー指摘対応結果

- 対応したレビュー指摘: `レビュー指摘 N`
- 実装した内容
- 変更したファイル
- 実行したコマンド
- 成功した確認
- 失敗または未確認の項目
- レビューしてほしい点
```
