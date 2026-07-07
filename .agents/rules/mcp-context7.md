# MCP And Context7 Rules

MCP servers are development support tools only.

They must not become runtime dependencies, build-time requirements, publishing requirements, or CI/CD requirements for the static site.

## General MCP Rules

Do not send secrets, API keys, tokens, private rule text, unpublished game text, personal information, or credentials to MCP servers.

Use only information that is safe to share externally.

Validate MCP output against:

- `AGENTS.md`
- current task issue
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- existing code

If MCP output conflicts with this repository's rules, follow the repository rules.

## Context7

Context7 may be used to check current official documentation for adopted or planned technologies such as:

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

