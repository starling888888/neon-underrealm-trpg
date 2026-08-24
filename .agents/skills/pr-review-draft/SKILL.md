---
name: pr-review-draft
description: Use this skill when reviewing a remote GitHub pull request with the selected local reviewers, then handing validated findings to review-to-issue.
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

This skill may write only under `.tmp/review/<branch-name>/` until it invokes `review-to-issue`. Do not update source code, `docs/issue/*.md`, `docs/TODO.md`, `docs/issue/milestone-<NN>/plan.md`, or `docs/agent-failure-log/active.md` directly.

Do not review the `User-Directed Changes Outside Current Issue` section of the PR description.

## Preconditions

1. Confirm that the PR already exists.
2. Confirm the current branch and matching issue file.
3. Confirm `.tmp/review/<branch-name>/` exists. Create it when absent.
4. Fetch or inspect the remote PR metadata, diff, discussion, reviews, and unresolved threads.
5. Read the local `AGENTS.md`, current issue, relevant skills, `docs/requirements.md`, `docs/out-of-scope.md`, `docs/issue/milestone-<NN>/plan.md`, `docs/TODO.md`, relevant design references, and affected local code when available.
6. Find the latest `.tmp/review/<branch-name>/pr-review-N.md`.

If no prior `pr-review-N.md` exists, review the full remote PR diff from the PR base commit through the current remote head commit. Use this as `pr-review-1.md`.

If the remote PR head equals the latest reviewed head commit, stop. Do not duplicate a review.

## Reviewer Selection

Classify the matching issue before spawning reviewers.

For a Gate child issue, use only `gate_technical_reviewer` from `.codex/agents/gate-technical-reviewer.toml`. A Gate child issue maps to exactly one selected Gate in its parent Gate plan. Do not spawn `document_reviewer` or a specialized reviewer for the same Gate PR. The Gate reviewer reports only `blocker` and `important` findings.

For a parent issue or non-Gate issue, always use `document_reviewer` and add every specialized reviewer selected by the changed paths:

- `frontend_technical_reviewer` for `frontend/**` or frontend build, test, GitHub Pages, and deploy configuration.
- `package_reviewer` for root or workspace `package.json`, `package-lock.json`, TypeScript configuration, workspace metadata, or `packages/**`.
- `ai_ops_reviewer` for `AGENTS.md`, `.agents/**`, or `.codex/**`.
- `backend_technical_reviewer` for `backend/**` after G2 creates `.codex/agents/backend-technical-reviewer.toml`.

When a selected specialist definition does not exist, record the reviewer as unavailable and leave that review area unverified. Do not substitute a different specialist without explicit user instruction. A Gate child issue continues to use its single Gate reviewer while the backend specialist is unavailable.

The selected reviewers return Japanese Markdown. Use the headings defined in each reviewer TOML. Every report must include the conclusion, scope, findings, confirmed checks, and unknown or user-confirmation items. Every finding must include its location, evidence, impact, recommendation, and routing hint.

## Workflow

1. Assign the next shared review number `N`.
2. Classify the issue as a Gate child issue or a parent/non-Gate issue.
3. For a Gate child issue, spawn only `gate_technical_reviewer`. Provide the remote PR information, reviewed commit range, current issue path, selected Gate, parent Gate plan path, and required local SSoT paths.
4. For a parent/non-Gate issue, select reviewers under Reviewer Selection. Spawn `document_reviewer` and every selected available specialist in parallel. Provide each reviewer the remote PR information, reviewed commit range, current issue path, relevant local SSoT paths, and its selected review scope.
5. Write each response under `.tmp/review/<branch-name>/` with a role-specific filename:
   - `gate-technical-review-N.md`
   - `document-review-N.md`
   - `frontend-technical-review-N.md`
   - `package-review-N.md`
   - `ai-ops-review-N.md`
   - `backend-technical-review-N.md`
6. Write `.tmp/review/<branch-name>/pr-review-N.md` with:
   - PR number, URL, base, head, and remote head commit
   - reviewed commit range
   - local agent and skill definitions used
   - selected reviewer names, report paths, and unavailable reviewer areas
   - known unchecked remote data
7. Run `review-to-issue` for every produced reviewer report.
8. Stop after `review-to-issue` updates the tracking documents and reports its result.

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
- selected and unavailable reviewer agents
- whether `review-to-issue` updated the issue, TODO, plan, or failure log
- remaining unverified or user-confirmation items

Do not commit, push, merge, approve, request changes, or post GitHub comments.
