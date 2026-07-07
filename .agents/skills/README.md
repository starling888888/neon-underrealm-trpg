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

### `pr-review-draft`

Use when producing a markdown review draft from a GitHub PR snapshot.

This skill produces draft review notes only. Local validation and tracking updates happen later through `review-to-issue`.

### `post-merge-plan-update`

Use after a PR has been merged and the user asks to return to `main`, pull merged changes, delete the merged branch, update tracking files, commit, and push.

This skill may update `docs/plan.md` checkboxes only because the user explicitly requested post-merge tracking work.

## Directory Role

- `.agents/skills/`: task workflows with start conditions, allowed actions, stopping points, and output rules.
- `.agents/rules/`: stable standing rules and rationale that are not a complete workflow by themselves.

If a user request matches a skill, read that skill before acting.

