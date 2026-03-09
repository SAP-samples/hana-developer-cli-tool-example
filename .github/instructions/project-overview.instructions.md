---
description: "Comprehensive overview of the SAP HANA Developer CLI Tool project. Provides essential context about project purpose, architecture, technologies, operating modes, and design patterns. Use this as foundational knowledge for all work in this repository."
---

# SAP HANA Developer CLI Tool - Project Overview

This document provides comprehensive context about the project's purpose, architecture, and design patterns. Reference this before making significant changes or when onboarding to the codebase.

## Project Purpose and Mission

The SAP HANA Developer CLI Tool is a comprehensive, developer-centric command-line interface designed to simplify SAP HANA database operations during local and cloud-based development.

**Core Objectives:**
- Provide 100+ database commands across 16 functional categories
- Simplify complex multi-step database operations into single commands
- Support multiple operating modes (CLI, Interactive, API Server, MCP Server)
- Work seamlessly in both local and cloud development environments
- Integrate with modern development toolchains (VS Code, SAP Business Application Studio, Cloud Shells)

**Target Use Cases:**
- Local SAP HANA development (SAP HANA Express Edition, Remote HANA)
- Cloud-based development (SAP BTP, HANA Cloud, Google Cloud Shell, AWS Cloud9)
- Database administration and maintenance
- Data analysis, profiling, and validation
- Schema management and migration
- Performance monitoring and optimization

**Not Intended For:**
- Replacing hdbsql as a generic SQL console
- Production database administration (primarily a development tool)

