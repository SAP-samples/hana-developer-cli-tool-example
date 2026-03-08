# Application Architecture

Detailed architecture and design of HANA CLI components.

## System Architecture

```bash
┌─────────────────────────────────────────────────────────────────────┐
│                      Usage Interfaces                               │
├─────────────────┬─────────────────┬─────────────────┬───────────────┤
│  Command Line   │   Web UI        │   REST API      │   MCP Server  │
│  (Terminal)     │   (Browser)     │   (HTTP)        │   (AI/Agent)  │
└────────┬────────┴────────┬────────┴────────┬────────┴────────┬──────┘
     │                 │                 │                │
     └─────────────────┴─────────────────┴────────────────┘
               │
     ┌─────────────────┴─────────────────┐
     │   HANA CLI Core Engine            │
     │  ├─ Command Router                │
     │  ├─ Command Loader (commandMap)   │
     │  ├─ Yargs + Prompt Handler        │
     │  ├─ Output & Format Helpers       │
     │  └─ Error Handling                │
     └─────────────────┬─────────────────┘
               │
      ┌────────────┴────────────┐
      │  Database Utilities     │
      ├─ Connection Resolution  │
      ├─ DB Adapters (HANA/CDS, │
      │   Postgres, SQLite)     │
      ├─ Query Executor         │
      └─ Result Output          │
      │
      ↓
     ┌─────────────────┐
     │  SAP HANA /     │
     │  PostgreSQL /   │
     │  SQLite DB      │
     │                 │
     │ SYSTEMDB        │
     │  ├─ Schemas     │
     │  ├─ Tables      │
     │  ├─ Views       │
     │  └─ ...         │
     └─────────────────┘
```

## Module Organization

### bin/ - CLI Entry and Commands

- `cli.js` - CLI bootstrap, lazy command loading
- `commandMap.js` - Command/alias to module mapping for fast routing
- `index.js` - Loads all command modules (used for full help output)
- `*.js` - Individual command modules (plus `*UI.js` variants for UI-backed flows)

**Command Structure:**

```javascript
import * as baseLite from '../utils/base-lite.js'

export const command = 'export'
export const aliases = ['exp']
export const describe = baseLite.bundle.getText('export')
export const builder = (yargs) => yargs.options(baseLite.getBuilder({ /* options */ }))
export async function handler(argv) { /* execute command */ }
```

**Key Commands:**

- Data tools: import, export, compareData, dataDiff, etc.
- Schema tools: schemaClone, compareSchema, erdDiagram, etc.
- Query tools: callProcedure, querySimple, etc.
- System tools: backup, partitions, indexes, roles, etc.

### app/ - Web UI Assets

- `resources/` - UI5/Fiori assets and shared components
- `appconfig/` - UI configuration and runtime metadata
- `dfa/` - Digital assistant assets used by the web UI
- UI apps include `tables/`, `inspect/`, `massConvert/`, `systemInfo/`, and `common/`

### utils/ - Shared Utilities

**Core Utilities:**

- `base-lite.js` / `base.js` - CLI runtime, prompts, output helpers, logging
- `config-loader.js` - Loads CLI configuration from project/home locations
- `connections.js` - Connection resolution (default-env, .env, VCAP)
- `database/` - DB adapters and factory (`hanaDirect`, `hanaCDS`, `postgres`, `sqlite`)
- `doc-linker.js` - Command doc epilog and related links
- `locale.js` - Locale detection and normalization

### routes/ - REST API Server

Express routes are loaded by `utils/base.js` when the web server starts.
Common endpoints include `/hana/*`, `/docs/*`, `/excel`, and `/api-docs`.

### _i18n/ - Internationalization

**Language Files:**

- `messages.properties` - Base English bundle
- `messages_de.properties` - German bundle
- `messages_es.properties` - Spanish bundle
- `messages_fr.properties` - French bundle
- `messages_ja.properties` - Japanese bundle
- `messages_ko.properties` - Korean bundle
- `messages_pt.properties` - Portuguese bundle
- Feature bundles like `compareData.properties`, `dataDiff.properties`, `export.properties`, etc.
- Format: Properties file with `key=value` pairs

### mcp-server/ - AI Integration

**MCP Protocol Server:**

- Tool definitions and documentation
- Database introspection
- Command wrapping for AI agents
- Connection context support

