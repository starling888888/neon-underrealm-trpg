---
name: remote-contents-markdown-authoring
description: Use this skill when ChatGPT drafts or reviews contents markdown from a remote repository snapshot without local .raw or Google Drive access.
---

# Remote Contents Markdown Authoring Skill

Draft or review contents markdown from a remote repository snapshot.

Use when the user asks ChatGPT to:

- draft contents markdown without a local repository workspace
- review a contents draft against remotely available page sources
- prepare a Markdown source draft for later local use
- convert page intent into contents markdown from a Git-managed snapshot

Do not use for:

- local `.raw/contents/*.md` authoring
- reading or writing local `.raw/`
- Google Drive search, sync, export, upload, or update
- page implementation
- UI, layout, Component, or design work

## Core Rule

This is the remote-only workflow.

Use these sources in order:

1. User instruction.
2. `src/pages/` files.
3. Current task issue under `docs/issue/`.
4. `docs/requirements.md` and relevant `docs/requirements/` files.
5. `docs/plan.md`.
6. `docs/out-of-scope.md`.

Do not access or infer `.raw/contents/` or `.raw/v1.0/`. They are local-only inputs and must be reported as unverified.

Report any unavailable Git-managed source as unverified. Do not silently skip it or change the source priority.

The result is a Markdown draft in chat. Do not claim that a local `.raw/contents/<slug>.md` file was created or updated.

## Preconditions

1. Identify the remote repository and ref when available.
2. Read the `src/pages/` files relevant to the target route.
3. Read the current issue, requirements, plan, and out-of-scope source. Use them to identify a conflict with the user instruction or existing implementation, not as a replacement for either higher-priority source.
4. Confirm the target slug, route, and title when the user did not provide them.
5. Do not claim local working-tree, `.raw/`, Google Drive, or command validation results.

## Workflow

1. State the source snapshot and the files used.
2. Compare the sources in priority order.
3. If a lower-priority source differs from the user instruction or existing implementation, identify the remotely observable page and link impact, ask for user direction, and do not propose an implementation change as completed.
4. If an available requirement, plan, or out-of-scope source conflicts with the user instruction or existing implementation, identify the conflict and impact, then ask whether it may be corrected.
5. Do not change a remote repository, local file, or Google Drive content in this mode. After user approval, report the required correction for an environment authorized to make it.
6. Draft normal Markdown with frontmatter and HTML comments when agent-facing notes are needed.
7. Do not use `:::` instruction blocks.
8. Report `.raw/contents/` and `.raw/v1.0/` as unchecked.

## Required Report

Report:

- target slug and route
- complete Markdown draft in chat
- source snapshot repository and ref when known
- checked remote files
- unverified local sources: `.raw/contents/` and `.raw/v1.0/`
- detected implementation differences and required user decisions
- source-of-truth conflicts and correction authorization status
- confirmation that no local file or Google Drive content was changed

Do not commit, push, create a PR, access Google Drive, write local files, or implement pages.
