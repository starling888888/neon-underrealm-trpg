# Data Management Rules

## Local-Only Inputs

Put local Spreadsheet working inputs under `<repo-root>/.raw/`.

In agent instructions, `.raw/` means the repository root directory `<repo-root>/.raw/`.

Do not interpret `.raw/` as:

- `/.raw/` at the OS root
- `./.raw/` relative to the current shell directory
- a `.raw/` directory outside the repository
- a Git-managed `raw/` directory

Resolve the repository root with:

```sh
git rev-parse --show-toplevel
```

`npm run sync:google-sheets` uses the `.env` root folder ID to recursively export Google Spreadsheets into `.raw/` as XLSX. It preserves the Drive folder hierarchy below the configured root and does not validate a fixed directory structure.

Google Docs and other Drive file types are not synchronized. `.raw/contents/` and `.raw/v1.0/` may be prepared manually when needed, but they are not Google Drive sync targets.

Do not Git-manage `.raw/` or `.env`.

Do not commit:

- `.raw/`
- `.env`
- `*.xlsx`
- `*.xlsm`
- `~$*.xlsx`

The local `.raw/` directory is an untracked working copy. Its Google Spreadsheet files are read-only local exports; do not write changes back to Google Drive.

Do not write Google Drive-derived files outside `<repo-root>/.raw/`.

`.raw/contents/` is a manual, non-canonical input. Git-managed MDX / Astro remains the page-body and visible-layout source of truth.

## Generated Data

Put Git-managed generated data under `data/generated/`.

Generated JSON normally comes from Excel input. Do not hand-edit it unless the current issue explicitly allows it.

Do not overbuild conversion scripts before the conversion specification is settled.

## Temporary Files

Put scratch files, copied review notes, comparison notes, and temporary artifacts under `.tmp/`.

`.tmp/` is not a shared deliverable. Move only necessary information into formal docs or reports.

Do not commit `.tmp/`.

### Review Artifacts

Use this branch-scoped structure for reviewer output:

```text
.tmp/review/<branch-name>/
├── issue-review-1.md
├── issue-review-2.md
├── user-directed-changes.md
├── pr-review-N.md
├── document-review-N.md
└── technical-review-N.md
```

`issue-review-N.md` is an ephemeral self-review record. Do not copy resolved findings into an issue.

`pr-review-N.md` records the reviewed commit range, reviewed head commit, remote PR information, and associated reviewer outputs. The next PR review starts after its reviewed head commit.

When a user explicitly directs a Git-managed change outside the current issue, record the user instruction, classification, target paths, before/after values, issue relationship, and related commit or PR in `user-directed-changes.md`.

Use these classifications:

- requirement change
- initial scope change
- out-of-issue tracking work
- other user-directed change

When the change modifies an existing requirement or initial scope SSoT, also update that SSoT and the current issue in the same task. Do not record ordinary current-issue work or Git operations.

After merge, `post-merge-plan-update` removes only `.tmp/review/<merged-branch>/` after confirming that required information was formalized. Do not remove other `.tmp/` files.

## Design Artifacts

Put design intent and VRT reference notes under:

```text
docs/design/<design-target>/
```

Put actual Visual Review screenshots in Playwright output directories such as:

```text
test-results/
playwright-report/
```

Do not commit Visual Review output directories.

Keep canonical VRT baselines in Playwright standard snapshot directories under `canonical-snapshots/visual/`. They are local-only comparison inputs and must stay ignored by Git. `docs/design/<design-target>/` is notes-only. Do not copy actual screenshots into `docs/design/`; baseline creation and updates require the user's explicit instruction.

For initial page, layout, UI, CSS, and component design work, record the intended route, states, viewports, constraints, and comparison points in `docs/design/<design-target>/notes.md`. When the user explicitly asks to create a design draft, put its standalone HTML/CSS prototype, capture script, and temporary capture under `.tmp/design/<design-target>/`. Do not store design images under `docs/design/`.

Do not use a draft prototype as an application implementation or a canonical VRT baseline. Use the local application route only through the matching VRT target. `test-results/` and `playwright-report/` remain transient diagnostic output and are never a design source of truth.

## Required Ignore Policy

Keep these ignore rules:

```gitignore
.raw/
.env
.tmp/
test-results/
playwright-report/
canonical-snapshots/visual/
*.xlsx
*.xlsm
~$*.xlsx
```
