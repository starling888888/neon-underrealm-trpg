---
name: post-merge-plan-update
description: Use this skill after a GitHub PR has been merged to return to main, pull merged changes, delete the merged work branch, update docs/issue/milestone-<NN>/plan.md, complete handled docs/TODO.md items, commit tracking updates, and push main.
---

# Post-merge Plan Update Skill

Perform repository cleanup and tracking updates after a PR has been merged.

Use when the user asks to:

- return to `main` after a merged PR
- pull merged changes and confirm the result
- delete the merged work branch
- mark the corresponding `docs/issue/milestone-<NN>/plan.md` task complete
- keep the completed task name and GitHub Issue number in the milestone plan
- mark handled `docs/TODO.md` items complete and move them to `docs/TODO-done.md`
- archive completed issue files as same-name GitHub closed Issues and delete the local files
- reduce completed issue records in milestone plans and Gate plans to their names and GitHub Issue numbers
- commit and push tracking updates to `main`

Do not use for:

- implementation work
- PR creation
- PR review intake
- failure-log done cleanup unless the user directly asks for that file

Update `docs/issue/milestone-<NN>/plan.md` checkboxes only because the user is explicitly requesting a post-merge plan update.

Update `docs/TODO.md` only when the merged work actually handled the TODO item.

Do not move `docs/agent-failure-log/active.md` entries from this skill. Failure-log done cleanup belongs to failure-log audit or a direct user instruction for that file.

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
8. Update only the relevant `docs/issue/milestone-<NN>/plan.md` checkbox block.
9. Do not retain detailed completion context in a completed milestone plan entry.
10. If the merged work handled `docs/TODO.md` items, mark them complete and move them to `docs/TODO-done.md`.
11. Confirm that required review information was formalized, then remove only `.tmp/review/<WORK_BRANCH>/`.
12. For a completed Gate child issue, prepare its parent Gate plan for a lightweight GitHub Issue reference.
13. If the issue is complete, archive it as a GitHub closed Issue and delete the local issue file.
14. Keep active documents from depending on completed issue files or closed GitHub Issues as implementation SSoT.
15. Run available validation commands.
16. Commit only tracking files that were intentionally updated.
17. Push `main`.

Do not modify source code.

Do not edit unrelated plan items.

Do not edit unrelated TODO items.

Do not delete remote branches unless the user explicitly asks.

Do not remove `.tmp/` as a whole or another branch's `.tmp/review/` directory.

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

## Updating docs/issue/milestone-<NN>/plan.md

Find the relevant `docs/issue/milestone-<NN>/plan.md` section by task number, task slug, or `WORK_BRANCH`.

Rules:

- Change the merged task checkbox from `[ ]` to `[x]`.
- Change direct subtasks from `[ ]` to `[x]` only when the merged work satisfies them.
- Do not update unrelated tasks.
- Do not update the `初期スコープ外として維持するもの` checklist unless the user specifically asks.
- If no matching `docs/issue/milestone-<NN>/plan.md` item exists, do not create a new plan item. Report that there was no plan checkbox to update.

After updating the relevant plan entry, check every checkbox in that entry. Keep the entry in the same milestone plan because it is both the current closure plan and the milestone history.

Rules:

- Before the GitHub Issue is closed, leave the plan entry active and do not add a completion record.
- After the GitHub Issue is closed, replace the completed entry and its direct subtask block with only `<issue-slug> — GitHub Issue #<number>`.
- Do not retain merged PR numbers, completion dates, commits, task details, or subtask context in a completed plan entry.
- Do not create a future milestone plan from this workflow.

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
  - plan: `docs/issue/milestone-<NN>/plan.md` の該当項目
  - handling plan: ...
```

If `docs/TODO.md` still contains a historical `## 完了済み` section, treat it as legacy active-file content. Do not add new completed TODOs there; move newly completed TODOs to `docs/TODO-done.md`.

---

## Archiving completed issues

