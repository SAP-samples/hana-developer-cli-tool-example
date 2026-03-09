# Project Structure

Complete project architecture and folder organization.

## Overview

HANA CLI is organized into clear logical modules:

```bash
hana-developer-cli-tool-example/
├── bin/                      # CLI commands and entry point
│   ├── cli.js               # Main entry point
│   ├── commandMap.js        # Command-to-file mapping for lazy loading
│   ├── index.js             # Command exports (fallback to load all)
│   ├── import.js            # Import command implementation
│   ├── export.js            # Export command implementation
│   ├── alerts.js            # Alerts command
│   └── ...                  # 150+ other command implementations
│
├── app/                      # Fiori UI5 application (not CLI commands)
│   ├── appconfig/           # Application configuration
│   ├── dfa/                 # Data foundation
│   └── resources/           # UI resources
│
├── utils/                    # Utility functions
│   ├── database.js          # Database operations
│   ├── formatting.js        # Output formatting
│   ├── validation.js        # Data validation
│   └── ...
│
├── routes/                   # REST API routes (server mode)
│   ├── index.js             # Route setup
│   ├── api.js               # API endpoints
│   └── ...
│
├── types/                    # TypeScript type definitions
│   └── index.d.ts
│
├── tests/                    # Test suite
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── mcp-server/              # Model Context Protocol implementation
│   ├── src/
│   ├── build/
│   └── README.md
│
├── docs/                     # Documentation (VitePress)
│   ├── .vitepress/          # VitePress config
│   ├── 01-getting-started/
│   ├── 02-commands/
│   ├── 03-features/
│   ├── 04-api-reference/
│   ├── 05-development/
│   └── 99-reference/
│
├── _i18n/                    # Internationalization
│   ├── messages.properties
│   ├── messages_de.properties
│   └── ...
│
├── scripts/                  # Build and utility scripts
│
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── CHANGELOG.md             # Version history
└── README.md                # Project readme
```

## Key Components

### bin/ - CLI Commands and Entry Point

Contains both the main entry point and all command implementations (150+ commands).

#### Main Entry Point (`cli.js`)

1. Parses command-line arguments
2. Loads configuration files
3. Checks `commandMap.js` for requested command
4. **Lazy loads** only the specific command module (performance optimization)
5. Creates yargs instance with command configuration
6. Executes command and handles errors

#### Command Structure

Each command file (e.g., `import.js`, `export.js`) exports:

- **command** - Command name
- **aliases** - Alternative command names
- **describe** - Command description (internationalized)
- **builder** - Function that defines options/flags with yargs
- **handler** - Function that receives parsed argv and delegates to promptHandler
- **inputPrompts** - Schema for interactive prompts
- **Processing function** - Actual business logic (e.g., `importData`, `exportData`)

Example structure:

```javascript
export const command = 'import'
export const aliases = ['imp', 'uploadData']
export const describe = baseLite.bundle.getText("import")

export const builder = (yargs) => yargs.options({
  filename: { alias: ['n'], type: 'string', desc: '...' },
  table: { alias: ['t'], type: 'string', desc: '...' }
  // ...more options
})

export let inputPrompts = {
  filename: { description: '...', type: 'string', required: true }
  // ...schema for interactive prompts
}

export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, importData, inputPrompts)
}

export async function importData(prompts) {
  // Actual import logic
}
```

### app/ - UI5 Application

Contains Fiori UI5 application resources (not CLI commands):

