# Project Structure

Complete project architecture and folder organization.

## Overview

HANA CLI is organized into clear logical modules:

```
hana-developer-cli-tool-example/
├── bin/                      # CLI entry point
│   ├── hana-cli             # Executable
│   └── hana-cli.js          # Main entry file
│
├── app/                      # Command implementations
│   ├── index.js             # Export all commands
│   ├── alerts.js            # Alerts command
│   ├── import.js            # Import command
│   ├── export.js            # Export command
│   └── ...                  # Other commands
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

### bin/ - CLI Entry Point

The executable entry point that:
1. Parses command-line arguments
2. Loads appropriate command handler
3. Executes command
4. Returns results

### app/ - Command Implementations

Each command has:
- **Builder function** - Defines command options/flags
- **Handler function** - Executes command logic
- **Exported** from `app/index.js` for loading

Example structure:
```javascript
exports.command = 'import'
exports.aliases = ['imp', 'uploadData']
exports.describe = 'Import data from CSV or Excel'
exports.builder = (yargs) => {
  // Define options
}
exports.handler = async (argv) => {
  // Execute command
}
```

### utils/ - Shared Utilities

Reusable functions:
- **database.js** - Database connection, queries
- **formatting.js** - Table, JSON, CSV output
- **validation.js** - Data type checking
- **translation.js** - Internationalization
- **logger.js** - Debug and error logging

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

Over 300 test cases covering:
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
- Additional languages as needed

## Code Flow Example: Import Command

1. **Entry** (`bin/hana-cli.js`)
   - User runs: `hana-cli import -n data.csv -t TABLE`

2. **Parsing** (yargs)
   - Parses arguments
   - Validates required options
   - Loads `app/import.js`

3. **Building** (`app/import.js` - builder function)
   - Defines options: filename, table, matchMode, truncate
   - Sets defaults
   - Adds help text

4. **Handler** (`app/import.js` - handler function)
   - Validates input (file exists, table valid)
   - Calls utils functions:
     - `database.js` - Connect to HANA
     - `validation.js` - Type checking
     - `formatting.js` - Output results
   - Handles errors with try-catch

5. **Output**
   - Returns success/error message
   - Writes results to stdout
   - Exits with appropriate code

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

When adding features:
1. Create implementation in `app/`
2. Add utilities to `utils/` if reusable
3. Write tests in `tests/`
4. Update docs in `docs/02-commands/`
5. Add i18n entries in `_i18n/`
6. Submit PR with test coverage

## See Also

- [Development Guide](../index.md)
- [MCP Server](../mcp-server/overview.md)
- [GitHub Repository](https://github.com/SAP-samples/hana-developer-cli-tool-example)
