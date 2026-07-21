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
- replacing unrelated requirements, plan, issue, or design source of truth
- using Google Docs rich-text layout as the source format

## Core Rule

This is the local-only content authoring workflow.

Use the following sources in order:

1. User instruction.
2. Matching local `.raw/contents/` Markdown body and HTML comments for page body and visible display structure.
3. Current task issue under `docs/issue/`.
4. `docs/requirements.md` and relevant `docs/requirements/` files.
5. `docs/out-of-scope.md`.
6. `docs/plan.md` and `docs/TODO.md`.
7. Related `docs/design/<design-target>/`.
8. Local `src/pages/` implementation.
9. Local `.raw/v1.0/` reference documents.

Do not treat a lower-priority source as confirmation that a higher-priority source is correct.

The latest user instruction and applicable `AGENTS.md`, skill, and rule safety or workflow constraints remain above this order.

`.raw/contents/<slug>.md` is Git-ignored working input. For its matching page, user-edited Markdown body and HTML comments are the source of truth for page body and visible display structure. It is not itself the published page source.

## Preconditions

1. Run `git status --short`.
2. Resolve the repository root with `git rev-parse --show-toplevel`.
3. Read the current issue when one exists.
4. Read `.agents/rules/contents-markdown.md`.
5. Confirm the target slug, route, and title with the user when they are not provided.
6. Check which local sources exist before claiming they were used.
7. Do not overwrite an existing `.raw/contents/<slug>.md` unless the user asks to update it.

## Local Source Review

1. Read the matching `.raw/contents/<slug>.md` when it exists.
2. Locate the implemented route and related page source under `src/pages/`.
3. Read the current issue, relevant requirements, plan, TODO, out-of-scope source, and related design when they exist.
4. Read relevant `.raw/v1.0/*.md` files only when they help with existing wording, terminology, or document style.
5. Use v1.0 only as historical rule, playtest, idea, and style reference. Do not restore old rules over the current implementation.
6. Respect observable v1.0 writing habits. Avoid generic, over-regular, or artificial-sounding prose.
7. Report unavailable sources as unverified. Do not guess their content.

## Conflict Handling

When matching contents differs from a lower-priority source:

1. Identify the affected page, internal links, shared Components, and data display.
2. Explain which source conflicts and its priority.
3. Align the lower-priority Git-managed source when the user has authorized the correction; otherwise, ask for authorization.
4. Stop before changing implementation until the documents are aligned.
5. After the user or an approved higher-priority source resolves the conflict, record it in the target contents file's `矛盾点` HTML-comment section.
6. For each record, state the lower-priority source, a concise summary of its conflicting information, and the adopted document or user instruction.

When the user approves an implementation change and that change is completed, update the corresponding local `.raw/contents/<slug>.md` in the same task. Do not write it back to Google Drive automatically. Use `raw-to-drive-sync` only after its explicit user invocation.

When a Git-managed source such as requirements, plan, issue, design, or out-of-scope conflicts with matching contents:

1. Identify the conflict and its impact.
2. Ask whether the source may be corrected when the user has not already authorized it.
3. Stop until the documents are aligned.
4. After approval, correct the lower-priority source and record the resolution in the contents file.

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

## 矛盾点
- 確認時点で、優先度が低い文書との齟齬は検出されていない。
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

Put agent-facing implementation or interpretation notes in HTML comments. Every new or updated contents file must include a `矛盾点` section in an HTML comment.

When a lower-priority source conflict is resolved, replace or add an entry using this form:

```md
## 矛盾点

- 低優先度の文書: `path/to/source.md`（優先度 N）
  - 齟齬の概要: 低優先度の文書では……としている。
  - 採用した文書またはユーザー指示: `path/to/adopted-source.md`（優先度 N）
```

When no conflict was found in the sources that were checked, keep the no-conflict entry. Do not claim that unavailable sources were checked.

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
- source-of-truth conflicts and correction authorization status
- whether `.raw/contents/<slug>.md` was created or updated
- confirmation that frontmatter and HTML comments are present when required
- confirmation that the `矛盾点` comment section records each resolved lower-priority source conflict, or that no checked-source conflict was found
- confirmation that `:::` instruction blocks and Google Docs rich-text layout are not used
- whether Drive synchronization remains pending

Do not commit, push, create a PR, write to Google Drive, or implement pages unless the user explicitly asks through the appropriate workflow.
