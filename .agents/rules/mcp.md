# MCP Rules

MCP servers are development support tools only.

They must not become runtime dependencies, build-time requirements, publishing requirements, or CI/CD requirements for the static site.

## General MCP Rules

Do not send secrets, API keys, tokens, credentials, personal information, unpublished game text, or private rule text to untrusted or unrelated MCP servers.

Use only information safe to share externally.

Validate MCP output against:

- `AGENTS.md`
- current task issue
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- existing code

If MCP output conflicts with this repository's rules, follow the repository rules.

Google Spreadsheet local synchronization does not use Google Drive MCP. Use the local-only `npm run sync:google-sheets` script; it reads credentials from `.env` and must never write to Google Drive.

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
