---
name: pr-review-draft
description: Use this skill when the user asks to review a GitHub pull request diff from a remote snapshot and produce a markdown review draft. This skill creates review drafts only and does not modify repository files.
---

# PR Review Draft Skill

Create a markdown review draft from a pull request snapshot.

Use when the user asks to:

- review a GitHub pull request from the browser UI
- inspect a PR diff without using local Codex execution time
- produce a `.tmp/*.md` review draft for later `review-to-issue` intake
- review an already-merged PR and extract follow-up items

Do not use for:

- code fixes
- GitHub review comments
- local tracking updates
- `review-to-issue` intake
- commit or push

Create a review draft only, then stop for human review.

---

## Core rule

A remote PR review draft is not a locally validated review.

The output from this skill must be treated as input for human review or for the local `review-to-issue` workflow.

Do not claim that local files, local working tree, local command results, or generated artifacts were verified unless a local agent actually verified them.

Do not update `docs/issue/*.md`, `docs/TODO.md`, or `docs/plan.md` from this skill. Routing happens later in `review-to-issue`.

---

## Required source checks

Before writing the review draft, fetch or inspect the following when available:

1. PR metadata
   - PR number
   - title
   - base branch
   - head branch
   - merge state
   - head SHA
   - merge commit SHA when merged
2. PR diff
   - changed files
   - important hunks
   - binary file changes noted as binary
3. PR discussion
   - issue comments
   - review comments
   - review submissions
   - unresolved threads
4. Project rules
   - `AGENTS.md`
   - relevant skill files under `.agents/skills/`
5. Task contract
   - matching `docs/issue/<task>.md` when available
6. Project SSoT
   - `docs/requirements.md`
   - `docs/out-of-scope.md`
   - `docs/plan.md`
   - `docs/TODO.md`
7. Design references when relevant
   - `docs/design/<design-target>/`
8. Existing code when relevant
   - files touched by the PR
   - nearby files needed to understand the implementation pattern

If any of these cannot be fetched, record them under `Unchecked / Not verified`.

---

## Review focus

Assess the PR on the following axes.

### Scope

Check whether the PR stays within the task issue.

Flag:

- implementation outside the issue scope
- features from `docs/out-of-scope.md`
- unrelated refactors
- broad formatting diffs
- new dependencies without justification
- generated artifacts committed in the wrong location

### SSoT consistency

Check whether the PR follows the repository's source-of-truth documents.

Flag:

- code that contradicts `docs/requirements.md`
- code that violates `docs/out-of-scope.md`
- task completion that is not supported by `docs/issue/*.md`
- `docs/plan.md` checkbox updates outside the post-merge workflow
- TODO-worthy work that is neither handled in the current issue nor tracked in `docs/TODO.md`
- design reference changes not explained in the issue or PR body
- docs and implementation drifting apart

### Implementation quality

Check whether the implementation is maintainable.

Flag:

- unclear responsibility boundaries
- local one-off logic that should be shared
- premature abstraction
- hardcoded paths that break GitHub Pages subpath publishing
- component APIs that will be awkward for later tasks
- CSS/layout rules that preempt later layout tasks
- type or schema shortcuts that will complicate data tasks
- fragile assumptions not documented in the issue

### Validation

Check whether the PR reports suitable validation.

Flag:

- missing build or check validation when applicable
- visual review claimed without screenshot outputs or notes
- binary screenshots/design files changed without sufficient explanation
- test or validation gaps that matter for the task type

### Documentation and review trail

Check whether the task leaves enough record for future humans and agents.

Flag:

- issue file missing or stale
- review feedback not reflected in the issue
- follow-up items not routed to `docs/TODO.md`
- TODO items not linked to a later task or plan entry
- decisions made in code but not documented
- comments that imply future work without assigning it to a future issue or TODO

---

## Review item routing hint

For each issue found, make a routing recommendation for the later `review-to-issue` step.

Use one of these hints:

- `current-issue`: should be handled by the current issue / PR follow-up
- `todo`: should be added to `docs/TODO.md`
- `plan`: should require or reference a `docs/plan.md` item
- `ignore`: not actionable after review

This is only a hint. The local `review-to-issue` workflow makes the final routing decision after local validation.

---

## Output format

Write the review as markdown.

Use this structure:

```md
# PR #N review: PR_TITLE

## 対象PR

- PR: #N `PR_TITLE`
- state:
- merged:
- base:
- head:
- head SHA:
- merge commit SHA:

## Source Snapshot

- mode: remote PR review draft
- repository: `owner/repo`
- PR: #N
- base:
- head:
- checked files:
  - `path/to/file`
- checked PR data:
  - metadata
  - diff
  - comments / reviews / threads

## Unchecked / Not verified

- local working tree
- local uncommitted changes
- local branch state
- command results unless explicitly provided
- generated artifacts not fetched
- binary files unless explicitly inspected
- files not listed in Source Snapshot

## Local Validation Required

This review draft was generated from a remote PR snapshot.

Before turning any item into an issue, TODO, plan item, or fix, validate it against the local repository state.

## 総評

A short assessment of whether the PR is generally sound.

## 指摘事項

### 1. TITLE

Describe the issue.

#### 根拠

- file / diff / source references

#### リスク

Explain why it matters.

#### routing hint

- current-issue / todo / plan / ignore

#### 対応案

Suggest a concrete fix, TODO entry, plan entry, or follow-up.

## 良かった点

- ...

## 重要度別まとめ

### 要修正候補

- ...

### TODO化候補

- ...

### plan追加・更新候補

- ...

### 現時点では問題なし

- ...
```

---

## Handling merged PRs

If the PR is already merged:

- do not write as if the PR can still be blocked
- write follow-up items instead
- point to a target issue, TODO, or later task when possible
- produce a `.tmp`-ready review draft that can be fed into `review-to-issue`

For merged PRs, prefer language like:

- `要修正候補`
- `TODO化候補`
- `plan追加・更新候補`
- `後続タスクで回収`
- `次回以降の運用改善`
- `review-to-issue に取り込む候補`

---

## Handoff to review-to-issue

The intended next step is:

1. Human copies this review draft to `.tmp/pr-N-review.md`
2. Local agent runs `review-to-issue`
3. Local agent validates the review against local SSoT
4. Local agent classifies items as valid / doubtful / out-of-scope / stale / invalid / follow-up
5. Local agent routes validated items to the current issue, `docs/TODO.md`, or `docs/plan.md` as appropriate
6. Human reviews and approves the proposed intake / routing
7. Local agent applies approved tracking updates and later implements only approved fixes

Do not skip local validation.

---

## What this skill does not do

This skill does not:

- replace human review
- replace local validation
- fix code
- update issues
- update `docs/TODO.md`
- update `docs/plan.md`
- post GitHub review comments
- approve PRs
- request changes on PRs
- merge PRs
- perform repository write operations
