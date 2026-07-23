---
name: design-image-generation
description: Use this skill when the user asks to create or update design intent and VRT reference notes under docs/design/<design-target>, or to update an approved VRT baseline.
---

# Design Notes and VRT Baseline Skill

Maintain design intent notes and approved VRT baselines. Do not create design images.

Use when the user asks to:

- create or update `docs/design/<design-target>/notes.md`
- prepare design intent, routes, states, viewports, or comparison points for a UI task
- record a VRT target and its snapshot names
- create or update a Playwright VRT baseline after explicitly approving it

Do not use for:

- implementation
- Visual Review or VRT comparison before the user approves a baseline update
- screenshot capture for a design document
- PR creation, commit, push, or post-merge cleanup

## Core Rule

`docs/design/<design-target>/` is notes-only. The canonical visual baseline is
the Playwright `toHaveScreenshot()` snapshot under
`canonical-snapshots/visual/<target>/`.

Do not create, copy, or canonicalize PNG images under `docs/design/`. Do not
run `visual:capture`, use `test-results/` or `playwright-report/` as a design
source, create a standalone screenshot prototype, or use an ad hoc Playwright
command.

Run `npm run visual:update` only after the user explicitly approves creation or
update of the baseline. Limit the update to the approved target. Do not update a
baseline merely to hide a Visual Review difference.

## Preconditions

Before editing design notes or a VRT baseline:

1. Read `AGENTS.md` and the current issue when one exists.
2. Read the relevant requirements, out-of-scope constraints, TODOs, and
   existing `docs/design/` notes.
3. Identify the target, route, states, viewports, VRT test file, tags, and
   snapshot names.
4. For a baseline update, confirm that the user explicitly approved the
   affected target and that the implementation difference is understood.

Stop and report missing information or an SSoT conflict. Do not implement a UI
change from this skill.

## Notes Format

Create or update `docs/design/<design-target>/notes.md` with the information
needed to understand and review the target:

```md
# <design-target>

## VRT baseline

- test: `tests/visual/vrt/<target>.spec.ts` and its tags
- route:
- states:
- snapshots:
- baseline update: user approval is required before `npm run visual:update`

## Target

- page / component:
- viewports:

## Referenced SSoT

- ...

## Design direction

- ...

## Existing constraints

- ...

## Out of scope

- ...

## Comparison points

- ...

## Open questions

- ...
```

Record the intent in text. Do not rely on a screenshot that is not in the VRT
baseline to carry a design decision.

## Workflow

### Design intent or VRT reference notes

1. Identify the design target and its relationship to the current task.
2. Read the required SSoT and existing design notes.
3. Record the route, states, viewports, constraints, and comparison points in
   `notes.md`.
4. If the VRT target does not yet exist, record that implementation work must
   add it; do not create implementation code from this skill.
5. Stop and report the notes and open questions.

### Approved VRT baseline update

1. Confirm the explicit user approval and the affected target tags.
2. Build the VRT fixture and use the existing 4321 preview server.
3. Run the target-only VRT comparison and inspect any difference.
4. Update only the approved target with `npm run visual:update` and its target
   tag.
5. Run the same target-only comparison without `--update-snapshots`.
6. Update `notes.md` when the route, state, viewport, test, or snapshot mapping
   changed.
7. Stop and report. Do not commit or push.

Do not run a full local VRT suite unless the user explicitly asks or the task is
to investigate VRT infrastructure.

## Required Report

Report:

- mode: notes update / approved baseline update
- design target and changed files
- VRT target, tags, and snapshots when applicable
- SSoT and constraints checked
- commands run and their results
- open questions or unverified items
- Git operations: not performed unless explicitly instructed
