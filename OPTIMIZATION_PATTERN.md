# Command Module Optimization Pattern

## Performance Impact

**Before optimization:** ~1567ms  
**After optimization:** ~916ms  
**Improvement:** 651ms (41.5% faster!)

## The Problem

Command modules were importing the full `base.js` at module level just to access metadata utilities like:

- `base.bundle.getText()` - for internationalized strings
- `base.getBuilder()` - for yargs builder configuration

This caused heavy dependencies to load even for simple `--help` commands:

- `sap-hdb-promisfied` (180ms)
- `@inquirer/prompts` (176ms)
- `terminal-kit` (138ms)
- `ora` (70ms)

## The Solution

Separate command metadata (loaded early) from implementation (loaded on execution):

### 1. Use `base-lite.js` for Metadata

```javascript
// OLD - loads all heavy dependencies
import * as base from '../utils/base.js'

export const describe = base.bundle.getText("tables")
export const builder = base.getBuilder({ /* options */ })

// NEW - only loads essentials
import * as baseLite from '../utils/base-lite.js'

export const describe = baseLite.bundle.getText("tables")
export const builder = baseLite.getBuilder({ /* options */ })
```

### 2. Lazy-Load Heavy Modules in Handler

```javascript
// OLD - imported at module level
import * as base from '../utils/base.js'
import dbClientClass from "../utils/database/index.js"

export async function handler(argv) {
  base.promptHandler(argv, getTables, inputPrompts)
}

// NEW - imported only when handler executes
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getTables, inputPrompts)
}
```

### 3. Lazy-Load in Implementation Functions

```javascript
// OLD - uses module-level imports
export async function getTables(prompts) {
  base.debug('getTables')
  const dbClient = await dbClientClass.getNewClient(prompts)
  // ...
}

// NEW - imports only when function executes
export async function getTables(prompts) {
  const base = await import('../utils/base.js')
  const dbClientModule = await import("../utils/database/index.js")
  const dbClientClass = dbClientModule.default
  
  base.debug('getTables')
  const dbClient = await dbClientClass.getNewClient(prompts)
  // ...
}
```

## Complete Example: bin/tables.js

See [bin/tables.js](bin/tables.js) for the complete optimized implementation.

## When to Apply This Pattern

Apply this optimization to any command module that:

- Uses `base.bundle.getText()` or `base.getBuilder()`
- Imports heavy dependencies like database clients, UI libraries, etc.
- Is frequently accessed (common commands benefit most)

## Benefits

1. **Faster CLI startup** - Only loads what's needed for the requested operation
2. **Lower memory footprint** - Heavy modules stay unloaded for simple operations
3. **Better user experience** - Especially noticeable on Windows where Node.js startup is slower
4. **Backwards compatible** - No changes to command behavior or API

## Files Modified

### Core Files

- `utils/base-lite.js` - Lightweight utilities (bundle, getBuilder, colors, debug)
- `bin/cli.js` - Lazy command loading based on requested command
- `bin/index.js` - Proper promise resolution for command modules

### Example Command (Pattern Template)

- `bin/tables.js` - Reference implementation showing the optimization pattern
