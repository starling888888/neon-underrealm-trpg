---
name: post-merge-plan-update
description: Use this skill after a GitHub PR has been merged to return to main, pull merged changes, delete the merged work branch, update docs/plan.md, complete handled docs/TODO.md items, commit tracking updates, and push main.
---

# Post-merge Plan Update Skill

This skill performs repository cleanup and tracking updates after a PR has been merged.

Use this skill when the user asks to:

- return to `main` after a merged PR
- pull merged changes and confirm the result
- delete the merged work branch
- mark the corresponding `docs/plan.md` task complete
- mark handled `docs/TODO.md` items complete and move them to `完了済み`
- commit and push tracking updates to `main`

This skill may update `docs/plan.md` checkboxes only because the user is explicitly requesting a post-merge plan update.

This skill may update `docs/TODO.md` only when the merged work actually handled the TODO item.

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
9. If the merged work handled `docs/TODO.md` items, mark them complete and move them to `完了済み`.
10. Run available validation commands.
11. Commit only tracking files that were intentionally updated.
12. Push `main`.

Do not modify source code.

Do not edit unrelated plan items.

Do not edit unrelated TODO items.

Do not delete remote branches unless the user explicitly asks.

---

## Preconditions

Before changing branches or tracking files, inspect the current branch and working tree.

If the working tree has unrelated changes, stop and ask the user.

If changes are only the intended `docs/plan.md` or `docs/TODO.md` tracking update, inspect them and continue.

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

---

## Updating docs/TODO.md

Check whether the merged work handled any `docs/TODO.md` item.

Use the merged PR, issue file, review notes, or user instruction to identify related TODOs.

Rules:

- Update TODOs only when the merged work actually handled them.
- Change the completed TODO checkbox from `[ ]` to `[x]`.
- Move completed TODO items from `## 未対応` to `## 完了済み`.
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

---

## Validation

Run available checks after editing tracking files:

- project check command
- project build command

If either script is missing, report it and continue.

If a command fails, stop and report the failure. Do not commit a failing tracking update unless the user explicitly asks.

---

## Commit and push

Stage only tracking files that were intentionally updated.

Allowed staged files:

- `docs/plan.md`
- `docs/TODO.md` only when TODO items were completed

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
