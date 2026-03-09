---
description: "Use when creating or updating database-specific client adapters. Enforces abstract base class extension patterns, required method implementations, connection lifecycle management, profile-based factory patterns, and integration with CDS and direct connection modes. Ensures consistent database abstraction across HANA, PostgreSQL, and SQLite."
applyTo: "utils/database/*.js"
---

# Database Client Implementation Guidelines

Use this guide when creating or modifying database client adapter files in the `utils/database/` directory.

## Scope and Purpose

This guide applies to database-specific client implementations that provide a unified interface for database operations across different database systems and connection modes:

- `index.js` - Abstract base class `dbClientClass`
- `hanaCDS.js` - SAP HANA via CDS connection
- `hanaDirect.js` - SAP HANA direct connection (non-CDS)
- `postgres.js` - PostgreSQL via CDS connection
- `sqlite.js` - SQLite via CDS connection

## Critical Principles

1. **Abstraction**: All clients extend the abstract `dbClientClass` base class
2. **Factory Pattern**: Use static factory method for client instantiation
3. **Profile-Based**: Support multiple connection profiles (CDS profiles)
4. **Lifecycle Management**: Implement proper connect/disconnect patterns
5. **Error Handling**: Provide database-specific error enrichment
6. **Type Safety**: Use JSDoc and TypeScript annotations
7. **Credential Security**: Handle credentials safely, never log passwords
8. **Graceful Degradation**: Handle missing credentials and connection failures

## Abstract Base Class Pattern

### Base Class Structure: `utils/database/index.js`

```javascript
import * as base from '../base.js'
import cds from '@sap/cds'

/**
 * Database Client Abstract Super Class 
 * @class
 * @constructor
 * @public
 * @classdesc Database Client Abstract Level
 */
export default class dbClientClass {
    /**
     * Prompts current value
     * @type {typeof import("prompt")}
     */
    #prompts
    
    /**
     * CDS connection options
     * @type {Object}
     */
    #optionsCDS
    
    /**
     * CDS connection object - returned from cds.connect.to or hdb module instance
     * @type {Object}
     */
    #db
    
    /**
     * Database Client type/flavor
     * @type {String}
     */
    #clientType = 'generic'

    /**
     * Create an instance of the database client
     * @param {typeof import("prompt")} prompts - Input prompts current value
     * @param {Object} [optionsCDS] - Optional CDS connection options
     */
    constructor(prompts, optionsCDS) {
        this.#prompts = prompts
        this.#optionsCDS = optionsCDS
        base.setPrompts(prompts)
        base.debug(base.bundle.getText("debug.dbClientGenericProfile", [this.#prompts.profile]))
    }

    /**
     * Static Factory Method to initialize the DB Client in your selected Flavor
     * @param {object} prompts - Processed input prompts
     * @returns {Promise<dbClientClass>} Flavor-specific DB client class instance
     */
    static async getNewClient(prompts) {
        let childClass = Object
        
        if (!prompts.profile) {
            // HANA Without CDS - Direct connection
            prompts.profile = 'hybrid'
            const { default: classAccess } = await import("./hanaDirect.js")
            childClass = new classAccess(prompts)
        } else {
            // CDS based connectivity
            process.env.CDS_ENV = prompts.profile
            process.env.NODE_ENV = prompts.profile
            let optionsCDS = cds.env.requires.db
            
            if (!optionsCDS || !optionsCDS.kind) {
                throw new Error(base.bundle.getText("error.cdsProjectMissing"))
            }
            
            // Load credentials from connections utility
            const conn = await import("../connections.js")
            const credentials = await conn.getConnOptions(prompts)
            
            if (optionsCDS.kind === 'sqlite') {
                if (credentials && credentials.sqlite) {
                    optionsCDS.credentials = credentials.sqlite
                }
                const { default: classAccess } = await import("./sqlite.js")
                childClass = new classAccess(prompts, optionsCDS)
            }
            else if (optionsCDS.kind === 'postgres') {
                if (credentials && credentials.postgres) {
                    optionsCDS.credentials = credentials.postgres
                }
                const { default: classAccess } = await import("./postgres.js")
                childClass = new classAccess(prompts, optionsCDS)
            }
            else if (optionsCDS.kind === 'hana') {
                if (credentials && credentials.hana) {
                    optionsCDS.credentials = credentials.hana
                }
                const { default: classAccess } = await import("./hanaCDS.js")
                childClass = new classAccess(prompts, optionsCDS)
            }
            else {
                throw new Error(base.bundle.getText("error.unsupportedDbClient", [optionsCDS.kind]))
            }
        }
        return childClass
    }

    // Protected getters/setters
    getDB() { return this.#db }
    setDB(db) { this.#db = db }
    getPrompts() { return this.#prompts }
    getOptionsCDS() { return this.#optionsCDS }

    /**
     * Abstract method - must be implemented by child classes
     * @returns {Promise<object>}
     */
    async connect() {
        throw new Error(base.bundle.getText("error.abstractMethod", ["connect"]))
    }

    /**
     * Abstract method - must be implemented by child classes
     * @returns {Promise<void>}
     */
    async disconnect() {
        throw new Error(base.bundle.getText("error.abstractMethod", ["disconnect"]))
    }

    /**
     * Abstract method - must be implemented by child classes
     * @returns {Promise<Array>}
     */
    async listTables() {
        throw new Error(base.bundle.getText("error.abstractMethod", ["listTables"]))
    }
}
```

