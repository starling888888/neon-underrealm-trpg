# Agent Skills Index

This directory contains task-specific workflows for agents.

Use this file as an index only. Do not read every skill by default. Read the skill that matches the current user request.

## Skills

### `issue-first-development`

Use when starting a development task, creating a task branch, creating or validating `docs/issue/*.md`, or drafting an issue from a remote snapshot. Creating or validating an issue requires explicit user authorization; task numbers, skill invocation, and branch preparation do not grant it.

For scope, requirements, or contents-only instructions, perform only the requested work and do not create an issue or run the issue reviewer. In local repository mode, run the issue reviewer only after creating a user-authorized local issue. Implementation requires explicit user approval.

### `design-image-generation`

Use when creating, updating, or canonicalizing design images under `docs/design/<design-target>/`.

This skill creates design artifacts only. It does not implement UI and does not perform Visual Review.

### `visual-implementation-review`

Use after an approved UI, CSS, layout, page, or Component implementation when screenshots must be compared with canonical design references.

This skill reviews implementation screenshots. It must not update canonical design images.

### `review-to-issue`

Use when local `.tmp/*.md` review notes must be validated against local SSoT and routed into the current issue, `docs/TODO.md`, or `docs/plan.md`.

Review intake stops before implementation. Fixes require explicit user approval.

### `drive-to-raw-sync`

Use when syncing Google Drive user-edited sources into the local `<repo-root>/.raw/` working input directory.

This skill reads the Drive folder URL from `<repo-root>/raw-google-drive.url` or an explicit user-provided Drive URL, verifies ignore policy and path safety, downloads or exports files through Google Drive MCP, and never writes back to Google Drive.

### `contents-markdown-authoring`

Use when drafting or reviewing contents markdown locally for `.raw/contents/*.md`.

This skill checks user instructions, local `src/pages/`, the current task issue, requirements, plan, out-of-scope, `.raw/contents/`, and `.raw/v1.0/` in that priority order. It treats Google Docs as a plain-text storage place for Markdown source, uses frontmatter for page metadata, uses HTML comments for agent-facing instructions, and does not implement pages.

### `remote-contents-markdown-authoring`

Use when ChatGPT drafts or reviews contents markdown from a remote repository snapshot.

This skill checks user instructions, Git-managed `src/pages/`, the current task issue, requirements, plan, and out-of-scope in that priority order. It reports unavailable Git-managed sources and local `.raw/contents/` / `.raw/v1.0/` as unverified. It does not access `.raw/`, Google Drive, or local files.

### `raw-to-drive-sync`

Use only when the user explicitly says `$raw-to-drive-sync` or `raw-to-drive-sync を実行して`.

This skill updates the existing `release-notes` Google Sheet and `contents/<slug>.md` Google Docs from approved local `.raw/` inputs. It refuses `.raw/data/` and `.raw/v1.0/` writes even with explicit user direction.

### `pr-review-draft`

Use when reviewing a remote GitHub PR with local document and technical reviewers, then handing validated findings to `review-to-issue`.

The remote PR is the review source. The workflow stores temporary reports under `.tmp/review/<branch-name>/` and stops after `review-to-issue`.

### `create-pr`

Use only when the user explicitly asks to create a GitHub pull request.

This skill uses `.github/pull_request_template.md`, checks the matching issue file, asks before creating a PR with unchecked issue items, and never merges, tags, releases, or handles review feedback.

PR creation and PR metadata updates use the GitHub connector. The skill does not use `gh pr create`, `gh pr edit`, or `gh api` as the default PR write path.

### `skill-authoring`

Use when creating or updating repository-local skills under `.agents/skills/`.

This skill standardizes SKILL.md format, controlled English, safety sections, reference updates, validation, and stopping points.

### `post-merge-plan-update`

Use after a PR has been merged and the user asks to return to `main`, pull merged changes, delete the merged branch, update tracking files, commit, and push.

This skill may update `docs/plan.md` checkboxes only because the user explicitly requested post-merge tracking work.

### `failure-log-audit`

Use when auditing `docs/agent-failure-log.md` for repeated failure categories, especially categories with three or more occurrences.

This skill reports repeated failures and proposes permanent countermeasures. It stops for user approval before editing rules, skills, or done archives.

## Directory Role

- `.agents/skills/`: task workflows with start conditions, allowed actions, stopping points, and output rules.
- `.agents/rules/`: stable standing rules and rationale that are not a complete workflow by themselves.

If a user request matches a skill, read that skill before acting.
