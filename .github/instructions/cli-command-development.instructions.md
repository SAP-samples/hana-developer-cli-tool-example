---
description: "Use when creating or updating CLI command files in bin/. Enforces consistent structure, imports, exports, error handling, internationalization, and integration with the command infrastructure. Ensures commands work seamlessly with the yargs framework, prompt system, and database connections."
applyTo: "bin/*.js"
---

# CLI Command Development Guidelines

Use this guide when creating or modifying CLI command files in the `bin/` directory.

## Scope and Purpose

This guide applies to all command files in `bin/`. Each file represents a single CLI command that users can execute via `hana-cli <commandName>`.

## Critical Principles

1. **Consistency**: All commands follow the same structural pattern.
2. **Type Safety**: Use JSDoc and `@ts-check` for type checking.
3. **Internationalization**: All user-facing strings must come from i18n bundles.
4. **Error Handling**: Comprehensive try/catch with proper cleanup.
5. **Database Connections**: Use the centralized connection infrastructure.
6. **Documentation Integration**: Every command links to its documentation.

## File Structure Template

Every CLI command file must follow this structure:

```javascript
// @ts-check
import * as baseLite from '../utils/base-lite.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'

export const command = 'commandName [param1] [param2]'
export const aliases = ['alias1', 'alias2']
export const describe = baseLite.bundle.getText("commandName")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  // Command-specific options here
})).wrap(160).example(
  'hana-cli commandName --option value',
  baseLite.bundle.getText("commandNameExample")
).epilog(buildDocEpilogue('commandName', 'category', ['relatedCmd1', 'relatedCmd2']))

export let inputPrompts = {
  // Prompt schema here
}

export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, mainFunction, inputPrompts)
}

export async function mainFunction(prompts) {
  const base = await import('../utils/base.js')
  base.debug('mainFunction')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
    
    // Business logic here
    
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}
```

## Required Exports

### 1. `command` (string)

Defines the command signature using yargs syntax:

```javascript
export const command = 'commandName [param1] [param2]'
```

**Rules:**
- Use camelCase for command names
- Optional parameters in square brackets `[param]`
- Required parameters without brackets
- Order parameters logically (most important first)

**Examples:**
```javascript
export const command = 'inspectTable [schema] [table]'
export const command = 'columnStats [schema] [table]'
export const command = 'connect [user] [password]'
export const command = 'dataProfile'  // No parameters
```

### 2. `aliases` (array of strings)

Alternative names for the command:

```javascript
export const aliases = ['it', 'insTbl', 'inspectable']
```

**Rules:**
- Provide short, memorable aliases
- Common patterns:
  - Abbreviations: `it` for `inspectTable`
  - Camel variations: `insTbl`, `inspectable`
  - Common misspellings or variations
- Can be empty array if no aliases needed

### 3. `describe` (string)

Brief description from i18n bundle:

```javascript
export const describe = baseLite.bundle.getText("commandName")
```

**Rules:**
- ALWAYS use `baseLite.bundle.getText()`
- Key should match the command name
- Never hardcode description strings
- Description should be concise (1-2 sentences)

### 4. `builder` (function)

Configures command options using yargs:

```javascript
export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  table: {
    alias: ['t'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("table")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  }
})).wrap(160).example(
  'hana-cli commandName --table myTable --schema MYSCHEMA',
  baseLite.bundle.getText("commandNameExample")
).epilog(buildDocEpilogue('commandName', 'category', ['relatedCmd1', 'relatedCmd2']))
```

**Rules:**
- ALWAYS use `baseLite.getBuilder()` to merge with common options
- Each option should have:
  - `alias`: Array of shorthand flags
  - `type`: 'string', 'number', 'boolean', or 'array'
  - `default`: Default value (optional)
  - `desc`: Description from i18n bundle
- ALWAYS chain `.wrap(160)` for consistent line wrapping
- ALWAYS provide at least one `.example()`
- ALWAYS end with `.epilog(buildDocEpilogue())`

**Common Option Defaults:**
- `schema`: `'**CURRENT_SCHEMA**'` (special token for current schema)
- `table`: `"*"` (wildcard for all tables)
- `view`: `"*"` (wildcard for all views)
- `limit`: `200` (reasonable default for result limiting)
- `output`: `"tbl"` (table output format)

**Special Builder Functions:**
For commands with complex or non-standard options, you may need a custom builder function from `base.js`:
- `getMassConvertBuilder()` for mass conversion commands
- `getBuilder()` with custom connection/debug flags

