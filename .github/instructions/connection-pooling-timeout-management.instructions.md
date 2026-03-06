---
description: "Use when creating or updating code that manages database connections. Enforces consistent timeout configuration, proper connection cleanup, graceful error handling, and connection pooling best practices across CLI commands, routes, and tests."
applyTo: "bin/*.js,routes/*.js,tests/**/*.js"
---

# Database Connection Pooling and Timeout Management Guidelines

Use this guide when creating or modifying code that establishes, manages, or disconnects database connections. This applies to CLI commands (`bin/`), API routes (`routes/`), and tests (`tests/`).

## Scope and Purpose

This guide establishes standards for:
- Configurable timeout values (connection, query, operation, disconnect)
- Graceful connection lifecycle management (establishment, usage, cleanup)
- Error handling and recovery patterns
- Connection pooling best practices
- Multi-database support (HANA, PostgreSQL, SQLite)

## Critical Principles

1. **No Hard-Coded Timeouts**: All timeout values must be configurable via environment, constructor, or options parameters. Default values are acceptable; hard-coded values are not.

2. **Proper Cleanup in All Paths**: Connections must be explicitly closed/disconnected in success, error, and timeout scenarios. Use try/finally blocks to guarantee cleanup.

3. **Graceful Degradation on Timeout**: Don't kill the entire process (`process.exit()`) on operation timeouts. Instead, throw an exception that can be caught and handled appropriately by the caller or error middleware.

4. **Connection Establishment Timeout**: Explicitly set a timeout for creating new connections to prevent indefinite hangs if the database is unreachable or unresponsive.

5. **Distinct Timeout Layers**: Implement timeouts at three levels:
   - **Connection timeout** (establishing the connection)
   - **Query/operation timeout** (executing a single query or operation)
   - **Overall operation timeout** (entire command/route processing)

6. **Retry Logic for Transient Failures**: Implement exponential backoff for connection failures due to transient network issues, not permanent failures (authentication, invalid connection details).

7. **Resource Cleanup on Exit**: Ensure database connections are properly disconnected before CLI exit, web server shutdown, or test suite completion.

8. **Connection State Transparency**: Track and expose connection states (connecting, connected, executing, disconnecting) for debugging and monitoring.

## Timeout Configuration Pattern

### Default Timeout Values

Establish sensible defaults at the module level using configuration constants:

```javascript
/**
 * Timeout configuration for database operations.
 * All values in milliseconds. Configurable via environment variables or options.
 */
const TIMEOUT_CONFIG = {
  // Time to establish an initial connection to the database
  connectionTimeout: parseInt(process.env.HANA_CONNECTION_TIMEOUT || '30000'),
  
  // Time to execute a single query
  queryTimeout: parseInt(process.env.HANA_QUERY_TIMEOUT || '300000'), // 5 minutes
  
  // Time to execute an entire operation/command
  operationTimeout: parseInt(process.env.HANA_OPERATION_TIMEOUT || '3600000'), // 1 hour
  
  // Time to gracefully disconnect (before force-close)
  disconnectTimeout: parseInt(process.env.HANA_DISCONNECT_TIMEOUT || '5000'),
  
  // Retry configuration
  retryAttempts: parseInt(process.env.HANA_RETRY_ATTEMPTS || '3'),
  retryBaseDelay: parseInt(process.env.HANA_RETRY_BASE_DELAY || '1000'), // Start at 1 second
}
```

**Environment Variable Naming Convention:**
- Use `HANA_*` prefix for settings related to HANA database
- Use `DB_*` prefix for database-agnostic settings
- Suffix with `_TIMEOUT`, `_RETRY_*`, or `_MAX_*` to indicate purpose

### Passing Timeouts in Options

When creating connections or executing operations, pass timeout values via options:

```javascript
// Creating a connection
const dbOptions = {
  ...connectionDetails,
  connectTimeout: TIMEOUT_CONFIG.connectionTimeout,
  queryTimeout: TIMEOUT_CONFIG.queryTimeout,
}
const connection = await createConnection(dbOptions)

// Executing an operation
const result = await executeWithTimeout(query, {
  timeout: TIMEOUT_CONFIG.queryTimeout,
  operationTimeout: TIMEOUT_CONFIG.operationTimeout,
})
```

### CLI Command Timeout Parameter

For CLI commands that support long-running operations, expose a `--timeout` flag:

```javascript
// In bin/<command>.js builder
export const builder = (yargs) => yargs.options({
  timeout: {
    alias: ['to'],
    type: 'number',
    default: Math.floor(TIMEOUT_CONFIG.operationTimeout / 1000), // Convert to seconds for user input
    describe: baseLite.bundle.getText("commandTimeoutDesc"),
  },
  // ... other options
}).epilog(...)
```

Convert the user-provided value (in seconds) to milliseconds:

```javascript
const operationTimeoutMs = prompts.timeout * 1000
const operationTimeout = setTimeout(() => {
  throw new Error(bundle.getText("error.operationTimeout"))
}, operationTimeoutMs)
```

## Connection Lifecycle Management

### 1. Establishing Connections (CLI Commands)

