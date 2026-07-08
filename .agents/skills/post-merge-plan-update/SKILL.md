---
name: post-merge-plan-update
description: Use this skill after a GitHub PR has been merged to return to main, pull merged changes, delete the merged work branch, update docs/plan.md, complete handled docs/TODO.md items, commit tracking updates, and push main.
---

# Post-merge Plan Update Skill

Perform repository cleanup and tracking updates after a PR has been merged.

Use when the user asks to:

- return to `main` after a merged PR
- pull merged changes and confirm the result
- delete the merged work branch
- mark the corresponding `docs/plan.md` task complete
- move completed `docs/plan.md` entries to `docs/plan-done.md` when the user asks for active/done cleanup
- mark handled `docs/TODO.md` items complete and move them to `docs/TODO-done.md`
- move completed issue files to `docs/issue/done/phase-N/` or `docs/issue/done/cross-phase/`
- commit and push tracking updates to `main`

Do not use for:

- implementation work
- PR creation
- PR review intake
- failure-log done cleanup unless the user directly asks for that file

Update `docs/plan.md` checkboxes only because the user is explicitly requesting a post-merge plan update.

Update `docs/TODO.md` only when the merged work actually handled the TODO item.

Do not move `docs/agent-failure-log.md` entries from this skill. Failure-log done cleanup belongs to failure-log audit or a direct user instruction for that file.

---

## Core rule

Do the cleanup in this order:

1. Inspect the current branch and working tree.
2. Identify the work branch to delete.
3. Switch to `main`.
4. Pull `origin/main` with fast-forward only.
5. Confirm the expected merged commits are present.
6. Confirm the work branch is merged into `main`.
7. Delete the local work branch only when it is safely merged.
8. Update only the relevant `docs/plan.md` checkbox block.
9. If active/done cleanup is requested, move completed plan entries from `docs/plan.md` to `docs/plan-done.md`.
10. If the merged work handled `docs/TODO.md` items, mark them complete and move them to `docs/TODO-done.md`.
11. If the issue is complete, move the issue file to the correct `docs/issue/done/` archive.
12. Keep active documents from depending on completed issue files.
13. Run available validation commands.
14. Commit only tracking files that were intentionally updated.
15. Push `main`.
Do not modify source code.

Do not edit unrelated plan items.

Do not edit unrelated TODO items.

Do not delete remote branches unless the user explicitly asks.

---

## Preconditions

Before changing branches or tracking files, inspect the current branch and working tree.

If the working tree has unrelated changes, stop and ask the user.

If changes are only the intended tracking update files, inspect them and continue.

Record the current branch as `WORK_BRANCH` before switching to `main`.

If already on `main`, infer `WORK_BRANCH` from the user's latest instruction, recent merged PR branch, or local history. If it cannot be inferred safely, ask the user.

---

## Main update flow

Switch to `main` and pull `origin/main` with fast-forward only.

Confirm that:

- `main` is up to date with `origin/main`
- the expected merged PR or commits are present
- no unexpected working tree changes exist

If the fast-forward pull fails, stop and report the failure.

Do not merge, rebase, reset, or force-update as part of this skill.

---

## Branch deletion

Confirm `WORK_BRANCH` is merged into `main` before deleting the local branch.

If `WORK_BRANCH` is not safely merged, stop and report that the branch cannot be deleted safely.

Do not force-delete a local branch unless the user explicitly approves it.

---

## Updating docs/plan.md

Find the relevant `docs/plan.md` section by task number, task slug, or `WORK_BRANCH`.

Rules:

- Change the merged task checkbox from `[ ]` to `[x]`.
- Change direct subtasks from `[ ]` to `[x]` only when the merged work satisfies them.
- Do not update unrelated tasks.
- Do not update the `初期スコープ外として維持するもの` checklist unless the user specifically asks.
- If no matching `docs/plan.md` item exists, do not create a new plan item. Report that there was no plan checkbox to update.

If the user requested active/done cleanup, move completed plan entries that no longer need to stay in active context to `docs/plan-done.md`.

Rules:

- Move only completed entries.
- Preserve the original task ID, task title, and relevant subtask context.
- Add completion context when available: merged PR number, completion date, related commit, or task name.
- Do not move incomplete tasks.
- Do not move future or in-progress phase headings if they still provide active planning context.
- If moving an item would make the active plan hard to understand, keep a concise phase placeholder or summary in `docs/plan.md`.

---

## Updating docs/TODO.md

Check whether the merged work handled any `docs/TODO.md` item.