Example:
```javascript
import { getMassConvertBuilder } from '../utils/base.js'
export const builder = getMassConvertBuilder(false)
```

### 5. `inputPrompts` (object)

Schema for interactive prompts:

```javascript
export let inputPrompts = {
  table: {
    description: baseLite.bundle.getText("table"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("schema"),
    type: 'string',
    required: false
  },
  output: {
    description: baseLite.bundle.getText("outputType"),
    type: 'string',
    required: true
  },
  useHanaTypes: {
    description: baseLite.bundle.getText("useHanaTypes"),
    type: 'boolean',
    required: false,
    ask: () => false  // Skip in interactive prompts
  }
}
```

**Rules:**
- Each key must match a builder option name
- Required fields:
  - `description`: From i18n bundle
  - `type`: 'string', 'number', 'boolean'
  - `required`: true/false
- Optional fields:
  - `ask`: Function returning boolean (controls interactive prompting)
  - `pattern`: Regex for validation
  - `message`: Custom validation message
  - `hidden`: true for passwords
  - `replace`: Character for password masking (default '*')

**`ask` Function Examples:**
```javascript
// Skip if another option is provided
ask: () => !argv.userstorekey

// Never ask in interactive mode
ask: () => false

// Ask based on condition
ask: () => prompts.output === 'sql'
```

### 6. `handler` (async function)

Entry point for command execution:

```javascript
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, mainFunction, inputPrompts)
}
```

**Rules:**
- ALWAYS async
- ALWAYS dynamically import base.js (for performance)
- ALWAYS call `base.promptHandler()` with:
  1. `argv`: Command arguments from yargs
  2. Business logic function (your main function)
  3. `inputPrompts`: Prompt schema
- Optional parameters to `promptHandler()`:
  - `iConn`: Include connection options (default: true)
  - `iDebug`: Include debug options (default: true)

**Variations:**
```javascript
// No connection needed
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, mainFunction, inputPrompts, false, true)
}

// Custom prompts from base.js
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, mainFunction, base.getMassConvertPrompts(false))
}
```

### 7. Main Business Logic Function

The actual command implementation:

```javascript
export async function getTableInfo(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getTableInfo')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
    
    // Calculate schema (handles **CURRENT_SCHEMA** token)
    const schema = await base.dbClass.schemaCalc(prompts, db)
    const table = base.dbClass.objectName(prompts.table)
    const limit = base.validateLimit(prompts.limit)
    
    // Build and execute query
    let query = `SELECT * FROM SYS.TABLES WHERE SCHEMA_NAME = ? AND TABLE_NAME LIKE ?`
    if (limit && base.sqlInjection.isAcceptableParameter(limit.toString())) {
      query += ` LIMIT ${limit.toString()}`
    }
    
    const results = await db.statementExecPromisified(
      await db.preparePromisified(query), 
      [schema, table]
    )
    
    // Output results
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}
```

**Naming Convention:**
- Verb-based: `getTableInfo`, `inspectView`, `createBackup`
- Descriptive: `launchHdbsql`, `convertTables`, `analyzeColumns`
- Should clearly indicate what the function does

**Standard Pattern:**
1. Import base.js dynamically
2. Call `base.debug()` with function name
3. Wrap everything in try/catch
4. Call `base.setPrompts(prompts)`
5. Create DB connection if needed
6. Perform business logic
7. Output results
8. Call `base.end()`
9. Return results
10. Catch and handle errors with `base.error()`

**Database Operations:**
- Use `base.createDBConnection()` for connections
- Use `base.dbClass.schemaCalc()` for schema resolution
- Use `base.dbClass.objectName()` for object name formatting
- Use `base.validateLimit()` for limit validation
- Use `base.sqlInjection.isAcceptableParameter()` for SQL injection prevention
- Use prepared statements: `db.preparePromisified()` + `db.statementExecPromisified()`

**Output Methods:**
- `base.outputTableFancy(data)`: Formatted table output
- `console.log()`: Simple text output
- `console.table()`: Native table output
- `base.outputTable(data)`: Alternative table format

## Import Patterns

### Required Imports

**Minimal (every command):**
```javascript
import * as baseLite from '../utils/base-lite.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'
```

**Database Commands:**
```javascript
import * as baseLite from '../utils/base-lite.js'
import dbClass from "sap-hdb-promisfied"
import * as conn from "../utils/connections.js"
import { buildDocEpilogue } from '../utils/doc-linker.js'
```