## CDS-Based Client Implementation Pattern

### Example: HANA CDS Client (`hanaCDS.js`)

```javascript
import DBClientClass from "./index.js"
import * as base from '../base.js'
import cds from '@sap/cds'

/**
 * Database Client for HANA via CDS
 * @extends DBClientClass
 */
export default class extends DBClientClass {
    #clientType = 'hanaCDS'
    #schema
    
    /**
     * Create an instance of the HANA CDS database client
     * @param {typeof import("prompt")} prompts - Input prompts current value
     * @param {Object} optionsCDS - CDS connection options
     */
    constructor(prompts, optionsCDS) {
        super(prompts, optionsCDS)
        base.debug(base.bundle.getText("debug.dbClientSpecificProfile", [prompts.profile]))
    }

    /**
     * Connect to HANA database via CDS
     * @returns {Promise<object>} CDS connection object
     */
    async connect() {
        const optionsCDS = super.getOptionsCDS()
        this.#db = await cds.connect.to(optionsCDS)
        this.#connectLogging()
        super.setDB(this.#db)
        return this.#db
    }
    
    /**
     * Disconnect from HANA database
     * @returns {Promise<void>}
     */
    async disconnect() {
        base.debug(base.bundle.getText("debug.dbDisconnectCalled"))
        const prompts = super.getPrompts()
        
        if (!base.isGui(prompts)) {
            base.debug(base.bundle.getText("debug.cdsExitCalled"))
            await cds.exit()
        }
        // Connection cleanup handled naturally by CDS
    }

    /**
     * Connect to specific schema
     * @param {String} schema - Database Schema name
     * @returns {Promise<object>} CDS connection object
     */
    async connectTargetSchema(schema) {
        let optionsCDS = super.getOptionsCDS()
        optionsCDS.credentials.schema = schema
        this.#schema = schema
        this.#db = await cds.connect.to(optionsCDS)
        this.#connectLogging()
        super.setDB(this.#db)
        return this.#db
    }

    /**
     * Set logging parameters upon connect
     * Deactivate most logging unless in debug mode
     */
    #connectLogging() {
        const prompts = super.getPrompts()
        if (!prompts.debug) {
            cds.log('pool', 'log')
        }
        if (base.verboseOutput(prompts)) {
            const optionsCDS = super.getOptionsCDS()
            console.log(`${base.bundle.getText("connFile2")} ${base.bundle.getText("cds.profiles", [optionsCDS.kind])} \n`)
        }
    }

    /**
     * Database specific wildcard handling 
     * @param {String} input - Database object name that needs wildcard handling
     * @returns {String} Adjusted wildcard
     */
    adjustWildcard(input) {
        base.debug(base.bundle.getText("debug.call", ["adjustWildcard"]))
        if (input == "*") {
            input = "%"
        }
        return input
    }

    /**
     * Get list of tables from HANA database
     * @returns {Promise<Array>} Array of table objects
     */
    async listTables() {
        base.debug(base.bundle.getText("debug.dbListTablesForClient", [this.#clientType]))
        const db = super.getDB()
        const prompts = super.getPrompts()

        prompts.limit = base.validateLimit(prompts.limit)
        const schema = prompts.schema || await base.dbInspect.getClientCurrentSchema(db)
        const table = this.adjustWildcard(prompts.table)

        const query = `SELECT SCHEMA_NAME, TABLE_NAME, TABLE_OID, COMMENTS 
                       FROM SYS.TABLES 
                       WHERE SCHEMA_NAME LIKE ? 
                         AND TABLE_NAME LIKE ? 
                       ORDER BY SCHEMA_NAME, TABLE_NAME 
                       LIMIT ?`

        const results = await this.execSQL(query, [schema, table, prompts.limit])
        return results
    }

    /**
     * Execute SQL statement and return result set
     * @param {string} query - SQL Statement
     * @param {Array<any>} [params] - Optional parameter bindings
     * @returns {Promise<any>} Result set object
     */
    async execSQL(query, params) {
        base.debug(base.bundle.getText("debug.dbExecSqlForClient", [this.#clientType]))
        const db = super.getDB()
        
        if (params && Array.isArray(params) && params.length > 0) {
            return await db.run(query, params)
        }
        return await db.run(query)
    }
}
```

