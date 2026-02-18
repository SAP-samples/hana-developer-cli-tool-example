# Utilities Reference

Complete documentation of all utility modules in the `utils/` folder.

## Overview

The `utils/` folder contains reusable utility modules that provide core functionality shared across commands. These modules handle database connectivity, SQL injection prevention, internationalization, platform integration (BTP, CF, XSA), and bulk operations on database objects.

## Core Utilities

### base.js

**Description:** Central functionality shared by all commands. Provides core utilities, database connectivity, output formatting, and CLI helpers.

**Key Exports:**
- `colors` - Chalk color utility for terminal output formatting
- `debug` - Debug logging utility
- `bundle` - i18n text bundle for internationalization
- `dbClass` - Database class for SAP HDB connections
- `sqlInjection` - SQL injection protection utilities
- `require` - CommonJS require function for ESM modules

**Key Functions:**
- `startSpinnerInt()` - Start an elegant terminal spinner
- `endSpinner(msg)` - End the spinner with optional message
- `log(msg)` - Output log message with color
- `error(err)` - Output error message with stack trace
- `createDBConnection()` - Establish database connection
- `createDBConnectionPromisified()` - Create promisified database connection
- `output(data, options)` - Format and output data
- `outputTableFancy(data)` - Output data as formatted table
- `getPrompts()` - Get current CLI prompts/arguments
- `setPrompts(prompts)` - Set CLI prompts/arguments
- `getBuilder(input, iConn, iDebug)` - Build yargs options with common parameters
- `validateLimit(limit)` - Validate and sanitize limit parameter

**Use Case:** Central hub for database operations and CLI utilities. Most commands import this module.

---

### base-lite.js

**Description:** Lightweight utilities for CLI initialization with minimal dependencies (no heavy database imports).

**Key Exports:**
- `colors` - Chalk color utility
- `debug` - Lazy-loaded debug module (only loads if DEBUG env var is set)
- `bundle` - i18n text bundle

**Key Functions:**
- `error(err)` - Output error message (async)
- `getBuilder(input, iConn, iDebug)` - Build yargs options with common parameters

**Use Case:** Fast CLI startup initialization. Used in bin/hana-cli.js to avoid loading expensive dependencies until command-specific code runs.

---

## Connection & Configuration Utilities

### connections.js

**Description:** Helper utility for making connections to HANA DB and determining connection settings. Supports multiple connection sources: `.cdsrc-private.json`, `default-env.json`, `default-env-admin.json`, `.env` files, XSA environment, and direct credentials.

**Key Functions:**
- `getFileCheckParents(filename, maxDepth)` - Search current and parent directories for a file
- `getPackageJSON()` - Find package.json in current/parent directories
- `getMTA()` - Find mta.yaml in current/parent directories
- `getDefaultEnv()` - Find default-env.json in current/parent directories
- `getDefaultEnvAdmin()` - Find default-env-admin.json in current/parent directories
- `getEnv()` - Find .env in current/parent directories
- `getCdsrcPrivate()` - Find .cdsrc-private.json in current/parent directories
- `resolveEnv(options)` - Determine which env file to use (admin or regular)
- `getConnOptions(prompts)` - Get connection options from available sources

**Environment Variables Supported:**
- `HANA_CLI_PROJECT_PATH` - Project directory for MCP server context
- `HANA_CLI_CONN_FILE` - Connection file name
- `HANA_CLI_HOST` - Direct database host
- `HANA_CLI_PORT` - Direct database port (default: 30013)
- `HANA_CLI_USER` - Direct database user
- `HANA_CLI_PASSWORD` - Direct database password
- `HANA_CLI_DATABASE` - Direct database name (default: SYSTEMDB)

**Use Case:** Centralized connection resolution. Intelligently finds credentials from multiple sources.

---

### locale.js

**Description:** Localization utilities for detecting and normalizing locale strings.

