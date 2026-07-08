---
name: contents-markdown-authoring
description: Use this skill when drafting or reviewing contents markdown for .raw/contents/*.md as plain Markdown source for Google Docs, without implementing pages or writing back to Drive.
---

# Contents Markdown Authoring Skill

Draft contents markdown that can be stored in Google Docs as plain text.

Use when the user asks to:

- draft contents markdown for `.raw/contents/*.md`
- prepare source text for a contents Google Doc
- review whether contents markdown can be interpreted by an agent
- write page source with frontmatter, Markdown body, and agent comments
- convert page intent into Markdown source before local implementation

Do not use for:

- syncing Google Drive files into `.raw/`
- writing local changes back to Google Drive
- implementing `.raw/contents/*.md` as Astro, MDX, or page source
- creating UI, layout, Component, or design images
- replacing requirements, plan, issue, or design source of truth
- using Google Docs rich-text layout as the source format

## Core Rule

Write Markdown source, not a formatted Google Docs document.

The output must be suitable for pasting into a Google Doc as plain text and later exporting through `text/plain`.

Do not use `:::` instruction blocks.

## Source Format

Use this structure:

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

Use normal Markdown for page body:

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

Use HTML comments for agent-facing instructions.

HTML comments are not final page body and must not be rendered as visible page text.

## Google Docs Handling

When the markdown is pasted into Google Docs:

- paste the Markdown source as plain text
- keep Markdown symbols visible in the document
- keep frontmatter as literal text
- keep HTML comments as literal text
- do not convert headings, lists, tables, or links into Google Docs rich-text layout
- do not use Google Docs formatting as the source of layout intent

Google Docs is only a storage place for Markdown source in this workflow.

## Noise Tolerance

Google Docs `text/plain` export may add or preserve non-semantic noise.

Treat these as noise unless the current task explicitly depends on them:

- UTF-8 BOM
- extra blank lines
- trailing spaces

Do not add a formatter workflow for `.raw/contents/*.md` unless an approved issue changes that policy.

## Workflow

1. Confirm the requested page slug, route, title, and intended content.
2. Check the current issue, requirements, plan, and out-of-scope notes when available.
3. Draft frontmatter as page metadata.
4. Draft the page body in normal Markdown.
5. Put agent-facing implementation or interpretation notes in HTML comments.
6. Confirm no `:::` instruction blocks are used.
7. Confirm the draft does not replace requirements, plan, issue, or design source of truth.
8. Report any assumptions or missing source information.

## Required Report

Report:

- page slug and route
- whether frontmatter is present
- whether HTML comments are used for agent-facing instructions
- confirmation that Google Docs rich-text layout is not required
- confirmation that `:::` instruction blocks are not used
- unverified assumptions

Do not commit, push, create a PR, write to Google Drive, or implement pages unless the user explicitly asks through the appropriate workflow.