## Direct Connection Pattern (Non-CDS)

### Example: HANA Direct Client (`hanaDirect.js`)

```javascript
import DBClientClass from "./index.js"
import * as base from '../base.js'

/**
 * Database Client for HANA Direct Connection (non-CDS)
 * @extends DBClientClass
 */
export default class extends DBClientClass {
    #clientType = 'hanaDirect'
    #schema
    
    /**
     * Create an instance of the HANA Direct database client
     * @param {typeof import("prompt")} prompts - Input prompts current value
     */
    constructor(prompts) {
        super(prompts)
        base.debug(base.bundle.getText("debug.dbClientSpecificProfile", [prompts.profile]))
    }

    /**
     * Connect to HANA database directly (using hdb module)
     * @returns {Promise<object>} Database connection object
     */
    async connect() {
        const db = await base.createDBConnection()
        super.setDB(db)
        return db
    }
    
    /**
     * Disconnect from HANA database
     * @returns {Promise<void>}
     */
    async disconnect() {
        base.debug(base.bundle.getText("debug.dbDisconnectCalled"))
        // Don't call base.end() as it exits the process
        // Instead use disconnectOnly to cleanup connection without exiting
        await base.disconnectOnly()
    }

    /**
     * Get list of tables from HANA database
     * @returns {Promise<Array>} Array of table objects
     */
    async listTables() {
        base.debug(base.bundle.getText("debug.dbListTablesForClient", [this.#clientType]))
        const db = super.getDB()
        const prompts = super.getPrompts()

        prompts.limit = base.validateLimit(prompts.limit)
        const schema = prompts.schema || await base.dbInspect.getCurrentSchema()
        const table = this.adjustWildcard(prompts.table)

        const query = `SELECT SCHEMA_NAME, TABLE_NAME, TABLE_OID, COMMENTS 
                       FROM SYS.TABLES 
                       WHERE SCHEMA_NAME LIKE ? 
                         AND TABLE_NAME LIKE ? 
                       ORDER BY SCHEMA_NAME, TABLE_NAME 
                       LIMIT ?`

        const statement = await db.prepare(query)
        const results = await db.all(statement, [schema, table, prompts.limit])
        return results
    }

    /**
     * Execute SQL statement
     * @param {string} query - SQL Statement
     * @param {Array<any>} [params] - Optional parameter bindings
     * @returns {Promise<any>} Result set
     */
    async execSQL(query, params) {
        base.debug(base.bundle.getText("debug.dbExecSqlForClient", [this.#clientType]))
        const db = super.getDB()
        
        const statement = await db.prepare(query)
        if (params && Array.isArray(params) && params.length > 0) {
            return await db.all(statement, params)
        }
        return await db.all(statement)
    }
    
    /**
     * Adjust wildcard character for HANA
     * @param {String} input - Input with wildcard
     * @returns {String} Adjusted wildcard
     */
    adjustWildcard(input) {
        if (input == "*") {
            input = "%"
        }
        return input
    }
}
```

