---
name: contents-review
description: Use when the user explicitly asks for a final review of user-revised contents with the local contents beginner and expert reviewer subagents.
---

# Contents Review Skill

Run a final content review after user feedback.

Use when the user explicitly asks to:

- run `$contents-review`
- run a final review after contents feedback
- review a specified contents file with the contents reviewers
- review a contents page through an already-running preview server

Do not use for:

- drafting or revising contents
- issue-first preparation
- Visual Review against canonical design images
- link checking
- implementation fixes
- commit, push, or PR work

## Core Rule

Run this skill only after the user asks for the review.

Do not change the reviewed contents, source code, issue, TODO, plan, design, or Google Drive content.

Use screenshots for visual findings. Do not review HTML, DOM, or CSS structure. Read the target contents text as well.

The reviewed page must stand on its own. Do not open another route in the target site to fill missing information. Do not report link failures.

## Preconditions

1. Run `git status --short`.
2. Confirm the target `issue-slug` from the user instruction or the matching local issue file.
3. Confirm at least one review input:
   - a target source file path,
   - an already-running preview URL and target route, or
   - supplied screenshot paths.
4. Do not start, stop, or change a dev server or preview server in this workflow.
5. Create `.tmp/review/<issue-slug>/` when absent.

When only a source file is available, allow text review. Record the visual review as unverified. Do not make visual claims without a screenshot.

## Review Inputs

For a preview review, use the target route only.

- beginner reviewer: mobile screenshot at 390px wide
- expert reviewer: desktop screenshot at 1440px wide

Use the approved project visual-test workflow or supplied screenshots. Do not create ad hoc browser automation. Keep screenshots out of Git-managed content and design paths.

## Workflow

1. Read the target contents source when supplied and the user feedback that the review should validate.
2. Capture or collect the required screenshots from the running preview server when available.
3. Spawn `contents_beginner_reviewer` and `contents_expert_reviewer` in parallel.
4. Give both reviewers:
   - target source path when supplied
   - preview URL and target route, or screenshot paths
   - issue slug
   - current user feedback and review scope
   - the rule that they must not open other target-site pages or report link failures
5. Save the Japanese reviewer responses as:
   - `.tmp/review/<issue-slug>/contents-beginner-review-N.md`
   - `.tmp/review/<issue-slug>/contents-expert-review-N.md`
6. Save a concise main-agent summary as `.tmp/review/<issue-slug>/contents-review-N.md`.
7. Report the findings to the user and stop.

Do not implement fixes from the review. Wait for explicit user instruction.

## Required Report

Report:

- target contents file and preview URL or screenshot inputs
- review artifacts under `.tmp/review/<issue-slug>/`
- reviewers used
- findings by severity
- visual items that were unverified
- confirmation that no target-site links or other pages were opened
- confirmation that no contents or source files were changed

Do not commit, push, create a PR, write to Google Drive, or implement fixes.