## Project Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     SAP HANA Developer CLI                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  CLI Mode │  │Interactive│  │API Server│  │  MCP Server  │  │
│  │  (yargs)  │  │   Mode    │  │ (Express)│  │(TypeScript)  │  │
│  └─────┬─────┘  └─────┬────┘  └─────┬────┘  └──────┬───────┘  │
│        │              │              │               │           │
│        └──────────────┴──────────────┴───────────────┘           │
│                            │                                      │
│                    ┌───────▼────────┐                           │
│                    │  Command Layer │                           │
│                    │    (bin/*)     │                           │
│                    └───────┬────────┘                           │
│                            │                                      │
│        ┌───────────────────┼───────────────────┐                │
│        │                   │                   │                │
│  ┌─────▼─────┐    ┌────────▼────────┐    ┌────▼────┐          │
│  │   Utils   │    │   DB Abstraction │    │ Routes  │          │
│  │ (base.js, │    │   Layer (CDS/    │    │(Express)│          │
│  │connections)│    │  native clients) │    │         │          │
│  └───────────┘    └─────────┬────────┘    └─────────┘          │
│                              │                                   │
│              ┌───────────────┼───────────────┐                  │
│              │               │               │                  │
│       ┌──────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐          │
│       │    HANA     │ │  PostgreSQL │ │   SQLite   │          │
│       │ (Direct/CDS)│ │    (CDS)    │ │   (CDS)    │          │
│       └─────────────┘ └─────────────┘ └────────────┘          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure and Responsibilities

```
hana-developer-cli-tool-example/
├── bin/                           # 165+ CLI command implementations
│   ├── cli.js                     # Entry point with lazy loading
│   ├── index.js                   # Command registry and loader
│   ├── commandMetadata.js         # Command categorization metadata
│   └── *.js                       # Individual command files
├── utils/                         # Shared utilities and core logic
│   ├── base-lite.js              # Lightweight startup utilities
│   ├── base.js                   # Core functionality (~2300 lines)
│   ├── connections.js            # Connection resolution and management
│   ├── database/                 # Database abstraction layer
│   │   ├── index.js              # Factory pattern for clients
│   │   ├── hanaDirect.js         # Native HANA client
│   │   ├── hanaCDS.js            # CAP/CDS HANA client
│   │   ├── postgres.js           # PostgreSQL client
│   │   └── sqlite.js             # SQLite client
│   ├── dbInspect.js              # Database inspection utilities
│   ├── doc-linker.js             # Documentation linking
│   ├── locale.js                 # Locale detection
│   └── *.js                      # Feature-specific utilities
├── routes/                        # Express API endpoints
│   ├── index.js                  # Configuration endpoints
│   ├── hanaInspect.js            # Inspection endpoints
│   ├── hanaList.js               # Listing endpoints
│   ├── webSocket.js              # WebSocket support
│   └── *.js                      # Other route modules
├── mcp-server/                    # Model Context Protocol server
│   ├── src/
│   │   ├── index.ts              # Server bootstrap
│   │   ├── command-parser.ts     # Extract CLI metadata
│   │   ├── executor.ts           # Execute CLI commands
│   │   ├── tools.ts              # MCP tool implementations
│   │   ├── resources.ts          # MCP resource providers
│   │   └── prompts.ts            # MCP prompt templates
│   └── build/                    # Compiled TypeScript output
├── app/                           # SAPUI5 applications
│   └── resources/                # UI5 components, views, controllers
├── _i18n/                         # Internationalization bundles
│   ├── messages*.properties      # Core UI texts (5 languages)
│   └── {feature}*.properties     # Feature-specific texts
├── tests/                         # Test suites
│   ├── *.Test.js                 # CLI command tests
│   ├── helper.js                 # Test setup and teardown
│   ├── appFactory.js             # Express app factory for tests
│   ├── routes/                   # API route tests
│   └── utils/                    # Utility tests
├── docs/                          # VitePress documentation site
│   ├── .vitepress/               # VitePress configuration
│   ├── 01-getting-started/       # Installation and setup guides
│   ├── 02-commands/              # Command reference (16 categories)
│   ├── 03-features/              # Feature guides
│   ├── 04-api-reference/         # REST API documentation
│   └── 05-development/           # Architecture and dev guides
├── scripts/                       # Maintenance and automation scripts
│   ├── postinstall.js            # Post-installation validation
│   ├── validate-i18n.js          # i18n bundle validation
│   └── build-docs-index.js       # Documentation index generation
├── generate-*.js                  # Root-level automation scripts
├── enhance-*.js                   # Documentation enhancement scripts
├── populate-*.js                  # Documentation population scripts
├── index.js                       # Project entry point
├── package.json                   # Project metadata and scripts
└── tsconfig.json                  # TypeScript configuration
```

## Technology Stack

### Runtime and Module System
- **Node.js**: ≥20.19.0 required
- **Module System**: Pure ESM (`"type": "module"` in package.json)
- **Import Pattern**: Always use `import`/`export`, never `require()`

### Database Support
**SAP HANA:**
- Native: `sap-hdb-promisfied` (2.202601.0) for direct connectivity
- CAP: `@cap-js/hana` (2.6.0) for CDS-based access

**PostgreSQL:**
- `@cap-js/postgres` (2.1.3) via CAP/CDS

**SQLite:**
- `@cap-js/sqlite` (2.1.3) via CAP/CDS for testing and local development

### SAP Cloud Application Programming Model (CAP)
- **Core Framework**: `@sap/cds` (9.7.1)
- **Extensions**:
  - GraphQL: `@cap-js/graphql` (0.14.0)
  - OData V2: `@cap-js-community/odata-v2-adapter` (1.15.9)
  - Telemetry: `@cap-js/telemetry` (1.6.0)
  - Fiori: `@sap/cds-fiori` (2.2.0)
  - Common Content: `@sap/cds-common-content` (3.1.0)

### CLI Framework
- **Argument Parser**: Yargs (18.0.0)
- **Interactive Prompts**: `@inquirer/prompts` (8.2.1) and `inquirer` (13.2.5)
- **Terminal Output**: `terminal-kit` (3.1.1) for rich tables
- **CLI Utilities**: `ora` (9.3.0) spinners, `chalk` (5.3.0) colors, `figures` (6.1.0) symbols

### UI Framework
- **SAPUI5**: Version 1.144.1
- **Location**: `app/resources/` directory
- **Pattern**: Component-based with MVC structure
- **Integration**: Launches via Express server in UI-enabled commands

### Express Server
- **Framework**: Express (5.2.1)
- **WebSocket**: `ws` (8.19.0)
- **Documentation**: `swagger-ui-express` (5.0.0), `swagger-jsdoc` (6.2.8)
- **Middleware**: `body-parser` (2.2.2), CORS support

### MCP (Model Context Protocol)
- **Implementation**: TypeScript in `mcp-server/src/`
- **Protocol**: JSON-RPC over STDIO
- **Usage**: Integrates with Claude, VS Code Copilot, and MCP clients

### Testing and Quality
- **Test Framework**: Mocha with `.mocharc.json` configuration
- **Assertions**: Chai (6.2.2) with `chai-as-promised` (8.0.2)
- **Mocking**: `sinon` (21.0.1), `esmock` (2.7.3), `mock-fs` (5.5.0)
- **Coverage**: Nyc (17.1.0) with 80% threshold for lines/functions/branches
- **HTTP Testing**: `supertest` (7.2.2)
- **Reporting**: `mochawesome` (7.1.3) for HTML reports

### Internationalization (i18n)
- **Framework**: `@sap/textbundle` (6.1.0)
- **Structure**: Property files in `_i18n/` directory
- **Languages Supported**: English (default), German, Spanish, French, Portuguese
- **Pattern**: Lazy-loaded bundles with fallback chaining

### Documentation
- **Framework**: VitePress with Mermaid diagrams
- **Markdown Rendering**: `marked` (17.0.3) + `marked-terminal` (7.0)
- **Automation**: Custom scripts for generation and enhancement

### Data Processing
- **Excel**: `exceljs` (4.4.0)
- **CSV**: `csv-parse` (6.1.0), `@json2csv/node` (7.0.6)
- **Compression**: `jszip` (3.10.1)
- **YAML**: `js-yaml` (4.1.0)

## Operating Modes

### 1. CLI Mode (Direct Command Execution)

The primary mode for running individual commands directly from the terminal.

**Usage:**
```bash
hana-cli <command> [options]
hana-cli tables --schema MYSCHEMA
hana-cli export --table USERS --path ./exports
hana-cli inspectTable --table USERS
```

**Characteristics:**
- Synchronous execution
- Lazy command loading (~150ms startup)
- Exit codes: 0 (success), 1 (error)
- Supports all 100+ commands
- Auto-prompts for missing required parameters (unless `--quiet` flag)

### 2. Interactive/REPL Mode

Menu-driven interface for discovering and executing commands interactively.

**Usage:**
```bash
hana-cli interactive
# or: hana-cli i, hana-cli repl, hana-cli shell
```

**Features:**
- Command discovery by category or search
- Persistent history and command presets
- Session-based prompt retention
- Supports `--category` and `--preset` flags

**Use Cases:**
- Exploring available commands
- Running multiple related commands in sequence
- Learning the CLI without memorizing command names

### 3. API Server Mode

Launches an Express server exposing CLI functionality via REST endpoints.

**Usage:**
```bash
hana-cli cds --table USERS --port 4000
hana-cli massConvert --port 5000
```

**Key Endpoints:**
- `GET /`: Returns current configuration
- `PUT /`: Updates configuration
- `GET /hana/inspectTable`: Table inspection
- `GET /swagger-ui`: API documentation
- `WS /ws`: WebSocket for streaming results

**Use Cases:**
- Web UI access to CLI functionality
- Integration with other tools via REST
- Long-running operations via WebSocket

### 4. MCP Server Mode

JSON-RPC server implementing the Model Context Protocol for AI assistant integration.

**Usage:**
```bash
node mcp-server/build/index.js
```

**Features:**
- Exposes 100+ commands as MCP tools
- Provides documentation as resources
- Supports workflow orchestration
- Integrates with Claude, VS Code Copilot, and MCP clients

**Use Cases:**
- AI-assisted database operations
- Natural language database queries
- Automated multi-step workflows

## Key Architectural Patterns

### 1. Lazy Module Loading

**Goal**: Minimize startup latency to ~150ms by deferring heavy imports.

**Implementation:**
```javascript
// In CLI entry point (bin/cli.js)
import * as baseLite from '../utils/base-lite.js'  // Lightweight, fast

// In command handler (lazy load heavy modules)
export async function handler(argv) {
  const base = await import('../utils/base.js')  // Load only when needed
  // ... use base
}
```

**Benefits:**
- Fast command discovery and help text
- Only loads necessary code for executed command
- Reduced memory footprint

**Apply To:**
- All command handlers in `bin/*.js`
- Heavy dependencies (terminal-kit, debug module)
- Database client initialization

### 2. Database Client Factory Pattern

**Goal**: Abstract multiple database types behind a unified interface.

**Implementation:**
```javascript
// In command handlers
const dbClient = await dbClientClass.getNewClient(prompts)
// Returns: hanaDirect, hanaCDS, postgres, or sqlite instance

// All clients implement common interface:
// - execute(sql, params)
// - query(sql, params)
// - disconnect()
// - getConnection()
```

**Selection Logic:**
- Profile detection from `process.env.CDS_ENV` or `optionsCDS.kind`
- Hybrid profile defaults to `hanaDirect`
- SQLite for testing environments
- PostgreSQL when CDS_ENV=postgres

**Key Files:**
- `utils/database/index.js` - Factory implementation
- `utils/database/hanaDirect.js` - Native HANA client
- `utils/database/hanaCDS.js` - CAP/CDS HANA client
- `utils/database/postgres.js` - PostgreSQL client
- `utils/database/sqlite.js` - SQLite client

### 3. Prompt Handler with Schema

**Goal**: Unified processing of CLI arguments and interactive prompts.

**Implementation:**
```javascript
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, processingFunction, inputPrompts)
}

export let inputPrompts = {
  table: { 
    description: 'Table name', 
    type: 'string', 
    required: true,
    validator: (input) => input.length > 0
  },
  schema: { 
    description: 'Schema name', 
    type: 'string', 
    required: false,
    default: 'DBADMIN'
  }
}
```

**Flow:**
1. Validate CLI arguments against schema
2. Prompt for missing required parameters (unless `--quiet`)
3. Apply transformations and defaults
4. Call processing function with complete prompts

**Benefits:**
- Consistent argument validation
- Automatic interactive prompting
- Self-documenting command interface

### 4. Text Bundle with i18n Proxy

**Goal**: Centralized internationalization with fallback to multiple bundles.

**Implementation:**
```javascript
// In base.js
const baseBundle = new TextBundle(path.join(bundlePath, 'messages'), locale)
const additionalTexts = {} // Lazy-loaded feature bundles

export const bundle = new Proxy(baseBundle, {
  get(target, prop) {
    if (prop === 'getText') {
      return (key, args) => {
        // Check additional texts first
        if (Object.prototype.hasOwnProperty.call(additionalTexts, key)) {
          return formatText(additionalTexts[key], args)
        }
        // Fallback to base bundle
        return baseBundle.getText(key, args)
      }
    }
    return target[prop]
  }
})
```

**Usage:**
```javascript
const describe = baseLite.bundle.getText("tables")
const error = baseLite.bundle.getText("error.connection", [dbName])
```

**Text Key Conventions:**
- Feature prefix: `import.*`, `export.*`, `tables.*`
- Error prefix: `error.*`
- Debug prefix: `debug.*`
- Validation prefix: `validation.*`

### 5. Command Metadata Registry

**Goal**: Single source of truth for command categorization and discovery.

**Implementation:**
```javascript
// bin/commandMetadata.js
export const commandMetadata = {
  'inspectTable': {
    category: 'object-inspection',
    relatedCommands: ['tables', 'inspect View', 'schemas']
  },
  // ... 100+ more commands
}
```

**Usage:**
- Documentation generation (docs linking)
- MCP server categorization
- Interactive mode menu organization
- Smart command suggestions

**Categories (16 total):**
- analysis-tools
- backup-recovery
- cds-cap-tools
- connection-auth
- data-tools
- developer-tools
- hana-cloud
- object-inspection
- performance-monitoring
- schema-tools
- security-audit
- system-admin
- ui-tools
- utilities
- xsa-cf-tools

### 6. Connection Resolution Chain

**Goal**: Flexible credential discovery across multiple configuration sources.

**Implementation:**
```javascript
// utils/connections.js
export async function resolveConnection() {
  // Priority order:
  // 1. default-env-admin.json (admin credentials)
  // 2. default-env.json (standard credentials)
  // 3. .cdsrc-private.json (CDS project credentials)
  // 4. .env file (environment variables)
  // 5. SAP_HANA_SERVICE environment variable
  // 6. Process.env variables directly
  
  // Traverse parent directories to find config files
  // Merge credentials with priority
  // Return unified connection object
}
```

**Supported Config Files:**
- `default-env.json` - Standard SAP development pattern
- `default-env-admin.json` - Admin-level credentials
- `.cdsrc-private.json` - CAP project credentials
- `.env` - Environment variables
- VCAP_SERVICES (Cloud Foundry)

### 7. Route Module Export Pattern

**Goal**: Consistent Express route registration.

**Implementation:**
```javascript
// routes/{feature}.js
export function route(app, server) {
  /**
   * @swagger
   * /api/endpoint:
   *   get:
   *     summary: Endpoint description
   */
  app.get('/api/endpoint', async (req, res, next) => {
    try {
      // Handle request
      res.json({ data })
    } catch (error) {
      next(error)  // Pass to error handler middleware
    }
  })
}
```

**Benefits:**
- Automatic Swagger documentation
- Consistent error handling
- Easy testing with appFactory
- Modular route organization

### 8. Test App Factory Pattern

**Goal**: Reusable Express app instances for testing.

**Implementation:**
```javascript
// tests/appFactory.js
export function createApp(options = {}) {
  const app = express()
  // Load all routes
  // Add error handlers
  // Return configured app
}