- **appconfig/** - UI application configuration
- **dfa/** - Data foundation artifacts
- **resources/** - UI5 resources and components

### utils/ - Shared Utilities

Reusable functions organized by category:

#### Core Utilities

- **base.js** - Central command functionality, database connections, terminal UI
- **base-lite.js** - Lightweight version of base for faster loading
- **connections.js** - Connection file discovery and management
- **dbInspect.js** - Database metadata inspection and versioning
- **locale.js** - Locale detection for internationalization
- **sqlInjection.js** - SQL injection protection and validation
- **versionCheck.js** - Node.js version validation

#### CLI Integration

- **btp.js** - SAP BTP CLI integration and API calls
- **cf.js** - Cloud Foundry CLI integration
- **xs.js** - XS Advanced CLI integration

#### Mass Operations

- **massConvert.js** - Bulk conversion of database objects to HDI formats
- **massExport.js** - Mass export operations for tables and data
- **massDelete.js** - Bulk delete operations across multiple objects
- **massUpdate.js** - Mass update operations with WHERE clauses
- **massGrant.js** - Bulk privilege granting

#### Additional Utilities

- **commandSuggestions.js** - Command suggestion system
- **config-loader.js** - Configuration file loading
- **doc-linker.js** - Documentation linking utilities
- **database/** - Database client abstraction layer (HANA, PostgreSQL, SQLite)

### routes/ - REST API Server

When running `hana-cli server`:

1. Initializes Express server
2. Registers API routes
3. Maps routes to command handlers
4. Returns JSON responses

Enables:

- Programmatic access via HTTP
- Integration with other tools
- Microservice architecture

### mcp-server/ - AI Integration

Model Context Protocol implementation:

- Exposes tools and resources
- Enables AI assistant integration
- Provides database introspection
- Facilitates automated operations

### tests/ - Test Suite

Over 1400 test cases covering:

- Unit tests for individual functions
- Integration tests for workflows
- End-to-end tests for commands
- Error handling scenarios

Run with: `npm test`

### docs/ - VitePress Documentation

This professional documentation site with:

- Getting started guides
- Complete command reference
- Feature documentation
- API reference
- Development guides

Run locally: `cd docs && npm run docs:dev`

### _i18n/ - Translations

Internationalization files in `properties` format:

- `messages.properties` - English
- `messages_de.properties` - German
- `messages_es.properties` - Spanish
- `messages_fr.properties` - French
- `messages_ja.properties` - Japanese
- `messages_ko.properties` - Korean
- `messages_pt.properties` - Portuguese
- `messages_zh.properties` - Simplified Chinese
- `messages_hi.properties` - Hindi
- `messages_pl.properties` - Polish

## Code Flow Example: Import Command

Actual execution flow when running: `hana-cli import -n data.csv -t TABLE`

### 1. Entry Point (`bin/cli.js`)

- Parses command-line arguments
- Loads configuration from config files (`loadConfig()`)
- Checks `commandMap` for the requested command
- **Lazy loading**: Dynamically imports only `bin/import.js` (optimization: ~7x faster startup)

```javascript
const commandModule = await import(commandMap[requestedCommand])
```

### 2. Yargs Builder (`bin/import.js` - builder function)

- Defines all command options and flags:
  - `--filename` (`-n`) - CSV/Excel file path
  - `--table` (`-t`) - Target table name
  - `--schema` (`-s`) - Target schema (default: current)
  - `--matchMode` (`-m`) - Column matching strategy
  - `--truncate` (`-tr`) - Clear table before import
  - `--batchSize` (`-b`) - Rows per batch (default: 1000)
  - Plus 10+ additional options
- Sets defaults and validates types
- Builds help text and examples

### 3. Yargs Handler (`bin/import.js` - handler function)

```javascript
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, importData, inputPrompts)
}
```

- Imports `utils/base.js` (deferred for performance)
- Delegates to `base.promptHandler()` with three key params:
  - `argv` - Parsed command-line arguments
  - `importData` - The actual processing function
  - `inputPrompts` - Schema for interactive prompts

### 4. Prompt Handler (`utils/base.js` - promptHandler)

- Validates all provided arguments against schema
- Checks for unknown/invalid options
- Prompts interactively for any missing required values
- Applies defaults for quiet mode
- Enables debug logging if `--debug` flag present
- Calls the processing function: `await importData(prompts)`

### 5. Import Processing (`bin/import.js` - importData function)

Main business logic execution:

1. **Database Connection**
   - Uses `dbClientClass.getNewClient()` from `utils/database/`
   - Supports HANA, PostgreSQL, SQLite via abstraction layer
   - Connects to target database

2. **Schema Resolution**
   - Parses qualified table name (schema.table)
   - Falls back to current schema if not specified
   - Handles SQLite (no schema concept)

3. **File Processing**
   - Creates streaming iterator for CSV or Excel
   - Validates file size (prevents memory exhaustion)
   - Reads records incrementally

4. **Table Metadata**
   - Queries database for table structure
   - Gets column names, types, constraints
   - Prepares for data type conversion

5. **Transaction Management**
   - Starts database transaction
   - Optional: Truncates table if `--truncate` flag set
   - Processes data in configurable batches

6. **Data Import Loop**
   - Matches file columns to table columns (by order/name/auto)
   - Converts data types per table schema
   - Handles NULL value parsing
   - Inserts batch with recursive error handling
   - Tracks progress (rows/sec, memory usage, errors)

7. **Commit/Rollback**
   - Commits transaction on success
   - Rolls back on error (or stops on max errors)
   - Dry-run mode: No actual database changes

### 6. Output & Cleanup

- Displays import summary:
  - Rows processed, inserted, failed
  - Execution time
  - Memory usage
  - Error details (first 100 errors)
- Disconnects from database
- Returns control to CLI
- Exits with appropriate code (0 = success, 1 = error)

## Dependencies & Versions

Current major dependencies:

- **Node.js**: 22+
- **yargs**: CLI parsing
- **Express**: REST server
- **sqlite3**: Optional local persistence
- **Internationalization**: Custom i18n system
- **TypeScript**: Type safety (definitions)

## Performance Optimization

Recent improvements (v4.202602):

- Lazy-loaded command modules
- Deferred yargs initialization
- Conditional debug loading
- ~7x faster startup (2.2s → 700ms)

## Testing Strategy

Approach:

- **Unit tests**: Individual functions
- **Integration tests**: Component interaction
- **Mocking**: Database calls mocked
- **Coverage**: Target 85%+

Run: `npm test`

## Building & Distribution

Build process:

1. Run tests: `npm test`
2. Build types: `npx tsc --noEmit`
3. Package: `npm pack` or publish to npm
4. Version: `npm version X.Y.Z`

## Contributing Guidelines

When adding new commands:

1. Create command implementation in `bin/` (e.g., `bin/myCommand.js`)
2. Add command mapping to `bin/commandMap.js` for lazy loading
3. Export command from `bin/index.js` for fallback loading
4. Add reusable utilities to `utils/` if needed
5. Write tests in `tests/`
6. Update command docs in `docs/02-commands/`
7. Add i18n text entries in `_i18n/*.properties` files
8. Submit PR with test coverage and documentation

## See Also

- [Development Guide](../index.md)
- [MCP Server](../mcp-server/overview.md)
- [GitHub Repository](https://github.com/SAP-samples/hana-developer-cli-tool-example)
