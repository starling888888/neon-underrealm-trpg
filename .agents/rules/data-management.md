# Data Management Rules

## Local-Only Inputs

Put Google Drive-derived local inputs under `<repo-root>/.raw/`.

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

Use this fixed local input structure:

```text
<repo-root>/.raw/
├── release-notes.xlsx
├── data/
│   └── *.xlsx
├── contents/
│   └── *.md
└── v1.0/
    └── *.md
```

The Google Drive sync root must use the same relative structure.

Use `<repo-root>/raw-google-drive.url` to store the Google Drive sync folder URL for local development.

`raw-google-drive.url` is local configuration. Do not Git-manage it.

Do not Git-manage `.raw/`.

Do not commit:

- `.raw/`
- `raw-google-drive.url`
- `*.xlsx`
- `*.xlsm`
- `~$*.xlsx`

Google Drive is the user-edited source for these local inputs. The local `.raw/` directory is a working copy for agents.

Google Docs sync to `.raw/contents/*.md`.

Google Sheets sync to `.raw/release-notes.xlsx` or `.raw/data/*.xlsx`.

Google Docs directly under Drive `v1.0/` sync to `.raw/v1.0/*.md` as historical references through `text/markdown` export. Remove inline `data:image/...;base64,...` Markdown image reference definitions before local storage. Do not treat them as current site source of truth. Stop if `v1.0/` contains a subdirectory or a non-Google-Doc file.

Do not write Google Drive-derived files outside `<repo-root>/.raw/`.

Do not create or use `<repo-root>/.raw/sheets/`.

Google Drive remains the user-edited source of truth for `.raw/contents/` and `.raw/release-notes.xlsx`.

Write local `.raw/` changes back to Google Drive only through `raw-to-drive-sync` after the user explicitly says `$raw-to-drive-sync` or `raw-to-drive-sync を実行して`.

`raw-to-drive-sync` may update the existing `release-notes` Google Sheet and existing or new `contents/<slug>.md` Google Docs. It must write Markdown source as plain text, not rich text. It must refuse `.raw/data/` and `.raw/v1.0/` even when the user explicitly requests them.

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

Put canonical design references under:

```text
docs/design/<design-target>/
```

Put actual Visual Review screenshots in Playwright output directories such as:

```text
test-results/
playwright-report/
```

Do not commit Visual Review output directories.

Do not replace canonical design images with actual screenshots unless the design-image-generation design fix workflow is approved.

## Required Ignore Policy

Keep these ignore rules:

```gitignore
.raw/
raw-google-drive.url
.tmp/
test-results/
playwright-report/
*.xlsx
*.xlsm
~$*.xlsx
```
