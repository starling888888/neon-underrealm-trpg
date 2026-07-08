# Data Management Rules

## Local-Only Inputs

Put Excel source files and other raw local inputs under `.raw/`.

Do not Git-manage `.raw/`.

Do not commit:

- `.raw/`
- `*.xlsx`
- `*.xlsm`
- `~$*.xlsx`

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
.tmp/
test-results/
playwright-report/
*.xlsx
*.xlsm
~$*.xlsx
```