**Inspection Commands:**
```javascript
import * as baseLite from '../utils/base-lite.js'
import * as dbInspect from '../utils/dbInspect.js'
import dbClass from "sap-hdb-promisfied"
import * as conn from "../utils/connections.js"
import cds from '@sap/cds'
import { buildDocEpilogue } from '../utils/doc-linker.js'
```

**Commands with Special Global State:**
```javascript
global.__xRef = []  // For cross-reference tracking
```

### Dynamic Imports

ALWAYS import `base.js` dynamically in handler and main function:

```javascript
const base = await import('../utils/base.js')
```

**Why?**
- Performance: Avoids loading heavy dependencies until needed
- Modules are cached after first import
- Keeps startup time fast

## Documentation Integration

### Using `buildDocEpilogue()`

Every command MUST have an epilogue linking to documentation:

```javascript
.epilog(buildDocEpilogue('commandName', 'category', ['relatedCmd1', 'relatedCmd2']))
```

**Parameters:**
1. `commandName`: Exact command name (camelCase)
2. `category`: Documentation category from `commandMetadata.js`
3. `relatedCommands`: Array of related command names

**Category Values** (from commandMetadata.js):
- `'data-tools'`: Import, export, data manipulation
- `'schema-tools'`: Schema management, object listing
- `'object-inspection'`: Inspecting tables, views, procedures
- `'analysis-tools'`: ERD, calc view analyzer, privilege analysis
- `'performance-monitoring'`: Query analysis, blocking, statistics
- `'backup-recovery'`: Backup, restore, replication
- `'system-admin'`: System info, health check, diagnostics
- `'security'`: Users, roles, authentication
- `'mass-operations'`: Mass export, delete, convert
- `'connection-auth'`: Connection management, authentication
- `'btp-integration'`: BTP service integration
- `'hana-cloud'`: HANA Cloud instance management
- `'hdi-management'`: HDI container operations
- `'developer-tools'`: CDS, migrations, code generation

**Finding Categories and Related Commands:**
Check `bin/commandMetadata.js` for existing mappings or add new entries:

```javascript
export const commandMetadata = {
  myCommand: { 
    category: 'data-tools', 
    relatedCommands: ['export', 'import', 'dataValidator'] 
  }
}
```

## Internationalization (i18n)

### Principle

**NEVER hardcode user-facing strings.** All text must come from properties files.

### Location

Properties files are in `_i18n/` directory:
- Base strings: `_i18n/messages.properties`
- Command-specific: `_i18n/commandName.properties`
- Translations: `_i18n/messages_de.properties`, etc.

### Usage Patterns

**In exports (use `baseLite.bundle`):**
```javascript
export const describe = baseLite.bundle.getText("commandName")
export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  table: {
    desc: baseLite.bundle.getText("table")
  }
}))
```

**In functions (use `base.bundle` after import):**
```javascript
export async function mainFunction(prompts) {
  const base = await import('../utils/base.js')
  console.log(base.bundle.getText("processing"))
  // ...
}
```

**With parameters:**
```javascript
base.bundle.getText("validation.invalidNumber", ["limit", prompts.limit])
// Replaces {0}, {1}, etc. in properties file
```

### Adding New Strings

1. Add to appropriate properties file:
   ```properties
   # _i18n/myCommand.properties
   myCommand=Description of my command
   myCommandExample=Example usage text
   myCommandParam1=Description of parameter 1
   myCommandError=Error message for my command
   ```

2. If command-specific, register in `baseLite.js` or `base.js`:
   ```javascript
   const additionalBundles = [
     'myCommand',  // Add here
     'duplicateDetection',
     // ...
   ]
   ```

3. Create translations (optional but recommended):
   ```properties
   # _i18n/myCommand_de.properties
   myCommand=Beschreibung meines Befehls
   # _i18n/myCommand_es.properties  
   myCommand=Descripción de mi comando
   ```

## Error Handling

### Standard Pattern

ALWAYS use try/catch with proper cleanup:

```javascript
export async function myFunction(prompts) {
  const base = await import('../utils/base.js')
  base.debug('myFunction')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
    
    // Business logic
    
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}
```

**What `base.error()` does:**
- Logs error to console
- Closes database connections
- Cleans up resources
- Throws in debug/GUI mode
- Handles gracefully in CLI mode

### Validation

**Parameter Validation:**
```javascript
// Validate limit
const limit = base.validateLimit(prompts.limit)

// Validate SQL injection
if (limit && base.sqlInjection.isAcceptableParameter(limit.toString())) {
  query += ` LIMIT ${limit.toString()}`
}

// Custom validation
if (!prompts.table || prompts.table === '') {
  throw new Error(base.bundle.getText("validation.requiredParam", ["table"]))
}
```

