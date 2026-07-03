---
name: post-merge-plan-update
description: Use this skill after a GitHub PR has been merged when the user asks to return to main, pull the merged changes, confirm the pull, delete the merged work branch, update docs/plan.md checkboxes, commit that plan update on main, and push main.
---

# Post-merge Plan Update Skill

This skill performs repository cleanup and the `docs/plan.md` update after a PR has been merged.

Use this skill when the user asks to:

* return to `main` after a merged PR
* pull merged changes
* confirm the pull result
* delete the current work branch
* mark the corresponding `docs/plan.md` task complete
* commit and push the `docs/plan.md` update to `main`

This skill may update `docs/plan.md` checkboxes only because the user is explicitly requesting a post-merge plan update.

---

## Core rule

Do the cleanup in this order:

1. Inspect the current branch and working tree
2. Identify the work branch to delete
3. Switch to `main`
4. Pull `origin/main` with fast-forward only
5. Confirm the expected merged commits are present
6. Confirm the work branch is merged into `main`
7. Delete the local work branch
8. Update only the relevant `docs/plan.md` checkbox block
9. Run available validation commands
10. Commit only `docs/plan.md`
11. Push `main`

Do not modify source code.
Do not edit unrelated plan items.
Do not delete remote branches unless the user explicitly asks.

---

## Preconditions

Run:

```sh
git status --short --branch
git branch --show-current
```

If the working tree has changes:

* Inspect them before switching branches.
* If the changes are only the intended `docs/plan.md` checkbox update, keep them and continue.
* If there are unrelated changes, stop and ask the user how to handle them.

Record the current branch as `WORK_BRANCH` before switching to `main`.

If already on `main`, infer `WORK_BRANCH` from the user's latest instruction, recent merged PR branch, or `git reflog`. If it cannot be inferred safely, ask the user.

---

## Main update flow

Switch to `main`:

```sh
git switch main
```

Pull with fast-forward only:

```sh
git pull --ff-only origin main
```

Confirm pull result:

```sh
git status --short --branch
git log --oneline --decorate -5
```

The status should show `main...origin/main` with no ahead/behind marker. The log should show the merged PR or commits expected by the user.

If `git pull --ff-only` fails, stop and report the failure. Do not merge, rebase, reset, or force-update.

---

## Branch deletion

Check whether `WORK_BRANCH` is merged:

```sh
git branch --merged main
```

If `WORK_BRANCH` is listed, delete it:

```sh
git branch -d WORK_BRANCH
```

If it is not listed, stop and report that the branch is not safely merged. Do not use `git branch -D` unless the user explicitly approves force deletion.

---

## Updating docs/plan.md

Open the relevant section:

```sh
rg -n "WORK_BRANCH|task slug|task number" docs/plan.md
```

Update only the checkbox block corresponding to the merged task.

Rules:

* Change the task checkbox from `[ ]` to `[x]`.
* Change its direct subtasks from `[ ]` to `[x]` only when the merged work satisfies them.
* Do not update unrelated tasks.
* Do not update the "初期スコープ外として維持するもの" checklist unless the user specifically asks.
* If the task is plan-outside and no matching `docs/plan.md` item exists, do not create a new plan item. Report that there was no plan checkbox to update.

Use `apply_patch` for the edit.

---

## Validation

Run available checks after editing `docs/plan.md`:

```sh
npm run check
npm run build
```

If either script is missing, report it and continue.
If a command fails, stop and report the failure. Do not commit a failing plan update unless the user explicitly asks.

---

## Commit and push

Stage only `docs/plan.md`:

```sh
git add docs/plan.md
git diff --cached --stat
```

Confirm the staged diff contains only `docs/plan.md`.

Commit:

```sh
git commit -m "docs: mark TASK_NAME complete"
```

Use the task slug in the commit message when possible, for example:

```sh
git commit -m "docs: mark 02 init complete"
```

Push:

```sh
git push origin main
```

---

## Final report

Report:

* current branch
* pull result
* deleted local branch
* updated plan item
* validation commands and results
* commit hash
* push result

Mention explicitly that no remote branch was deleted unless it was requested and performed.
