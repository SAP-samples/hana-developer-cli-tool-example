---
description: "Use when creating or updating shared utility modules. Enforces consistent patterns for error handling, internationalization, type safety, lazy loading, caching, and integration with the CLI infrastructure. Ensures utilities are reusable, maintainable, and follow established conventions."
applyTo: "utils/*.js"
---

# Utility Module Development Guidelines

Use this guide when creating or modifying JavaScript utility files in the `utils/` directory (excluding `utils/database/` which has separate instructions).

## Scope and Purpose

This guide applies to shared utility modules in `utils/` that provide common functionality across CLI commands, routes, and other components. Key modules include:
- `base.js` / `base-lite.js` - Core functionality and database connections
- `connections.js` - Connection parameter resolution
- `locale.js` - Locale detection and normalization
- `sqlInjection.js` - SQL injection prevention
- `commandSuggestions.js` - Command suggestion system
- `config-loader.js` - Configuration file loading
- `massConvert.js`, `massExport.js`, etc. - Bulk operation utilities
- `dbInspect.js` - Database schema inspection
- `doc-linker.js` - Documentation cross-linking
- `versionCheck.js` - Version validation

## Critical Principles

1. **Type Safety**: Use `@ts-check` and JSDoc annotations for type information
2. **Lazy Loading**: Defer expensive imports until needed to optimize startup time
3. **Internationalization**: All user-facing strings must use `bundle.getText()`
4. **Error Handling**: Provide clear, actionable error messages with context
5. **Debug Support**: Use `base.debug()` for diagnostic logging
6. **Caching**: Implement intelligent caching for expensive operations
7. **Pure Functions**: Prefer stateless functions with predictable behavior
8. **Configuration**: Support configuration overrides from config files

## File Structure Template

```javascript
/*eslint-env node, es6 */
// @ts-check

/**
 * @module moduleName - Brief description of module purpose
 */

// Standard imports
import * as base from "./base.js"
import * as fs from 'fs'
import * as path from 'path'

// Module-level state (minimize)
const cache = new Map()

/**
 * Main function documentation
 * @param {string} param1 - Description
 * @param {number} [param2] - Optional parameter
 * @returns {Promise<ReturnType>} Description of return value
 */
export async function mainFunction(param1, param2) {
    base.debug(base.bundle.getText("debug.call", ["mainFunction"]))
    
    try {
        // Implementation
        return result
    } catch (error) {
        throw new Error(base.bundle.getText("error.specificError", [param1]))
    }
}
```

## Lazy Loading Pattern

### Pattern: Defer Expensive Imports

```javascript
// ❌ WRONG - Eager loading slows startup
import inquirer from 'inquirer'
import { glob } from 'glob'

// ✅ CORRECT - Lazy load when needed
let inquirerPrompts = null
const getInquirer = async () => {
    if (!inquirerPrompts) {
        inquirerPrompts = await import('@inquirer/prompts')
    }
    return inquirerPrompts
}

// Usage
export async function prompt(questions) {
    const inquirer = await getInquirer()
    return await inquirer.select(questions)
}
```

### Pattern: Conditional Heavy Imports

```javascript
// Import heavy modules only when actually used
export async function exportToExcel(data) {
    base.debug("Lazy loading ExcelJS...")
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    // ... Excel operations
}
```

## Debug Logging Pattern

### Pattern: Use base.debug() for Diagnostic Logging

```javascript
import * as base from "./base.js"

/**
 * Debug instance with lazy initialization
 */
export const debug = (...args) => {
    // Check if DEBUG was enabled at runtime
    if (process.env.DEBUG && !_debugEnabled) {
        _debugInstance = null
        _debugEnabled = true
    }
    
    if (!_debugInstance) {
        if (process.env.DEBUG) {
            _debugInstance = debugModule('hana-cli')
            _debugEnabled = true
        } else {
            _debugInstance = () => {} // No-op when disabled
            _debugEnabled = false
        }
    }
    return _debugInstance(...args)
}

// Usage in functions
export function processData(data) {
    base.debug(base.bundle.getText("debug.processingData", [data.length]))
    base.debug("Processing steps:", data)
    // ... implementation
}
```