Archive an issue only when all of these are true:

- the issue corresponds to the merged work
- every relevant completion criterion and checkpoint has been checked locally or confirmed by the user
- the merged PR or commit is present on `main`
- the issue is not the current in-progress tracking issue

For a Gate child issue, confirm the parent Gate plan path from the child issue. After GitHub closure, update that Gate entry to status `done` and retain only `<child-issue-slug> — GitHub Issue #<number>`. Do not copy implementation logs, temporary review notes, background, detailed requirements, or follow-up handoff into the plan.

Before deciding whether an issue is complete, inspect its `完了条件` and `チェックポイント`.

If the latest merged issue still has unchecked items, update those checkboxes during post-merge only when the item can be confirmed from the merged `main` state, validation results, merged PR record, or explicit user confirmation.

If older active issue files have unchecked items because the check update was missed earlier, you may update those checkboxes during post-merge when the current repository state or explicit user confirmation proves the item is complete.

Do not invent completion evidence. Do not mark an item complete merely because the related plan item is checked.

If an unchecked item cannot be confirmed during post-merge, leave it unchecked, report it, and do not create or close a GitHub archive Issue or delete the local issue file.

Create or reuse the GitHub Issue as follows:

1. Search the issue body for the exact original local issue path marker.
2. Create a same-name Issue only when the marker has no result. Include the final local issue body, original path, completion record, and related PR or commit.
3. Reuse exactly one matching Issue. If the marker has multiple results, or a prior inventory says a number exists but marker lookup finds none, stop and request a decision.
4. Close the Issue only after confirming its title, body, and completion state.
5. Verify the closed state through GitHub before deleting the local issue file.

Do not archive:

- unfinished issues
- the current issue still being worked on
- issue drafts that were not validated locally
- issue files with unchecked completion criteria or checkpoints unless the items were confirmed and checked during this post-merge update, or the user explicitly confirms they are complete
- an issue when GitHub creation or close has not been authorized by the user or approved policy

Before deleting the local issue file:

- Do not make active documents depend on completed issue files.
- If active docs still need information from a completed issue, promote that information to the appropriate active SSoT: requirements, design notes, TODO, plan, `AGENTS.md`, or a skill.
- Historical references must use plain text `<slug> — GitHub Issue #<number>`, not a Markdown link or a local issue path.
- For a milestone plan, retain only the completed issue name and GitHub Issue number; remove its detailed requirements, completion criteria, and implementation history.
- For a completed parent Gate plan, move the lightweight plan to `docs/issue/milestone-<NN>/plans/` before deleting its parent issue file.

---

## Review Artifact Cleanup

After the merged work, issue, TODO, plan, and failure-log routing are confirmed:

1. Inspect `.tmp/review/<WORK_BRANCH>/` when it exists.
2. Confirm that required user-directed requirement changes were reflected in their source SSoT and current issue before cleanup.
3. Remove only `.tmp/review/<WORK_BRANCH>/` and its contents.
4. Do not remove another `.tmp/` path.
5. Report whether the directory was removed or absent.

The review artifact directory is Git-ignored and must never be staged.

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

- `docs/issue/milestone-<NN>/plan.md`
- `docs/issue/milestone-<NN>/plan.md` only when plan entries were moved
- `docs/TODO.md` only when TODO items were completed or removed from active TODO
- `docs/TODO-done.md` only when completed TODO items were moved
- `docs/issue/*.md` only when deleting the completed local issue file
- `docs/issue/milestone-<NN>/plans/*.md` only when receiving a completed parent Gate plan
- documentation files whose only change is a GitHub Issue reference or compact plan update caused by archiving a completed issue

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
- archived GitHub Issue number and deleted local issue path
- completed TODO items, or explicitly state that no TODO item was completed
- removed review artifact directory, or explicitly state that it was absent
- validation commands and results
- commit hash
- push result

Mention explicitly that no remote branch was deleted unless it was requested and performed.
