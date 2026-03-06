---
description: "Use when creating or updating route files in routes/. Enforces consistent structure, error handling, database connection management, internationalization, and integration with the Express server and CLI command infrastructure. Ensures routes follow established patterns for endpoint registration, response formatting, middleware usage, and WebSocket support."
applyTo: "routes/*.js"
---

# Route Development Guidelines

Use this guide when creating or modifying route files in the `routes/` directory.

## Scope and Purpose

This guide applies to all route files in `routes/`. Each file exports a `route(app, server)` function that registers one or more related endpoints on the Express application. Routes serve as bridges between HTTP clients and CLI commands.

## Critical Principles

1. **Consistency**: All routes follow the same structural pattern and registration method.
2. **Error Handling**: Errors propagate to centralized Express error middleware, never handled inline.
3. **Connection Management**: Database connections are cleared before use and created as needed.
4. **Internationalization**: All user-facing strings come from i18n bundles via `base.bundle.getText(key)`.
5. **Response Standardization**: Use `base.sendResults(res, results)` for consistent JSON response formatting.
6. **Swagger Documentation**: Every endpoint includes JSDoc comments for auto-generated API docs.
7. **CLI Integration**: Dynamic imports enable newly added CLI commands to be instantly available to routes.
8. **Dual Support**: When applicable, support both API (`/path`) and UI (`/path-ui`) endpoint variants.

## File Structure Template

Every route file must follow this structure:

```javascript
/**
 * @fileoverview [Brief description of what these routes handle]
 * 
 * Routes:
 *  - GET /path1 - [Description]
 *  - GET /path2 - [Description]
 * 
 * Dependencies: CLI commands at bin/[commandName].js, utils/base.js
 */

export async function route(app, server) {
  const base = await import('../utils/base.js')
  
  /**
   * @swagger
   * /path1:
   *   get:
   *     tags:
   *       - Category Name
   *     summary: Brief endpoint description
   *     description: Detailed endpoint description from i18n
   *     responses:
   *       200:
   *         description: Success response
   */
  app.get('/path1', async (req, res, next) => {
    try {
      // Endpoint logic
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  })
}
```

## Required Pattern: Route Function Signature

### Main Export: `route(app, server)`

Every route file must export an async function with this signature:

```javascript
export async function route(app, server) {
  // Route registration logic
}
```

**Parameters:**
- `app` — Express application instance (required). Used to register endpoints via `app.get()`, `app.post()`, etc.
- `server` — HTTP server instance (optional). Provided when WebSocket support is needed.

**Rules:**
- Function must be async
- Must be named exactly `route`
- Signature must accept both `app` and `server` (use `server` only if WebSocket needed)
- Must be registered in `routes/index.js` via `await route(app, server)`

## Error Handling Convention

### Pattern: Try-Catch with next(error)

**All async route handlers must follow this pattern:**

```javascript
app.get('/endpoint', async (req, res, next) => {
  try {
    // Logic here
    const result = await someAsyncOperation()
    res.status(200).json(result)
  } catch (error) {
    // NEVER handle error inline. Delegate to Express error middleware.
    next(error)
  }
})
```

**Rules:**
- Wrap entire handler in try-catch
- Pass all errors to `next(error)` — DO NOT return error responses directly
- DO NOT log errors in the route (centralized handler does this)
- Centralized error handler is configured in `tests/appFactory.js#L60-L65` and integrated in main app startup

**Example of what NOT to do:**
```javascript
// ❌ WRONG: Catching error and responding directly
catch (error) {
  res.status(500).json({ error: error.message })
}

// ✅ CORRECT: Passing to Express error handler
catch (error) {
  next(error)
}
```

## Response Formatting

### Pattern: Use `base.sendResults(res, results)` for Standardized Responses

For endpoints that execute CLI commands and return data:

