---
name: skill-authoring
description: Use this skill when creating or updating repository-local agent skills under .agents/skills/*. This skill standardizes controlled English, SKILL.md format, trigger wording, references, validation, and stopping points for future skills.
---

# Skill Authoring Skill

Create or update repository-local agent skills under `.agents/skills/`.

Use when the user asks to:

- create a new SKILL
- update an existing SKILL format
- standardize skill wording
- add a workflow skill under `.agents/skills/`
- make skills easier for humans to read
- align skills with controlled English

Do not use for:

- implementing the workflow that a new skill describes
- creating global Codex skills outside this repository
- updating user-facing docs unless they must link to the new skill
- changing `AGENTS.md` top-level rules beyond references
- weakening existing stop, approval, or forbidden-action rules

## Core Rule

Prefer consistent format over aggressive shortening.

Use controlled English:

- short sentences
- imperative verbs
- `Use when`
- `Do not use for`
- `Core Rule`
- `Preconditions`
- `Workflow`
- `Required Report`
- explicit stopping points

Keep safety meaning unchanged.

Do not translate project-specific Japanese terms only for token reduction.

## Required Checks

Before editing:

1. Inspect `git status --short`.
2. Read `AGENTS.md`.
3. Read `.agents/skills/README.md`.
4. Read related existing skills.
5. Read the current issue file when work is part of an active issue.

If uncommitted changes are unrelated, stop and ask the user.

## Skill Naming

Use lowercase hyphen-case.

Good names:

- `create-pr`
- `review-to-issue`
- `skill-authoring`

Avoid:

- Japanese names
- spaces
- vague names such as `helper`
- names longer than needed

The folder name and frontmatter `name` must match.

## Required Files

A repository-local skill needs:

```text
.agents/skills/<skill-name>/SKILL.md
```

Do not add extra README, changelog, or guide files unless the user explicitly asks or the skill truly needs lazy-loaded references.

If references are needed, keep them one level below the skill directory:

```text
.agents/skills/<skill-name>/references/<topic>.md
```

Link every reference from `SKILL.md` and state when to read it.

## SKILL.md Format

Use this shape:

```md
---
name: skill-name
description: Use this skill when ...
---

# Skill Title

One short purpose sentence.

Use when the user asks to:

- trigger phrase or task
- trigger phrase or task

Do not use for:

- excluded task
- excluded task

## Core Rule

Primary rule and stopping point.

## Preconditions

Required local checks.

## Workflow

1. Step.
2. Step.
3. Stop when needed.

## Required Report

- result
- changed files
- commands
- validation
- unverified items
```

Add other sections only when needed.

## Frontmatter Description

The `description` is trigger metadata.

Make it:

- specific
- action-oriented
- clear about when the skill applies
- clear about important exclusions when useful

Do not make it a broad project summary.

## Safety Requirements

Preserve or add these when relevant:

- explicit user approval before implementation
- stop before code changes when the workflow is preparatory
- no commit, push, PR, GitHub write, merge, tag, or release without explicit instruction
- no scope expansion beyond the current issue
- no source-of-truth changes without validation
- no `.tmp/`, `.raw/`, `test-results/`, or `playwright-report/` commits

Do not weaken existing safety rules for readability.

## Reference Updates

When adding or renaming a skill, update:

- `.agents/skills/README.md`
- `AGENTS.md` when it should be a main entry point
- the current issue file when the issue tracks the new skill

Do not update unrelated docs.

## Validation

Always run:

```sh
git diff --check
```

For Markdown-only skill changes, skip `npm run check` and `npm run build` unless the changed files include `.mdx` or executable code.

If executable scripts or project code are changed, run the relevant checks.

## Required Report

Report:

- created or updated skill
- reference files updated
- safety rules preserved
- validation commands and results
- checks skipped and why
- Git operations performed or not performed

Do not commit unless the user explicitly asks.