### Debug Message Guidelines

```javascript
// ✅ GOOD - Informative debug messages
base.debug(base.bundle.getText("debug.call", ["functionName"]))
base.debug(base.bundle.getText("debug.connDetails", [host, port]))
base.debug("Cache hit for key:", cacheKey)

// ❌ BAD - Not helpful
base.debug("here")
base.debug("test")
```

## Internationalization Pattern

### Pattern: Always Use Bundles for User-Facing Strings

```javascript
import * as baseLite from './base-lite.js'
const bundle = baseLite.bundle

// ✅ CORRECT - Translatable
export function validateInput(value) {
    if (!value) {
        throw new Error(bundle.getText("error.valueRequired"))
    }
    return true
}

// ❌ WRONG - Hardcoded English
export function validateInput(value) {
    if (!value) {
        throw new Error("Value is required")
    }
    return true
}
```

### Pattern: Bundle Loading with Fallback

```javascript
import { TextBundle } from '@sap/textbundle'
import * as locale from './locale.js'

/**
 * Load additional text resources for a given base name and locale
 * @param {string} baseName - Base name of properties file
 * @param {string} localeTag - Locale identifier (e.g., 'de_DE')
 * @returns {Record<string, string>} Key-value pairs from properties file
 */
function loadAdditionalBundle(baseName, localeTag) {
    try {
        const normalizedLocale = locale.normalizeLocale(localeTag)
        const bundle = new TextBundle(
            path.join(__dirname, '../_i18n', `${baseName}.properties`),
            normalizedLocale
        )
        return bundle
    } catch (error) {
        base.debug(`Failed to load bundle ${baseName}: ${error.message}`)
        // Return empty bundle on failure
        return { getText: (key) => key }
    }
}
```

## Caching Patterns

### Pattern: File System Cache

```javascript
const fileCheckCache = new Map()

/**
 * Check for file existence with caching
 * @param {string} filename - File to search for
 * @param {number} maxDepth - Maximum directory depth (default: 5)
 * @returns {string|undefined} Full path if found
 */
export function getFileCheckParents(filename, maxDepth = 5) {
    const cacheKey = `${process.cwd()}|${filename}|${maxDepth}`
    
    // Check cache first
    if (fileCheckCache.has(cacheKey)) {
        return fileCheckCache.get(cacheKey) || undefined
    }
    
    // Search file system
    let currentPath = '.'
    for (let i = 0; i < maxDepth; i++) {
        const fullPath = path.join(currentPath, filename)
        if (fs.existsSync(fullPath)) {
            fileCheckCache.set(cacheKey, fullPath)
            return fullPath
        }
        currentPath = path.join(currentPath, '..')
    }
    
    // Cache negative result
    fileCheckCache.set(cacheKey, null)
    return undefined
}
```

### Pattern: Configuration Cache

```javascript
const cdsrcPrivateCache = new Map()

/**
 * Load .cdsrc-private.json with caching
 * @param {string} [filename] - Config file name
 * @returns {Object} Parsed configuration object
 */
export function getCdsrcPrivate(filename = '.cdsrc-private.json') {
    const filePath = getFileCheckParents(filename)
    
    if (!filePath) {
        return {}
    }
    
    // Check cache
    if (cdsrcPrivateCache.has(filePath)) {
        return cdsrcPrivateCache.get(filePath)
    }
    
    // Load and cache
    try {
        const config = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        cdsrcPrivateCache.set(filePath, config)
        return config
    } catch (error) {
        base.debug(`Failed to parse ${filePath}: ${error.message}`)
        return {}
    }
}
```

### Cache Invalidation

```javascript
// Provide cache clearing when needed
export function clearFileCache() {
    fileCheckCache.clear()
    cdsrcPrivateCache.clear()
    base.debug("File caches cleared")
}
```

## Error Handling Patterns

### Pattern: Descriptive Error Messages with Context