export function createMinimalApp(routeFunction) {
  const app = express()
  routeFunction(app, null)  // Load single route
  // Add minimal middleware
  // Return lightweight app
}

// In tests
const app = createMinimalApp(hanaInspectRoute)
request(app).get('/hana/inspectTable').expect(200)
```

## Internationalization (i18n) System

### Structure and Organization

**Directory**: `_i18n/`

**Base Bundle**: `messages*.properties` (5 language variants)
- `messages.properties` (English - default)
- `messages_de.properties` (German)
- `messages_es.properties` (Spanish)
- `messages_fr.properties` (French)
- `messages_pt.properties` (Portuguese)

**Feature-Specific Bundles** (40+ additional property files):
- `compareData*.properties`
- `compareSchema*.properties`
- `dataDiff*.properties`
- `dataLineage*.properties`
- `dataProfile*.properties`
- `dataValidator*.properties`
- `duplicateDetection*.properties`
- `export*.properties`
- `import*.properties`
- ... and more

### Loading Pattern

```javascript
// 1. Detect locale
const locale = locale.normalizeLocale(locale.getLocale())

// 2. Load base bundle
const baseBundle = new TextBundle(path.join(bundlePath, 'messages'), locale)

// 3. Lazy-load additional bundles as needed
function loadAdditionalBundle(bundleName) {
  const bundle = new TextBundle(path.join(bundlePath, bundleName), locale)
  Object.assign(additionalTexts, bundle.texts)
}

