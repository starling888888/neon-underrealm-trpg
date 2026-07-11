---
name: pr-review-draft
description: Use this skill when reviewing a remote GitHub pull request with local document and technical reviewer subagents, then handing validated findings to review-to-issue.
---

# PR Review Draft Skill

Review a remote PR and stop after review intake.

Use when the user asks to:

- review a GitHub pull request
- review changes pushed by Codex to an existing PR branch
- inspect a PR diff and create local review records
- review an already-merged PR and extract follow-up items

Do not use for:

- code fixes
- GitHub review comments
- PR creation
- commit or push
- post-merge cleanup

## Core Rule

The remote PR is the review source for metadata, diff, and discussion.

Use the local `.codex/agents/*.toml` and local skill definitions when spawning reviewers. They may be unmerged or part of the reviewed PR. Do not stop for that reason.

This skill may write only under `.tmp/review/<branch-name>/` until it invokes `review-to-issue`. Do not update source code, `docs/issue/*.md`, `docs/TODO.md`, `docs/plan.md`, or `docs/agent-failure-log.md` directly.

Do not review the `User-Directed Changes Outside Current Issue` section of the PR description.

## Preconditions

1. Confirm that the PR already exists.
2. Confirm the current branch and matching issue file.
3. Confirm `.tmp/review/<branch-name>/` exists. Create it when absent.
4. Fetch or inspect the remote PR metadata, diff, discussion, reviews, and unresolved threads.
5. Read the local `AGENTS.md`, current issue, relevant skills, `docs/requirements.md`, `docs/out-of-scope.md`, `docs/plan.md`, `docs/TODO.md`, relevant design references, and affected local code when available.
6. Find the latest `.tmp/review/<branch-name>/pr-review-N.md`.

If no prior `pr-review-N.md` exists, review the full remote PR diff from the PR base commit through the current remote head commit. Use this as `pr-review-1.md`.

If the remote PR head equals the latest reviewed head commit, stop. Do not duplicate a review.

## Review Scope

For `pr-review-1.md`, review every commit from the PR base commit through the current remote PR head commit.

For later review cycles, review every commit after the latest `pr-review-N.md` reviewed head commit through the current remote PR head commit.

Historical review records may retain the file paths and line numbers from their reviewed snapshot. Do not raise a finding only because a completed change moved, removed, or changed that historical location in the current tree. Raise a finding only when the historical record represents the current state as unresolved or unmodified.

The document reviewer checks:

- current issue scope
- documentation consistency
- requirements, out-of-scope, plan, TODO, and design consistency
- review trail and follow-up routing

The technical reviewer checks:

- bugs and behavior regressions
- frontend behavior and GitHub Pages subpath risks
- tests, validation, and maintainability
- Codex workflow and agent-facing Markdown safety

Both reviewers return Japanese Markdown. Each report must use:

```md
# Document Review / Technical Review

## レビュー結論

## 対象範囲・対象外

## 指摘事項

### [重大度] タイトル

- 位置:
- 根拠:
- 影響:
- 推奨対応:
- routing hint: current-issue / todo / plan / ignore

## 指摘なしとして確認した観点

## 判断不能・ユーザー確認事項
```

## Workflow

1. Assign the next shared review number `N`.
2. Spawn `document_reviewer` and `technical_reviewer` in parallel.
3. Give both reviewers the remote PR information, reviewed commit range, current issue path, and required local SSoT paths.
4. Write their responses to:
   - `.tmp/review/<branch-name>/document-review-N.md`
   - `.tmp/review/<branch-name>/technical-review-N.md`
5. Write `.tmp/review/<branch-name>/pr-review-N.md` with:
   - PR number, URL, base, head, and remote head commit
   - reviewed commit range
   - local agent and skill definitions used
   - linked document and technical report paths
   - known unchecked remote data
6. Run `review-to-issue` for both reports.
7. Stop after `review-to-issue` updates the tracking documents and reports its result.

When the user asks Codex to push an existing PR branch, run this skill after the push succeeds. Do not detect or review pushes performed outside Codex.

## Handling Merged PRs

When a PR is already merged:

- do not write as if the PR can still be blocked
- route valid findings as follow-up or process improvements
- keep the same temporary report format
- stop after `review-to-issue`

## Required Report

Report:

- PR URL and reviewed commit range
- created `.tmp/review/<branch-name>/` files
- reviewer agents used
- whether `review-to-issue` updated the issue, TODO, plan, or failure log
- remaining unverified or user-confirmation items

Do not commit, push, merge, approve, request changes, or post GitHub comments.