**Key Functions:**
- `getLocale(env)` - Get locale from environment variables (LC_ALL, LC_MESSAGES, LANG, LANGUAGE)
- `normalizeLocale(locale)` - Normalize locale string by removing encoding suffixes (e.g., 'de_DE.UTF-8' → 'de_DE')

**Use Case:** Determine system locale for i18n text bundle configuration.

---

## SQL Injection Protection

### sqlInjection.js

**Description:** SQL Injection Protection Utilities. Provides comprehensive whitelist-based parameter validation.

**Key Exports:**
- `whitespaceTable` - Map of whitespace characters including Unicode variants
- `separatorTable` - Map of SQL separator characters
- `isAcceptableQuotedParameter(value)` - Check if quoted parameter contains no unescaped quotes
- `isAcceptableParameter(value, maxToken)` - Validate parameter as safe SQL token (default: 1 token max)
- `parameterObjectProtoTypeFactory(name, type, escape)` - Create parameter object with validation
- `objectName(name)` - Sanitize object names (schema, table, column)
- `objectNameEscape(name)` - Escape object names with double quotes
- `checkUniformity()` - Validate input uniformity

**Use Case:** Protect all SQL queries from injection attacks. Used extensively throughout the codebase.

---

## Database Inspection & Metadata

### dbInspect.js

**Description:** Database object dynamic inspection and metadata processing. Provides functions for analyzing database schemas, tables, views, procedures, and their properties.

**Key Functions:**
- `getHANAVersion(db, options)` - Get HANA database version (with caching)
- `isCalculationView(db, schema, viewId, options)` - Check if view is a calculation view
- `getView(db, schema, viewId)` - Get database view details
- `getTable(db, schema, table)` - Get table metadata
- `getTableFields(db, tableOID)` - Get table column information
- `getTableData(db, schema, table, limit)` - Query table data
- `getConstraints(db, table)` - Get table constraints (primary key, foreign key, unique)
- `getProcedure(db, schema, procedure)` - Get stored procedure details
- `getFunction(db, schema, function)` - Get function metadata
- `getDef(db, schema, object)` - Get SQL definition of database object
- `formatCDS(db, object, fields, constraints, type, schema, filter)` - Format object as CDS source
- `getStatistics(db, schema, table)` - Get table statistics
- `resetHANAVersionCache()` - Clear cached version info

**Use Case:** Introspect database objects for inspecting, importing, exporting, and migration operations.

---

## Bulk Operations

### massConvert.js

**Description:** Bulk operations for converting database objects between formats (e.g., SQL to HDBTABLE or HDBVIEW).

**Key Functions:**
- `convertTablesToHdbtable(db, schema, tablePattern, format, output)` - Convert tables to HDBTABLE format
- `convertViewsToHdbview(db, schema, viewPattern, format, output)` - Convert views to HDBVIEW format
- `convertToCSV(sourceCode)` - Convert object definition to CSV format
- `convertToJSON(sourceCode)` - Convert object definition to JSON format
- `removeCSTypes(db, source)` - Remove calculation-specific types from source
- `addAssociations(db, schema, table, source)` - Add association information to source

**Use Case:** Mass conversion of database objects for development/deployment workflows.

---

### massDelete.js

**Description:** Bulk deletion of database objects (tables, views, procedures) with optional filtering and dry-run support.

**Key Functions:**
- `deleteObjects()` - Main function to trigger mass deletion
- `deleteObjectsInternal(db, schema, objectPattern, objectType, limit, dry, logOutput)` - Execute bulk delete
- `executeDeletion(db, objectList, dry, logOutput)` - Run deletion with optional dry-run
- `writeLog(prompts, dir, logOutput)` - Write deletion operation log

**Use Case:** Remove multiple database objects matching patterns with optional test mode.

---

### massExport.js

**Description:** Bulk export of database objects (tables, views, procedures) with their structure and data.