**Schema and Object Names:**
```javascript
// Handles **CURRENT_SCHEMA** token
const schema = await base.dbClass.schemaCalc(prompts, db)

// Formats object names properly (handles quoting, escaping)
const table = base.dbClass.objectName(prompts.table)
```

### Common Error Scenarios

```javascript
// Connection failure
if (!db) {
  throw new Error(base.bundle.getText("error.connectionFailed"))
}

// Invalid parameter
if (isNaN(prompts.limit)) {
  throw new Error(base.bundle.getText("validation.invalidNumber", ["limit", prompts.limit]))
}

// No results found
if (!results || results.length === 0) {
  console.log(base.bundle.getText("noResults"))
  base.end()
  return []
}
```

## Database Connection Patterns

### Standard Connection

```javascript
const db = await base.createDBConnection()
```

**Features:**
- Reuses existing connection if available
- Uses connection parameters from prompts
- Handles authentication (user/password or service key)
- Supports encryption and SSL
- Automatically managed by base infrastructure

### Alternative Connection Creation

```javascript
// Direct connection with options
let dbConnection = await conn.createConnection(prompts, false)
const db = new dbClass(dbConnection)
```

**When to use:**
- Need explicit control over connection
- Multiple connections required
- Special connection parameters

### Connection Parameters

Automatically available from `prompts`:
- `admin`: Admin connection flag
- `conn`: Connection file path
- `connection`: Direct connection string (host:port)
- `user`, `password`: Credentials
- `userstorekey`: Secure store key
- `encrypt`: SSL encryption flag
- `trustStore`: Certificate trust store

### Closing Connections

**Automatic:**
```javascript
base.end()  // Closes connection and cleans up
```

**Manual:**
```javascript
await base.clearConnection()
await db.disconnect()
```

## Common Patterns and Best Practices

### Wildcards and Patterns

Support SQL wildcards for flexible filtering:

```javascript
const table = base.dbClass.objectName(prompts.table)  // "*" stays as wildcard
const query = `SELECT * FROM SYS.TABLES WHERE TABLE_NAME LIKE ?`
const results = await db.statementExecPromisified(
  await db.preparePromisified(query),
  [table]  // "*" becomes "%" in LIKE clause
)
```

### Result Limiting

Always validate and apply limits:

```javascript
const limit = base.validateLimit(prompts.limit)
let query = `SELECT * FROM SYS.TABLES WHERE SCHEMA_NAME = ?`
if (limit && base.sqlInjection.isAcceptableParameter(limit.toString())) {
  query += ` LIMIT ${limit.toString()}`
}
```

### Output Formatting

**Table Output:**
```javascript
base.outputTableFancy(results)  // Pretty formatted table
```

**Multiple Outputs:**
```javascript
console.log(results[0])  // First object details
console.log("\n")
base.outputTableFancy(fields)  // Fields table
base.outputTableFancy(constraints)  // Constraints table
```

**Conditional Output:**
```javascript
switch (prompts.output) {
  case 'tbl':
    base.outputTableFancy(results)
    break
  case 'sql':
    console.log(highlight(sqlDefinition))
    break
  case 'json':
    console.log(JSON.stringify(results, null, 2))
    break
}
```

### Schema Resolution

**Standard Pattern:**
```javascript
// Handles **CURRENT_SCHEMA** token automatically
const schema = await base.dbClass.schemaCalc(prompts, db)
```

**Special Cases:**
```javascript
// Explicit schema override
if (prompts.schema && prompts.schema !== '**CURRENT_SCHEMA**') {
  schema = prompts.schema
} else {
  schema = await base.dbClass.schemaCalc(prompts, db)
}
```

### Prepared Statements

ALWAYS use prepared statements to prevent SQL injection:

```javascript
// ✅ CORRECT
const query = `SELECT * FROM SYS.TABLES WHERE SCHEMA_NAME = ? AND TABLE_NAME = ?`
const stmt = await db.preparePromisified(query)
const results = await db.statementExecPromisified(stmt, [schema, table])

// ❌ WRONG - SQL Injection vulnerability
const query = `SELECT * FROM SYS.TABLES WHERE SCHEMA_NAME = '${schema}'`
const results = await db.execSQL(query)
```

### Debugging

Use `base.debug()` for debug output:

```javascript
base.debug('Starting table inspection')
base.debug(`Schema: ${schema}, Table: ${table}`)
```

**Activation:**
- Via flag: `hana-cli myCommand --debug`
- Via environment: `DEBUG=hana-cli hana-cli myCommand`

## Special Command Types

### UI Commands (Browser-Based)

Commands ending in `UI` launch browser interfaces:

```javascript
export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  port: {
    alias: ['p'],
    type: 'integer',
    default: 3000,
    desc: baseLite.bundle.getText("port")
  }
  // ... other options
}))

export async function handler(argv) {
  const base = await import('../utils/base.js')
  // Usually launches Express server
  await startUIServer(argv.port)
}
```

### Mass Operations

Commands operating on multiple objects:

```javascript
import { getMassConvertBuilder } from '../utils/base.js'

export const builder = getMassConvertBuilder(false)

export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, processMultiple, base.getMassConvertPrompts(false))
}
```

### Connection-Only Commands

Commands that don't need database operations:

```javascript
export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  // ... options
}, false))  // false = no connection params

export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, myFunction, inputPrompts, false, true)
  //                                                    ↑
  //                                    iConn = false (no connection)
}
```

## Testing Considerations

### Exports for Testing

Export the main business logic function for unit testing:

```javascript
export async function getTableInfo(prompts) {
  // ... implementation
}
```

**Why:**
- Allows direct testing without yargs
- Can mock prompts object
- Can control database connections in tests

### Test-Friendly Patterns

```javascript
// Return results for assertions
return results

// Don't just console.log
base.outputTableFancy(results)
return results  // Also return for testing
```

## Common Mistakes to Avoid

### ❌ Hardcoded Strings
```javascript
// WRONG
export const describe = "Inspect a table"
desc: "Table name"

// CORRECT
export const describe = baseLite.bundle.getText("inspectTable")
desc: baseLite.bundle.getText("table")
```

### ❌ Missing Error Handling
```javascript
// WRONG
export async function myFunction(prompts) {
  const db = await base.createDBConnection()
  const results = await db.execSQL(query)
  return results
}

// CORRECT
export async function myFunction(prompts) {
  const base = await import('../utils/base.js')
  base.debug('myFunction')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
    const results = await db.execSQL(query)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}
```

### ❌ SQL Injection Vulnerabilities
```javascript
// WRONG
const query = `SELECT * FROM TABLES WHERE NAME = '${prompts.table}'`

// CORRECT
const query = `SELECT * FROM TABLES WHERE NAME = ?`
const results = await db.statementExecPromisified(
  await db.preparePromisified(query),
  [prompts.table]
)
```

### ❌ Missing base.setPrompts()
```javascript
// WRONG
export async function myFunction(prompts) {
  const db = await base.createDBConnection()
  // ...
}

// CORRECT
export async function myFunction(prompts) {
  const base = await import('../utils/base.js')
  base.setPrompts(prompts)  // Required for connection to work!
  const db = await base.createDBConnection()
  // ...
}
```

### ❌ Missing Epilogue
```javascript
// WRONG
export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  // options
})).wrap(160)

// CORRECT
export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  // options
})).wrap(160).epilog(buildDocEpilogue('myCommand', 'category', ['related']))
```

### ❌ Synchronous Handler
```javascript
// WRONG
export function handler(argv) {
  const base = require('../utils/base.js')
  // ...
}

// CORRECT
export async function handler(argv) {
  const base = await import('../utils/base.js')
  // ...
}
```

## Checklist for New Commands

Before submitting a new command, verify:

- [ ] File is in `bin/` directory
- [ ] File has `// @ts-check` at top
- [ ] All 7 required exports present
- [ ] Uses `baseLite.bundle.getText()` for all strings
- [ ] Builder uses `baseLite.getBuilder()`
- [ ] Builder has `.wrap(160).example().epilog()`
- [ ] `inputPrompts` schema matches builder options
- [ ] Handler is async and imports base.js dynamically
- [ ] Main function has try/catch with `base.error()`
- [ ] Main function calls `base.setPrompts(prompts)`
- [ ] Uses prepared statements for SQL queries
- [ ] Validates input parameters
- [ ] Returns results (for testing)
- [ ] Command added to `commandMetadata.js`
- [ ] i18n strings added to properties file
- [ ] Documentation created in `docs/02-commands/`

## Complete Example

Here's a complete, production-ready command:

```javascript
// @ts-check
import * as baseLite from '../utils/base-lite.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'

export const command = 'myTables [schema]'
export const aliases = ['mt', 'mytables', 'myTbls']
export const describe = baseLite.bundle.getText("myTables")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  pattern: {
    alias: ['p'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("pattern")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 100,
    desc: baseLite.bundle.getText("limit")
  },
  includeViews: {
    alias: ['v'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("includeViews")
  }
})).wrap(160).example(
  'hana-cli myTables --schema MYSCHEMA --pattern USER* --limit 50',
  baseLite.bundle.getText("myTablesExample")
).epilog(buildDocEpilogue('myTables', 'schema-tools', ['tables', 'views', 'inspectTable']))

export let inputPrompts = {
  schema: {
    description: baseLite.bundle.getText("schema"),
    type: 'string',
    required: true
  },
  pattern: {
    description: baseLite.bundle.getText("pattern"),
    type: 'string',
    required: false
  },
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: true
  },
  includeViews: {
    description: baseLite.bundle.getText("includeViews"),
    type: 'boolean',
    required: false,
    ask: () => false
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getMyTables, inputPrompts)
}

/**
 * Get tables matching pattern in schema
 * @param {object} prompts - Input prompts with schema, pattern, and limit
 * @returns {Promise<Array>} - Array of table information
 */
export async function getMyTables(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getMyTables')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    // Resolve schema (handles **CURRENT_SCHEMA**)
    const schema = await base.dbClass.schemaCalc(prompts, db)
    const pattern = base.dbClass.objectName(prompts.pattern || '*')
    const limit = base.validateLimit(prompts.limit)

    // Build query
    let query = `
      SELECT SCHEMA_NAME, TABLE_NAME, TABLE_TYPE, RECORD_COUNT
      FROM SYS.TABLES
      WHERE SCHEMA_NAME = ?
      AND TABLE_NAME LIKE ?
    `
    
    if (!prompts.includeViews) {
      query += ` AND TABLE_TYPE = 'TABLE'`
    }
    
    query += ` ORDER BY TABLE_NAME`
    
    if (limit && base.sqlInjection.isAcceptableParameter(limit.toString())) {
      query += ` LIMIT ${limit.toString()}`
    }

    // Execute query with prepared statement
    const stmt = await db.preparePromisified(query)
    const results = await db.statementExecPromisified(stmt, [schema, pattern])

    // Output results
    if (!results || results.length === 0) {
      console.log(base.bundle.getText("noResults"))
    } else {
      console.log(base.bundle.getText("found", [results.length]))
      base.outputTableFancy(results)
    }

    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}
```

With corresponding i18n entries in `_i18n/myTables.properties`:

```properties
myTables=List tables in schema matching pattern
myTablesExample=List tables starting with USER in MYSCHEMA
pattern=Pattern for table name (supports wildcards)
includeViews=Include views in results
found=Found {0} tables
noResults=No tables found matching criteria
```

## Additional Resources

- **Base Utilities**: `utils/base.js`, `utils/base-lite.js`
- **Connection Management**: `utils/connections.js`
- **Database Inspection**: `utils/dbInspect.js`
- **SQL Injection Prevention**: `utils/sqlInjection.js`
- **Documentation Linking**: `utils/doc-linker.js`
- **Command Metadata**: `bin/commandMetadata.js`
- **i18n Resources**: `_i18n/` directory

## Summary

Creating a new CLI command involves:

1. **Structure**: Follow the 7-export pattern consistently
2. **Imports**: Use baseLite for definitions, base for runtime
3. **i18n**: All strings from properties files
4. **Builder**: Merge with `baseLite.getBuilder()`, add epilogue
5. **Handler**: Async, dynamic import, call `promptHandler()`
6. **Logic**: Try/catch, setPrompts, createConnection, validate, execute, output, end
7. **Security**: Prepared statements, validation, SQL injection prevention
8. **Documentation**: Link with `buildDocEpilogue()`, document in `docs/`
9. **Metadata**: Register in `commandMetadata.js`
10. **Testing**: Export functions, return results

Following these guidelines ensures commands are consistent, secure, maintainable, and well-integrated with the hana-cli infrastructure.

## Related Documentation

- See [translatable-text-handling.instructions.md](./translatable-text-handling.instructions.md) for detailed guidance on i18n key naming, import patterns, and adding new translatable strings
- See [i18n-translation-management.instructions.md](./i18n-translation-management.instructions.md) for structure and multi-file synchronization of translation files
- See [command-documentation.instructions.md](./command-documentation.instructions.md) for API documentation and Mermaid diagrams
