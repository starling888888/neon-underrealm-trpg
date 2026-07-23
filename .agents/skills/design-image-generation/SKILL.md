---
name: design-image-generation
description: Use this skill when creating an HTML and Playwright-captured design draft, maintaining design intent notes, or updating an approved VRT baseline for a UI task.
---

# Design Draft, Notes, and VRT Baseline Skill

Create reviewable design drafts. Maintain design intent notes. Maintain approved
VRT baselines.

Use when the user asks to:

- create or generate a design draft image for a UI, CSS, layout, page, or
  Component task
- create a desktop, tablet, or mobile HTML design draft before implementation
- create or update `docs/design/<design-target>/notes.md`
- prepare design intent, routes, states, viewports, or comparison points for a
  UI task
- create or update a Playwright VRT baseline after explicit approval

Do not use for:

- application UI implementation
- Visual Review of an implementation before the user approves a baseline update
- copying a design draft or implementation screenshot into `docs/design/`
- PR creation, commit, push, merge, tag, or release

## Core Rule

Keep these artifact roles separate:

- A design draft is a temporary HTML/CSS prototype and capture under
  `.tmp/design/<design-target>/`. It supports a design conversation. Do not
  commit it or treat it as a canonical visual baseline.
- `docs/design/<design-target>/notes.md` records approved design intent in text.
  It is the design documentation source of truth. Do not put PNG files there.
- A Playwright `toHaveScreenshot()` snapshot under
  `canonical-snapshots/visual/<target>/` is the canonical visual baseline for an
  implemented UI. Create or update it only after the user explicitly approves
  the affected target.

Do not use raster image generation as the default for a page or Component
layout draft. Use it only when the design needs a bitmap asset such as an
illustration, texture, or non-system visual.

## Preconditions

Before creating a draft, updating notes, or updating a baseline:

1. Read `AGENTS.md` and the current issue when one exists.
2. Read relevant requirements, out-of-scope constraints, TODOs, and existing
   `docs/design/` notes.
3. Identify the design target, route when known, states, viewports, and the
   decision that the user wants to review.
4. Identify existing global style and layout constraints.
5. For a baseline update, identify the VRT test, tags, and snapshot names, and
   confirm explicit user approval.

Stop and report an SSoT conflict. Do not implement application UI from this
skill.

## Initial Draft Workflow

Use this workflow only when the user explicitly asks to create or generate a
draft.

1. Identify the design target and review scope.
2. Read the required SSoT and existing design notes.
3. Record unresolved questions in `notes.md` before guessing a requirement that
   changes scope.
4. Create a standalone HTML/CSS prototype under
   `.tmp/design/<design-target>/`. Do not alter application source files.
5. Add a local Playwright capture script in the same directory when one is
   needed. Capture the prototype, not an application route.
6. Capture the requested viewport and state. Use the review viewport values in
   `notes.md` when they exist.
7. Inspect the capture. Correct visible conflicts with the approved design
   intent before presenting it.
8. Present the temporary capture to the user and stop for review.
9. Record accepted decisions in `docs/design/<design-target>/notes.md`. Do not
   rely on the temporary image alone to carry an approved decision.

Do not copy the draft capture into `docs/design/`, `test-results/`,
`playwright-report/`, or a canonical VRT snapshot. Do not run
`npm run visual:update` for a draft.

## Design Notes Workflow

1. Identify the design target and its relationship to the current task.
2. Record the route, states, viewports, constraints, comparison points, and
   VRT status in `docs/design/<design-target>/notes.md`.
3. If the VRT target does not exist, record that an implementation gate must add
   it. Do not create application code or a placeholder baseline.
4. Stop and report changed notes and unresolved questions.

Use this structure when it fits the target:

```md
# <design-target>

## VRT baseline

- test:
- route:
- states:
- snapshots:
- baseline update: explicit user approval is required

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

## Approved VRT Baseline Workflow

Use this workflow only after the user explicitly approves the target baseline.

1. Confirm the affected target, tags, route, states, and snapshot names.
2. Build the VRT fixture and use the existing `4321` preview server.
3. Run the target-only VRT comparison and inspect the difference.
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

- mode: initial draft / notes update / approved baseline update
- design target and changed files
- draft artifact and capture path when initial draft mode is used
- VRT target, tags, and snapshots when applicable
- SSoT and constraints checked
- commands run and their results
- open questions or unverified items
- Git operations: not performed unless explicitly instructed
