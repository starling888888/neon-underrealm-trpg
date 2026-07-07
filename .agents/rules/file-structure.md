# File Structure Rules

Use this file for agent-facing structure decisions. Use `docs/development-structure.md` as the project-facing source for development structure.

## General Rule

Keep files split by stable responsibility, not by temporary task convenience.

Do not move files or change import paths unless the current issue allows it.

Do not mix behavior changes with file moves.

Use `.gitignore` as the source for untracked local inputs, generated reports, and temporary files.

Use `package.json` as the source for available npm scripts.

## Documentation

Long documents should become indexes when they start mixing unrelated reference areas.

Split by work-time reference unit, not by arbitrary chapter number.

Do not turn an index into a link dump. Keep a short explanation of each linked file and when to read it.

## Scripts

Each script program should have its own directory when it grows beyond a small single file.

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
- `common/`
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
