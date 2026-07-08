---
name: create-pr
description: Use this skill when the user explicitly asks to create a GitHub pull request for the current task branch. This skill prepares a minimal PR from the approved issue and pull request template, checks unresolved issue checkboxes, asks before proceeding when needed, and never merges, tags, releases, or handles review feedback.
---

# Create PR Skill

Create a GitHub PR only after an explicit PR creation request.

Use when the user asks to:

- create a PR
- open a pull request
- make a draft PR
- ask to run `gh pr create`
- publish the current branch as a PR

Do not use for:

- PR review
- review comment intake
- `review-to-issue`
- post-merge cleanup
- branch setup
- issue creation

## Core Rule

PR creation writes to GitHub.

Do not create a PR unless the user explicitly asked for PR creation in the current turn or an immediately relevant instruction.

Do not push unless the user explicitly permits `git push`.

Create and update PRs through the GitHub connector.

Do not use `gh pr create`, `gh pr edit`, or `gh api` to create PRs or edit PR metadata by default.

If the GitHub connector is unavailable or cannot perform the required PR operation, stop and ask the user. Do not fall back to `gh` automatically.

Never merge, tag, release, resolve review comments, or run `review-to-issue`.

## Preconditions

Run:

```sh
git status --short
git branch --show-current
```

Identify:

- current branch
- intended base branch
- repository full name from local `git remote -v`
- matching issue file: `docs/issue/<issue-slug>.md`
- PR template: `.github/pull_request_template.md`

If the PR template is missing, stop. Do not invent a replacement.

If the matching issue file is missing, stop and ask the user.

If the working tree has unrelated changes, stop and ask the user.

## Issue Checkbox Check

Read the matching issue file before PR creation.

Check all relevant `完了条件` and `チェックポイント` items.

During implementation, update checkboxes when each item is actually verified.

At PR creation time, do not do new implementation work just to satisfy unchecked items.

At PR creation time, mark an unchecked item complete only when all are true:

- the required work is already present in the current branch
- the verification evidence is already available in local files, command output, or an explicit user confirmation
- marking the item does not require new code, design, workflow, or documentation changes beyond the checkbox update itself

Leave items unchecked when they still need human visual confirmation, external service confirmation, post-merge confirmation, or work outside the current branch.

If unchecked items remain:

1. Report the unchecked items.
2. Explain that the issue is not fully checked.
3. Ask whether to create the PR anyway.
4. Do not create the PR until the user explicitly approves proceeding with unchecked items.

Do not mark unchecked items complete just to create a PR.

## PR Title

Default title:

```text
<issue-slug>
```

Do not require:

- commit type such as `docs:` or `feat:`
- group number
- a rewritten description of the slug

## PR Body

Use `.github/pull_request_template.md`.

Use only:

- Related issue
- Summary
- Review focus
- Review handling

Do not add:

- Changed areas
- Group completion
- Checks
- Unchecked / Not verified
- Scope guard

Keep detailed check status in the issue file, not in the PR body.

Pass the PR body directly to the GitHub connector as structured tool input.

Do not embed the PR body in a shell command string.

## Creation Flow

1. Confirm branch, base branch, issue file, and template.
2. Confirm the branch has commits to publish.
3. If push is needed, ask for explicit push permission unless already given.
4. Prepare PR title from the issue slug.
5. Prepare PR body from `.github/pull_request_template.md`.
6. If unchecked issue items remain, stop and ask for explicit approval before PR creation.
7. Create the PR with the GitHub connector only after all required permissions are satisfied.
8. If PR metadata must be corrected after creation, use the GitHub connector update operation.

## Required Report

After PR creation, report:

- PR URL
- base branch
- head branch
- related issue
- GitHub connector operation used
- whether unchecked issue items remained
- checks or validations reviewed
- items not verified

## Forbidden Actions

Do not:

- create GitHub Issues
- merge PRs
- tag releases
- create GitHub Releases
- delete branches
- resolve or reply to review comments
- run `review-to-issue`
- edit unrelated tracking files
- run `gh pr create`, `gh pr edit`, or `gh api` for PR creation or PR metadata updates unless the user explicitly approves that fallback after the GitHub connector is unavailable