**Key Functions:**
- `getTablesInternal(db, schema, tablePattern, limit)` - Find tables matching pattern
- `getTableStructure(db, schema, table)` - Get table column definitions
- `getTableData(db, schema, table, limit)` - Export table data
- `exportTableDefinition(db, tableObj, schema, format, folderPath, logOutput)` - Export table structure
- `exportTableData(db, tableObj, schema, format, folderPath, limit, logOutput)` - Export table data
- `exportTableMetadata(db, tableObj, schema, folderPath, logOutput)` - Export table metadata

**Supported Formats:** JSON, CSV, SQL

**Use Case:** Export database objects and data for backup, migration, or analysis.

---

### massGrant.js

**Description:** Bulk privilege grant operations on database objects (tables, views, procedures).

**Key Functions:**
- `grantPrivilege()` - Main function for bulk privilege grants
- `getObjectsInternal(db, schema, objectPattern, objectType, limit)` - Find objects for granting
- `executeGrant(db, objectList, grantee, privilege, withGrantOption, dry, logOutput)` - Execute bulk grant
- `validatePrivilege(privilege)` - Validate privilege name
- `validateGrantee(grantee)` - Validate grantee user/role

**Supported Privileges:** SELECT, INSERT, UPDATE, DELETE, EXECUTE, TRIGGER, ADMIN

**Use Case:** Grant same privileges to multiple objects or users efficiently.

---

### massUpdate.js

**Description:** Bulk update operations on database tables with optional WHERE clause filtering.

**Key Functions:**
- `updateTables()` - Main function to trigger mass update
- `getTablesInternal(db, schema, tablePattern, limit)` - Find tables matching pattern
- `getUpdateCount(db, schema, table, whereClause)` - Get count of rows to be updated
- `executeUpdate(db, tableList, schema, setClause, whereClause, dry, logOutput)` - Execute bulk update
- `writeLog(prompts, dir, logOutput)` - Write update operation log

**Use Case:** Perform same updates across multiple tables with optional filtering.

---

## Command Suggestions

### commandSuggestions.js

**Description:** Utility for suggesting similar commands when user enters invalid command or option names.

**Key Functions:**
- `getUniqueCommands()` - Get unique command names from command map
- `getSimilarCommands(input, threshold, maxSuggestions)` - Find similar commands using fuzzy matching
- `getSuggestionMessage(invalidCommand, bundle)` - Get formatted suggestion message for display
- `getSimilarOptions(input, availableOptions, threshold, maxSuggestions)` - Find similar options

**Parameters:**
- `threshold` (default: 0.4) - Similarity threshold (0-1, lower = more strict)
- `maxSuggestions` (default: 3) - Maximum suggestions to return

**Use Case:** Provide helpful "Did you mean?" suggestions for typos in command names and options.

---

## Version Management

### versionCheck.js

**Description:** Node.js version validation using package.json engine requirements.

**Key Functions:**
- `checkVersion()` - Check if current Node.js version meets requirements from package.json

**Use Case:** Ensure CLI runs on compatible Node.js version before initializing.

---

## Cloud Platform Integration

### btp.js

**Description:** Library for calling BTP (SAP Business Technology Platform) APIs via CLI.

**Key Functions:**
- `getVersion()` - Get BTP CLI version
- `getSubaccounts()` - Get available subaccounts
- `getSubaccountByName(name)` - Find subaccount by name
- `getSubscribableServices()` - Get available services to subscribe
- `subscribeService(serviceId, plan)` - Subscribe to BTP service
- `getServiceBindings()` - Get service instance bindings
- `getHANAInstances()` - Get HANA Cloud instances
- `getHANAInstanceByName(name)` - Find HANA instance by name
- `executeSubaccountCommand(command)` - Execute arbitrary BTP command

**Use Case:** Integration with SAP BTP for cloud operations and service management.

---

### cf.js

**Description:** Library for calling CloudFoundry (CF) APIs via CLI.

