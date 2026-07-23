# Agent Skills Index

This directory contains task-specific workflows for agents.

Use this file as an index only. Do not read every skill by default. Read the skill that matches the current user request.

## Skills

### `issue-first-development`

Use when starting a development task, creating a task branch, creating or validating `docs/issue/*.md`, or drafting an issue from a remote snapshot. Creating or validating an issue requires explicit user authorization; task numbers, skill invocation, and branch preparation do not grant it.

For scope, requirements, or contents-only instructions, perform only the requested work and do not create an issue or run the issue reviewer. In local repository mode, run the issue reviewer only after creating a user-authorized local issue. Implementation requires explicit user approval.

### `design-image-generation`

Use when creating or updating design intent and VRT reference notes under `docs/design/<design-target>/`, or when updating an approved VRT baseline.

This skill maintains design notes and VRT baselines only. It does not implement UI or perform Visual Review.

### `visual-implementation-review`

Use after an approved UI, CSS, layout, page, or Component implementation when changed VRT targets must be compared with their canonical baselines.

This skill reviews VRT results. It must not update VRT baselines.

### `review-to-issue`

Use when local `.tmp/*.md` review notes must be validated against local SSoT and routed into the current issue, `docs/TODO.md`, or `docs/plan.md`.

Review intake stops before implementation. Fixes require explicit user approval.

### `drive-to-raw-sync`

Use when syncing Google Drive user-edited sources into the local `<repo-root>/.raw/` working input directory.

This skill reads the Drive folder URL from `<repo-root>/raw-google-drive.url` or an explicit user-provided Drive URL, verifies ignore policy and path safety, downloads or exports files through Google Drive MCP, and never writes back to Google Drive.

### `contents-markdown-authoring`

Use when drafting or reviewing contents markdown locally for `.raw/contents/*.md`.

For page body and visible display structure, this skill checks user instructions, matching `.raw/contents/`, the current task issue, requirements, out-of-scope, plan and TODO, design, local `src/pages/`, and `.raw/v1.0/` in that priority order. `AGENTS.md` and applicable skill and rule safety or workflow constraints remain above this order. It treats Google Docs as a plain-text storage place for Markdown source, uses frontmatter for page metadata, and uses HTML comments for agent-facing instructions and lower-priority source conflict records. It does not implement pages.

### `contents-review`

Use only when the user explicitly asks for a final review after contents feedback.

This skill runs the local beginner and expert contents reviewers. They receive no current conversation history and use only the target and review inputs explicitly identified by the user for that review. They evaluate supplied screenshots or an already-running preview route without opening other target-site pages. The main agent stores their reports under `.tmp/review/<issue-slug>/` and stops before fixes.

### `remote-contents-markdown-authoring`

Use when ChatGPT drafts or reviews contents markdown from a remote repository snapshot.

This skill checks user instructions, Git-managed `src/pages/`, the current task issue, requirements, plan, and out-of-scope in that priority order. It records remotely observed lower-priority source conflicts in agent-facing HTML comments, reports unavailable Git-managed sources and local `.raw/contents/` / `.raw/v1.0/` as unverified, and does not access `.raw/`, Google Drive, or local files.

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
