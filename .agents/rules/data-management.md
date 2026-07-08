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
└── contents/
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

Do not write Google Drive-derived files outside `<repo-root>/.raw/`.

Do not create or use `<repo-root>/.raw/sheets/`.

Do not write local `.raw/` changes back to Google Drive unless a future approved issue explicitly changes that policy.

## Generated Data

Put Git-managed generated data under `data/generated/`.

Generated JSON normally comes from Excel input. Do not hand-edit it unless the current issue explicitly allows it.

Do not overbuild conversion scripts before the conversion specification is settled.

## Temporary Files

Put scratch files, copied review notes, comparison notes, and temporary artifacts under `.tmp/`.

`.tmp/` is not a shared deliverable. Move only necessary information into formal docs or reports.

Do not commit `.tmp/`.

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
