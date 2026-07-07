# Git Operations Rules

## Default Rule

Do not run these unless the user explicitly asks:

- `git commit`
- `git push`
- `git tag`
- `git rebase`
- `git merge`
- `git reset --hard`
- `git clean -fd`
- PR creation
- release creation
- remote branch creation

## Safe Read Commands

Read-only commands are allowed when needed:

- `git status`
- `git branch --show-current`
- `git diff`
- `git log`
- `git remote -v`
- `gh --version`
- `gh auth status`
- `gh pr list`
- `gh pr view`

Do not treat `gh repo view` as the source of truth for this repository. Prefer local `git remote -v`, files, and user instructions.

## Branches

Development tasks require a dedicated branch.

Normal task branch format:

```text
NN-slug
```

Child task branch format:

```text
NN-M-slug
```

Use the branch name defined by the approved issue when the issue intentionally differs from a plan number.

If the target branch already exists, stop and ask the user.

## Commits

Commit only when the user explicitly asks.

Before committing:

- inspect `git status --short`
- inspect the staged diff
- include only intended files
- do not include `.raw/`, `.tmp/`, `test-results/`, or `playwright-report/`

## Pushes And PRs

Push only when the user explicitly permits it.

Create PRs only when the user explicitly asks for PR creation.

Use `.agents/skills/create-pr/SKILL.md` when the user asks to create a PR.

Before PR creation, confirm:

- base branch
- head branch
- diff scope
- PR title
- PR body
- draft or ready-for-review state

Use `.github/pull_request_template.md` for the PR body.

The default PR title is the issue slug only:

```text
<issue-slug>
```

If the matching issue file has unchecked completion criteria or checkpoints, report them and ask for explicit approval before creating the PR.

Do not add these sections to the PR body:

- Changed areas
- Group completion
- Checks
- Unchecked / Not verified
- Scope guard

Keep detailed status in the issue file.

## Destructive Actions

Ask before deleting files, deleting directories, resetting, cleaning, rebasing, merging, moving many files, changing public URLs, or running a formatter that will create a large diff.

Never use destructive commands to resolve uncertainty.