**Key Functions:**
- `getVersion()` - Get CloudFoundry CLI version
- `getCFConfig()` - Read CF CLI central configuration
- `clearCFConfigCache()` - Clear CF config cache for refresh
- `getCFOrg()` - Get target organization information
- `getCFOrgName()` - Get organization name
- `getCFOrgGUID()` - Get organization GUID
- `getCFSpace()` - Get target space information
- `getCFSpaceName()` - Get space name
- `getCFSpaceGUID()` - Get space GUID
- `getCFTarget()` - Get current CF target
- `getServiceInstances()` - Get service instances in current space
- `getServices()` - Get available services
- `getServicePlans(serviceGUID)` - Get service plans for a service
- `getHANAInstances()` - Get HANA service instances

**Use Case:** CloudFoundry integration for service binding and instance management.

---

### xs.js

**Description:** Library for calling XSA (SAP XS Advanced) APIs via CLI.

**Key Functions:**
- `getVersion()` - Get XS CLI version
- `getCFConfig()` - Read XS CLI configuration
- `clearXSConfigCache()` - Clear XS config cache
- `getCFOrg()` - Get XSA organization info
- `getCFOrgName()` - Get organization name
- `getCFOrgGUID()` - Get organization GUID
- `getCFSpace()` - Get XSA space info
- `getCFSpaceName()` - Get space name
- `getCFSpaceGUID()` - Get space GUID
- `getCFTarget()` - Get current XS target
- `getHANAInstances()` - Get HANA instances
- `getHANAInstanceByName(name)` - Find HANA instance by name
- `getServices()` - Get available services
- `getServicePlans(serviceGUID)` - Get service plans
- `getServiceGUID(service)` - Get service GUID by name
- `getServicePlanGUID(serviceGUID, servicePlan)` - Get plan GUID
- `getHDIInstances()` - Get HDI instances
- `getSbssInstances()` - Get SBSS instances
- `getSecureStoreInstances()` - Get secure store instances
- `getSchemaInstances()` - Get schema instances
- `getUpsInstances()` - Get UPS instances

**Use Case:** XSA integration for HANA service management in on-premise environments.

---

## Database Adapter Layer

### database/ folder

Provides abstraction layer for different database backends.

#### database/index.js

**Description:** Abstract database client factory and base class.

**Key Classes:**
- `dbClientClass` - Abstract base class for database clients

**Key Static Methods:**
- `getNewClient(prompts)` - Factory method to create database client of correct type

**Key Instance Methods:**
- `connect()` - Establish database connection
- `disconnect()` - Disconnect from database
- `listTables()` - List database tables
- `execSQL(query, params)` - Execute SQL query
- `getKind()` - Get database kind/flavor

**Supported Database Types:**
- `hana` - SAP HANA (direct connection)
- `hanaCDS` - SAP HANA (via CDS)
- `sqlite` - SQLite
- `postgres` - PostgreSQL

---

#### database/hanaDirect.js

**Description:** Database client for HANA direct connection (non-CDS).

**Key Methods:**
- `connect()` - Connect to HANA with direct credentials
- `disconnect()` - Close direct connection
- `listTables()` - Query HANA table catalog
- `execSQL(query, params)` - Execute SQL on HANA
- `getKind()` - Returns 'hana'

**Use Case:** Direct HANA connections when CDS is not available.

---

#### database/hanaCDS.js

**Description:** Database client for HANA via CDS framework.

**Key Methods:**
- `connect()` - Connect via CDS framework
- `disconnect()` - Close CDS connection
- `listTables()` - Get tables via CDS query
- `execSQL(query, params)` - Execute via CDS
- `getKind()` - Returns 'hana'

**Use Case:** HANA connections through CDS, integrating with CAP applications.

---

#### database/sqlite.js

**Description:** Database client for SQLite databases.

**Key Methods:**
- `connect()` - Connect to SQLite file
- `disconnect()` - Close SQLite connection
- `listTables()` - Query SQLite table catalog
- `execSQL(query, params)` - Execute SQL on SQLite
- `getKind()` - Returns 'sqlite'

**Use Case:** Local SQLite database support for development and testing.

---

#### database/postgres.js

**Description:** Database client for PostgreSQL databases.

