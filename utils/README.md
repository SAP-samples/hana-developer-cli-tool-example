# Utils Directory

This directory contains reusable utility modules that provide core functionality for the SAP HANA Developer CLI tool. These utilities handle database connections, CLI interactions, security, and various helper functions used throughout the application.

## Table of Contents

- [Core Utilities](#core-utilities)
  - [base.js](#basejs)
  - [connections.js](#connectionsjs)
  - [dbInspect.js](#dbinspectjs)
  - [locale.js](#localejs)
  - [sqlInjection.js](#sqlinjectionjs)
  - [versionCheck.js](#versioncheckjs)
- [CLI Integration Utilities](#cli-integration-utilities)
  - [btp.js](#btpjs)
  - [cf.js](#cfjs)
  - [xs.js](#xsjs)
- [Database Utilities](#database-utilities)
  - [massConvert.js](#massconvertjs)
  - [database/](#database-subfolder)
- [Usage Examples](#usage-examples)

---

## Core Utilities

### base.js

**Module**: `base` - Central functionality shared by all commands

The base module is the foundation of the CLI tool, providing shared functionality that is used across all commands.

**Key Features**:

- Database connection management
- Terminal UI components (spinners, progress bars, tables)
- Color output support via chalk
- Prompts handling and validation
- Debugging utilities
- Internationalization (i18n) support via text bundles
- Command builder for yargs
- File opening utilities

**Key Exports**:

```javascript
export const dbClass           // sap-hdb-promisfied instance
export const colors            // Chalk color utilities
export const debug             // Debug logging function
export const terminal          // Terminal-kit instance
export const bundle            // Text bundle for i18n
export const sqlInjection      // SQL injection protection

export const tableOptions      // Default table rendering options
```

**Important Functions**:

- `createDBConnection(options)` - Create and return a database connection
- `getBuilder(input, iConn, iDebug)` - Initialize Yargs builder with connection and debug groups
- `setPrompts(newPrompts)` / `getPrompts()` - Manage command prompts
- `startSpinnerInt()` / `stopSpinnerInt()` - Control terminal spinner
- `clearConnection()` - Clear the database connection
- `blankLine()` - Output a blank line to console

**Usage**:

```javascript
import * as base from './utils/base.js'
const db = await base.createDBConnection()
base.colors.green('Success!')
```

---

### connections.js

**Module**: `connections` - Helper utility for making connections to HANA DB and determining connection settings

Manages database connectivity and configuration file discovery, supporting multiple connection methods and secure credential management.

**Key Features**:

- Searches for configuration files in current and parent directories
- Supports multiple connection file types (default-env.json, .env, .cdsrc-private.json)
- Handles admin connection overrides
- Integrates with SAP CAP/CDS projects
- Supports secure credential lookup via `cds bind`

**Key Functions**:

- `getFileCheckParents(filename)` - Search for a file in current and parent directories (up to 5 levels)
- `getPackageJSON()` - Find package.json file
- `getMTA()` - Find mta.yaml file  
- `getDefaultEnv()` - Find default-env.json file
- `getDefaultEnvAdmin()` - Find default-env-admin.json file
- `getEnv()` - Find .env file

**Connection Resolution Order**:

1. Admin option: `default-env-admin.json`
2. CDS bind: `.cdsrc-private.json` (most secure, cloud-based lookup)
3. Local env: `.env` file with VCAP_SERVICES
4. Custom file via `--conn` parameter
5. Default: `default-env.json`
6. Fallback: `${homedir}/.hana-cli/default.json`

**Usage**:

```javascript
import * as conn from './utils/connections.js'
const envFile = conn.getDefaultEnv()
const pkgJson = conn.getPackageJSON()
```

---

### dbInspect.js

**Module**: `dbInspect` - Database Object Dynamic Inspection and Metadata processing

Provides utilities for inspecting and retrieving metadata about various SAP HANA database objects.

**Key Features**:

- Retrieve HANA database version information
- Inspect views, including calculation views
- Get database object metadata
- Handle different HANA versions (1.x and 2.x)
- Support for column views, calculation views, and structured privileges

**Key Functions**:

- `getHANAVersion(db)` - Return the HANA DB version and major version number
- `isCalculationView(db, schema, viewId)` - Check if a view is a calculation view
- `getView(db, schema, viewId)` - Get DB view details including metadata

**Usage**:

```javascript
import * as dbInspect from './utils/dbInspect.js'
const version = await dbInspect.getHANAVersion(db)
const isCalcView = await dbInspect.isCalculationView(db, 'MYSCHEMA', 'MY_VIEW')
const viewDetails = await dbInspect.getView(db, 'MYSCHEMA', 'MY_VIEW')
```

---

### locale.js

**Module**: Simple locale detection utility

Detects the user's locale from environment variables for internationalization support.

**Key Functions**:

- `getLocale(env)` - Get the locale from environment variables (LC_ALL, LC_MESSAGES, LANG, or LANGUAGE)

**Usage**:

```javascript
import * as locale from './utils/locale.js'
const userLocale = locale.getLocale()
```

---

### sqlInjection.js

**Module**: `sqlInjection` - SQL Injection Protection Utilities

Provides security utilities to protect against SQL injection attacks by validating SQL parameters.

**Key Features**:

- Whitespace character validation
- SQL separator character detection
- Quoted parameter validation
- Token-based parameter validation
- Protection against malicious SQL input

**Key Exports**:

```javascript
export const whitespaceTable   // Table of valid whitespace characters
export const separatorTable    // Table of SQL separator characters
```

**Key Functions**:

- `isAcceptableParameter(value, maxToken)` - Check if a parameter is safe (default: 1 token max)
- `isAcceptableQuotedParameter(value)` - Check if a quoted parameter contains no unescaped quotes

**Usage**:

```javascript
import * as sqlInjection from './utils/sqlInjection.js'
if (sqlInjection.isAcceptableParameter(userInput, 1)) {
    // Safe to use in SQL query
}
```

---

### versionCheck.js

**Module**: Node.js version validation utility

Validates that the current Node.js version meets the requirements specified in package.json.

**Key Functions**:

- `checkVersion()` - Check if the current Node.js version meets the required version

**Usage**:

```javascript
import * as versionCheck from './utils/versionCheck.js'
await versionCheck.checkVersion()
```

---

## CLI Integration Utilities

### btp.js

**Module**: `btp` - Library for calling BTP APIs via CLI

Provides utilities for interacting with SAP Business Technology Platform (BTP) via the btp CLI.

**Key Features**:

- BTP CLI version detection
- Configuration file parsing
- Service instance management
- Global account and subaccount targeting

**Key Constants**:

- `globalAccount`, `subAccount`, `hanaCloudTools`, `applicationStudio`, `hanaPlanName`

**Key Functions**:

- `getVersion()` - Get btp CLI version
- `getInfo()` - Get btp CLI info (configuration, server URL, user)
- `getBTPConfig()` - Read central configuration file for BTP CLI

**Usage**:

```javascript
import * as btp from './utils/btp.js'
const version = await btp.getVersion()
const info = await btp.getInfo()
const config = await btp.getBTPConfig()
```

---

### cf.js

**Module**: `cf` - Library for calling CF APIs via CLI

Provides utilities for interacting with Cloud Foundry via the cf CLI.

**Key Features**:

- CF CLI version detection
- Organization and space management
- Configuration file parsing (~/.cf/config.json)
- Target information retrieval

**Key Functions**:

- `getVersion()` - Get cf CLI version
- `getCFConfig()` - Read central configuration file for CF CLI
- `getCFOrg()` / `getCFOrgName()` / `getCFOrgGUID()` - Get target organization details
- `getCFSpace()` / `getCFSpaceName()` / `getCFSpaceGUID()` - Get target space details

**Usage**:

```javascript
import * as cf from './utils/cf.js'
const version = await cf.getVersion()
const orgName = await cf.getCFOrgName()
const spaceName = await cf.getCFSpaceName()
```

---

### xs.js

**Module**: `xs` - Library for calling XSA APIs via CLI

Provides utilities for interacting with SAP XS Advanced (XSA) via the xs CLI.

**Key Features**:

- XSA configuration file parsing (~/.xsconfig)
- Organization and space management for XSA
- Similar API to cf.js for consistency

**Key Functions**:

- `getCFConfig()` - Read central configuration file for XSA CLI
- `getCFOrg()` / `getCFOrgName()` / `getCFOrgGUID()` - Get target organization details
- `getCFSpace()` / `getCFSpaceName()` / `getCFSpaceGUID()` - Get target space details

**Usage**:

```javascript
import * as xs from './utils/xs.js'
const config = await xs.getCFConfig()
const orgName = await xs.getCFOrgName()
```

---

## Database Utilities

### massConvert.js

**Module**: Mass conversion utilities for database objects

Provides functionality for bulk conversion and export of database objects (tables, views) to various formats.

**Key Features**:

- Convert multiple tables to HDI artifact formats (.hdbtable)
- Convert views to HDI formats
- Progress bar visualization
- ZIP file generation for exports
- Error logging and handling
- Support for SQL-based and CDS-based outputs

**Key Functions**:

- `hdbtableTablesSQL(prompts, results, wss, db, schema, replacer, zip, logOutput)` - Convert tables to .hdbtable SQL format
- `hdbtableViewsSQL(prompts, viewResults, wss, db, schema, replacer, zip, logOutput)` - Convert views to .hdbtable SQL format
- `getProcessBarTableOptions(prompts, length)` - Build progress bar options for tables
- `getProcessBarViewOptions(prompts, length)` - Build progress bar options for views

**Usage**:

```javascript
import * as massConvert from './utils/massConvert.js'
// Used internally by mass conversion commands
```

---

## database/ Subfolder

The `database/` subfolder contains database-specific client implementations that provide abstraction over different database types.

### index.js

**Module**: Abstract database client super class

Base class that provides a common interface for all database-specific implementations.

**Key Features**:

- Factory pattern for database client instantiation
- Supports HANA (CDS and direct), PostgreSQL, and SQLite
- Connection management (connect/disconnect)
- Schema targeting
- Profile-based configuration
- Credential management

**Key Class**: `dbClientClass`

**Key Methods**:

- `static async getNewClient(prompts)` - Factory method to create the appropriate database client based on profile
- `async connect()` - Connect to the target database
- `async disconnect()` - Disconnect from the target database
- `async connectTargetSchema(schema)` - Connect to a specific schema
- `async listTables()` - Abstract method implemented by subclasses
- `getDB()` / `setDB(db)` - Getter/setter for database connection
- `getPrompts()` - Get current prompts
- `schemaCalculation(prompts, optionsCDS)` - Calculate schema name from options

**Supported Database Kinds**:

- `hana` - SAP HANA via CDS
- `postgres` - PostgreSQL via CDS
- `sqlite` - SQLite via CDS
- `hybrid` / no profile - SAP HANA direct connection (non-CDS)

---

### hanaCDS.js

**Module**: Database Client for HANA via CDS

Extends `dbClientClass` to provide HANA-specific functionality using SAP CAP/CDS.

**Key Features**:

- CDS-based querying
- Schema calculation and filtering
- Table listing with metadata

**Key Methods**:

- `async listTables()` - Get list of tables from HANA database using CDS query builder

---

### hanaDirect.js

**Module**: Database Client for HANA Direct Connection (non-CDS)

Extends `dbClientClass` to provide direct HANA connectivity without CDS.

**Key Features**:

- Direct HANA connection using sap-hdb-promisfied
- Raw SQL execution
- Independent of CAP/CDS project structure

**Key Methods**:

- `async connect()` - Connect to HANA database directly
- `async disconnect()` - Disconnect from HANA database
- `async listTables()` - Get list of tables using direct SQL queries
- `async execSQL(query)` - Execute SQL query directly on HANA

**Usage**: Automatically selected when no CDS profile is specified.

---

### postgres.js

**Module**: Database Client for PostgreSQL via CDS

Extends `dbClientClass` to provide PostgreSQL-specific functionality using SAP CAP/CDS.

**Key Features**:

- PostgreSQL schema management (search_path)
- CDS query builder for PostgreSQL
- Information schema integration

**Key Methods**:

- `async listTables()` - Get list of tables from PostgreSQL database using CDS

---

### sqlite.js

**Module**: Database Client for SQLite via CDS

Extends `dbClientClass` to provide SQLite-specific functionality using SAP CAP/CDS.

**Key Features**:

- SQLite schema introspection
- Lightweight database support
- Ideal for local development and testing

**Key Methods**:

- `async listTables()` - Get list of tables from SQLite database using sqlite_schema

---

## Usage Examples

### Establishing a Database Connection

```javascript
import * as base from './utils/base.js'

// Set prompts
const prompts = {
    admin: false,
    schema: 'MYSCHEMA',
    table: '*',
    limit: 100
}
base.setPrompts(prompts)

// Create connection
const db = await base.createDBConnection()

// Use database connection
const version = await dbInspect.getHANAVersion(db)
console.log(`HANA Version: ${version.VERSION}`)
```

### Using Database Client Factory

```javascript
import DBClientClass from './utils/database/index.js'

// Get appropriate database client based on prompts
const prompts = { 
    profile: 'development',  // or 'production', 'hybrid', etc.
    table: 'MY_TABLE',
    limit: 50
}

const dbClient = await DBClientClass.getNewClient(prompts)
await dbClient.connect()

// List tables
const tables = await dbClient.listTables()
console.log(tables)

// Cleanup
await dbClient.disconnect()
```

### Security: Validating User Input

```javascript
import * as sqlInjection from './utils/sqlInjection.js'

function executeQuery(userTableName) {
    // Validate input before using in SQL
    if (!sqlInjection.isAcceptableParameter(userTableName, 1)) {
        throw new Error('Invalid table name: possible SQL injection attempt')
    }
    
    // Safe to use in query
    const query = `SELECT * FROM ${userTableName}`
    // ... execute query
}
```

### Finding Configuration Files

```javascript
import * as conn from './utils/connections.js'

// Search for configuration files
const defaultEnv = conn.getDefaultEnv()
const packageJson = conn.getPackageJSON()
const mtaYaml = conn.getMTA()

if (defaultEnv) {
    console.log(`Found default-env.json at: ${defaultEnv}`)
}
```

### Using Terminal UI Components

```javascript
import * as base from './utils/base.js'

// Start spinner
base.startSpinnerInt()
// ... perform long operation
base.stopSpinnerInt()

// Display colored output
console.log(base.colors.green('Success!'))
console.log(base.colors.red('Error!'))

// Display data as table
const data = [
    { name: 'Table1', rows: 100 },
    { name: 'Table2', rows: 200 }
]
base.terminal.table(data, base.tableOptions)
```

### Checking BTP/CF Configuration

```javascript
import * as btp from './utils/btp.js'
import * as cf from './utils/cf.js'

// Check BTP CLI
try {
    const btpVersion = await btp.getVersion()
    const btpInfo = await btp.getInfo()
    console.log(`BTP CLI Version: ${btpVersion}`)
    console.log(`Server URL: ${btpInfo.serverURL}`)
} catch (error) {
    console.log('BTP CLI not configured')
}

// Check CF CLI
try {
    const cfVersion = await cf.getVersion()
    const orgName = await cf.getCFOrgName()
    const spaceName = await cf.getCFSpaceName()
    console.log(`CF CLI Version: ${cfVersion}`)
    console.log(`Org: ${orgName}, Space: ${spaceName}`)
} catch (error) {
    console.log('CF CLI not configured')
}
```

---

## Architecture Notes

### Modular Design

The utilities are designed to be modular and reusable across the CLI tool. Each module has a specific responsibility and can be used independently or in combination with others.

### Database Abstraction

The `database/` subfolder implements a factory pattern with a common abstract base class, allowing the CLI to work with multiple database types (HANA, PostgreSQL, SQLite) through a unified interface.

### Security First

SQL injection protection is built into the core utilities and should be used whenever constructing SQL queries with user input.

### Internationalization

The base module integrates with SAP's text bundle system for i18n support, allowing the CLI to be localized to different languages.

### Connection Flexibility

The connection utilities support multiple methods of providing credentials, from local files to secure cloud-based lookups, giving users flexibility in how they manage sensitive information.

---

## Contributing

When adding new utilities to this folder:

1. **Follow the module pattern**: Export modules with ES6 `export` syntax
2. **Document your functions**: Use JSDoc comments for all exported functions
3. **Add to this README**: Update this document with your new utility's description and usage examples
4. **Handle errors gracefully**: Use try-catch blocks and provide meaningful error messages
5. **Security first**: Always validate user input, especially for SQL operations
6. **Test your code**: Ensure your utilities work with different database types and configurations

---

## See Also

- [Main Project README](../README.md)
- [Changelog](../CHANGELOG.md)
- [SAP HANA Developer Guide](https://help.sap.com/docs/HANA_CLOUD_DATABASE)
- [SAP CAP Documentation](https://cap.cloud.sap/docs/)
