# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**hana-cli** is a developer-centric CLI tool for SAP HANA database development with 183+ commands. It supports four operating modes: CLI, interactive menu, REST API server, and MCP server (for AI assistants). It targets SAP CAP 10 and runs on Node.js ≥22.0.0 (Node.js 24 LTS highly recommended, following the CAP 10 recommendation). It is a pure ESM project (`"type": "module"`).

## Commands

### Quick Start

```bash
npm ci                      # Install dependencies (use npm ci, not npm install, for reproducible builds)
npm test                    # Verify everything works
```

### Testing

```bash
npm test                    # All tests (Mocha, 16 parallel jobs)
npm run test:cli            # CLI command tests only
npm run test:utils          # Utility tests only
npm run test:routes         # Route/API tests only
npm run test:sequential     # Non-parallel tests
npm run test:grep           # Filter by test name
npm run test:e2e            # End-to-end tests
npm run coverage            # All tests with 80% threshold enforcement
npm run coverage:check      # Check thresholds without re-running tests
```

### Linting & Types

```bash
npm run lint                # ESLint
npm run lint:fix            # Auto-fix
npm run types               # Generate TypeScript declarations (.d.ts)
```

### Documentation

```bash
# From docs/ subdirectory (has its own package.json):
cd docs && npm install      # First-time setup for docs
npm run docs:dev            # VitePress dev server (localhost:5173)
npm run docs:build          # Production build
```

### i18n Validation

```bash
npm run validate:i18n       # Validate i18n bundle completeness
```

## Architecture

### Directory Layout

- **`bin/`** — 183 CLI command files + `cli.js` (entry point with lazy loading), `commandMap.js`, `commandMetadata.js`
- **`utils/`** — Core utilities: `base.js` (~1500 lines, core API), `connections.js` (connection resolution), `database/` (factory pattern), `dbInspect.js`, `sqlInjection.js`, and mass-operation helpers
- **`routes/`** — Express REST API endpoints (served when running `hana-cli ui`)
- **`mcp-server/src/`** — TypeScript MCP server (JSON-RPC over STDIO for AI tool use)
- **`app/`** — SAPUI5 web applications (Fiori Launchpad UI)
- **`_i18n/`** — i18n property files (en, de, es, fr, pt)
- **`tests/`** — Mocha test suite; `helper.js` for setup, `appFactory.js` for route testing
- **`docs/`** — VitePress documentation site
- **`.github/instructions/`** — 25+ detailed development guides (authoritative reference for adding commands, routes, tests, etc.)

### Key Architectural Patterns

**Database Abstraction (Factory Pattern)**
`utils/database/index.js` selects between `hanaDirect.js`, `hanaCDS.js`, `postgres.js`, and `sqlite.js` based on environment profile. All commands go through this layer via `utils/base.js`.

**Connection Resolution (6-step fallback)**
`utils/connections.js` tries in order: `default-env-admin.json` (with `--admin`), `.cdsrc-private.json` (CAP dynamic binding), `.env` / `VCAP_SERVICES`, `--conn` parameter, `default-env.json` (current/parent dirs), `~/.hana-cli/default.json`.

**Lazy Loading for Performance**
`bin/cli.js` defers heavy dependency imports until a command is actually invoked. `--version` and other fast-path commands bypass full initialization entirely (~60-77% startup improvement over v3).

**Command Registration**
Each `bin/*.js` file is a yargs command module. `commandMap.js` registers all commands dynamically; `commandMetadata.js` categorizes them into 16 groups.

**i18n**
All user-facing console output uses `base.bundle.getText(key, [params])` backed by `@sap/textbundle` property files in `_i18n/`. Feature-specific strings go in separate property files (e.g., `messages_dataProfile_en.properties`).

### Standard CLI Parameters

Most commands share: `--schema`/`-s` (defaults to `**CURRENT_SCHEMA**`), `--table`/`-t`, `--limit`/`-l`, `--output`/`-o` (csv|json|table|excel), `--dryRun`/`-dr`, `--admin`/`-a`, `--profile`/`-p` (database profile), `--debug`/`-d`.

### MCP Server (TypeScript)

`mcp-server/src/` exposes CLI commands as MCP tools for AI assistants. Build output goes to `mcp-server/build/`. It wraps the CLI's metadata from `commandMetadata.js` and executes commands via `executor.ts`.

### Testing Conventions

- Test files: `tests/*.Test.js`, `tests/routes/*.Test.js`, `tests/utils/*.Test.js`
- Config: `tests/.mocharc.json` (16 parallel jobs, 10s timeout)
- Mocking: `sinon` + `esmock` for ESM mocking, `mock-fs` for filesystem, `supertest` for HTTP routes
- Coverage threshold: 80% lines/functions/branches (enforced in CI via `npm run coverage:check`)
- Cross-platform CI: Windows/macOS/Ubuntu × Node 22/24 in `.github/workflows/cross-platform-tests.yml`

## Development Guides

Before adding a new command, route, or test, consult `.github/instructions/` — it contains authoritative, detailed guides for every major development task:

- `cli-command-development.instructions.md` — adding CLI commands
- `testing.instructions.md` — test patterns and mocking
- `route-development.instructions.md` — REST API endpoints
- `mcp-server-development.instructions.md` — MCP tool integration
- `i18n-translation-management.instructions.md` — i18n patterns

## Gotchas

- **`default-env.json` contains credentials** — This file stores HANA connection credentials and is NOT gitignored. Never commit real credentials. Use `hana-cli connect` to regenerate it locally.
- **ESM mocking** — Standard `sinon.stub()` cannot intercept ESM `import` bindings. Use `esmock` to mock module-level dependencies in tests. See `.github/instructions/testing.instructions.md`.
- **Docs is a separate project** — The `docs/` directory has its own `package.json` and `node_modules`. Run `npm install` inside `docs/` before building documentation.
- **ESLint flat config** — This project uses ESLint flat config (`eslint.config.js`), not legacy `.eslintrc`. The `@sap/eslint-plugin-cds` plugin is integrated.
