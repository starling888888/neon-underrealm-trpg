# File Structure Rules

Use this file for agent-facing structure decisions. Use `docs/development-structure.md` as the project-facing source.

## General Rule

Split files by stable responsibility, not temporary task convenience.

Do not move files or change import paths unless the current issue allows it.

Do not mix behavior changes with file moves.

Use `.gitignore` as the source for untracked local inputs, generated reports, and temporary files.

Use `package.json` as the source for available npm scripts.

Google Drive-derived local inputs belong under `<repo-root>/.raw/`.

Use this fixed structure:

```text
.raw/
├── release-notes.xlsx
├── data/
│   └── *.xlsx
└── contents/
    └── *.md
```

Do not add alternative raw input roots such as `raw/`, `contents/`, `data/`, or `.raw/sheets/`.

Keep the Google Drive sync folder URL in `raw-google-drive.url` at the repository root. Do not Git-manage it.

## Documentation

Turn long mixed-reference documents into indexes.

Split by work-time reference unit, not by arbitrary chapter number.

Do not turn an index into a link dump. Keep a short explanation of each linked file and when to read it.

For `.md` syntax and style, follow `.agents/rules/markdown-style.md`.

Do not use Fetch or external style guides for Markdown style decisions. Do not reformat unrelated existing Markdown files only for style consistency unless the current issue explicitly allows a Markdown format pass.

## Scripts

Give each script program its own directory when it grows beyond a small single file.

Use:

```text
scripts/<program>/main.ts
scripts/<program>/lib.ts
```

`main.ts` handles CLI entry, arguments, process exit, and high-level orchestration.

`lib.ts` holds testable logic.

When `lib.ts` becomes large, split it under:

```text
scripts/<program>/lib/
```

Only place code in `scripts/_common/` when more than one script program actually uses it.

## Source Components

Group `src/components/` by purpose:

- `layout/`
- `seo/`
- `data/`
- `_common/`
- `search/` when search is implemented

Do not introduce a large UI library for a small component.

## Source Libraries

Group `src/lib/` by responsibility:

- `data/`
- `schemas/`
- `site/`
- `utils/`

Data pages should access generated JSON through `src/lib/data/` instead of scattering file reads through components.

## Browser Scripts

Client-side scripts belong under `src/scripts/`.

Split scripts by behavior area. Keep DOM controllers small and dependency-light.