```javascript
export async function mainFunction(prompts) {
  const base = await import('../utils/base.js')
  base.debug('mainFunction')
  
  // Set operation timeout before any operations
  const operationTimeoutMs = prompts.timeout * 1000
  const operationTimeout = setTimeout(() => {
    throw new Error(bundle.getText("error.operationTimeout"))
  }, operationTimeoutMs)
  
  try {
    base.setPrompts(prompts)
    
    // Create connection with explicit timeout
    const db = await createDBConnectionWithTimeout(
      prompts,
      TIMEOUT_CONFIG.connectionTimeout
    )
    
    // Business logic
    const result = await executeQuery(db, query, {
      timeout: TIMEOUT_CONFIG.queryTimeout,
    })
    
    base.outputTableFancy(result)
  } catch (error) {
    await base.error(error)
  } finally {
    // Guarantee cleanup happens
    clearTimeout(operationTimeout)
    await disconnectGracefully(db, TIMEOUT_CONFIG.disconnectTimeout)
    base.end()
  }
}
```

### 2. Establishing Connections in Routes

Routes should create fresh connections for each request (or reuse via a connection pool if implemented):

```javascript
export async function route(app, server) {
  const base = await import('../utils/base.js')
  
  app.get('/api/endpoint', async (req, res, next) => {
    let db = null
    const operationTimeout = setTimeout(() => {
      const error = new Error('Operation timeout exceeded')
      error.statusCode = 504
      next(error)
    }, TIMEOUT_CONFIG.operationTimeout)
    
    try {
      // Create connection with timeout
      db = await createDBConnectionWithTimeout(
        req.connectionOptions, // from middleware or request context
        TIMEOUT_CONFIG.connectionTimeout
      )
      
      const result = await executeQuery(db, query, {
        timeout: TIMEOUT_CONFIG.queryTimeout,
      })
      
      res.status(200).json(result)
    } catch (error) {
      next(error)
    } finally {
      clearTimeout(operationTimeout)
      if (db) {
        await disconnectGracefully(db, TIMEOUT_CONFIG.disconnectTimeout)
      }
    }
  })
}
```

### 3. Connection Establishment with Timeout

Implement this helper function in `utils/base.js` or `utils/connection-helpers.js`:

```javascript
/**
 * Creates a database connection with an explicit timeout.
 * @param {object} options - Connection options
 * @param {number} timeoutMs - Connection timeout in milliseconds
 * @param {number} retries - Number of retry attempts (default: 3)
 * @returns {Promise<object>} Connected database instance
 * @throws {Error} If connection fails or times out
 */
export async function createDBConnectionWithTimeout(
  options,
  timeoutMs = TIMEOUT_CONFIG.connectionTimeout,
  retries = TIMEOUT_CONFIG.retryAttempts
) {
  let lastError
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connectionPromise = createConnection(options)
      
      // Race between connection and timeout
      const db = await Promise.race([
        connectionPromise,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Connection timeout after ${timeoutMs}ms`)),
            timeoutMs
          )
        ),
      ])
      
      return db
    } catch (error) {
      lastError = error
      debug(`Connection attempt ${attempt}/${retries} failed: ${error.message}`)
      
      // Calculate exponential backoff delay
      if (attempt < retries) {
        const delayMs = TIMEOUT_CONFIG.retryBaseDelay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }
  
  throw new Error(
    `Failed to connect after ${retries} attempts: ${lastError.message}`
  )
}
```

### 4. Graceful Disconnect

```javascript
/**
 * Gracefully disconnects from the database with a timeout.
 * If disconnect takes too long, closes forcefully.
 * @param {object} db - Database connection instance
 * @param {number} timeoutMs - Disconnect timeout in milliseconds
 */
export async function disconnectGracefully(
  db,
  timeoutMs = TIMEOUT_CONFIG.disconnectTimeout
) {
  if (!db) return
  
  try {
    await Promise.race([
      db.disconnect(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Disconnect timeout')),
          timeoutMs
        )
      ),
    ])
  } catch (error) {
    debug(`Disconnect timeout or error: ${error.message}`)
    try {
      // Force close if graceful disconnect fails
      db = null
    } catch (forceCloseError) {
      debug(`Force close error: ${forceCloseError.message}`)
    }
  }
}
```

## Error Handling Patterns

### Do NOT Use `process.exit()` in Graceful Error Scenarios

**❌ BAD** - Kills entire process:

```javascript
const timeout = setTimeout(() => {
  console.error('Operation timeout')
  process.exit(1)  // Terminates immediately, no cleanup
}, operationTimeoutMs)
```

**✅ GOOD** - Throws exception that can be caught:

```javascript
const timeout = setTimeout(() => {
  throw new Error('Operation timeout')
}, operationTimeoutMs)

try {
  // Business logic
} catch (error) {
  // Can gracefully handle, cleanup, and return error response
  await base.error(error)
} finally {
  clearTimeout(timeout)
}
```

### Handle Transient vs. Permanent Failures

```javascript
/**
 * Determines if an error is transient (retry-worthy) or permanent.
 * @param {Error} error
 * @returns {boolean}
 */