```javascript
const base = await import('../utils/base.js')

app.get('/hana/tables', async (req, res, next) => {
  try {
    await base.clearConnection()
    const lib = await import('../bin/list.js')
    const results = await lib.mainFunction(base.getPrompts())
    
    // Use sendResults for consistent response format + result caching
    base.sendResults(res, results)
  } catch (error) {
    next(error)
  }
})
```

**Benefits of `base.sendResults()`:**
- Standardizes JSON response format
- Caches results in `base.lastResults` for Excel export via `/excel` route
- Handles status code and content-type automatically

### Direct JSON Responses

For simple endpoints that don't need result caching:

```javascript
app.get('/config', async (req, res, next) => {
  try {
    const config = base.getPrompts()
    res.status(200).json(config)
  } catch (error) {
    next(error)
  }
})
```

**Pattern:**
- `res.status(statusCode).json(data)`
- Specify status code explicitly (200, 201, 400, 404, 500)
- Use `.json()` for automatic `Content-Type: application/json`

## CLI Command Integration

### Pattern: Dynamic Module Imports

Routes dynamically load CLI commands at request time, enabling new commands to be instantly available:

```javascript
app.get('/hana/tables', async (req, res, next) => {
  try {
    const base = await import('../utils/base.js')
    await base.clearConnection()
    
    // Dynamic import: load CLI command module
    const lib = await import('../bin/list.js')
    
    // Call named export function from CLI command
    const results = await lib.mainFunction(base.getPrompts())
    
    base.sendResults(res, results)
  } catch (error) {
    next(error)
  }
})
```

**Rules:**
- Use template string: `await import(\`../bin/${commandName}.js\`)`
- Import the entire module, then call the exported function
- Always import inside the route handler, never at module top level (enables hot-reloading)
- Pass CLI command prompt object via `base.getPrompts()`

### Reusable Handler Functions

For routes that follow a common pattern, extract a handler function:

```javascript
async function listHandler(res, lib, func) {
  try {
    const base = await import('../utils/base.js')
    await base.clearConnection()
    
    const libModule = await import(`../bin/${lib}.js`)
    const results = await libModule[func](base.getPrompts())
    
    base.sendResults(res, results)
  } catch (error) {
    throw error
  }
}

app.get('/hana/tables', async (req, res, next) => {
  try {
    await listHandler(res, 'list', 'mainFunction')
  } catch (error) {
    next(error)
  }
})
```

**Benefits:**
- Reduces code duplication
- Centralizes common error handling
- Makes routes more readable

## Database Connection Management

### Pattern: Clear Before Each Operation

Always clear connections before database operations to ensure fresh state:

```javascript
await base.clearConnection()
const db = await base.createDBConnection()
const result = await someQuery()
```

**Rules:**
- Call `await base.clearConnection()` before any database operation
- Call `await base.createDBConnection()` if explicit connection needed
- Most CLI commands handle connection internally; pass `base.getPrompts()` for auth info
- Connection state is shared in `base.lastConnection`

## Dual Endpoint Pattern (API + UI)

For endpoints serving both API clients and web UI:

```javascript
// API endpoint - pure JSON
app.get('/hana/tables', async (req, res, next) => {
  try {
    const lib = await import('../bin/list.js')
    const results = await lib.mainFunction(prompts)
    base.sendResults(res, results)
  } catch (error) {
    next(error)
  }
})

// UI endpoint - preprocessed for browser consumption
app.get('/hana/tables-ui', async (req, res, next) => {
  try {
    const lib = await import('../bin/list.js')
    // Optionally transform data for UI consumption
    const results = await lib.mainFunction(prompts)
    res.status(200).json(results)
  } catch (error) {
    next(error)
  }
})
```

**Convention:**
- `/path` — API response (raw data for programmatic use)
- `/path-ui` — Same endpoint, optionally formatted for UI rendering

## Swagger Documentation

### Pattern: JSDoc Comments for Endpoints

Every endpoint must include JSDoc comments for Swagger auto-generation:

```javascript
/**
 * @swagger
 * /hana/tables:
 *   get:
 *     tags:
 *       - System Information
 *     summary: List HANA tables
 *     description: Retrieves all tables in the connected HANA instance
 *     parameters:
 *       - name: schema
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by schema name
 *     responses:
 *       200:
 *         description: Array of table objects
 *         content:
 *           application/json:
 *            schema:
 *              type: array
 *       500:
 *         description: Database connection error
 */
app.get('/hana/tables', async (req, res, next) => {
  // Implementation
})
```

**Rules:**
- Include `@swagger` comment block before endpoint
- Specify `tags` for Swagger UI organization
- Include `summary` and `description`
- Document all `parameters` with `in: query|body|path`
- Define response schemas for success (200) and error (4xx/5xx)
- Use i18n keys in descriptions: `{i18n.endpoint.description}`
- Tags should match common groupings: `System Information`, `Code Generation`, `Data Operations`

## Middleware Usage

### Middleware Pattern: Create Per-Route Instance

For endpoints that need JSON parsing or other middleware:

```javascript
export async function route(app, server) {
  const base = await import('../utils/base.js')
  const jsonParser = express.json()
  
  // POST/PUT endpoint with JSON body parsing
  app.put('/config', jsonParser, async (req, res, next) => {
    try {
      const { schema, table } = req.body
      if (!schema || !table) {
        return res.status(400).json({ error: 'Missing schema or table' })
      }
      base.setPrompts({ schema, table })
      res.status(200).json({ message: 'Configuration updated' })
    } catch (error) {
      next(error)
    }
  })
}
```

**Rules:**
- Create middleware instance at top of `route()` function
- Pass middleware to specific endpoints that need it (e.g., POST/PUT)
- Always validate required request body fields before using them
- Return 400 status for invalid/missing required parameters

## Static Asset Serving

### Pattern: Use app.use() for Static Directories

For serving static files like UI assets, documentation, i18n files:

```javascript
app.use('/ui', express.static(new URL('../app/resources', import.meta.url).pathname))
app.use('/i18n', express.static(new URL('../_i18n', import.meta.url).pathname))
app.use('/favicon.ico', express.static(new URL('../app/favicon.ico', import.meta.url).pathname))
```

**Rules:**
- Use `express.static()` for serving directories
- Use `new URL(..., import.meta.url).pathname` for correct path resolution in ES modules
- Static routes typically don't need Swagger documentation
- Mount at top of `route()` function before dynamic endpoints

## Internationalization (i18n)

### Pattern: Use base.bundle.getText(key)

For all user-facing strings in responses and error messages:

```javascript
const base = await import('../utils/base.js')

app.get('/results', async (req, res, next) => {
  try {
    if (!base.lastResults) {
      return res.status(404).json({
        error: base.bundle.getText('noResultsAvailable')
      })
    }
    res.status(200).json(base.lastResults)
  } catch (error) {
    next(error)
  }
})
```

### Pattern: Recursive i18n Resolution for Complex Objects

For responses that contain nested i18n keys:

```javascript
function resolveI18nStrings(obj, bundle) {
  if (Array.isArray(obj)) {
    return obj.map(item => resolveI18nStrings(item, bundle))
  }
  if (obj !== null && typeof obj === 'object') {
    const resolved = {}
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.startsWith('i18n.')) {
        resolved[key] = bundle.getText(value.replace('i18n.', ''))
      } else {
        resolved[key] = resolveI18nStrings(value, bundle)
      }
    }
    return resolved
  }
  return obj
}

app.get('/config/fioriSandboxConfig.json', async (req, res, next) => {
  try {
    const base = await import('../utils/base.js')
    let config = require('../app/fioriSandboxConfig.json')
    
    // Recursively replace i18n.key strings with actual translations
    config = resolveI18nStrings(config, base.bundle)
    
    res.type('application/json').json(config)
  } catch (error) {
    next(error)
  }
})
```