## Required Method Implementations

Every database client MUST implement these methods:

### 1. `connect()` - Establish Database Connection

```javascript
/**
 * Connect to the target database
 * @returns {Promise<object>} Database connection object
 * @throws {Error} If connection fails
 */
async connect() {
    // Implementation specific to database type
    // Set connection using super.setDB(db)
    // Return connection object
}
```

### 2. `disconnect()` - Close Database Connection

```javascript
/**
 * Disconnect from the target database
 * @returns {Promise<void>}
 */
async disconnect() {
    // Clean up connection resources
    // Handle GUI vs CLI mode differences
    // Don't exit process, just cleanup
}
```

### 3. `listTables()` - Query Database Tables

```javascript
/**
 * Get list of database tables
 * @returns {Promise<Array<TableLine>>} Array of table objects
 */
async listTables() {
    // Execute database-specific query
    // Return standardized result format
    // Apply schema and table filters from prompts
}
```

### 4. `execSQL()` - Execute SQL Statement

```javascript
/**
 * Execute single SQL Statement and return result set
 * @param {string} query - SQL Statement
 * @param {Array<any>} [params] - Optional parameter bindings
 * @returns {Promise<any>} Result set object
 */
async execSQL(query, params) {
    // Execute query with optional parameters
    // Handle database-specific execution method
    // Return results in consistent format
}
```

### 5. `adjustWildcard()` - Handle Wildcard Characters

```javascript
/**
 * Database specific wildcard handling 
 * @param {String} input - Database object name that needs wildcard handling
 * @returns {String} Adjusted wildcard
 */
adjustWildcard(input) {
    // Convert CLI wildcard (*) to database wildcard (%, _, etc.)
    // Different databases may use different wildcards
}
```

## Type Definitions

### Standard Type Definitions

```javascript
/** 
 * TableData as JSON
 * @typedef {Object} TableLine
 * @property {String} [SCHEMA_NAME] - Schema name
 * @property {String} TABLE_NAME - Table name
 * @property {String} [TABLE_OID] - Table object ID
 * @property {String} [COMMENTS] - Table comments/description
 */

/** 
 * TableData as JSON
 * @typedef {Array.<TableLine>} TableData
 */

/**
 * @typedef {Object} ConnectionCredentials
 * @property {string} host - Database host
 * @property {number} port - Database port
 * @property {string} [schema] - Default schema
 * @property {string} [user] - User name
 * @property {string} [password] - Password
 * @property {boolean} [useTLS] - Use TLS/SSL
 */
```

## Connection Lifecycle Management

### Pattern: Proper Connect/Disconnect

```javascript
export async function mainFunction(prompts) {
    const dbClient = await dbClientClass.getNewClient(prompts)
    
    try {
        // Connect
        await dbClient.connect()
        base.debug("Connected to database")
        
        // Perform operations
        const tables = await dbClient.listTables()
        
        // Process results
        base.outputTableFancy(tables)
        
    } catch (error) {
        await base.error(error)
    } finally {
        // Always disconnect
        await dbClient.disconnect()
    }
}
```

### Pattern: Schema Switching

