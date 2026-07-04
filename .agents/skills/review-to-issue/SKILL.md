---
name: review-to-issue
description: Use this skill when local review notes in .tmp/*.md should be read, summarized into the current docs/issue/*.md as a numbered review section, then paused for user confirmation before implementing fixes and updating the review checklist.
---

# Review-to-Issue Skill

This skill handles local review feedback captured in `.tmp/*.md`.

Use this skill when the user asks to:

* read local review notes from `.tmp/`
* add review comments to a task issue file
* create a numbered review section in `docs/issue/*.md`
* pause for user confirmation before addressing review feedback
* implement approved review fixes and update the corresponding checklist

This skill has two phases.

1. Review intake: read `.tmp/*.md`, update only the issue file, then stop.
2. Review response: after explicit approval, implement fixes and update the checklist.

---

## Core rule

Do not implement fixes during review intake.

The intake workflow is:

1. Inspect current branch and working tree
2. Find the relevant `.tmp/*.md` review file
3. Read the review file
4. Validate the review feedback against the current issue, project rules, and implementation context
5. Report the validity assessment to the user and confirm any doubtful or design-sensitive feedback before issue intake
6. Identify the current task issue file
7. Add one numbered review section to that issue file
8. Stop and wait for user confirmation

Implementation may begin only after the user explicitly approves the review response.

---

## Preconditions

Run:

```sh
git status --short --branch
git branch --show-current
```

If there are uncommitted changes:

* Inspect them before editing.
* If the changes are completed fixes for a previous review section, stop and ask whether to commit them before starting the next review intake.
* If changes are unrelated to the review intake, stop and ask the user how to proceed.
* If changes are the intended issue update from a previous review intake, work with them.

Review files must stay under `.tmp/` and must not be committed.

Review responses should normally be committed separately per review section, but commit only when the user explicitly asks. Do not commit automatically.

---

## Review intake workflow

Find review notes:

```sh
find .tmp -maxdepth 2 -type f -name '*.md' -print
```

If there is exactly one obvious review file, read it.

If multiple review files exist and the user did not identify one, inspect filenames and ask only if the relevant file cannot be inferred from the current branch or task number.

Find the issue file:

```sh
git branch --show-current
rg -n "review|レビュー|TASK_SLUG|TASK_NUMBER" docs/issue
```

Prefer `docs/issue/CURRENT_BRANCH.md` when it exists.

Before appending a review section, assess the feedback:

* Compare it with the current issue scope, `AGENTS.md`, `docs/out-of-scope.md`, design references, and implementation state when relevant.
* Do not simply accept review feedback because it came from the user.
* Treat clearly valid feedback as an adoption candidate and say so to the user.
* For doubtful feedback, possible out-of-scope changes, or design decisions that need judgment, discuss whether it should be addressed before writing it into the issue.
* If the user explicitly asked only for a validity check, report the assessment and do not update the issue.

Append a numbered section to the issue file. If previous review sections exist, use the next number.

Use this structure:

```md
## レビュー指摘 N

### 指摘事項

- 指摘を箇条書きで整理する

### 対応方針

- 実装前に合意したい対応方針を書く

### 対応完了チェックリスト

- [ ] 対応項目
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る
```

Rules:

* Update only the relevant `docs/issue/*.md` file during intake.
* Do not modify source code.
* Do not modify docs other than the issue file.
* Do not run broad formatting.
* Do not commit unless the user explicitly asks.
* Preserve the review file in `.tmp/`.
* Summarize, do not paste long review notes verbatim unless the wording matters.

After updating the issue file, report:

```md
## レビュー取り込み完了

- review: `.tmp/...md`
- issue: `docs/issue/...md`
- added section: `レビュー指摘 N`

## 追加した内容

- 指摘事項
- 対応方針
- 対応完了チェックリスト

ユーザー確認後に指摘対応を開始します。
Git commit / push は未実行です。
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

1. Read the numbered review section from the issue file
2. Implement only the approved response scope
3. Update relevant docs only when the review section says to do so
4. Run the required validation commands
5. Update only that review section's checklist
6. Stop and report results

Prefer:

```sh
npm run check
npm run build
```

If the review checklist includes another concrete verification command, run it when available.

If validation fails, stop and report the failure. Do not mark failed checklist items complete.

Do not update unrelated review sections.

Do not update `docs/plan.md` checkboxes.

Do not commit unless the user explicitly asks.

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

## Git操作

- commit: 未実行
- push: 未実行
```