```javascript
/**
 * Load connection configuration
 * @param {Object} prompts - Command prompts
 * @returns {Promise<Object>} Connection configuration
 * @throws {Error} If configuration is invalid or missing
 */
export async function getConnOptions(prompts) {
    try {
        const configPath = getFileCheckParents('default-env.json')
        
        if (!configPath) {
            throw new Error(base.bundle.getText("error.noConfigFile"))
        }
        
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        
        if (!config.VCAP_SERVICES) {
            throw new Error(
                base.bundle.getText("error.invalidConfig", [configPath])
            )
        }
        
        return parseConnectionConfig(config)
        
    } catch (error) {
        // Enrich error with context
        const enrichedError = new Error(
            base.bundle.getText("error.connConfigFailed", [error.message])
        )
        enrichedError.cause = error
        throw enrichedError
    }
}
```

### Pattern: Validation with Clear Feedback

```javascript
/**
 * Validate limit parameter
 * @param {number} limit - Limit value
 * @returns {number} Validated limit
 * @throws {Error} If limit is invalid
 */
export function validateLimit(limit) {
    if (typeof limit !== 'number') {
        throw new Error(base.bundle.getText("error.limitNotNumber", [typeof limit]))
    }
    
    if (limit < 1) {
        throw new Error(base.bundle.getText("error.limitTooSmall", [limit]))
    }
    
    if (limit > 10000) {
        base.debug(base.bundle.getText("warn.limitLarge", [limit]))
    }
    
    return limit
}
```

## Type Safety with JSDoc

### Pattern: Comprehensive Type Annotations

```javascript
// @ts-check

/**
 * @typedef {Object} ConnectionOptions
 * @property {string} host - Database host
 * @property {number} port - Database port
 * @property {string} [user] - Optional user name
 * @property {string} [password] - Optional password
 * @property {boolean} [useTLS] - Use TLS connection
 */

/**
 * @typedef {Object} QueryResult
 * @property {Array<Object>} rows - Result rows
 * @property {number} rowCount - Number of rows
 * @property {Object} metadata - Query metadata
 */

/**
 * Execute database query with options
 * @param {string} sql - SQL query string
 * @param {Array<any>} [params] - Query parameters
 * @param {ConnectionOptions} options - Connection options
 * @returns {Promise<QueryResult>} Query results
 */
export async function executeQuery(sql, params, options) {
    // Implementation with type checking
}
```

### Pattern: Import Types from Other Modules

```javascript
/**
 * @param {typeof import("../utils/base.js").dbClass} db - Database instance
 * @param {typeof import("./connections.js").ConnectionOptions} options
 * @returns {Promise<void>}
 */
export async function setupDatabase(db, options) {
    // TypeScript will validate types
}
```

## Configuration Management

### Pattern: Load Configuration with Defaults

```javascript
import dotenv from 'dotenv'
import * as xsenv from '@sap/xsenv'

/**
 * Load configuration from multiple sources with priority
 * @returns {Object} Merged configuration
 */
export function loadConfig() {
    const config = {}
    
    // 1. Load environment variables
    dotenv.config()
    
    // 2. Load VCAP services (Cloud Foundry)
    try {
        const services = xsenv.getServices({
            hana: { tag: 'hana' }
        })
        Object.assign(config, services)
    } catch (error) {
        base.debug("No VCAP services found")
    }
    
    // 3. Load local configuration files
    const localConfig = getFileCheckParents('default-env.json')
    if (localConfig) {
        const local = JSON.parse(fs.readFileSync(localConfig, 'utf8'))
        Object.assign(config, local)
    }
    
    // 4. Load user configuration from home directory
    const userConfigPath = path.join(homedir(), '.hana-cli', 'config.json')
    if (fs.existsSync(userConfigPath)) {
        const userConfig = JSON.parse(fs.readFileSync(userConfigPath, 'utf8'))
        Object.assign(config, userConfig)
    }
    
    return config
}

/**
 * Apply configuration to environment variables
 * @param {Object} config - Configuration object
 */
export function applyConfigToEnv(config) {
    if (config.DEBUG) {
        process.env.DEBUG = config.DEBUG
    }
    if (config.NODE_ENV) {
        process.env.NODE_ENV = config.NODE_ENV
    }
    // ... apply other config values
}
```