function isTransientError(error) {
  // Transient: network, timeout, resource exhaustion
  const transientPatterns = [
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'timeout',
    'temporarily unavailable',
    'connection pool exhausted',
  ]
  
  return transientPatterns.some(pattern =>
    error.message.toLowerCase().includes(pattern.toLowerCase())
  )
}

// Use in retry logic
if (attempt < retries && isTransientError(error)) {
  // Retry with backoff
} else {
  // Permanent failure, don't retry
  throw error
}
```

## Connection State Tracking (Optional but Recommended)

For complex operations, track connection state:

```javascript
const connectionState = {
  status: 'idle', // idle | connecting | connected | querying | disconnecting
  lastError: null,
  connectionStartTime: null,
  queryStartTime: null,
}

function setConnectionState(state, error = null) {
  connectionState.status = state
  connectionState.lastError = error
  if (state === 'connecting') {
    connectionState.connectionStartTime = Date.now()
  } else if (state === 'querying') {
    connectionState.queryStartTime = Date.now()
  }
  debug(`Connection state changed to: ${state}`)
}
```

## Test Timeout Configuration

In test files, set appropriate timeouts based on operation type:

```javascript
describe('Database Operations', function () {
  // Connection establishment tests: 15 seconds
  this.timeout(15000)
  
  it('should establish connection within timeout', async function () {
    this.timeout(10000) // Override for specific test
    const db = await createDBConnectionWithTimeout(options, 5000)
    expect(db).to.exist
  })
  
  // Complex operations: 30 seconds
  describe('Complex Queries', function () {
    this.timeout(30000)
    
    it('should execute complex query', async function () {
      // Test logic
    })
  })
})
```

## Multi-Database Support

When supporting multiple database types (HANA, PostgreSQL, SQLite), ensure timeout patterns are consistent:

```javascript
const DATABASE_TIMEOUTS = {
  hana: {
    connectionTimeout: 30000,
    queryTimeout: 300000,
    operationTimeout: 3600000,
  },
  postgresql: {
    connectionTimeout: 15000,
    queryTimeout: 300000,
    operationTimeout: 3600000,
  },
  sqlite: {
    connectionTimeout: 5000, // File-based, minimal timeout
    queryTimeout: 60000,
    operationTimeout: 600000,
  },
}

// In connection establishment
const dbType = determineDbType(options)
const timeoutConfig = DATABASE_TIMEOUTS[dbType]
const connection = await createDBConnectionWithTimeout(
  options,
  timeoutConfig.connectionTimeout
)
```

## Connection Pooling (Future Enhancement)

While the current implementation uses a lazy-load singleton pattern, consider these principles if implementing a connection pool:

1. **Pool Size Configuration**: Make pool size configurable:
   ```javascript
   const poolConfig = {
     min: parseInt(process.env.HANA_POOL_MIN || '2'),
     max: parseInt(process.env.HANA_POOL_MAX || '10'),
     idleTimeout: parseInt(process.env.HANA_POOL_IDLE_TIMEOUT || '30000'),
     acquireTimeout: parseInt(process.env.HANA_POOL_ACQUIRE_TIMEOUT || '10000'),
   }
   ```

2. **Connection Validation**: Validate connections before lending from pool:
   ```javascript
   pool.on('connection', (connection) => {
     connection.ping() // Or appropriate health check
   })
   ```

3. **Monitoring**: Track pool utilization for debugging:
   ```javascript
   pool.on('acquire', () => debug(`Pool: ${pool.activeCount()}/${pool.size()}`))
   pool.on('release', () => debug(`Pool: ${pool.activeCount()}/${pool.size()}`))
   ```

## Checklist for New Code

Use this checklist when creating new database-connected code:

- [ ] All timeout values are configurable (environment variables or options parameter)
- [ ] Connection establishment has an explicit timeout
- [ ] Operations have query-level and overall operation timeouts
- [ ] Disconnect timeout is configured
- [ ] Try/finally blocks guarantee cleanup happens
- [ ] No `process.exit()` in error handlers (throw exceptions instead)
- [ ] Transient errors trigger retry logic with exponential backoff
- [ ] Permanent errors fail fast without retry
- [ ] Tests define appropriate `this.timeout()` values
- [ ] Routes disconnect connections after response is sent
- [ ] CLI commands disconnect before `base.end()` is called
- [ ] Error messages are internationalized (from i18n bundles)
- [ ] Connection state is logged for debugging
- [ ] Documentation explains timeout configuration options

## Examples

### CLI Command with Full Lifecycle

See `bin/compareData.js` as primary example of:
- Configurable operation timeout (default 3600 seconds)
- Proper connection creation and cleanup
- Error handling with cleanup

**To improve**: Add connection establishment timeout, use try/finally for guaranteed cleanup.

### Route with Connection Cleanup

See `routes/hanaInspect.js` and `routes/hanaList.js` as examples of route-based connection usage.

**To improve**: Add explicit disconnect after response, add timeouts at multiple levels.

### Test with Timeout Configuration

See `tests/utils/profileIntegration.Test.js` for test-level timeout examples.

**To improve**: Add retry logic for transient failures.
