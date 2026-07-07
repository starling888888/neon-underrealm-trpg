---
name: create-pr
description: Use this skill when the user explicitly asks to create a GitHub pull request for the current task branch. This skill prepares a minimal PR from the approved issue and pull request template, checks unresolved issue checkboxes, asks before proceeding when needed, and never merges, tags, releases, or handles review feedback.
---

# Create PR Skill

This skill creates a GitHub pull request only when the user explicitly asks for PR creation.

Use this skill when the user asks to:

- create a PR
- open a pull request
- make a draft PR
- run `gh pr create`
- publish the current branch as a PR

Do not use this skill for:

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

Do not merge, tag, release, resolve review comments, or run `review-to-issue`.

## Preconditions

Inspect:

```sh
git status --short
git branch --show-current
```

Identify:

- current branch
- intended base branch
- matching issue file: `docs/issue/<issue-slug>.md`
- PR template: `.github/pull_request_template.md`

If the PR template is missing, stop. Do not invent a replacement.

If the matching issue file is missing, stop and ask the user.

If the working tree has unrelated changes, stop and ask the user.

## Issue Checkbox Check

Read the matching issue file before PR creation.

Check all `完了条件` and `チェックポイント` checkboxes relevant to the implemented task or group.

If unchecked items remain:

1. Report the unchecked items.
2. Explain that the issue is not fully checked.
3. Ask whether to create the PR anyway.
4. Do not create the PR until the user explicitly approves proceeding with unchecked items.

Do not mark unchecked items complete just to create a PR.

## PR Title

Use the issue slug only by default:

```text
<issue-slug>
```

Do not require:

- commit type such as `docs:` or `feat:`
- group number
- a rewritten description of the slug

## PR Body

Use `.github/pull_request_template.md`.

The PR body should contain only:

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

## Creation Flow

1. Confirm branch, base branch, issue file, and template.
2. Confirm the branch has commits to publish.
3. If push is needed, ask for explicit push permission unless already given.
4. Prepare PR title from the issue slug.
5. Prepare PR body from `.github/pull_request_template.md`.
6. If unchecked issue items remain, stop and ask for explicit approval before PR creation.
7. Create the PR only after all required permissions and confirmations are satisfied.

## Required Report

After PR creation, report:

- PR URL
- base branch
- head branch
- related issue
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

