# Core Rules Rationale

`AGENTS.md` keeps mandatory top-level rules. This file records the reasons without making `AGENTS.md` longer.

## No Unrequested Pre-Commit Staging, Commit, Or Push

Staging, commits, pushes, tags, releases, remote branches, and PRs select or publish a repository state. The user may not have reviewed that state.

Agents must leave ordinary implementation changes in the working tree unless the user explicitly asks for version-control write operations.

Before a commit instruction, the staging area is user-controlled review state. The user may use `git add` to select paths and inspect a future commit. Agents must not rewrite that selection without an explicit staging instruction.

After the user asks to commit, staging the intended files is part of making the requested commit. The agent must still inspect the diff and stage only the files that belong to that commit.

## No Inline Environment-Variable Commands

Do not execute commands in the form `XXX=hogehoge command`.

Inline assignments alter the command prefix. That can cause an unnecessary approval request even when the command itself has an approved prefix, which makes the execution path unpredictable and interrupts the intended workflow.

When a tool requires environment-variable configuration, place the setting in that tool's appropriate `.env` file instead. This keeps the invoked command stable and makes configuration explicit and reviewable.

## Issue-First Before Implementation

Development work starts with a reviewed issue contract.

This rule protects implementation work. It does not convert every task-number reference, branch request, scope adjustment, requirements adjustment, or local contents-authoring request into authorization to create an issue. The latest user instruction controls whether issue creation is allowed.

When a user limits work to scope, requirements, or contents, the agent must complete only that work, report the result and unresolved decisions, and stop. Running an issue reviewer without first creating a user-authorized local issue would add unrequested work and can obscure the requested stopping point.

The issue file defines:

- task goal
- target scope
- out of scope items
- completion criteria
- checkpoints
- related TODO handling
- design reference requirements

This prevents scope drift and allows review before code changes begin.

## Dedicated Branches

Each development task uses its own branch so unrelated work is not mixed.

If a branch name already exists, stop and ask. Do not overwrite or reuse a branch in a way that could hide existing work.

## Scope Discipline

The current `docs/issue/*.md` is the implementation contract.

Do not silently expand the task. If related work appears, record it in the issue for review, route it to `docs/TODO.md`, or split it into another task.

## Static Site Constraint

This project must stay suitable for static hosting.

Do not introduce DB, authentication, CMS, API server, mandatory SSR, or secret-dependent runtime behavior during initial implementation.

## Design And Visual Review Separation

Design images under `docs/design/<design-target>/` are canonical references.

Visual Review screenshots are actual implementation artifacts. Do not copy actual screenshots into `docs/design/` to hide mismatches.

Canonical design updates require the design-image-generation workflow and explicit approval.

## Failure Log

`docs/agent-failure-log.md` captures agent procedure failures, repeated validation failures, and user-identified judgment errors.

The log is not a general TODO list, and it is not a place for ordinary implementation review feedback.

Use it to preserve evidence of workflow overrun, unapproved action, scope drift, validation misreporting, source-of-truth confusion, repeated tool/check failures, or judgment errors that may need permanent rule or workflow updates.

When review feedback exposes an agent failure, record the failure source as `review`. Keep normal review findings in the current issue or `docs/TODO.md`.
