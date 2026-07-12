---
name: drive-to-raw-sync
description: Use this skill when syncing Google Drive user-edited sources, including historical v1.0 Google Docs, into the local <repo-root>/.raw/ working input directory without writing back to Drive.
---

# Drive To Raw Sync Skill

Sync approved Google Drive sources into local `.raw/` working inputs.

Use when the user asks to:

- sync Google Drive to `.raw/`
- sync Drive sources to `.raw/`
- update `.raw/contents/`
- fetch local content or data input through Google Drive
- refresh local v1.0 historical reference documents

Do not use for:

- writing local changes back to Google Drive
- creating, updating, deleting, moving, copying, or sharing Drive files
- syncing a v1.0 document back to Drive
- implementing a custom Google Drive API sync script
- requiring `rclone` or another external sync CLI
- CI/CD, build-time, runtime, or publishing workflows
- converting `.raw/` files into `data/generated/`
- writing directly to `src/pages/` or `data/generated/`

## Core Rule

Copy only from Google Drive into `<repo-root>/.raw/`.

Never write Drive-derived files outside `<repo-root>/.raw/`.

Never write back to Google Drive in this workflow.

Stop if the Drive folder, local path, ignore policy, MCP availability, export format, expected v1.0 structure, or overwrite safety is unclear.

## Preconditions

1. Run `git status --short`.
2. Resolve the repository root:

   ```sh
   git rev-parse --show-toplevel
   ```

3. Confirm the command output is the repository root. Treat that output as `<repo-root>` for the remaining steps. Do not assign it to an environment variable.
4. Treat `.raw/` as `<repo-root>/.raw/`.
5. Confirm `.raw/` is Git-ignored.
6. Confirm `<repo-root>/raw-google-drive.url` is Git-ignored.
7. Confirm Google Drive MCP is available and authenticated.
8. Confirm the MCP can list folders, read file metadata, export contents Google Docs as `text/plain`, export v1.0 Google Docs as `text/markdown`, and export Google Sheets as `.xlsx`.
9. Stop if any precondition fails.

## Drive Folder Resolution

Use the first available source that identifies one Drive sync root:

1. An explicit Google Drive folder URL from the user.
2. A single folder URL in `<repo-root>/raw-google-drive.url`.
3. An explicit Google Drive folder ID from the user.

When `raw-google-drive.url` is used, read only that file. Require exactly one valid Drive folder URL. Do not commit it.

## Allowed Structure

The Drive sync root and local `.raw/` directory use this structure:

```text
<sync-root>/
├── release-notes                 # existing Google Sheet
├── data/
│   └── *.xlsx-compatible Sheets
├── contents/
│   └── *.md                      # Google Docs with literal Markdown source
└── v1.0/
    └── Google Docs only, directly under this folder
```

Local outputs are limited to:

```text
<repo-root>/.raw/release-notes.xlsx
<repo-root>/.raw/data/*.xlsx
<repo-root>/.raw/contents/*.md
<repo-root>/.raw/v1.0/*.md
```

Do not create or use:

```text
<repo-root>/.raw/sheets/
<repo-root>/raw/
<repo-root>/data/
<repo-root>/contents/
<repo-root>/src/pages/
<repo-root>/data/generated/
```

`v1.0/` is a historical reference only. It may contain old rules, playtest material, and v1.5 ideas. It is not the current site source of truth.

Require every direct child of Drive `v1.0/` to be a Google Doc. Stop and report if it contains a subdirectory or another file type. Do not recurse into subdirectories or invent a conversion for unsupported files.

## Export Rules

Export contents Google Docs as:

```text
text/plain
```

Save them as Markdown `.md` files. Keep Markdown symbols, frontmatter, and HTML comments as literal plain text.

For `contents/`, map the Google Doc title `<slug>.md` to:

```text
<repo-root>/.raw/contents/<slug>.md
```

Export v1.0 Google Docs as:

```text
text/markdown
```

This conversion preserves the source document's Google Docs styling as Markdown. Do not use `text/plain` for v1.0 documents.

Google Drive export has no option to exclude inline data URI images. Before writing a v1.0 export, remove only Markdown image reference definitions that embed `data:image/...;base64,...`. Keep normal Markdown image links and all non-image text. Do not print or return the exported Markdown payload in tool output. Report only file names, counts, and validation results.

For `v1.0/`, map each direct Google Doc title to a local filename ending in `.md` under:

```text
<repo-root>/.raw/v1.0/
```

Stop if two source documents map to the same local filename.

Export Google Sheets as:

```text
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

Map the root `release-notes` Google Sheet to `<repo-root>/.raw/release-notes.xlsx`. Map permitted data Sheets to `<repo-root>/.raw/data/*.xlsx`.

## Workflow

1. Inspect local status and stop if unrelated uncommitted changes would be overwritten.
2. Resolve the repository root and verify the ignore policy.
3. Resolve exactly one Drive sync root.
4. List direct root children and verify `release-notes`, `data/`, `contents/`, and `v1.0/` map unambiguously.
5. List direct children of `v1.0/` and verify that all are Google Docs.
6. Map allowed Drive files to the allowed local paths.
7. Stop if any path escapes `<repo-root>/.raw/`, maps twice, or has an unsupported type.
8. Before overwriting a local file, confirm the exported content is non-empty and complete.
9. Download or export the allowed files through Google Drive MCP.
10. For each v1.0 Markdown export, remove inline base64 image reference definitions and confirm none remain.
11. Write only under `<repo-root>/.raw/`.
12. Report the result.

## Required Report

Report:

- Drive source folder
- local repository root
- synced contents, data, release-notes, and v1.0 file counts
- v1.0 structure verification result
- skipped or unsupported files
- failed and overwritten files
- confirmation that contents Google Docs used `text/plain`
- confirmation that v1.0 Google Docs used `text/markdown`
- number of inline base64 image definitions removed from v1.0 exports, and confirmation that none remain
- confirmation that outputs stayed under `<repo-root>/.raw/`
- confirmation that `.raw/` and `raw-google-drive.url` are Git-ignored
- confirmation that no Drive write operation was used

Do not commit `.raw/` files or `raw-google-drive.url`.
