# Contents Markdown Rules

This file defines how agents interpret contents markdown from `.raw/contents/*.md`.

## Role

`.raw/contents/*.md` files are local working inputs.

They may originate from Google Docs, but Google Docs is only a storage place for Markdown source.

Do not treat `.raw/contents/*.md` as:

- Git-managed source
- final published page source
- design source of truth
- requirements source of truth
- plan source of truth
- issue source of truth

Final page body and UI structure belong in Git-managed `.mdx`, `.astro`, or related source files under `src/pages` and supporting code.

## Format

Contents markdown uses:

- frontmatter for page metadata
- normal Markdown for page body
- HTML comments for agent-facing instructions

HTML comments are instructions for agents.

HTML comments are not final page body and must not be rendered as visible text.

Do not use `:::` instruction blocks for contents markdown.

## Google Docs Source Handling

Contents markdown Google Docs must keep Markdown source as plain text.

Do not create a formatted Google Docs document with rich-text headings, lists, tables, or links as the source format.

When syncing Google Docs into `.raw/contents/*.md`, export the Google Doc as:

```text
text/plain
```

Save the result as a Markdown `.md` file under:

```text
<repo-root>/.raw/contents/*.md
```

Do not use Google Docs `text/markdown` export for contents markdown.

## Noise

Google Docs `text/plain` export may include non-semantic noise.

Treat these as Google Docs-derived noise unless the current approved task says otherwise:

- UTF-8 BOM
- extra blank lines
- trailing spaces

Do not rely on trailing-space hard line breaks in contents markdown. Use paragraph breaks, explicit HTML, or an HTML comment instruction when a hard line break is required.

Do not add formatter processing for `.raw/contents/*.md` unless an approved issue changes that policy.

## Source Of Truth

Contents markdown helps agents create or update site pages.

It does not override:

- `AGENTS.md`
- `.agents/skills/*`
- `.agents/rules/*`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/issue/*.md`
- `docs/design/<design-target>/`

## Local Authoring Priority

When `contents-markdown-authoring` creates or reviews a new local contents instruction, use this order:

1. User instruction.
2. Local `src/pages/` implementation.
3. Local `.raw/contents/` source.
4. Local `.raw/v1.0/` historical reference.

When higher-priority user instruction conflicts with current implementation or local contents, identify the impact and ask the user before implementation changes.

`v1.0/` is for historical wording, old rules, and ideas. It must not replace the current site source of truth.

## Drive Write Handling

Only `raw-to-drive-sync` may write a contents source to Google Drive, and only after its explicit user invocation.

Map `.raw/contents/<slug>.md` to a Google Doc named `<slug>.md` in the Drive `contents/` folder. Preserve Markdown source as literal plain text. Do not use Google Docs rich-text formatting or Markdown import behavior.
