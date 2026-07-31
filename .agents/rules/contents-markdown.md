# Contents Markdown Rules

This file defines how agents interpret contents markdown from `.raw/contents/*.md`.

## Role

`.raw/contents/*.md` files are manually prepared local working inputs.

Do not treat `.raw/contents/*.md` as:

- Git-managed source
- final published page source
- a replacement for safety or workflow rules
- a source for unrelated page requirements

For a matching page, Git-managed MDX / Astro is the source of truth for page body and visible display structure. Contents markdown can be used as supplementary user input but does not override the current issue, requirements, design, or existing Git-managed implementation without a newer explicit user instruction.

## Format

Contents markdown uses:

- frontmatter for page metadata
- normal Markdown for page body
- HTML comments for agent-facing instructions

HTML comments are instructions for agents.

HTML comments are not final page body and must not be rendered as visible text.

Every new or updated contents file must include a `矛盾点` section inside an HTML comment. When no conflict was found in the sources checked for that contents file, state that no checked-source conflict was found. Do not claim that unavailable sources were checked.

Do not use `:::` instruction blocks for contents markdown.

Do not add formatter processing for `.raw/contents/*.md` unless an approved issue changes this policy.

## Source Of Truth

For a matching page's body and visible display structure, Git-managed MDX / Astro, the current issue, requirements, out-of-scope, plan, TODO, and design take priority over contents markdown. The latest user instruction, `AGENTS.md`, and applicable skill and rule safety or workflow constraints remain higher than all of them.

## Local Authoring Priority

When `contents-markdown-authoring` creates or reviews a new local contents instruction, use this order:

1. User instruction.
2. Current task issue under `docs/issue/`.
3. `docs/requirements.md` and relevant `docs/requirements/` files.
4. `docs/out-of-scope.md`.
5. `docs/issue/milestone-<NN>/plan.md` and `docs/TODO.md`.
6. Related `docs/design/<design-target>/`.
7. Local `src/pages/` implementation.
8. Matching local `.raw/contents/` Markdown body and HTML comments.
9. Local `.raw/v1.0/` historical reference.

The latest user instruction and the applicable `AGENTS.md`, skill, and rule safety or workflow constraints remain above this local priority.

When matching contents conflicts with a higher-priority Git-managed source, keep the Git-managed source unless the user explicitly instructs a correction.

`v1.0/` is for historical wording, old rules, and ideas. It must not replace the current site source of truth.

## Conflict Records

When a lower-priority source conflict is resolved, record it in the contents file's HTML-comment `矛盾点` section. Each entry must include:

- the lower-priority source path and priority
- a concise summary of the conflicting information
- the adopted document or user instruction and its priority when applicable

Keep this information agent-facing. Do not render it as page body.