// 4. Access via proxy for fallback behavior
bundle.getText('key', [param1, param2])
```

### Key Naming Conventions

**By Feature:**
- `tables.header` - Table-related text
- `export.success` - Export-related text
- `import.validation` - Import-related text

**By Type:**
- `error.*` - Error messages
- `debug.*` - Debug/verbose output
- `validation.*` - Validation messages
- `warning.*` - Warning messages
- `success.*` - Success messages

**By Usage:**
- `grp*` - Option group labels for yargs
- `*Example` - Usage examples for help text
- `*Desc` - Descriptions for commands/options

### Format Strings

Supports positional parameters in property values:

```properties
error.connection = Connection to {0} failed: {1}
success.export = Exported {0} rows to {1}
```

Usage:
```javascript
bundle.getText('error.connection', [dbName, errorMessage])
// Output: "Connection to HANA failed: timeout"
```

### Usage in Commands

```javascript
// In bin/*.js files
import * as baseLite from '../utils/base-lite.js'

export const describe = baseLite.bundle.getText("commandName")

export const builder = (yargs) => yargs.options({
  table: {
    alias: ['t'],
    description: baseLite.bundle.getText("table"),
    type: 'string'
  }
}).example(
  'hana-cli commandName --table USERS',
  baseLite.bundle.getText("commandNameExample")
)
```

### Critical Rules

1. **Never hardcode user-facing text** - Always use `bundle.getText()`
2. **Provide English default** - English property file is the source of truth
3. **Keep keys consistent** - Use existing key patterns
4. **Translate all variants** - When adding keys, update all 5 language files
5. **Use descriptive keys** - Keys should indicate purpose (e.g., `error.notFound`, not `err1`)

## Testing Strategy

### Test Organization

**Directory Structure:**
```
tests/
├── *.Test.js                # 150+ CLI command tests
├── helper.js                # Global test setup/teardown hooks
├── appFactory.js            # Express app factory for route tests
├── base.js                  # Shared test utilities
├── routes/                  # API route test suites
│   ├── index.Test.js
│   ├── hanaInspect.Test.js
│   └── ...
└── utils/                   # Utility test suites
    ├── connections.Test.js
    └── ...
