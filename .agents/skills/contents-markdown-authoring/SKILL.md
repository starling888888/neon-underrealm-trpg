---
name: contents-markdown-authoring
description: Use this skill when drafting or reviewing .raw/contents/*.md locally with the local site, local contents, and local v1.0 reference sources.
---

# Contents Markdown Authoring Skill

Draft or review local contents markdown without conflicting with the current site.

Use when the user asks to:

- draft contents markdown for `.raw/contents/*.md` locally
- prepare a local source file for a contents Google Doc
- review a local contents markdown file against local site sources
- create a local content instruction for a page before implementation
- update a local contents instruction after an approved page-content change

Do not use for:

- ChatGPT or remote-snapshot content drafting
- syncing `.raw/` to or from Google Drive
- implementing `.raw/contents/*.md` as Astro, MDX, or page source
- creating UI, layout, Component, or design images
- replacing requirements, plan, issue, or design source of truth
- using Google Docs rich-text layout as the source format

## Core Rule

This is the local-only content authoring workflow.

Use the following sources in order:

1. User instruction.
2. Local `src/pages/` implementation.
3. Local `.raw/contents/` source.
4. Local `.raw/v1.0/` reference documents.

Do not treat a lower-priority source as confirmation that a higher-priority source is correct.

`.raw/contents/<slug>.md` is the local result. It is Git-ignored working input. It is not the published page source.

## Preconditions

1. Run `git status --short`.
2. Resolve the repository root with `git rev-parse --show-toplevel`.
3. Read the current issue when one exists.
4. Read `.agents/rules/contents-markdown.md`.
5. Confirm the target slug, route, and title with the user when they are not provided.
6. Check which local sources exist before claiming they were used.
7. Do not overwrite an existing `.raw/contents/<slug>.md` unless the user asks to update it.

## Local Source Review

1. Locate the implemented route and related page source under `src/pages/`.
2. Read the matching `.raw/contents/<slug>.md` when it exists.
3. Read relevant `.raw/v1.0/*.md` files only when they help with existing wording, terminology, or document style.
4. Use v1.0 only as historical rule, playtest, idea, and style reference. Do not restore old rules over the current implementation.
5. Respect observable v1.0 writing habits. Avoid generic, over-regular, or artificial-sounding prose.
6. Report unavailable local sources as unverified. Do not guess their content.

## Conflict Handling

When user instruction differs from `src/pages/` or `.raw/contents/`:

1. Identify the affected page, internal links, shared Components, and data display.
2. Explain which source conflicts with the user instruction.
3. Ask the user whether the implementation, the local contents source, or both should change.
4. Stop before changing implementation.

When the user approves an implementation change and that change is completed, update the corresponding local `.raw/contents/<slug>.md` in the same task. Do not write it back to Google Drive automatically. Use `raw-to-drive-sync` only after its explicit user invocation.

## Source Format

Use this structure for `.raw/contents/<slug>.md`:

```md
---
page: slug
route: /path
title: Page Title
---

<!--
Agent-facing instructions go here.
They are not final page body.
-->

# Page Title

Markdown body goes here.
```

Use frontmatter for page metadata.

Use normal Markdown for the page body:

- ATX headings
- paragraphs
- emphasis
- inline code
- relative links
- blockquotes
- unordered lists
- ordered lists
- checklists when needed
- tables when needed
- fenced code blocks when needed
- horizontal rules when needed

Put agent-facing implementation or interpretation notes in HTML comments.

Do not use `:::` instruction blocks.

## Google Docs Compatibility

The local file is Markdown source for a Google Doc stored as plain text.

When it is later synchronized to Drive, preserve Markdown symbols, frontmatter, and HTML comments as literal text. Do not require Google Docs rich-text headings, lists, tables, or links.

Do not run a formatter over `.raw/contents/*.md` unless an approved issue changes this policy.

## Required Report

Report:

- target slug and route
- local sources checked and unavailable sources
- detected source conflicts and required user decisions
- whether `.raw/contents/<slug>.md` was created or updated
- confirmation that frontmatter and HTML comments are present when required
- confirmation that `:::` instruction blocks and Google Docs rich-text layout are not used
- whether Drive synchronization remains pending

Do not commit, push, create a PR, write to Google Drive, or implement pages unless the user explicitly asks through the appropriate workflow.
