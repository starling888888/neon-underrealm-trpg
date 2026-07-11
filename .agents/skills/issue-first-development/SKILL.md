---
name: issue-first-development
description: Use this skill when the user asks to start a task from docs/plan.md, create a task branch, prepare docs/issue/*.md before implementation, validate an existing issue, or draft an issue from a remote GitHub snapshot. This skill must stop before code implementation and wait for human review.
---

# Issue-first Development Skill

Prepare a development task before implementation.

Use when the user asks to:

- start a task from `docs/plan.md`
- create a branch for a planned task
- prepare an issue file before development
- draft an issue from a GitHub repository snapshot
- validate an existing `docs/issue/*.md`
- begin work using the project's issue-first workflow
- create `docs/issue/X-hogehoge.md`
- split a planned task into a child task

Do not use for:

- implementation
- Visual Review
- PR creation
- post-merge cleanup
- review note intake

Create, draft, or validate the branch / issue contract, then stop for human review.

---

## Core rule

Do not implement the task immediately.

The local workflow is:

1. Read the requested task from `docs/plan.md`.
2. Determine the branch name.
3. Check the current local repository state.
4. Check whether a matching `docs/issue/NN-slug.md` already exists.
5. Check `docs/TODO.md` for related follow-up items.
6. For UI, CSS, layout, page, or component tasks, check whether a relevant design target exists under `docs/design/`.
7. If design images are needed but missing, route design creation to `design-image-generation` initial draft mode instead of implementing UI.
8. Create `.tmp/review/<branch-name>/` after creating the branch.
9. Create or validate `docs/issue/NN-slug.md`.
10. Write the task goal, scope, completion criteria, checkpoints, design references, TODO references, design-generation prerequisites when relevant, and review points.
11. Run the local issue review workflow.
12. Stop and wait for user review.

Implementation may begin only after the user explicitly approves the issue file.

---

## Execution modes

### Local repository mode

Use this mode when the agent can inspect the local repository filesystem and current working tree.

In this mode, the agent may:

- inspect local repository state
- inspect the current branch
- inspect local files
- create a dedicated branch
- create `.tmp/review/<branch-name>/`
- create `docs/issue/NN-slug.md`
- validate an existing local issue
- check `docs/TODO.md` for related future-work items
- check local design references under `docs/design/`

In this mode, the agent must not:

- implement before issue approval
- overwrite user changes
- update `docs/plan.md` checkboxes
- treat a remote draft as final before local validation
- create design images unless the user explicitly asks to run `design-image-generation`

### Remote snapshot draft mode

Use this mode when the agent can read repository files through GitHub or another remote source, but cannot verify the local working tree.

In this mode, the agent may:

- fetch repository files from a remote source
- read `AGENTS.md`, this skill, `docs/plan.md`, `docs/requirements.md`, `docs/out-of-scope.md`, `docs/TODO.md`, relevant design docs, relevant existing issues, and relevant existing code
- produce an issue markdown draft in chat
- validate an existing issue against a remote snapshot
- cite or list the exact files and refs used to generate the draft

In this mode, the agent must not:

- claim local repository validation
- claim local branch creation
- claim local issue-file creation
- claim local command execution
- treat the draft as a final issue
- implement code
- update repository files
- update `docs/plan.md`
- claim design images were generated or verified locally
- create `.tmp/review/` files
- run reviewer subagents

Remote snapshot output must include:

- `Source Snapshot`
- `Unchecked / Not verified`
- `Local Validation Required`

A remote draft is not the final task contract until it is validated against the local repository state.

---

## Preconditions

Before doing local work, inspect the current repository state.

Run:

```sh
git status
git branch --show-current
```

If there are uncommitted changes, inspect them before making changes.

Do not overwrite, delete, format, or move existing user changes unless the user explicitly approves it.

If the working tree is unsafe or ambiguous, stop and ask the user.

In remote snapshot draft mode, do not infer local repository state. If a required file cannot be fetched, mark it under `Unchecked / Not verified`.

## Context hygiene

Before starting issue-first work, check whether the current conversation still carries context from a previous issue.

Previous-issue context includes old issue goals, old branch assumptions, old review notes, old implementation details, old TODO routing decisions, and temporary task assumptions.

Do not carry previous-issue context into a new issue-first task.

Clear only task-derived context. Do not clear or ignore:

- `AGENTS.md`
- `.agents/skills/*`
- `.agents/rules/*`
- repository configuration
- MCP server connection information
- current user instructions

If the agent cannot clear previous-issue context by itself, stop before preparing the new issue and tell the user to start a fresh Codex session or otherwise clear the previous issue's conversation context.

If automatic context compaction happened during the same issue, do not treat that as a completed clear. Re-check the current issue, branch, working tree, and latest user instruction before continuing.

---

## Branch naming

Use the task number and slug from `docs/plan.md`.

Normal task:

```txt
NN-slug
```

Child task:

```txt
NN-M-slug
```

Examples:

```txt
01-docs-requirements
06-config-base-path
12-1-mobile-menu-drawer
39-2-ryugi-detail-template
```

Rules:

- Use lowercase English
- Use numbers and hyphens
- Do not use Japanese in branch names
- Do not use spaces
- Keep the slug short and descriptive

Before preparing or validating a local issue draft, determine its target branch name.

When the target branch is the current branch, use it. Create `.tmp/review/<branch-name>/` and continue with local repository mode.

When the target branch differs from the current branch and does not already exist, create the target branch from the current branch. Then create `.tmp/review/<branch-name>/` and continue with local repository mode. Branches may be created from an existing work branch when the user starts a different issue.

When the target branch already exists but is not the current branch, do not overwrite it. Stop and ask the user how to proceed.

In remote snapshot draft mode, do not claim the branch was created.

---

## Issue file naming

Create or draft the issue file under:

```txt
docs/issue/
```

The issue filename must match the branch name.

Examples:

```txt
docs/issue/01-docs-requirements.md
docs/issue/06-config-base-path.md
docs/issue/12-1-mobile-menu-drawer.md
```

Create `docs/issue/` if it does not exist in local repository mode.

In remote snapshot draft mode, do not claim the issue file was written.

---

## Existing issue handling

If `docs/issue/NN-slug.md` already exists, do not recreate it.

Validate it against the relevant SSoT.

Check:

- the task exists in `docs/plan.md`
- the branch / issue name matches the plan task
- the issue goal matches the plan task
- the scope is neither broader nor narrower than the task requires
- initial out-of-scope items are explicit
- completion criteria are reviewable
- checkpoints cover build, check, subpath behavior, unnecessary dependencies, and scope discipline when relevant
- expected files match the likely implementation area
- design references are recorded for UI, CSS, layout, page, or component tasks
- when design images are missing, `design-image-generation` initial draft mode is recorded as a pre-implementation prerequisite
- related `docs/TODO.md` items are referenced or deliberately left for later
- existing code paths mentioned in the issue exist or are clearly marked as planned
- the issue does not contradict `AGENTS.md`, this skill, `docs/requirements.md`, `docs/out-of-scope.md`, `docs/TODO.md`, `docs/plan.md`, or relevant `docs/design/` files

If the issue is valid, report that it can be used and stop for user approval.

If the issue is stale, incomplete, or contradictory, report the mismatches and stop. Do not silently rewrite it unless the user explicitly asks.

---

## TODO reference check

Before writing or validating an issue, check `docs/TODO.md`.

If TODO items are related to the requested task:

- reference them in the issue `背景` or `備考`
- decide whether the issue should handle them now or leave them for a later task
- avoid creating duplicate TODOs or duplicate plan entries
- include TODO-derived work in `対象範囲` and `完了条件` only when it clearly belongs to the current task

If a TODO item points to a plan item that no longer exists or no longer fits, report the mismatch and stop for user judgment.

If `docs/TODO.md` does not exist in local mode, report that TODO tracking is absent. Do not create it unless the user asks or the current workflow explicitly requires it.

In remote snapshot draft mode, include `docs/TODO.md` in `Source Snapshot` when fetched, or under `Unchecked / Not verified` when not fetched.

---

## Design reference check

For UI, CSS, layout, page, or component tasks, check `docs/design/` before writing the issue.

If a relevant design target exists, record it in the issue file.

Examples:

```txt
docs/design/global-styles/
docs/design/site-layout/
docs/design/home/
docs/design/rule-page/
docs/design/components/
```

Record the design target and key reference files in `背景`, `対象範囲`, `完了条件`, `レビュー観点`, or `備考`, whichever is clearest for the task.

For UI implementation tasks, design images must exist before implementation begins.

If no relevant design target exists, or if the design target exists but lacks required design images, record `design-image-generation initial draft mode を実行する` as a required pre-implementation item in the issue.

When design generation is required, record the expected artifacts where relevant:

```txt
docs/design/<design-target>/notes.md
docs/design/<design-target>/design-desktop.png
docs/design/<design-target>/design-mobile.png
```

Design image creation belongs to `.agents/skills/design-image-generation/SKILL.md`.

Do not create new design images during issue-first preparation unless the user explicitly asks to run `design-image-generation`.

Do not treat unreviewed initial design drafts as final design source of truth.

In remote snapshot draft mode, record whether the design target was found in the fetched snapshot. Do not assume local design files exist.

---

## Issue file template

Use `.github/ISSUE_TEMPLATE/issue-first-development.md` as the issue body template.

In local repository mode:

- read `.github/ISSUE_TEMPLATE/issue-first-development.md`
- create `docs/issue/<issue-slug>.md` as a local repository file
- fill the template with the current task's goal, scope, completion criteria, checkpoints, TODO references, design references, and review points

In ChatGPT / remote snapshot draft mode:

- fetch or read `.github/ISSUE_TEMPLATE/issue-first-development.md` when available
- output the complete issue markdown draft in chat so it can be copied into the repository later
- do not claim that a GitHub Issue or repository file was created

If the template cannot be read, do not reconstruct it from memory. Stop in local repository mode, or record the template as not verified in remote snapshot draft mode.

This skill creates or validates local `docs/issue/*.md` files. It does not create GitHub Issues unless the user explicitly asks for a GitHub Issue.

GitHub Issue creation requires a clear instruction such as:

- `GitHub Issueを作って`
- `GitHub上にissueを発行して`
- `gh issue createして`
- `この内容でGitHub Issueを作成して`

The phrase `issueを作って` by itself means the local issue-first workflow unless the user explicitly says GitHub Issue.

---

## Remote draft required sections

When running in remote snapshot draft mode, append these sections after `備考`.

```md
## Source Snapshot

- mode: remote snapshot draft
- repository: `owner/repo`
- remote ref: `branch-or-commit`
- generated from: GitHub connector or other remote source
- checked files:
  - `path/to/file`

## Unchecked / Not verified

- local working tree
- local uncommitted changes
- local branch existence
- local generated files not fetched
- files not listed in Source Snapshot
- binary design files unless explicitly inspected
- command results such as `npm run check` / `npm run build`

## Local Validation Required

This issue draft was generated from a remote repository snapshot.

Before creating, accepting, or implementing this issue, validate it against the local repository state.
```

Do not omit these sections in remote snapshot draft mode.

---

## Local validation completion

If an issue was originally created from a remote snapshot draft and local validation later completes, update the remote draft sections so they no longer contradict the validated local state.

Do this before treating the issue as approved for implementation.

Update the issue as follows:

- replace stale `Source Snapshot` / `Unchecked / Not verified` / `Local Validation Required` content with a concise local validation summary, or clearly mark the remote snapshot content as historical only
- remove items from `Unchecked / Not verified` when they have been locally verified
- record the local branch, matching issue file, relevant local files, required assets, and related TODO/design checks that were actually verified
- if validation commands were run, record the command names and results
- if validation commands were not run yet, keep them unchecked or explicitly state that they remain unverified
- do not mark completion criteria or checkpoints as done until they have actually been checked locally

The issue should not simultaneously claim that local validation is required and that the same items are already locally completed.

---

## Local issue review

Run this section only in local repository mode, after the issue body is ready and before user review.

1. Create `.tmp/review/<branch-name>/` with `mkdir -p`.
2. Spawn the `issue_reviewer` custom agent from `.codex/agents/issue-reviewer.toml`.
3. Give the agent the current issue path and the relevant SSoT paths.
4. Write the agent's Japanese response to `.tmp/review/<branch-name>/issue-review-1.md`.
5. If the first review has no findings or user-confirmation items, continue to the required stopping point.
6. If the first review has valid findings, update only the issue file to resolve them, then run `issue_reviewer` once more.
7. Write the second response to `.tmp/review/<branch-name>/issue-review-2.md`.
8. After the second review, continue to the required stopping point even when findings remain. Report remaining findings or user-confirmation items clearly.

Do not copy resolved issue-review findings into the issue as historical review sections.

After the user starts reviewing the issue, do not rerun `issue_reviewer`. Update the issue through the user conversation instead.

### User-directed changes outside the current issue

When a user explicitly directs a Git-managed change outside the current issue during issue preparation or user review:

1. Append the user instruction, classification, target paths, before/after values, issue relationship, and related commit or PR to `.tmp/review/<branch-name>/user-directed-changes.md`.
2. When the change modifies an existing requirement or initial scope SSoT, update that SSoT and current issue in the same task.
3. Do not record ordinary current-issue work or Git operations.
4. Do not use the temporary record as the source of truth. It is the later PR description source only.

Do not run this workflow in remote snapshot draft mode. The user may place a remote draft in the local repository and start this skill again; then use local repository mode.

---

## Required stopping point

After creating, drafting, or validating the issue, stop.

Do not modify source code.

Do not implement the task.

Do not run broad formatting.

Do not commit unless explicitly asked.

Report the following to the user:

```md
## 作業前準備完了

- branch: `NN-slug`
- issue: `docs/issue/NN-slug.md`
- mode: local repository mode / remote snapshot draft mode

## このissueで定義した内容

- 目的
- 対象範囲
- 完了条件
- チェックポイント
- 関連TODO
- 関連design target
- design-image-generation前提条件
- issue reviewerの実行回数と結果
- 残る判断不能事項

## レビューしてほしい点

- タスク範囲が広すぎないか
- 初期スコープ外が明確か
- 完了条件がレビュー可能か
- 関連TODOをこのissueで扱ってよいか
- design画像作成を別タスクまたは前段作業として扱うべきか

ユーザー承認後に実装を開始します。

Git commit / push は未実行です。
```

In remote snapshot draft mode, also state that the draft is not a final local issue until local validation is complete.

---

## Explicit approval required

Implementation may begin only after the user says something like:

```txt
OK、進めて
この内容で実装して
レビューした。開発して
承認。実装開始
```

Without explicit approval, stop after issue creation, draft, or validation.

Remote snapshot approval is not sufficient for implementation unless local validation has also been completed.

---

## Forbidden actions

Never run forbidden actions defined in `AGENTS.md` unless the user explicitly instructs it.

Never update `docs/plan.md` checkboxes by yourself.

Never mark a task complete without human review.

---

## Scope discipline

If the requested task appears to require work outside the issue scope, do not expand the task silently.

Instead:

1. Add a note to the issue file under `備考`.
2. Explain the risk to the user.
3. Ask whether to split it into a child task, route it to `docs/TODO.md`, or run `design-image-generation` first.

Examples of work that should be split or routed:

- Adding search while building layout
- Adding Excel conversion while building card UI
- Adding analytics while preparing deployment
- Adding character sheet features during rule site work
- Introducing a large UI library for a small component
- Pulling unrelated TODO items into the current issue
- Generating new design images while preparing an implementation issue

---

## Reference priority

Follow this priority order:

1. Latest user instruction
2. `AGENTS.md`
3. This skill
4. `docs/issue/NN-slug.md` when validating an existing issue
5. `docs/requirements.md`
6. `docs/out-of-scope.md`
7. `docs/plan.md`
8. `docs/TODO.md`
9. `.agents/skills/design-image-generation/SKILL.md` when design images are required
10. Relevant `docs/design/<design-target>/`
11. Existing code

If these conflict, stop and ask the user.

In remote snapshot draft mode, if a referenced file was not fetched, do not infer its content. Mark it under `Unchecked / Not verified`.
