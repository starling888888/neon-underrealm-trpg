---
name: design-image-generation
description: Use this skill when the user asks to create, update, or canonicalize design images under docs/design/<design-target> for UI, CSS, layout, page, or component work. This skill produces design artifacts only and must preserve requirements, out-of-scope constraints, and existing design consistency.
---

# Design Image Generation Skill

Create or canonicalize design images used as Visual Review references.

Use when the user asks to:

- create an initial design image for a UI, CSS, layout, page, or component task
- prepare design references under `docs/design/<design-target>/`
- generate desktop / mobile design images before implementation
- update design images after a reviewed implementation should become the new canonical design
- create or update `docs/design/<design-target>/notes.md`

Do not use for:

- code implementation
- Visual Review execution
- screenshot comparison after implementation
- PR creation
- post-merge cleanup

Prepare design artifacts, then stop for human review or approval.

If the user asks to review, inspect, validate, or discuss a design direction, prepare only the requested analysis or draft notes and stop. Do not generate or update design images until the user explicitly asks to create, update, generate, or canonicalize the images.

---

## Core rule

Design images must follow project SSoT.

Design images must not introduce UI, features, navigation, tools, or flows that contradict:

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `AGENTS.md`
- the current task issue
- existing design references
- existing global style and layout direction

Design images are implementation guidance. Do not draw future features just because they look useful.

---

## Modes

### Mode A: Design initial draft

Use this mode before implementation when a UI, CSS, layout, page, or component task needs a design reference.

This mode creates an initial design image from:

- project requirements
- out-of-scope constraints
- current task issue
- existing global design
- existing layout or component design
- relevant content/data assumptions

Output from this mode is a design draft until the user reviews and accepts it.

Do not treat an unreviewed initial draft as the final design source of truth.

### Mode B: Design fix / canonicalize from implementation

Use this mode after implementation when the user explicitly wants a reviewed implementation screenshot to become the new canonical design image.

This mode may use actual implementation screenshots as the basis for `docs/design/<design-target>/design-*.png`.

This mode is allowed only when:

- the relevant implementation has been reviewed
- differences from the previous design reference are understood
- the differences do not contradict requirements, out-of-scope constraints, global styles, or layout direction
- the user explicitly approves canonicalizing the implementation screenshot as design source of truth

Do not update design source-of-truth images merely to hide Visual Review mismatches.

---

## Required inputs

Before generating or canonicalizing design images, identify:

- design target name
- target page or component
- target route when applicable
- viewport requirements
- desktop / mobile requirements
- relevant UI states
- source task issue
- relevant plan item
- relevant TODO item when applicable
- existing design references to preserve
- whether this is initial draft mode or design fix mode

If these cannot be identified, stop and ask the user or record the missing items in `notes.md`.

---

## SSoT references

Read or inspect these sources when relevant:

1. latest user instruction
2. `AGENTS.md`
3. current task issue under `docs/issue/`
4. `docs/requirements.md`
5. `docs/out-of-scope.md`
6. `docs/plan.md`
7. `docs/TODO.md`
8. `docs/design/global-styles/`
9. existing layout design under `docs/design/`
10. existing target design under `docs/design/<design-target>/`
11. existing implementation when design fix mode is used

If these conflict, stop and ask the user.

---

## Existing design consistency

Before creating a new image, check existing design targets.

At minimum, preserve consistency with:

- global color direction
- typography direction
- spacing rhythm
- link / button / callout treatment
- content width and page gutter direction
- desktop and mobile layout expectations

A page or component design may vary by purpose, but it must not look like a separate site unless the task explicitly requires that.

---

## Out-of-scope constraints

`docs/out-of-scope.md` applies to design images, not only implementation code.

Do not draw out-of-scope features unless the current task explicitly allows them.

Examples of commonly risky design elements:

- search UI
- login UI
- CMS or editing UI
- character sheet tools
- dice rollers
- advanced filters
- breadcrumbs
- previous / next navigation
- current-position table of contents highlighting
- analytics UI
- server-backed workflows

If a design would benefit from an out-of-scope element, record it as a TODO or future note instead of drawing it into the canonical design.

---

## Output location

Design artifacts belong under:

```txt
docs/design/<design-target>/
```

Recommended files:

```txt
docs/design/<design-target>/notes.md
docs/design/<design-target>/design-desktop.png
docs/design/<design-target>/design-mobile.png
```

State-specific images may use explicit suffixes:

```txt
design-desktop-default.png
design-desktop-hover.png
design-mobile-default.png
design-mobile-menu-open.png
```

Do not place temporary screenshots or trial images in `docs/design/` unless they are intended for review as design artifacts.