**Rules:**
- Store all user-visible strings in `_i18n/*.properties` files
- Reference i18n keys in code via `base.bundle.getText(key)`
- For config files with i18n keys, use prefix `i18n.keyname` and resolve recursively
- Detect locale from `Accept-Language` header when serving locale-specific content

## WebSocket Support (Optional)

### Pattern: Server Parameter for WebSocket

For routes supporting WebSocket connections:

```javascript
export async function route(app, server) {
  // Optional: server parameter only provided if WebSocket needed
  if (!server) return  // Gracefully handle absence (tests skip this)
  
  const WebSocketServer = (await import('ws')).WebSocketServer
  const wss = new WebSocketServer({ server })
  
  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      const { action, data } = JSON.parse(message)
      try {
        if (action === 'massConvert') {
          // Long-running operation with progress
          await handleMassConvert(ws, data)
        }
      } catch (error) {
        ws.send(JSON.stringify({ error: error.message }))
      }
    })
  })
  
  // Add HTTP endpoint for WebSocket info (optional)
  app.get('/websockets', (req, res) => {
    res.status(200).json({ status: 'websocket server active' })
  })
}

async function handleMassConvert(ws, data) {
  const base = await import('../utils/base.js')
  try {
    // Simulate progress updates
    for (let i = 0; i <= 100; i += 10) {
      ws.send(JSON.stringify({ progress: i, status: `Processing ${i}%` }))
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    ws.send(JSON.stringify({ complete: true, result: 'Success' }))
  } catch (error) {
    ws.send(JSON.stringify({ error: error.message }))
  }
}
```

**Rules:**
- WebSocket setup is optional; check if `server` parameter exists
- Use `WebSocketServer` from `ws` library
- Create a broadcast helper if multiple clients need updates
- Always wrap message handlers in try-catch
- Send JSON objects: `ws.send(JSON.stringify({ ... }))`
- Gracefully handle disconnects

## Input Validation

### Pattern: Validate Query and Body Parameters

Always validate incoming request parameters:

```javascript
app.post('/hana/query', jsonParser, async (req, res, next) => {
  try {
    const base = await import('../utils/base.js')
    const { sql } = req.body
    
    // Validate required parameters
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({
        error: base.bundle.getText('invalidSqlQuery'),
        details: 'sql parameter is required and must be a string'
      })
    }
    
    // Validate length/content
    if (sql.length > 10000) {
      return res.status(400).json({
        error: 'Query too large'
      })
    }
    
    // Proceed with validated data
    const lib = await import('../bin/query.js')
    const results = await lib.mainFunction({ ...base.getPrompts(), sql })
    base.sendResults(res, results)
  } catch (error) {
    next(error)
  }
})
```

**Rules:**
- Validate type of each parameter (`string`, `number`, `array`, etc.)
- Check for required parameters before using them
- Validate constraints (length, range, format)
- Return 400 status for invalid input
- Include helpful error messages in response
- Use specific i18n error messages when available

## Complete Example: New Feature Route

Here's a complete example showing a well-structured new route:

