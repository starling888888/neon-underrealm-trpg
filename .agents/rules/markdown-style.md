# Markdown Style Rules

This file defines the repository-specific Markdown style rules for `.md` files.

## Required Rules

- Use ATX headings:
  - `#`
  - `##`
  - `###`
- Use `-` for unordered list markers.
- Use 2 spaces for nested unordered list indentation.

## Formatter

Run the Markdown formatter after creating or editing `.md` files.

Use:

```sh
npm run format:md
```

Use this to check Markdown formatting:

```sh
npm run check:md
```

The Markdown formatter targets Git-managed `.md` files only. `.mdx` files are not part of the default Markdown formatter target.

## Non-Rules

This file does not define rules for prose style, terminology, sentence structure, line length, punctuation, emphasis syntax, or link syntax.

Do not use the Google Markdown Style Guide or another external style guide for Markdown style decisions in this repository.

When style judgment is unclear, keep the decision within the three required rules above instead of expanding this rule set.