```

### Test Configuration

**File**: `tests/.mocharc.json`

```json
{
  "parallel": true,
  "timeout": 10000,
  "recursive": true,
  "spec": ["tests/**/*.Test.js"]
}
```

### NPM Test Scripts

```bash
# Run all tests in parallel
npm test

# Run tests sequentially (for debugging)
npm run test:sequential

# Run specific test categories
npm run test:cli        # CLI command tests only
npm run test:utils      # Utility tests only
npm run test:routes     # Route/API tests only

# Platform-specific tests
npm run test:windows    # Tests tagged @windows or @all
npm run test:unix       # Tests tagged @unix or @all
npm run test:platform   # Platform-specific tests

# Coverage reports
npm run coverage        # Generate coverage data
npm run coverage:report # View HTML coverage report
npm run coverage:check  # Enforce 80% threshold

# HTML Test Reports
npm run test:report     # Generate mochawesome HTML report
```

### Platform-Specific Testing

Tests can be tagged for platform-specific execution:

```javascript
describe('File system operations @windows', function() {
  // Only runs on Windows
})

describe('Path handling @unix', function() {
  // Only runs on Unix/Linux/macOS
})

describe('Connection tests @all', function() {
  // Runs on all platforms
})
```

**Filter by Platform:**
- `--grep "@windows|@all"` - Windows and cross-platform tests
- `--grep "@unix|@all"` - Unix and cross-platform tests

### Test Patterns and Best Practices

**1. Use appFactory for Route Tests:**
```javascript
import { createMinimalApp } from './appFactory.js'
import { route as hanaInspectRoute } from '../routes/hanaInspect.js'
import request from 'supertest'

