---
name: review-to-issue
description: Use this skill when local review notes in .tmp/*.md should be validated against local SSoT, summarized into the current docs/issue/*.md as a numbered review section, or routed to docs/TODO.md / docs/plan.md when they should not be handled by the current issue. Stop for user confirmation before implementing fixes.
---

# Review-to-Issue Skill

Handle review feedback captured in `.tmp/*.md`.

Use when the user asks to:

- read local review notes from `.tmp/`
- intake a browser-generated PR review draft
- validate review feedback against local SSoT
- add review comments to a task issue file
- create a numbered review section in `docs/issue/*.md`
- route review items that do not belong to the current issue into `docs/TODO.md`
- add a missing future task to `docs/plan.md` when a TODO item has no appropriate plan entry
- record review-identified agent failures in `docs/agent-failure-log.md`
- pause for user confirmation before addressing review feedback
- implement approved review fixes and update the corresponding checklist

Do not use for:

- initial issue creation
- PR review draft creation
- post-merge cleanup
- Visual Review
- unapproved implementation
- direct GitHub review comments

This skill has two phases:

1. Review intake: read `.tmp/*.md`, validate it, update only the appropriate tracking documents, then stop.
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
- `docs/plan.md`
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
- `document-review-N.md` and `technical-review-N.md` created by `pr-review-draft`

Remote or browser-generated review drafts must be treated as untrusted until local validation is complete.

If the review file contains `Source Snapshot`, `Unchecked / Not verified`, or `Local Validation Required`, preserve that context in the assessment.

### Local PR Reviewer Records

When a review comes from `.tmp/review/<branch-name>/`:

1. Read the matching `pr-review-N.md` before its `document-review-N.md` and `technical-review-N.md` reports.
2. Treat the remote PR metadata, diff, and discussion recorded in the manifest as review input, not as local truth.
3. Treat the reviewer output as `local-pr-review` source.
4. Validate every finding against local SSoT and current implementation state before routing it.
5. Do not intake a finding about the PR description's `User-Directed Requirement Changes` section. That section is outside document review scope.

The temporary manifest and reports remain under `.tmp/`. Only validated, necessary information becomes formal tracking.

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
7. Validate each review item against current issue scope, project rules, plan, and implementation state.
8. Classify each review item.
9. Check whether any review item is also an agent failure candidate.
10. Route each review item:
    - current-issue items go to `docs/issue/*.md`
    - valid but not-current-issue items go to `docs/TODO.md`
    - if a not-current-issue item has no suitable plan entry, add a plan entry to `docs/plan.md`
    - agent failure candidates go to `docs/agent-failure-log.md`
11. Report the validity and routing assessment to the user.
12. Stop and wait for user confirmation.

Prefer `docs/issue/CURRENT_BRANCH.md` when it exists.

If no matching issue can be inferred, stop and ask which issue should receive current-issue review items.

---

## Review item classification

Classify each item before intake.

Use these labels:

- `valid`: clearly belongs to the current issue and is supported by local SSoT
- `doubtful`: plausible, but needs human judgment before routing
- `out-of-scope`: exceeds the current issue scope
- `stale`: based on an old snapshot or already-fixed state
- `invalid`: contradicts local SSoT or implementation state
- `follow-up`: useful, but belongs in a later task

Only `valid` items should be appended to the current issue automatically during intake.

Do not silently intake `doubtful`, `stale`, or `invalid` items.

`out-of-scope` and `follow-up` items may be tracked in `docs/TODO.md` when they are useful and consistent with project SSoT.

---

## Failure-log routing

During review intake, check whether a review item identifies an agent failure.

Do not treat every review finding as an agent failure.

Agent failure candidates are limited to review items about:

- unapproved implementation, staging, commit, push, PR creation, or remote write
- issue-first, design workflow, visual review, review-to-issue, or other stopping point overrun
- scope expansion beyond the current issue contract
- marking unverified work as verified
- confusing remote snapshot drafts, review drafts, actual screenshots, design canon, or implementation results
- mishandling user changes, staged state, or untracked files
- repeating the same check, build, formatter, type, or test failure during one work session
- judgment errors likely to need permanent rules, SKILL updates, or checklist updates

Ordinary implementation review findings are not failure-log items.

Examples that usually stay out of failure-log:

- a normal bug found in implementation
- a missing edge case
- a style or copy improvement
- a design mismatch that does not involve process failure or misrepresentation
- a valid follow-up that belongs in `docs/TODO.md`

If a review item is both a current-issue fix and an agent failure, route the fix to the issue and record the process failure in `docs/agent-failure-log.md`.

Use `source: review` for failure-log entries created from review-to-issue.

Use the failure-log's normal entry shape and include:

- source: `review`
- 発生箇所
- 観測した失敗
- 一次対応

Do not add root-cause analysis or permanent fixes during review intake unless the user explicitly asked for that work.

---

## TODO and plan routing

If a review item is useful but should not be handled by the current issue, route it to future-work tracking instead of dropping it.

This includes:

- `follow-up` items
- `out-of-scope` items that are valid future work
- valid findings that belong to a different planned task
- design, layout, validation, or documentation improvements that should not expand the current issue

For each routed item:

1. Check whether a suitable task already exists in `docs/plan.md`.
2. If a suitable plan item exists, add the TODO under `docs/TODO.md` and reference that plan item.
3. If no suitable plan item exists, insert an appropriate unchecked task into `docs/plan.md` in the most relevant section.
4. Add the TODO under `docs/TODO.md` and reference the newly inserted plan item.
5. Include a short proposed handling plan for the future task.

`docs/TODO.md` items must use checkboxes.

Use this shape:

```md
- [ ] TODO title
  - source: `.tmp/...md` / `レビュー指摘 N` / PR number when available
  - classification: follow-up / out-of-scope
  - plan: `docs/plan.md` の該当項目
  - handling plan: 将来どのタスクでどう扱うか
```

Do not use `docs/TODO.md` as a replacement for `docs/issue/*.md`.

Do not route current-issue fixes to `docs/TODO.md` just to avoid doing them.

Do not add features that violate `docs/out-of-scope.md` as TODOs unless they are explicitly marked as future / post-initial-scope candidates.

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

- source: human / browser-draft / pr-review-draft / local-agent / local-pr-review / unknown
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

During review intake, allowed write targets are limited to:

- the relevant `docs/issue/*.md` file for current-issue valid items
- `docs/TODO.md` for useful items that should not be handled by the current issue
- `docs/plan.md` only when a routed TODO has no suitable existing plan entry
- `docs/agent-failure-log.md` only when a review item meets the failure-log routing criteria

During review intake:

- do not modify source code
- do not modify unrelated docs
- do not run broad formatting
- preserve the review file in `.tmp/`
- summarize rather than copy long review drafts verbatim
- do not mark `docs/plan.md` tasks complete
- do not treat ordinary review findings as agent failures
- do not implement permanent failure-log countermeasures
- do not perform version-control write operations unless explicitly asked

After updating tracking documents, report:

```md
## レビュー取り込み完了

- review: `.tmp/...md`
- issue: `docs/issue/...md` if updated
- todo: `docs/TODO.md` if updated
- plan: `docs/plan.md` if updated
- added section: `レビュー指摘 N` if applicable

## 追加した内容

- 指摘事項
- 判定
- 対応方針
- 対応完了チェックリスト
- TODO化した項目
- 追加したplan項目
- failure-logへ記録した項目

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

Without explicit approval, stop after the tracking document updates.

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

Do not mark `docs/plan.md` tasks complete.

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