Do not commit Playwright actual screenshots, `test-results/`, `playwright-report/`, or `.tmp/` artifacts as design source of truth.

---

## notes.md requirements

Every design target should include `notes.md`.

Use this structure:

```md
# <design-target>

## Mode

- initial draft / design fix

## Target

- page / component:
- route:
- viewport:
- states:

## Referenced SSoT

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md` when relevant
- `docs/issue/<task>.md`
- `docs/design/<design-target>/`

## Design direction

- visual direction
- layout direction
- typography direction
- color / accent usage

## Existing design constraints

- global styles to preserve
- layout assumptions to preserve
- component conventions to preserve

## Out of scope

- elements intentionally not shown
- future ideas intentionally not included

## Comparison points for implementation

- what Visual Review should compare
- what differences are acceptable
- what differences need review

## Generation source

- generator or capture source:
- source branch / commit when applicable:
- route when applicable:
- viewport:
- prompt summary or capture notes:

## Open questions

- unresolved design questions
```

Do not rely on the image alone to carry design intent.

---

## Viewport rules

Default viewport targets should align with Visual Review capture settings when possible.

Recommended defaults:

- desktop: `1440x1200`
- mobile: `390x900`

If a different viewport is required, record it in `notes.md`.

Component-only designs may use a smaller frame, but the frame size must be recorded.

---

## Text in generated images

Do not rely on generated images for exact text.

Rules:

- avoid long exact Japanese text inside generated images
- use representative blocks or short labels when exact text is not required
- record exact wording in `notes.md` or implementation, not only in the image
- do not treat generated text accuracy as a design requirement unless explicitly requested

---

## Initial draft workflow

1. Identify the design target.
2. Read project SSoT and current task issue.
3. Check `docs/TODO.md` for related design follow-ups.
4. Check existing global and layout design references.
5. Identify out-of-scope elements that must not be drawn.
6. Determine viewport and state coverage.
7. Generate or prepare design image drafts.
8. Create or update `notes.md` with design intent and source references.
9. Stop for human review.

Do not proceed to implementation from this skill.

If `notes.md` is being created or updated as a review checkpoint before image generation, stop after `notes.md` and report the unresolved design questions. Generate image drafts only after explicit user approval of that next step.

---

## Design fix workflow

1. Confirm the user asked to canonicalize from implementation.
2. Identify source branch, commit, route, and viewport.
3. Capture or inspect actual implementation screenshots.
4. Compare actual screenshots against existing design references.
5. Explain the differences.
6. Confirm the differences are compatible with requirements, out-of-scope constraints, global styles, and layout direction.
7. Ask for explicit approval before replacing canonical design images.
8. After approval, update `docs/design/<design-target>/design-*.png` and `notes.md`.
9. Stop and report the updated design artifacts.

Do not canonicalize implementation screenshots just because they exist.

Do not canonicalize screenshots to make a Visual Review failure disappear.

---

## Relationship to visual-implementation-review

This skill and `visual-implementation-review` have different responsibilities.

`design-image-generation`:

- creates initial design references
- updates canonical design references after explicit approval
- maintains `docs/design/<design-target>/` artifacts

`visual-implementation-review`:

- captures actual implementation screenshots
- compares actual screenshots with canonical design references
- reports mismatches
- may propose implementation fixes

Visual Review actual screenshots are not canonical design images until explicitly approved and moved into `docs/design/<design-target>/` by this workflow or an equivalent approved process.

---

## Approval gates

Initial draft mode:

- create design draft and notes
- stop for user review
- do not treat the draft as approved until the user says so

Design fix mode:

- capture or inspect actual screenshot
- explain differences from existing design
- stop before canonical replacement unless approval is already explicit
- update canonical design only after explicit approval

---

## Final report

After creating or updating design artifacts, report:

```md
## デザイン画像作成結果

- mode: initial draft / design fix
- design target: `docs/design/<design-target>/`
- updated files:
  - `docs/design/<design-target>/notes.md`
  - `docs/design/<design-target>/design-desktop.png`
  - `docs/design/<design-target>/design-mobile.png`

## 参照したSSoT

- ...

## 守ったスコープ

- ...

## 初期スコープ外として描かなかったもの

- ...

## レビューしてほしい点

- ...
```

---

## What this skill does not do

This skill does not:

- implement source code
- replace Visual Review
- update `docs/plan.md` checkboxes
- commit temporary screenshots
- commit `test-results/`
- commit `playwright-report/`
- commit `.tmp/`
- introduce out-of-scope features through design images
- turn implementation screenshots into canonical design without approval
