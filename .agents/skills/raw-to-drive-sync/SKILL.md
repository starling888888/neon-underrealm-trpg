---
name: raw-to-drive-sync
description: Use this skill only when the user explicitly says $raw-to-drive-sync or raw-to-drive-sync を実行して to update the approved Google Drive contents and release-notes sources from local .raw inputs.
---

# Raw To Drive Sync Skill

Update the approved Google Drive sources from selected local `.raw/` inputs.

Use only when the user explicitly says:

- `$raw-to-drive-sync`
- `raw-to-drive-sync を実行して`

Do not use for:

- a general request to sync, reflect, save, or upload
- any automatic or follow-up synchronization
- `.raw/data/` synchronization, even when the user explicitly asks
- `.raw/v1.0/` synchronization
- Drive-to-raw download or export
- CI/CD, build-time, runtime, or publishing workflows

## Core Rule

Google Drive remains the user-edited source of truth for `.raw/contents/` and `.raw/release-notes.xlsx`.

This skill only reduces the user's manual synchronization work. It is not bidirectional or automatic synchronization.

The only permitted local sources are:

```text
<repo-root>/.raw/release-notes.xlsx
<repo-root>/.raw/contents/*.md
```

Refuse `.raw/data/` and `.raw/v1.0/` writes even if the user explicitly requests them.

## Preconditions

1. Confirm the user used one of the exact invocation phrases in this skill.
2. Run `git status --short`.
3. Resolve the repository root with `git rev-parse --show-toplevel`.
4. Confirm `.raw/` and `raw-google-drive.url` are Git-ignored.
5. Resolve exactly one Drive sync root from an explicit user URL or `raw-google-drive.url`.
6. Confirm Google Drive MCP is available and authenticated.
7. List the Drive root and identify the existing root Google Sheet named `release-notes` and the `contents/` folder.
8. Check each requested local source file exists under an allowed path.
9. Check the current session for clear evidence that the user and agent updated each requested source file in this session.
10. If that evidence is absent, stop and ask the user to confirm the source file, Drive destination, and overwrite intent.

Do not use timestamps, Git status, or local file existence as a replacement for session-memory confirmation.

## Release Notes Sync

Map:

```text
<repo-root>/.raw/release-notes.xlsx
→ existing root Google Sheet named release-notes
```

Do not create a Google Sheet or upload an Excel file.

Before writing, read the target spreadsheet metadata and the local workbook structure. Use the Google Sheets workflow and connector to update the existing Sheet so its content reflects the approved local Excel source. Re-read the affected spreadsheet data after writing.

Stop if the target Sheet is missing, ambiguous, or cannot be matched safely.

## Contents Sync

Map each local source:

```text
<repo-root>/.raw/contents/<slug>.md
→ <sync-root>/contents/<slug>.md as a native Google Doc
```

For an existing matching Google Doc, replace its content with the local Markdown source as literal plain text.

For a missing matching Google Doc, create a native Google Doc named `<slug>.md` inside the verified `contents/` folder, then write the local Markdown source as literal plain text.

Do not import Markdown, use rich-text paste behavior, or interpret headings, lists, tables, links, frontmatter, or HTML comments as Google Docs formatting. Use a plain-text connector write and verify that the document readback preserves the Markdown source.

Stop if a matching title is ambiguous, the target is not a Google Doc, or the destination folder is unclear.

## Workflow

1. Confirm the exact invocation phrase and all preconditions.
2. List requested local sources. Refuse any disallowed path immediately.
3. Confirm session-memory evidence for every requested source.
4. Ground every Drive target from fresh folder listing and metadata.
5. Synchronize `release-notes.xlsx` only to the existing `release-notes` Google Sheet.
6. Synchronize each contents source only to the matching `<slug>.md` native Google Doc.
7. Verify every write with connector readback.
8. Report the result and any files left unsynchronized.

## Required Report

Report:

- explicit invocation phrase used
- Drive sync root and local repository root
- updated Google Sheet and contents Google Doc count
- created Google Doc count
- overwritten Google Doc count
- refused data and v1.0 paths
- files stopped for missing session-memory confirmation
- confirmation that contents were written as plain text
- confirmation that no Google Sheet, Excel file, data file, or v1.0 document was created or updated outside this policy
- connector readback verification result

Do not commit `.raw/` files, `raw-google-drive.url`, or connector output.