```javascript
/**
 * @fileoverview User preference management endpoints
 * 
 * Routes:
 *  - GET /preferences - Retrieve saved user preferences
 *  - PUT /preferences - Update user preferences
 */

export async function route(app, server) {
  const base = await import('../utils/base.js')
  const express = await import('express')
  const jsonParser = express.json()

  /**
   * @swagger
   * /preferences:
   *   get:
   *     tags:
   *       - Configuration
   *     summary: Get user preferences
   *     description: Retrieves currently saved user preferences
   *     responses:
   *       200:
   *         description: User preferences object
   */
  app.get('/preferences', async (req, res, next) => {
    try {
      const prefs = base.getPrompts()
      res.status(200).json(prefs)
    } catch (error) {
      next(error)
    }
  })

  /**
   * @swagger
   * /preferences:
   *   put:
   *     tags:
   *       - Configuration
   *     summary: Update user preferences
   *     description: Saves user preferences
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               theme:
   *                 type: string
   *               language:
   *                 type: string
   *     responses:
   *       200:
   *         description: Preferences updated successfully
   *       400:
   *         description: Invalid preference values
   */
  app.put('/preferences', jsonParser, async (req, res, next) => {
    try {
      const { theme, language } = req.body

      // Validate inputs
      const validThemes = ['light', 'dark']
      const validLanguages = ['en', 'de', 'es', 'fr', 'pt']
      
      if (theme && !validThemes.includes(theme)) {
        return res.status(400).json({
          error: base.bundle.getText('invalidTheme'),
          validValues: validThemes
        })
      }

      if (language && !validLanguages.includes(language)) {
        return res.status(400).json({
          error: base.bundle.getText('invalidLanguage'),
          validValues: validLanguages
        })
      }

      // Update preferences
      base.setPrompts({ ...base.getPrompts(), theme, language })
      
      res.status(200).json({
        message: base.bundle.getText('preferencesSaved'),
        preferences: base.getPrompts()
      })
    } catch (error) {
      next(error)
    }
  })
}
```

## Anti-Patterns: What NOT to Do

❌ **Don't handle errors inline**
```javascript
// WRONG
app.get('/path', (req, res) => {
  try {
    // ...
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

❌ **Don't import CLI commands at module level**
```javascript
// WRONG: Prevents hot-reloading, breaks if command not yet loaded
import * as listCommand from '../bin/list.js'
```

❌ **Don't use hardcoded strings for user-facing messages**
```javascript
// WRONG
res.status(400).json({ error: 'Missing schema parameter' })

// CORRECT
res.status(400).json({ error: base.bundle.getText('missingSchema') })
```

❌ **Don't create database connections without clearing first**
```javascript
// WRONG
const db = base.createDBConnection()
```

❌ **Don't skip Swagger documentation**
```javascript
// WRONG: No JSDoc comments, undocumented endpoint
app.get('/hidden-api', (req, res) => { ... })
```

❌ **Don't mix error handling styles**
```javascript
// WRONG: Some errors handled inline, some delegated
app.get('/path', async (req, res, next) => {
  try {
    if (!param) res.status(400).send()  // Inline
    await operation()
  } catch (error) {
    next(error)  // Delegated
  }
})
```

❌ **Don't log in route handlers**
```javascript
// WRONG: Logging happens in centralized error handler
catch (error) {
  console.error(error)  // Remove this
  next(error)
}
```

## Checklist for New Routes

Before submitting a new route:

- [ ] Function signature: `export async function route(app, server)`
- [ ] All endpoints wrapped in try-catch with `next(error)`
- [ ] Swagger JSDoc comments on every endpoint
- [ ] Input validation for all query/body parameters
- [ ] Database connection: `await base.clearConnection()` before use
- [ ] Responses use `base.sendResults()` or `res.status().json()`
- [ ] All user-facing strings from `base.bundle.getText(key)`
- [ ] Dynamic CLI imports: `await import(\`../bin/${cmd}.js\`)`
- [ ] Middleware instances created in `route()` function
- [ ] Route registered in `routes/index.js`
- [ ] Tested with both API and WebUI clients (if dual endpoints)
- [ ] Documentation updated in `docs/02-commands/` (if exposing new functionality)

## Related Conventions

- **CLI Commands**: See [cli-command-development.instructions.md](./cli-command-development.instructions.md) for command structure
- **Translatable Text**: See [translatable-text-handling.instructions.md](./translatable-text-handling.instructions.md) for i18n key naming, import patterns, and multi-language synchronization
- **i18n Management**: See [i18n-translation-management.instructions.md](./i18n-translation-management.instructions.md) for translation file structure and validation
- **Command Documentation**: See [command-documentation.instructions.md](./command-documentation.instructions.md) for API docs format