const app = createMinimalApp(hanaInspectRoute)

it('should inspect table', async () => {
  const res = await request(app)
    .get('/hana/inspectTable')
    .query({ table: 'USERS' })
    .expect(200)
  
  expect(res.body).to.have.property('columns')
})
```

**2. Mock Database Connections:**
```javascript
import { esmock } from 'esmock'

const mockDB = {
  execute: sinon.stub().resolves({ rows: [] }),
  disconnect: sinon.stub().resolves()
}

const command = await esmock('../bin/tables.js', {
  '../utils/base.js': {
    createDBConnection: sinon.stub().resolves(mockDB)
  }
})
```

**3. Cleanup After Tests:**
```javascript
afterEach(async () => {
  await base.clearConnection()
  sinon.restore()
})
```

### Coverage Requirements

**Thresholds** (configured in `.nycrc`):
- Lines: 80%
- Functions: 80%
- Branches: 80%

**Excluded from Coverage:**
- `node_modules/`
- `tests/`
- `docs/`
- `mcp-server/build/`
- `coverage/`

## Documentation System

### VitePress Structure

**Directory**: `docs/`

**Organization:**
```
docs/
├── .vitepress/
│   ├── config.ts               # VitePress configuration
│   ├── theme/                  # Custom theme components
│   └── sidebar-config.ts       # Auto-generated sidebar
├── 01-getting-started/
│   ├── installation.md
│   ├── quick-start.md
│   └── configuration.md
├── 02-commands/                # 16 category folders
│   ├── analysis-tools/
│   ├── backup-recovery/
│   ├── connection-auth/
│   ├── data-tools/
│   ├── object-inspection/
│   └── ...
├── 03-features/
│   ├── cli-usage.md
│   ├── api-server.md
│   ├── mcp-server.md
│   └── interactive-mode.md
├── 04-api-reference/
│   ├── rest-api.md
│   └── endpoints/
├── 05-development/
│   ├── architecture/
│   ├── copilot/               # Copilot instructions
│   ├── implementation.md
│   ├── testing.md
│   └── mcp-server/
├── 99-reference/
│   ├── troubleshooting.md
│   └── faq.md
├── faq.md
├── troubleshooting.md
└── README.md
```

### Command Documentation Pattern

Each command in `docs/02-commands/{category}/{command}.md` follows this structure:

```markdown
---
category: Category Name
relatedCommands:
  - commandName1
  - commandName2
---

# Command Name

Brief description of what the command does.

## Syntax

\`\`\`bash
hana-cli commandName [options]
\`\`\`

## Parameters

### Required Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| --param   | string | Description |

### Optional Parameters
| Parameter | Alias | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| --option  | -o    | string | value | Description |

## Examples

### Example 1: Basic Usage
\`\`\`bash
hana-cli commandName --param value
\`\`\`

### Example 2: Advanced Usage
\`\`\`bash
hana-cli commandName --param value --option custom
\`\`\`

## Output

Description of command output and format.

## Related Commands

- [CommandName1](./commandName1.md)
- [CommandName2](./commandName2.md)

## Mermaid Diagrams (if applicable)

\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`
```

### Documentation Automation Scripts

**Root-Level Scripts:**

1. **generate-command-docs.js**
   - Scans `bin/` directory for all commands
   - Extracts command metadata (name, aliases, options)
   - Creates skeleton markdown files in `docs/02-commands/{category}/`
   - Uses `bin/commandMetadata.js` for categorization

2. **enhance-command-docs.js**
   - Enriches existing command documentation
   - Adds detailed parameter descriptions
   - Includes examples and usage patterns
   - Integrates Mermaid diagrams

3. **populate-command-docs.js**
   - Populates documentation with captured command output
   - Takes screenshots of UI commands
   - Updates examples with real execution results

4. **generate-sidebar-config.js**
   - Auto-generates VitePress sidebar configuration
   - Scans `docs/` directory structure
   - Creates hierarchical navigation
   - Outputs to `docs/.vitepress/sidebar-config.ts`

**Scripts Directory:**

5. **scripts/build-docs-index.js**
   - Creates searchable index of all documentation
   - Outputs to `mcp-server/docs-index.json`
   - Used by MCP server for documentation search

### Documentation Build and Preview

**Local Development:**
```bash
cd docs
npm install
npm run docs:dev
# Opens http://localhost:5173
```

**Production Build:**
```bash
cd docs
npm run docs:build    # Build static site
npm run docs:serve    # Preview production build
```

## Configuration Management

### Configuration Sources (Priority Order)

1. **default-env-admin.json** - Admin credentials (highest priority)
2. **default-env.json** - Standard development credentials
3. **.cdsrc-private.json** - CAP project credentials
4. **.env** - Environment variables
5. **Environment Variables** - Process.env
6. **VCAP_SERVICES** - Cloud Foundry service bindings

### Connection Resolution

**File**: `utils/connections.js`

**Process:**
1. Traverse parent directories to find configuration files
2. Read and parse each file
3. Merge credentials with priority-based override
4. Extract database connection details
5. Return unified connection object

**Supported Formats:**
```json
// default-env.json
{
  "VCAP_SERVICES": {
    "hana": [{
      "credentials": {
        "host": "hostname",
        "port": 30015,
        "user": "username",
        "password": "password"
      }
    }]
  }
}

