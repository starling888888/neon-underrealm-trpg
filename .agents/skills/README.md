# Agent Skills Index

This directory contains task-specific workflows for agents.

Use this file as an index only. Do not read every skill by default. Read the skill that matches the current user request.

## Skills

### `issue-first-development`

Use when starting a development task, creating a task branch, creating or validating `docs/issue/*.md`, preparing a Gate plan or child issue when the user explicitly requests Gate splitting, or drafting an issue from a remote snapshot. A normal issue is the self-contained implementation contract. Create `docs/issue/<parent-issue>/plan.md` and Gate child issues only when the user explicitly directs Gate creation or splitting. Creating or validating an issue requires explicit user authorization; task numbers, skill invocation, and branch preparation do not grant it.

For scope, requirements, or contents-only instructions, perform only the requested work and do not create an issue or run an issue review agent. In local repository mode, run an issue review agent only after creating a user-authorized local issue. Parent issues use `issue_reviewer`; Gate child issues use the faster one-pass `gate_issue_reviewer`. Implementation requires explicit user approval.

### `design-image-generation`

Use when creating an HTML and Playwright-captured design draft, creating or updating design intent and VRT reference notes under `docs/design/<design-target>/`, or updating an approved VRT baseline.

This skill keeps temporary design drafts under `.tmp/design/`, design documentation under `docs/design/`, and implemented UI baselines under Playwright VRT snapshots. It does not implement UI or perform Visual Review.

### `visual-implementation-review`

Use after an approved UI, CSS, layout, page, or Component implementation when changed VRT targets must be compared with their canonical baselines.

This skill reviews VRT results. It must not update VRT baselines.

### `review-to-issue`

Use when local `.tmp/*.md` review notes must be validated against local SSoT and routed into the current issue, `docs/TODO.md`, or `docs/issue/milestone-<NN>/plan.md`.

Review intake stops before implementation. Fixes require explicit user approval.

### `contents-markdown-authoring`

Use when drafting or reviewing contents markdown locally for `.raw/contents/*.md`.

For page body and visible display structure, this skill checks user instructions, the current task issue, requirements, out-of-scope, plan and TODO, design, local `src/pages/`, then optional `.raw/contents/` and `.raw/v1.0/` in that priority order. `AGENTS.md` and applicable skill and rule safety or workflow constraints remain above this order. It uses frontmatter for page metadata and HTML comments for agent-facing instructions and lower-priority source conflict records. It does not implement pages.

### `contents-review`

Use only when the user explicitly asks for a final review after contents feedback.

This skill runs the local beginner and expert contents reviewers. They receive no current conversation history and use only the target and review inputs explicitly identified by the user for that review. They evaluate supplied screenshots or an already-running preview route without opening other target-site pages. The main agent stores their reports under `.tmp/review/<issue-slug>/` and stops before fixes.

### `remote-contents-markdown-authoring`

Use when ChatGPT drafts or reviews contents markdown from a remote repository snapshot.

This skill checks user instructions, Git-managed `src/pages/`, the current task issue, requirements, plan, and out-of-scope in that priority order. It records remotely observed lower-priority source conflicts in agent-facing HTML comments, reports unavailable Git-managed sources and local `.raw/contents/` / `.raw/v1.0/` as unverified, and does not access `.raw/`, Google Drive, or local files.

### `pr-review-draft`

Use when reviewing a remote GitHub PR with local document and technical reviewers, then handing validated findings to `review-to-issue`. Technical review is mandatory for every PR. Gate child issue PRs use `gate_technical_reviewer`; parent and non-Gate issue PRs use `technical_reviewer`.

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

This skill may update `docs/issue/milestone-<NN>/plan.md` checkboxes only because the user explicitly requested post-merge tracking work. It archives a completed local issue as a same-name GitHub closed Issue, retains only its name and Issue number in the plan, and then deletes the local issue file.

### `failure-log-audit`

Use when auditing `docs/agent-failure-log/active.md` for repeated failure categories, especially categories with three or more occurrences.

This skill reports repeated failures and proposes permanent countermeasures. It stops for user approval before editing rules, skills, or done archives.

## Directory Role

- `.agents/skills/`: task workflows with start conditions, allowed actions, stopping points, and output rules.
- `.agents/rules/`: stable standing rules and rationale that are not a complete workflow by themselves.

If a user request matches a skill, read that skill before acting.
