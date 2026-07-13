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

Each contents reviewer must be independent from the current conversation. Do not pass conversation history, inferred user intent, previous feedback, or a parent-agent summary to a reviewer.

Pass only a review input packet that the user explicitly identifies for that review. If the user does not identify a target source, preview URL, screenshot, or review scope, ask for it. Do not infer it from the active task or prior conversation.

Do not change the reviewed contents, source code, issue, TODO, plan, design, or Google Drive content.

Use screenshots for visual findings. Do not review HTML, DOM, or CSS structure. Read the target contents text as well.

The reviewed page must stand on its own. Do not open another route in the target site to fill missing information. Do not report link failures.

## Preconditions

1. Run `git status --short`.
2. Confirm the target `issue-slug` from the user instruction or the matching local issue file.
3. Confirm that the user explicitly identified the target source, preview URL, screenshot, or review scope. Do not reuse a previous-turn target.
4. Confirm at least one review input:
   - a target source file path,
   - an already-running preview URL and target route, or
   - supplied screenshot paths.
5. Do not start, stop, or change a dev server or preview server in this workflow.
6. Create `.tmp/review/<issue-slug>/` when absent.

When only a source file is available, allow text review. Record the visual review as unverified. Do not make visual claims without a screenshot.

## Review Inputs

For a preview review, use the target route only.

- beginner reviewer: mobile screenshot at 390px wide
- expert reviewer: desktop screenshot at 1440px wide

Use the approved project visual-test workflow or supplied screenshots. Do not create ad hoc browser automation. Keep screenshots out of Git-managed content and design paths.

## Workflow

1. Read only the target contents source and the review input packet explicitly identified by the user for this review.
2. Capture or collect the required screenshots from the running preview server when available.
3. Spawn `contents_beginner_reviewer` and `contents_expert_reviewer` in parallel.
4. Spawn each reviewer with `fork_turns="none"`. Do not give either reviewer the current conversation history.
5. Give both reviewers only this review input packet:
   - target source path when supplied
   - preview URL and target route, or screenshot paths
   - issue slug
   - review scope only when the user explicitly supplied it for this review
   - the rule that they must not open other target-site pages or report link failures
6. Do not add a parent-agent interpretation, a summary of prior feedback, or any information that the user did not explicitly designate as reviewer input.
7. Save the Japanese reviewer responses as:
   - `.tmp/review/<issue-slug>/contents-beginner-review-N.md`
   - `.tmp/review/<issue-slug>/contents-expert-review-N.md`
8. Save a concise main-agent summary as `.tmp/review/<issue-slug>/contents-review-N.md`.
9. Report the findings to the user and stop.

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
