# Workspace Copilot Instructions

These instructions apply to all work in this repository.

## Project Context

**For comprehensive architecture and design patterns**, refer to [project-overview.instructions.md](instructions/project-overview.instructions.md). It contains:
- Project purpose, mission, and use cases
- Complete architecture overview with diagrams
- Technology stack and framework details
- Operating modes (CLI, Interactive, API Server, MCP Server)
- Key architectural patterns (lazy loading, database abstraction, i18n, etc.)
- Testing strategy and documentation system
- Critical development rules and common workflows

**Quick Reference:**
- Node.js ESM project ("type": "module"); prefer ESM import/export patterns.
- CLI uses i18n; all user-facing text must go through text bundles.
- Docs are VitePress-based; keep structure and taxonomy consistent.

## General Expectations
- Keep changes minimal and consistent with existing style.
- Prefer updating existing utilities/scripts over introducing new ones.
- Use repository instructions in `.github/instructions/` when they match file scope.
- Avoid modifying docs or workflows unless explicitly requested.
- When adding scripts, keep them cross-platform.

## Testing and Validation
- Run targeted tests only when needed; do not run the full suite unless requested.
- For docs changes, consider regenerating the docs index or building VitePress.
- For i18n changes, validate using the existing i18n validation script.
- For documentation creation or updates, perform a consistency-only cross-check against current sources (no command execution unless explicitly requested).

## Tooling Preferences
- Use the existing scripts in `scripts/` and root automation scripts when available.
- Avoid introducing new dependencies unless necessary and justified.

## Database Operations and Inspection
- When asked about database operations, schema inspection, or data queries, **use `hana-cli` commands directly** to inspect and interact with the database.
- Common database inspection commands:
  - `hana-cli tables` - List all tables in the current schema
  - `hana-cli inspectTable [schema] [table]` - Show table columns and structure
  - `hana-cli querySimple --query "SELECT * FROM TABLE"` - Execute SQL with `--query` flag (supports `--output json|csv|table|excel`)
  - `hana-cli indexes [schema] [table]` - List indexes on a table
  - `hana-cli dependencies [schema] [object]` - Show object dependencies
- **Important**: Always use the `--query` flag with querySimple: `hana-cli querySimple --query "SQL statement"` (not positional arguments)
- Use actual database queries via `hana-cli` rather than relying on code inspection; this provides real, up-to-date information for testing and validation.
- For custom SQL queries, use `hana-cli querySimple` to execute the SQL and get structured JSON results back, enabling programmatic analysis.
- Document any database schema changes, new tables, or structural modifications discovered during inspection.

## Output Expectations
- Provide concise summaries of changes and recommended follow-ups.