Use the merged PR, issue file, review notes, or user instruction to identify related TODOs.

Rules:

- Update TODOs only when the merged work actually handled them.
- Change the completed TODO checkbox from `[ ]` to `[x]`.
- Move completed TODO items from `docs/TODO.md` to `docs/TODO-done.md`.
- Preserve the original TODO metadata when moving it.
- Add completion context when available: merged PR number or branch, completion date, related commit, or task name.
- Do not mark TODOs complete merely because the related plan item was completed.
- Do not update unrelated TODOs.
- If related TODOs remain unhandled, leave them under `## 未対応` and report that they remain open.

Example completed item shape:

```md
- [x] TODO title
  - completed: YYYY-MM-DD via PR #N / `WORK_BRANCH`
  - source: `.tmp/pr-N-review.md`
  - classification: follow-up
  - plan: `docs/plan.md` の該当項目
  - handling plan: ...
```

If `docs/TODO.md` still contains a historical `## 完了済み` section, treat it as legacy active-file content. Do not add new completed TODOs there; move newly completed TODOs to `docs/TODO-done.md`.

---

## Moving completed issue files

Move an issue file only when all of these are true:

- the issue corresponds to the merged work
- every relevant completion criterion and checkpoint has been checked locally or confirmed by the user
- the merged PR or commit is present on `main`
- the issue is not the current in-progress tracking issue
- the destination classification is clear

Before deciding whether an issue is complete, inspect its `完了条件` and `チェックポイント`.

If the latest merged issue still has unchecked items, update those checkboxes during post-merge only when the item can be confirmed from the merged `main` state, validation results, merged PR record, or explicit user confirmation.

If older active issue files have unchecked items because the check update was missed earlier, you may update those checkboxes during post-merge when the current repository state or explicit user confirmation proves the item is complete.

Do not invent completion evidence. Do not mark an item complete merely because the related plan item is checked.

If an unchecked item cannot be confirmed during post-merge, leave it unchecked, report it, and do not move that issue file to `docs/issue/done/`.

Destination rules:

- Use `docs/issue/done/phase-0/` for Phase 0 issue tasks.
- Use `docs/issue/done/phase-1/` for Phase 1 issue tasks.
- Use `docs/issue/done/phase-2/` for Phase 2 issue tasks.
- Use `docs/issue/done/cross-phase/` for tasks that are not tied to a single numbered plan phase, or for repository/process cleanup spanning multiple phases.

Do not move:

- unfinished issues
- the current issue still being worked on
- issue drafts that were not validated locally
- issue files with unchecked completion criteria or checkpoints unless the items were confirmed and checked during this post-merge update, or the user explicitly confirms they are complete

When moving an issue file:

- Keep the filename unchanged.
- Do not make active documents depend on completed issue files.
- If active docs still need information from a completed issue, promote that information to the appropriate active SSoT: requirements, design notes, TODO, plan, `AGENTS.md`, or a skill.
- Historical or provenance references may remain only when clearly marked as historical and not used as implementation responsibility.
- Report every moved issue path in the final report.

---

## Validation

Run available checks after editing tracking files:

- project check command
- project build command

Skip `npm run check` and `npm run build` when every changed file is a `.md` file. Markdown-only tracking updates do not justify the execution cost.

Do not skip validation for `.mdx` changes. Treat `.mdx` as site content that can affect the build.

If either script is missing, report it and continue.

If a command fails, stop and report the failure. Do not commit a failing tracking update unless the user explicitly asks.

---

## Commit and push

Stage only tracking files that were intentionally updated.

Allowed staged files:

- `docs/plan.md`
- `docs/plan-done.md` only when plan entries were moved
- `docs/TODO.md` only when TODO items were completed or removed from active TODO
- `docs/TODO-done.md` only when completed TODO items were moved
- `docs/issue/*.md` only when moving the completed issue out of active issue storage
- `docs/issue/done/**/*.md` only when receiving moved completed issue files
- documentation files whose only change is an internal link update caused by moved issue files

Confirm the staged diff contains only intended tracking files.

Use a commit message such as:

```txt
docs: mark TASK_NAME complete
```

If the commit updates TODOs as well as plan checkboxes, prefer:

```txt
docs: mark TASK_NAME tracking complete
```

Push `main` after committing.

---

## Final report

Report:

- current branch
- pull result
- deleted local branch
- updated plan item
- completed TODO items, or explicitly state that no TODO item was completed
- validation commands and results
- commit hash
- push result

Mention explicitly that no remote branch was deleted unless it was requested and performed.
