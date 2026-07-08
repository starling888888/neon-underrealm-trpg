# MCP Rules

MCP servers are development support tools only.

They must not become runtime dependencies, build-time requirements, publishing requirements, or CI/CD requirements for the static site.

## General MCP Rules

Do not send secrets, API keys, tokens, credentials, personal information, unpublished game text, or private rule text to untrusted or unrelated MCP servers.

Use only information safe to share externally.

Exception: Google Drive Connector / Google Drive MCP may access the approved Drive sync root only for the Drive-to-raw workflow, because Google Drive is the user-edited source for local `.raw/` inputs.

In that workflow, follow `.agents/skills/drive-to-raw-sync/SKILL.md`, use read, download, and export operations only, and do not relay Drive content to other MCP servers.

Validate MCP output against:

- `AGENTS.md`
- current task issue
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- existing code

If MCP output conflicts with this repository's rules, follow the repository rules.

## Google Drive

Use Google Drive MCP only as a development support tool for copying user-edited sources into local working inputs.

When syncing Google Drive sources, follow `.agents/skills/drive-to-raw-sync/SKILL.md`.

The sync target is only:

```text
<repo-root>/.raw/
```

Do not use Google Drive MCP as a runtime dependency, build-time requirement, publishing requirement, or CI/CD requirement.

Do not use Google Drive MCP to write, create, delete, move, copy, or share Drive files in the Drive-to-raw workflow.

Do not store Google credentials, tokens, API keys, or Drive content secrets in the repository.

The local `raw-google-drive.url` file may contain the sync folder URL. It must remain Git-ignored.

If Google Drive MCP is unavailable, unauthenticated, or cannot export Google Docs as Markdown or Google Sheets as `.xlsx`, stop. Do not implement a replacement Google Drive API script or require `rclone` in the same task.

## Context7

Use Context7 to check current official documentation for adopted or planned technologies such as:

- Astro
- MDX
- TypeScript
- Zod
- Pagefind
- ExcelJS
- Playwright
- GitHub Actions

Use Context7 for API names, option names, deprecations, version differences, and official examples.

Do not use Context7 to decide project-specific scope, priorities, or requirements.

Do not use Context7 to expand an approved issue's scope.

Context7 configuration belongs in `.mcp.json`.

When used, `CONTEXT7_API_KEY` must be set as a shell environment variable, not committed to the repository.

## Fetch

Use Fetch to retrieve public external documentation when the URL is stable and the content is safe to send to an external MCP server.

Use Fetch for:

- public documentation files hosted on GitHub
- public specification pages

Do not use Fetch for:

- local files
- internal network URLs
- unpublished game text
- private repository content
- secrets, API keys, tokens, credentials, or personal information

Fetch configuration belongs in `.mcp.json`.

Do not use Fetch for Markdown style decisions.

For Markdown style decisions, follow `.agents/rules/markdown-style.md` and the formatter / checker configuration in this repository.

If Markdown style judgment is unclear, keep the decision within the minimal rules defined by `.agents/rules/markdown-style.md`. Do not expand the scope by fetching an external style guide.