### tests/ - Test Suite

**Test Organization:**

- Command-level tests in the `tests/` root
- `tests/routes/` - Route and API tests
- `tests/utils/` - Utility and helper tests

## Performance Optimizations

### Startup Performance

**Techniques:**

- Lazy loading of commands on-demand via `bin/commandMap.js`
- Deferred yargs initialization in `bin/cli.js`
- Lazy loading of optional modules in `utils/base.js`
- Single-command load path for fast startup

### Query Performance

**Optimizations:**

- Direct SQL execution through DB adapters (`utils/database/*`)
- Command-level limits and filters to reduce result size
- Output truncation for large datasets in CLI output

### Memory Efficiency

**Techniques:**

- Lazy-loading dependencies to reduce startup memory
- Truncation and table rendering limits for CLI output
- Prompt-driven options to constrain result size

## Data Flow

### Command Execution Flow

```bash
1. User Input (CLI / Web UI / API / MCP)
   │
2. Config Load (`utils/config-loader.js`)
   │
3. Command Routing (bin/cli.js + commandMap)
   │
4. Parameter Parsing + Prompts (yargs + `utils/base.js`)
   │
5. Database Connection Resolution (`utils/connections.js`)
   │
6. Query Execution (`utils/database/*` → DB)
   │
7. Result Output (CLI output helpers or HTTP response)
   │
8. Output (stdout / HTTP response / WebSocket)
```

### Plugin Architecture

Commands are designed as plugins:

```javascript
// bin/myCommand.js
import * as baseLite from '../utils/base-lite.js'

export const command = 'myCommand'
export const describe = baseLite.bundle.getText('myCommand')
export const builder = (yargs) => yargs.options(baseLite.getBuilder({ /* options */ }))
export async function handler(argv) { /* execution */ }

// Auto-loaded by yargs via commandMap/index
```

## Extension Points

### Adding Commands

1. Create `bin/myCommand.js`
2. Export: `command`, `aliases`, `describe`, `builder`, `handler`
3. Add entry to `bin/commandMap.js` and `bin/index.js`

### Adding Database Types

1. Add a new adapter in `utils/database/`
2. Register the adapter in `utils/database/index.js`
3. Update connection resolution if new credentials are required
4. Update tests

### Adding Output Formats

1. Update the relevant command in `bin/` to add the format option
2. Add or reuse output helpers in `utils/base.js` where appropriate
3. Add tests

### Adding Languages

1. Create `_i18n/messages_xx.properties`
2. Add translations for feature bundles (for example `dataDiff_xx.properties`)
3. Verify locale normalization in `utils/locale.js` if new locale tags are used

## Configuration Management

### CLI Configuration Loading (Startup)

1. `.hana-cli-config` (JSON) in current working directory
2. `hana-cli.config.js` (JS) in current working directory
3. `~/.hana-cli-config` (JSON)
4. `~/hana-cli.config.js` (JS)

### Connection Resolution (Database)

1. `.cdsrc-private.json` (CDS binding, non-admin paths)
2. `default-env.json` / `default-env-admin.json`
3. `--conn` file (current directory or `~/.hana-cli/`)
4. `~/.hana-cli/default.json`
5. `.env` (fallback)
6. `VCAP_SERVICES` (environment variable)

## Error Handling

### Error Categories

- **Connection errors** - Database unreachable
- **Permission errors** - Insufficient privileges
- **Data errors** - Invalid data types
- **Syntax errors** - Invalid SQL/parameters
- **System errors** - Out of memory, disk full

### Error Flow

```bash
Error Occurs
   │
Caught by handler
   │
Formatted/logged by `utils/base.js`
   │
Log if debug enabled
   │
Return user-friendly message
   │
Exit with appropriate code
```

## Security Considerations

### Credential Handling

- Passwords never logged
- Credentials stored only in config files
- Environment variables supported
- Command-line passwords not recommended (visible in processes)

### Input Validation

- All user input validated
- SQL parameters escaped
- File paths sanitized
- Schema/table names verified

### Access Control

- Database user permissions enforced
- No privilege escalation
- Multi-user support
- Audit logging available

## See Also

- [Project Structure](../../05-development/architecture/project-structure.md)
- [Implementation Details](../../05-development/implementation.md)
- [Testing Guide](../testing-guide.md)