```javascript
/**
 * Connect to a specific schema
 * @param {String} schema - Target schema name
 * @returns {Promise<object>} Connection object
 */
async connectTargetSchema(schema) {
    let optionsCDS = super.getOptionsCDS()
    optionsCDS.credentials.schema = schema
    
    const db = await cds.connect.to(optionsCDS)
    super.setDB(db)
    
    base.debug(`Connected to schema: ${schema}`)
    return db
}
```

## Error Handling Patterns

### Pattern: Database-Specific Error Enrichment

```javascript
async listTables() {
    try {
        const db = super.getDB()
        const results = await db.run(query, params)
        return results
    } catch (error) {
        // Enrich with database-specific context
        if (error.code === 'ECONNREFUSED') {
            throw new Error(
                base.bundle.getText("error.dbConnectionRefused", [
                    this.#clientType,
                    error.message
                ])
            )
        } else if (error.code === 259) { // HANA: insufficient privilege
            throw new Error(
                base.bundle.getText("error.dbInsufficientPrivilege", [
                    error.message
                ])
            )
        }
        throw error
    }
}
```

## Credential Management

### Pattern: Secure Credential Handling

```javascript
/**
 * Load credentials securely
 * @param {Object} prompts - Command prompts
 * @returns {Promise<ConnectionCredentials>}
 */
async #loadCredentials(prompts) {
    const conn = await import("../connections.js")
    const credentials = await conn.getConnOptions(prompts)
    
    // NEVER log passwords
    base.debug(`Connecting to ${credentials.host}:${credentials.port}`)
    base.debug(`User: ${credentials.user}`)
    // ❌ NEVER: base.debug(`Password: ${credentials.password}`)
    
    return credentials
}
```

## Database-Specific Considerations

### HANA-Specific

```javascript
// HANA uses % for LIKE wildcards
adjustWildcard(input) {
    return input === "*" ? "%" : input
}

// HANA system views
const systemCatalog = 'SYS'
```

### PostgreSQL-Specific

```javascript
// PostgreSQL uses public schema by default
const defaultSchema = 'public'

// PostgreSQL information schema
const systemCatalog = 'information_schema'
```

### SQLite-Specific

```javascript
// SQLite doesn't have schemas in the same way
// Use main database
const defaultDatabase = 'main'

// SQLite system tables
const systemCatalog = 'sqlite_master'
```

## Common Mistakes to Avoid

❌ **Not calling super.setDB()** → Other methods can't access connection

❌ **Forgetting to disconnect** → Connection leaks and resource exhaustion

❌ **Hardcoding SQL for one database** → Breaks compatibility with other databases

❌ **Not validating credentials** → Security vulnerabilities

❌ **Calling process.exit() in disconnect** → Breaks when used as library

❌ **Logging passwords or sensitive data** → Security breach

❌ **Not handling connection errors** → Poor user experience

❌ **Missing type definitions** → Reduces type safety

## Testing Database Clients

```javascript
// Test client instantiation
async function testClientFactory() {
    const prompts = {
        profile: 'development',
        schema: 'TEST',
        table: '*',
        limit: 10
    }
    
    const client = await dbClientClass.getNewClient(prompts)
    console.log(`Client type: ${client.constructor.name}`)
    
    await client.connect()
    const tables = await client.listTables()
    console.log(`Found ${tables.length} tables`)
    await client.disconnect()
}
```

## Documentation Requirements

Every database client should document:
- Supported connection modes (CDS vs direct)
- Required credentials format
- Database-specific behaviors and limitations
- SQL dialect differences
- Schema/catalog handling
- Transaction support
- Connection pooling behavior

## Reference Examples in This Repository

- `utils/database/index.js` - Abstract base class
- `utils/database/hanaCDS.js` - CDS-based HANA client
- `utils/database/hanaDirect.js` - Direct HANA client
- `utils/database/postgres.js` - PostgreSQL client
- `utils/database/sqlite.js` - SQLite client
