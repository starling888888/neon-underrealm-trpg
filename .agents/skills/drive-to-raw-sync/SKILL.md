---
name: drive-to-raw-sync
description: Use this skill when syncing Google Drive user-edited source files into the local <repo-root>/.raw/ working input directory through Google Drive MCP, without writing back to Drive or adding runtime/build dependencies.
---

# Drive To Raw Sync Skill

Sync Google Drive user-edited sources into local `.raw/` working inputs.

Use when the user asks to:

- sync Google Drive to `.raw`
- sync Drive sources to `.raw`
- update `.raw/contents`
- sync Drive input before page creation
- reflect Google Docs content into local input
- download a Spreadsheet to `.raw`
- fetch working input through Drive MCP

Do not use for:

- writing local changes back to Google Drive
- creating, updating, deleting, moving, copying, or sharing Drive files
- implementing a custom Google Drive API sync script
- requiring `rclone` or another external sync CLI
- CI/CD, build-time, runtime, or publishing workflows
- converting `.raw/` files into `data/generated/`
- writing directly to `src/pages/` or `data/generated/`

## Core Rule

Copy only from Google Drive into `<repo-root>/.raw/`.

Never write Drive-derived files outside `<repo-root>/.raw/`.

Never write back to Google Drive in this workflow.

Stop if the Drive folder, local path, ignore policy, MCP availability, export format, or overwrite safety is unclear.

## Preconditions

1. Run `git status --short`.
2. Resolve the repository root:

   ```sh
   git rev-parse --show-toplevel
   ```

3. Treat `.raw/` as `<repo-root>/.raw/`.
4. Confirm `.raw/` is Git-ignored:

   ```sh
   git check-ignore <repo-root>/.raw
   ```

5. Confirm `<repo-root>/raw-google-drive.url` is Git-ignored:

   ```sh
   git check-ignore <repo-root>/raw-google-drive.url
   ```

6. Stop if `.raw/` or `raw-google-drive.url` is not Git-ignored.
7. Confirm Google Drive MCP is available and authenticated.
8. Confirm the MCP can search files, read metadata, and download or export file content.
9. Confirm Google Docs can be exported as Markdown.
10. Confirm Google Sheets can be exported as `.xlsx`.

## Drive Folder Resolution

Use the first available source that identifies one Drive sync root:

1. An explicit Google Drive folder URL from the user.
2. A single folder URL in `<repo-root>/raw-google-drive.url`.
3. An explicit Google Drive folder ID from the user.
4. An explicitly provided file URL for a one-file sync.

If `raw-google-drive.url` is used:

- read only `<repo-root>/raw-google-drive.url`
- require exactly one Drive folder URL
- stop if the file is missing, empty, ambiguous, or not a Drive folder URL
- do not commit the file

## Allowed Structure

The Drive sync root and local `.raw/` directory must use the same relative structure:

```text
<sync-root>/
├── release-notes.xlsx
├── data/
│   └── *.xlsx
└── contents/
    └── *.md
```

Local outputs are limited to:

```text
<repo-root>/.raw/release-notes.xlsx
<repo-root>/.raw/data/*.xlsx
<repo-root>/.raw/contents/*.md
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

## Export Rules

Export Google Docs as Markdown:

```text
text/markdown
```

Save Google Docs under:

```text
<repo-root>/.raw/contents/*.md
```

Export Google Sheets as Excel:

```text
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

Save Google Sheets under:

```text
<repo-root>/.raw/release-notes.xlsx
<repo-root>/.raw/data/*.xlsx
```

If MCP returns base64 content, decode it before writing the local file.

## Workflow

1. Inspect local status and stop if unrelated uncommitted changes would be overwritten.
2. Resolve `<repo-root>`.
3. Verify `.raw/` and `raw-google-drive.url` ignore policy.
4. Resolve exactly one Drive sync root or one explicit Drive file.
5. List candidate Drive files under the sync root.
6. Keep only files matching:

   ```text
   ./release-notes.xlsx
   ./data/*.xlsx
   ./contents/*.md
   ```

7. Map each Drive file to the matching local path under `<repo-root>/.raw/`.
8. Stop if any output path escapes `<repo-root>/.raw/`.
9. Stop if Drive structure does not map clearly to the allowed local structure.
10. Stop if multiple Drive files map to the same local path.
11. Before overwriting an existing local file, confirm the downloaded or exported content is non-empty and complete.
12. If overwrite safety is unclear, stop and ask the user.
13. Download or export the files through Google Drive MCP.
14. Write files only under `<repo-root>/.raw/`.
15. Report the result.

## Stop Conditions

Stop when:

- `<repo-root>` cannot be resolved
- `.raw/` is not Git-ignored
- `raw-google-drive.url` is not Git-ignored
- the Drive folder is missing, ambiguous, or inaccessible
- Google Drive MCP is unavailable or unauthenticated
- required MCP tools are unavailable
- Google Docs Markdown export is unavailable
- Google Sheets `.xlsx` export is unavailable
- a Drive path cannot be mapped to the allowed `.raw/` structure
- an output path would be outside `<repo-root>/.raw/`
- a local output collision exists
- a download or export is empty, partial, or failed
- overwrite safety is unclear

## Required Report

Report:

- Drive source folder or file
- local repo root
- synced file count
- Google Docs exported to Markdown
- Google Sheets exported to `.xlsx`
- regular files downloaded
- skipped files
- failed files
- overwritten files
- confirmation that outputs stayed under `<repo-root>/.raw/`
- confirmation that `.raw/` and `raw-google-drive.url` are Git-ignored
- confirmation that no Drive write operation was used

Do not commit `.raw/` files or `raw-google-drive.url`.