// .cdsrc-private.json
{
  "requires": {
    "db": {
      "kind": "hana",
      "credentials": {
        "host": "hostname",
        "port": 30015,
        "user": "username",
        "password": "password"
      }
    }
  }
}
```

### Runtime Configuration

**Stored in**: Persistent state managed by `utils/base.js`

**Accessible via:**
- `base.getPrompts()` - Get current prompts/configuration
- `base.setPrompts(prompts)` - Update prompts/configuration
- `baseLite.getConfigValue(key, defaultValue)` - Get individual config values

**Typical Configuration:**
```javascript
{
  host: 'hostname',
  port: 30015,
  user: 'DBADMIN',
  schema: 'MYSCHEMA',
  quiet: false,
  verbose: false,
  admin: false,
  // ... command-specific options
}
```

## Critical Development Rules

### 1. Module System
- ✅ **Always use ESM**: `import`/`export` syntax
- ❌ **Never use CommonJS**: No `require()` or `module.exports`
- ✅ **File extensions required**: `import { x } from './file.js'` (include .js)

### 2. Lazy Loading
- ✅ **Defer heavy imports**: Load base.js and heavy modules in handlers
- ✅ **Use base-lite**: For startup and lightweight operations
- ❌ **Don't load everything upfront**: Hurts CLI startup performance

### 3. Internationalization
- ✅ **Use i18n bundles**: `bundle.getText('key')` for all user-facing text
- ❌ **No hardcoded strings**: Even for debugging (use debug keys)
- ✅ **Update all 5 languages**: When adding new keys

### 4. Database Connections
- ✅ **Use factory pattern**: `dbClientClass.getNewClient(prompts)`
- ✅ **Always disconnect**: `base.end()` in try/finally
- ✅ **Handle errors**: Comprehensive error handling with cleanup

### 5. Error Handling
- ✅ **Try/catch all handlers**: Every command handler needs error handling
- ✅ **Use base.error()**: For consistent error reporting
- ✅ **Clean up resources**: Disconnect DB, close files, etc.

### 6. Testing
- ✅ **Write tests for new commands**: Coverage threshold is 80%
- ✅ **Use platform tags**: @windows, @unix, @all
- ✅ **Mock database connections**: Don't rely on real databases in tests

### 7. Documentation
- ✅ **Document new commands**: Add to appropriate category folder
- ✅ **Update commandMetadata.js**: For proper categorization
- ✅ **Run doc generation scripts**: After adding new commands

### 8. Code Style
- ✅ **Follow existing patterns**: Consistency is critical
- ✅ **Use JSDoc**: `@ts-check` and type annotations
- ✅ **Descriptive names**: Commands, variables, functions
- ❌ **No console.log in production**: Use debug module or base.debug()

### 9. MCP Server
- ✅ **Log to stderr only**: `console.error()` not `console.log()`
- ✅ **Return structured data**: JSON objects, not raw text
- ✅ **Update tool registry**: When adding new command tools

### 10. Performance
- ✅ **Optimize startup**: ~150ms target for help/version
- ✅ **Stream large results**: Don't buffer entire datasets
- ✅ **Use connection pooling**: Via CDS or native pooling

## Project-Specific npm Scripts

### Primary Scripts

```bash
# Testing
npm test                    # Run all tests in parallel
npm run test:sequential    # Run tests sequentially
npm run test:cli           # CLI command tests only
npm run test:utils         # Utility tests only
npm run test:routes        # Route/API tests only
npm run test:report        # Generate HTML test report

