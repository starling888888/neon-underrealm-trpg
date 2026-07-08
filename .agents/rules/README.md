# Agent Rules Index

This directory contains stable rules and rationale for agents.

Use this file as an index only. Do not read every rule file by default. Read the files that match the current task.

## Rule Files

- `core-rules-rationale.md`: reasons behind the top-level safety rules in `AGENTS.md`.
- `git-operations.md`: Git, GitHub CLI, destructive command, branch, commit, push, PR, and release rules.
- `data-management.md`: `.raw/`, `.tmp/`, generated JSON, design artifacts, screenshots, and ignored files.
- `mcp.md`: MCP server and external documentation usage policy.
- `work-report.md`: required post-work report format and validation expectations.
- `file-structure.md`: repository file structure and splitting policy for docs, scripts, and source files.

## Relationship With Skills

Rules do not replace skills.

When a request matches a skill, read the skill first. Then read only the rule files needed for that task.

Rules must not weaken `AGENTS.md`, `docs/issue/*.md`, `docs/requirements.md`, `docs/out-of-scope.md`, `docs/plan.md`, or `docs/TODO.md`.
