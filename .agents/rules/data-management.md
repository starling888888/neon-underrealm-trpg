# Data Management Rules

## Local-Only Inputs

Excel source files and other raw local inputs belong under `.raw/`.

`.raw/` is not Git-managed.

Do not commit:

- `.raw/`
- `*.xlsx`
- `*.xlsm`
- `~$*.xlsx`

## Generated Data

Git-managed generated data belongs under `data/generated/`.

Generated JSON is normally produced from Excel input. Do not hand-edit generated JSON unless the current issue explicitly allows it.

Do not overbuild conversion scripts before the conversion specification is settled.

## Temporary Files

Scratch files, copied review notes, comparison notes, and temporary artifacts belong under `.tmp/`.

`.tmp/` is not a shared deliverable. Move only the necessary information into formal docs or reports.

Do not commit `.tmp/`.

## Design Artifacts

Canonical design references belong under:

```text
docs/design/<design-target>/
```

Actual Visual Review screenshots belong in Playwright output directories such as:

```text
test-results/
playwright-report/
```

Do not commit Visual Review output directories.

Do not replace canonical design images with actual screenshots unless the design-image-generation design fix workflow is approved.

## Required Ignore Policy

The repository ignore policy must include:

```gitignore
.raw/
.tmp/
test-results/
playwright-report/
*.xlsx
*.xlsm
~$*.xlsx
```