# Coverage
npm run coverage           # Generate coverage report
npm run coverage:report    # View HTML coverage
npm run coverage:check     # Enforce 80% threshold

# Documentation
npm run build:docs-index   # Build documentation search index

# Internationalization
npm run validate:i18n      # Validate all i18n bundles
npm run validate:i18n:quiet # Validate silently (CI mode)

# Type Checking
npm run types              # Generate TypeScript declarations

# Changelog
npm run changelog          # Generate CHANGELOG.md from CHANGELOG.json
```

### Post-Install Hook

**File**: `scripts/postinstall.js`

**Purpose:**
- Validates Node.js version (≥20.19.0)
- Checks for required dependencies
- Displays installation success message
- Shows quick start instructions

## Common Workflows

### Adding a New CLI Command

1. **Create command file** in `bin/newCommand.js`
   - Follow `bin/inspectTable.js` as template
   - Include command, aliases, describe, builder, handler exports
   - Implement inputPrompts schema
   - Add internationalized text to `_i18n/messages*.properties`

2. **Register in metadata** in `bin/commandMetadata.js`
   - Add entry with category and relatedCommands

3. **Write tests** in `tests/newCommand.Test.js`
   - Test argument parsing
   - Test execution with mocked DB
   - Test error handling

4. **Generate documentation**
   ```bash
   node generate-command-docs.js
   node enhance-command-docs.js
   ```

5. **Run validation**
   ```bash
   npm run validate:i18n
   npm test
   npm run coverage:check
   ```

### Adding a New API Route

1. **Create route file** in `routes/newFeature.js`
   - Export `route(app, server)` function
   - Add Swagger JSDoc annotations
   - Handle errors with try/catch and next(error)

2. **Register route** in appropriate server initialization

3. **Write tests** in `tests/routes/newFeature.Test.js`
   - Use appFactory.createMinimalApp()
   - Test all endpoints with supertest
   - Test error conditions

4. **Document API** in `docs/04-api-reference/`

### Adding i18n Text

1. **Add to English bundle** `_i18n/messages.properties`
   ```properties
   myFeature.title = My Feature
   myFeature.description = This is my feature
   error.myFeature.notFound = Feature not found: {0}
   ```

2. **Translate to other languages**
   - Update `_i18n/messages_de.properties` (German)
   - Update `_i18n/messages_es.properties` (Spanish)
   - Update `_i18n/messages_fr.properties` (French)
   - Update `_i18n/messages_pt.properties` (Portuguese)

3. **Validate**
   ```bash
   npm run validate:i18n
   ```

### Updating Documentation

1. **Edit markdown** in appropriate `docs/` subfolder

2. **Regenerate sidebar** if structure changed
   ```bash
   node generate-sidebar-config.js
   ```

3. **Rebuild docs index**
   ```bash
   npm run build:docs-index
   ```

4. **Preview locally**
   ```bash
   cd docs
   npm run docs:dev
   ```

5. **Build for production**
   ```bash
   cd docs
   npm run docs:build
   ```

## Related Documentation

For detailed guidance on specific file types, refer to the specialized instructions files:

- **CLI Commands**: `.github/instructions/cli-command-development.instructions.md`
- **API Routes**: `.github/instructions/route-development.instructions.md`
- **Utilities**: `.github/instructions/utility-module-development.instructions.md`
- **Tests**: `.github/instructions/testing.instructions.md`
- **Documentation**: `.github/instructions/general-documentation.instructions.md`, `.github/instructions/command-documentation.instructions.md`
- **i18n**: `.github/instructions/i18n-translation-management.instructions.md`, `.github/instructions/translatable-text-handling.instructions.md`
- **Automation Scripts**: `.github/instructions/automation-script-development.instructions.md`
- **MCP Server**: `.github/instructions/mcp-server-development.instructions.md`
- **Database Clients**: `.github/instructions/database-client-implementation.instructions.md`
- **Configuration**: `.github/instructions/config-files-management.instructions.md`

## Summary

This SAP HANA Developer CLI Tool is a comprehensive, multi-mode database development interface with:
- 100+ commands across 16 categories
- Multiple operating modes (CLI, Interactive, API Server, MCP Server)
- Multi-database support (HANA, PostgreSQL, SQLite)
- Full i18n support (5 languages)
- CAP/CDS integration
- Extensive testing infrastructure
- Auto-generated documentation

When working on this project, always consider:
1. **Performance** - Lazy loading and fast startup
2. **Internationalization** - All text through bundles
3. **Consistency** - Follow established patterns
4. **Testing** - 80% coverage requirement
5. **Documentation** - Keep docs in sync with code
