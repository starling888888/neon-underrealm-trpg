# Core Rules Rationale

`AGENTS.md` keeps the mandatory top-level rules. This file records why those rules exist so the reasons can be referenced without making `AGENTS.md` longer.

## No Unrequested Pre-Commit Staging, Commit, Or Push

Staging, commits, pushes, tags, releases, remote branches, and PRs publish, preserve, or select a state that may not have been reviewed by the user.

Agents must leave ordinary implementation changes in the working tree unless the user explicitly asks for version-control write operations.

Before a commit instruction, the staging area is user-controlled review state. The user may use `git add` to select paths and inspect the next diff or future commit. Agents must not rewrite that selection by running `git add` without an explicit staging instruction.

After the user asks to commit, staging the intended files is part of making the requested commit. The agent must still inspect the diff and stage only the files that belong to that commit.

## Issue-First Before Implementation

Development work must start with a reviewed issue contract.

The issue file defines:

- task goal
- target scope
- out of scope items
- completion criteria
- checkpoints
- related TODO handling
- design reference requirements

This prevents scope drift and makes review possible before code changes begin.

## Dedicated Branches

Each development task must use its own branch so unrelated work is not mixed.

If a branch name already exists, stop and ask. Do not overwrite or reuse a branch in a way that could hide existing work.

## Scope Discipline

The current `docs/issue/*.md` is the implementation contract.

Do not silently expand the task. If related work is discovered, record it in the issue for review, route it to `docs/TODO.md`, or split it into another task.

## Static Site Constraint

This project must remain suitable for static hosting.

Do not introduce DB, authentication, CMS, API server, mandatory SSR, or secret-dependent runtime behavior during initial implementation.

## Design And Visual Review Separation

Design images under `docs/design/<design-target>/` are canonical references.

Visual Review screenshots are actual implementation artifacts. Do not copy actual screenshots into `docs/design/` to hide mismatches.

Canonical design updates require the design-image-generation workflow and explicit approval.

## Failure Log

`docs/agent-failure-log.md` captures agent procedure failures, repeated validation failures, and user-identified judgment errors.

The log is not a general TODO list, and it is not a place for ordinary implementation review feedback.

Use it to preserve evidence of workflow overrun, unapproved action, scope drift, validation misreporting, source-of-truth confusion, repeated tool/check failures, or judgment errors that may need later permanent rule or workflow updates.

When review feedback exposes an agent failure, record the failure source as `review`. Keep normal review findings in the current issue or `docs/TODO.md`.
