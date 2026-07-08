# Agent Skills Index

This directory contains task-specific workflows for agents.

Use this file as an index only. Do not read every skill by default. Read the skill that matches the current user request.

## Skills

### `issue-first-development`

Use when starting a development task, creating a task branch, creating or validating `docs/issue/*.md`, or drafting an issue from a remote snapshot.

Stop after branch and issue preparation. Implementation requires explicit user approval.

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

Use when drafting or reviewing contents markdown for `.raw/contents/*.md`.

This skill treats Google Docs as a plain-text storage place for Markdown source, uses frontmatter for page metadata, uses HTML comments for agent-facing instructions, and does not implement pages.

### `pr-review-draft`

Use when producing a markdown review draft from a GitHub PR snapshot.

This skill produces draft review notes only. Local validation and tracking updates happen later through `review-to-issue`.

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