**Key Methods:**
- `connect()` - Connect to PostgreSQL server
- `disconnect()` - Close PostgreSQL connection
- `listTables()` - Query PostgreSQL table catalog
- `execSQL(query, params)` - Execute SQL on PostgreSQL
- `getKind()` - Returns 'postgres'

**Use Case:** PostgreSQL database support for cross-platform compatibility.

---

## Usage Examples

### Connecting to Database

```javascript
import * as connections from './utils/connections.js'
import * as base from './utils/base.js'

// Get connection options
const prompts = { admin: false }
const connOptions = await connections.getConnOptions(prompts)

// Create connection using base utility
const db = await base.createDBConnection()
```

### SQL Injection Protection

```javascript
import * as sqlInjection from './utils/sqlInjection.js'

// Validate parameter
if (sqlInjection.isAcceptableParameter(userInput, 1)) {
    // Safe to use in SQL
    const sanitized = sqlInjection.objectName(userInput)
}
```

### Database Inspection

```javascript
import * as dbInspect from './utils/dbInspect.js'

// Get HANA version
const version = await dbInspect.getHANAVersion(db)

// Get table metadata
const table = await dbInspect.getTable(db, 'SCHEMA', 'TABLE_NAME')
const fields = await dbInspect.getTableFields(db, table[0].TABLE_OID)
```

### Bulk Operations

```javascript
import * as massExport from './utils/massExport.js'

// Export tables matching pattern
const logOutput = []
const tables = await massExport.getTablesInternal(db, 'SCHEMA', '%TEMP%', 100)
for (let table of tables) {
    await massExport.exportTableData(db, table, 'SCHEMA', 'csv', './output', 1000, logOutput)
}
```

---

## Architecture Patterns

### Promisification

Many utilities wrap callback-based APIs into promises:
- Database statements use `preparePromisified()` and `statementExecPromisified()`
- Child process commands use `promisify(child_process.exec)`

### Caching

Performance optimization through strategic caching:
- **HANA Version** - Cached to avoid repeated queries
- **Calculation View** - Cached per schema/view ID
- **CF/XS Config** - Cached to avoid file I/O

### Progress Tracking

Bulk operations use progress bars:
- `base.terminal.progressBar()` for visual feedback
- WebSocket broadcast for remote UIs

### Localization

All user-facing strings use i18n bundles:
- `bundle.getText(key, parameters)` for translated messages
- Locale detection and normalization

---

## Best Practices

1. **Always use SQL injection protection** - Use `sqlInjection` utility for all user inputs
2. **Validate parameters** - Use `isAcceptableParameter()` for identifiers
3. **Handle errors gracefully** - Use `base.error()` for consistent error output
4. **Use versioning** - Check HANA version for feature support using `dbInspect.getHANAVersion()`
5. **Cache when appropriate** - Reuse cached data to reduce database load
6. **Provide progress feedback** - Use progress bars for long operations
7. **Log operations** - Write operation logs for audit and debugging
8. **Support dry-run mode** - Implement preview before destructive operations

---

## Testing Utilities

Most mass operation utilities support:
- **Dry-run mode** - Preview changes without executing
- **Logging** - Write operation logs to JSON
- **Progress feedback** - Visual progress bars
- **Error handling** - Continue on error with error logging
- **Filtering** - Limit operations with patterns and count limits

---

## Integration with Commands

Most CLI commands follow this pattern:

```javascript
import * as base from '../utils/base.js'
import * as dbInspect from '../utils/dbInspect.js'

export async function handler(argv) {
    try {
        const prompts = base.getPrompts()  // Get CLI arguments
        const db = await base.createDBConnection()  // Connect to DB
        const data = await dbInspect.getTable(db, schema, table)
        base.output(data)  // Display results
        base.end()  // Cleanup and exit
    } catch (err) {
        base.error(err)
        base.end(1)
    }
}
```

---

## See Also

- [Project Structure](./project-structure.md) - Overall project organization
- [Codebase Deep Dives](./codebase.md) - Command implementation details
- [Database Operations](../../02-commands/) - Command implementations using these utilities