## SQL Injection Prevention

### Pattern: Parameter Validation

```javascript
/**
 * Validate input to prevent SQL injection
 * @param {string} input - User input
 * @param {string} context - Context for error message
 * @returns {string} Validated input
 * @throws {Error} If input contains suspicious patterns
 */
export function validateSqlInput(input, context) {
    // Check for SQL injection patterns
    const dangerousPatterns = [
        /;\s*DROP/i,
        /;\s*DELETE/i,
        /UNION.*SELECT/i,
        /--.*$/,
        /\/\*.*\*\//
    ]
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(input)) {
            throw new Error(
                base.bundle.getText("error.suspiciousInput", [context, input])
            )
        }
    }
    
    return input
}

/**
 * Escape SQL identifier (table/column name)
 * @param {string} identifier - Identifier to escape
 * @returns {string} Escaped identifier
 */
export function escapeIdentifier(identifier) {
    return `"${identifier.replace(/"/g, '""')}"`
}
```

## Utility Export Patterns

### Pattern: Export Multiple Related Functions

```javascript
// Named exports for tree-shaking
export {
    validateLimit,
    validateSchema,
    validateTable,
    validateColumn
}

// Default export for main utility class
export default class DbInspector {
    constructor(db) {
        this.db = db
    }
    
    async inspect() {
        // Implementation
    }
}
```

### Pattern: Re-export from Index

```javascript
// utils/database/index.js
export { default as DBClient } from './index.js'
export { default as HanaCDSClient } from './hanaCDS.js'
export { default as HanaDirectClient } from './hanaDirect.js'
export { default as PostgresClient } from './postgres.js'
export { default as SQLiteClient } from './sqlite.js'
```

## Common Mistakes to Avoid

❌ **Eager loading heavy dependencies** → Slows CLI startup time significantly

❌ **Hardcoded user-facing strings** → Breaks internationalization

❌ **Missing type annotations** → Reduces type safety and IDE support

❌ **No debug logging** → Makes troubleshooting difficult

❌ **Synchronous file operations in hot paths** → Blocks event loop

❌ **Caching without invalidation strategy** → Stale data issues

❌ **Not handling missing config files gracefully** → Poor user experience

❌ **Throwing generic errors without context** → Hard to diagnose issues

## Testing Considerations

```javascript
/**
 * Design utilities to be testable
 */

// ✅ GOOD - Pure function, easy to test
export function parseConnectionString(connStr) {
    const parts = connStr.split(':')
    return {
        host: parts[0],
        port: parseInt(parts[1], 10)
    }
}

// ❌ BAD - Relies on global state, hard to test
export function getConnection() {
    return globalDb.connection
}
```

## Performance Optimization

### Pattern: Batch Operations

```javascript
/**
 * Process items in batches to avoid memory issues
 * @param {Array<any>} items - Items to process
 * @param {Function} processor - Processing function
 * @param {number} batchSize - Batch size
 */
export async function processBatches(items, processor, batchSize = 100) {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        await Promise.all(batch.map(processor))
        base.debug(`Processed batch ${i / batchSize + 1}`)
    }
}
```

## Documentation Requirements

Every exported function should have:
- Clear JSDoc with `@param`, `@returns`, `@throws`
- Type annotations for parameters and return values
- Brief description of purpose and behavior
- Examples of typical usage (in comments or separate examples file)
- Notes about performance characteristics if relevant

## Reference Examples in This Repository

- `utils/base.js` - Core utilities and database connections
- `utils/connections.js` - Configuration loading and caching
- `utils/locale.js` - Simple utility with clear purpose
- `utils/commandSuggestions.js` - String matching algorithms
- `utils/massConvert.js` - Complex batch operations with progress
- `utils/config-loader.js` - Multi-source configuration loading
