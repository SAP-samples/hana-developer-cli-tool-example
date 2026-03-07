# Quick Implementation Guide: Project-Specific Connection Context for MCP

## Problem Statement

The MCP server always uses connection files from the install path (`~/default-env.json`, `~/.hana-cli/default.json`) instead of from the code project being analyzed by an AI Agent. This means it can't automatically use the correct database for the project context.

## Solution Overview

Pass project connection context through MCP tool parameters → MCP Server sets this as environment/working directory → CLI looks for connections in project directory first.

---

## Code Changes Required

### 1. Create Connection Context Interface

**File**: `mcp-server/src/connection-context.ts` (NEW FILE)

```typescript
/**
 * Connection context for project-specific database connections
 * Passed from AI Agent through MCP tools to the CLI
 */
export interface ConnectionContext {
  /** Absolute path to project directory */
  projectPath?: string;
  
  /** Connection file name relative to projectPath (e.g., '.env', 'default-env.json') */
  connectionFile?: string;
  
  /** Direct connection - host/port/credentials for explicit connection setup */
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}
```

---

### 2. Update Executor to Handle Connection Context

**File**: `mcp-server/src/executor.ts`

**Change 1**: Update function signature (line ~240)

BEFORE:

```typescript
export async function executeCommand(
  commandName: string,
  args: Record<string, any> = {}
): Promise<ExecutionResult & { commandName: string }>
```

AFTER:

```typescript
import { ConnectionContext } from './connection-context.js';

export async function executeCommand(
  commandName: string,
  args: Record<string, any> = {},
  context?: ConnectionContext
): Promise<ExecutionResult & { commandName: string }>
```

**Change 2**: Update spawn call to use context (line ~260)

BEFORE:

```typescript
let stdout = '';
let stderr = '';

// Spawn the CLI process
const child = spawn('node', [cliPath, ...commandArgs], {
  env: {
    ...process.env,
    // Ensure stdio output is captured
    FORCE_COLOR: '0',
  },
  cwd: join(__dirname, '..', '..'),
});
```

AFTER:

```typescript
let stdout = '';
let stderr = '';

// Build environment with context
const env = {
  ...process.env,
  FORCE_COLOR: '0',
};

// Apply project context to environment
if (context?.projectPath) {
  env.HANA_CLI_PROJECT_PATH = context.projectPath;
}

if (context?.connectionFile) {
  env.HANA_CLI_CONN_FILE = context.connectionFile;
}

// Set direct credentials if provided
if (context?.host) {
  env.HANA_CLI_HOST = context.host;
  env.HANA_CLI_PORT = String(context.port || 30013);
  env.HANA_CLI_USER = context.user || '';
  env.HANA_CLI_PASSWORD = context.password || '';
  if (context.database) {
    env.HANA_CLI_DATABASE = context.database;
  }
}

// Spawn the CLI process
const child = spawn('node', [cliPath, ...commandArgs], {
  env,
  cwd: context?.projectPath ? context.projectPath : join(__dirname, '..', '..'),
});
```

---

### 3. Update MCP Server Tool Handler

**File**: `mcp-server/src/index.ts`

**Change 1**: Import new interface (line 1)

```typescript
import { ConnectionContext } from './connection-context.js';
```

**Change 2**: Update tool request handler where commands are executed (line ~1325)

BEFORE:

```typescript
// Execute the command
try {
  const result = await executeCommand(actualCommandName, args || {});
  const formattedOutput = formatResult(result);

  return {
    content: [
      {
        type: 'text',
        text: formattedOutput,
      },
    ],
  };
}
```

AFTER:

```typescript
// Execute the command
try {
  // Extract connection context if provided by agent
  const context = (args as any)?.__projectContext as ConnectionContext | undefined;
  
  // Remove context from args before passing to CLI (it's not a CLI parameter)
  const cleanArgs = { ...args };
  delete cleanArgs.__projectContext;
  
  const result = await executeCommand(actualCommandName, cleanArgs, context);
  const formattedOutput = formatResult(result);

  return {
    content: [
      {
        type: 'text',
        text: formattedOutput,
      },
    ],
  };
}
```

**Change 3**: Add `__projectContext` to command tool schemas (line ~145)

Find the tool schema building code and update each command's inputSchema:

BEFORE:

```typescript
tools.push({
  name: `hana_${sanitizeToolName(name)}`,
  description: fullDescription,
  inputSchema: info.schema,
});
```

AFTER:

```typescript
// Extend schema with project context
const extendedSchema = {
  ...info.schema,
  properties: {
    ...(info.schema.properties || {}),
    __projectContext: {
      type: 'object',
      description: 'Project-specific connection context (optional). Used to find project-specific connection files instead of install path.',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Absolute path to the project directory. Example: "C:/Users/me/projects/my-app"'
        },
        connectionFile: {
          type: 'string',
          description: 'Connection file location relative to projectPath. Example: ".env" or "default-env.json"'
        },
        host: {
          type: 'string',
          description: 'Database host (for direct connection)'
        },
        port: {
          type: 'number',
          description: 'Database port (for direct connection)'
        },
        user: {
          type: 'string',
          description: 'Database user (for direct connection)'
        },
        password: {
          type: 'string',
          description: 'Database password (for direct connection - use file-based credentials when possible)'
        },
        database: {
          type: 'string',
          description: 'Database name (for direct connection)'
        }
      }
    }
  }
};

tools.push({
  name: `hana_${sanitizeToolName(name)}`,
  description: fullDescription,
  inputSchema: extendedSchema,
});
```

---

### 4. Update CLI Connection Resolution

**File**: `utils/connections.js`

**Change**: Add at the beginning of `getConnOptions()` function (line ~92)

```typescript
export async function getConnOptions(prompts) {
    base.debug(base.bundle.getText("debug.call", ["getConnOptions"]))
    
    // NEW: Check for project-specific context from MCP server
    const projectPath = process.env.HANA_CLI_PROJECT_PATH;
    const connFile = process.env.HANA_CLI_CONN_FILE;
    
    // If project path provided, change to that directory so connection resolution starts there
    if (projectPath && fs.existsSync(projectPath)) {
        process.chdir(projectPath);
        base.debug(`Using project directory for connection resolution: ${projectPath}`);
    }
    
    // NEW: Check for direct database credentials from MCP (for explicit connection setup)
    if (process.env.HANA_CLI_HOST) {
        const directConnection = {
            hana: {
                host: process.env.HANA_CLI_HOST,
                port: parseInt(process.env.HANA_CLI_PORT || '30013'),
                user: process.env.HANA_CLI_USER,
                password: process.env.HANA_CLI_PASSWORD,
                database: process.env.HANA_CLI_DATABASE || 'SYSTEMDB',
            }
        };
        base.debug('Using direct database connection from MCP context');
        return directConnection;
    }
    
    // Rest of existing code continues...
    delete process.env.VCAP_SERVICES
    
    // Try .cdsrc-private.json with CDS binding first
    const cdsrcPrivate = prompts?.admin ? undefined : getCdsrcPrivate()
    // ... rest of function
}
```

---

## Usage: AI Agent Perspective

### Example 1: Using Project's .env File

```javascript
// Agent knows the project path and wants to use its .env file
await mcp.callTool('hana_tables', {
  schema: 'MY_SCHEMA',
  __projectContext: {
    projectPath: '/home/user/projects/my-cap-app',
    connectionFile: '.env'
  }
});

// Result: CLI changes to /home/user/projects/my-cap-app
// Then looks for .env file there (not in install path)
```

### Example 2: Explicit Database Connection

```javascript
// Agent has database credentials and wants to use them directly
await mcp.callTool('hana_import', {
  file: 'data.csv',
  table: 'MY_TABLE',
  __projectContext: {
    host: 'database.mydomain.com',
    port: 30013,
    user: 'DBAdmin',
    password: 'MyPassword123',
    database: 'SYSTEMDB'
  }
});
```

### Example 3: Backward Compatible (No Context)

```javascript
// If no context provided, works as before (uses install path)
await mcp.callTool('hana_status');

// Uses default-env.json from install directory or ~/.hana-cli/
```

---

## Testing the Implementation

### Test 1: Basic Functionality

```bash
# Create test project with .env
mkdir -p /tmp/test-project
echo "host=myhost" > /tmp/test-project/.env

# Run MCP server and call a command with context
node mcp-server/build/index.js
# Send: hana_tables with __projectContext.projectPath="/tmp/test-project"
# Expected: CLI changes to /tmp/test-project and finds .env there
```

### Test 2: Verify Environment Variables

Add to executor.ts for debugging:

```typescript
if (context) {
  console.error('[DEBUG] Applied context:', {
    cwd: context.projectPath,
    envVars: {
      HANA_CLI_PROJECT_PATH: env.HANA_CLI_PROJECT_PATH,
      HANA_CLI_CONN_FILE: env.HANA_CLI_CONN_FILE
    }
  });
}
```

### Test 3: Multiple Projects in One Conversation

```javascript
// First command uses Project A
await mcp.callTool('hana_tables', {
  __projectContext: { projectPath: '/path/to/project-a' }
});

// Second command uses Project B (different database)
await mcp.callTool('hana_import', {
  __projectContext: { projectPath: '/path/to/project-b' }
});

// Expected: Different databases for each command
```

---

## Validation Checklist

- [ ] `connection-context.ts` file created
- [ ] `executor.ts` updated with context parameter
- [ ] `index.ts` extracts and passes context
- [ ] Tool schemas include `__projectContext` property
- [ ] `connections.js` checks for `HANA_CLI_PROJECT_PATH` env var
- [ ] Commands work without context (backward compatible)
- [ ] Commands work with context (uses project path)
- [ ] Environment variable setting is correct
- [ ] CWD changing works properly
- [ ] No passwords logged in debug output

---

## Expected Behavior After Implementation

| Scenario | Before | After |
| ---------- | -------- | ------- |
| Agent calls `hana_tables` without context | Uses `~/.hana-cli/default.json` | Uses `~/.hana-cli/default.json` (same) |
| Agent calls `hana_tables` with projectPath | Uses `~/.hana-cli/default.json` (WRONG!) | Uses `/project/path/.env` (CORRECT!) |
| Agent switches projects mid-conversation | Same DB for all commands (WRONG!) | Each project uses its own DB (CORRECT!) |
| Multiple agents work different projects | Conflicts, uses wrong DB | Isolated contexts, correct DBs |

---

## Migration Path

1. **Deploy Phase 1**: Add interfaces and update executor, index (2-3 hours)
2. **Deploy Phase 2**: Update CLI connection logic (1 hour)
3. **Test**: Manual testing with different project structures (2 hours)
4. **Release**: No breaking changes, backward compatible
5. **Documentation**: Update README with examples (1 hour)

---

## Security Considerations

1. **Password in Parameters**: Only use `password` in `__projectContext` for automation/secure systems. Prefer `.env` files.
2. **Path Validation**: Consider validating `projectPath` to prevent directory traversal attacks:

   ```typescript
   if (context?.projectPath) {
     const normalized = path.resolve(context.projectPath);
     // Optional: Check against whitelist of allowed paths
   }
   ```

3. **Logging**: Never log passwords:

   ```typescript
   // WRONG:
   base.debug(context);  // Would log password!
   
   // RIGHT:
   const safeContext = { ...context };
   delete safeContext.password;
   base.debug(safeContext);
   ```

4. **Environment Cleanup**: Consider clearing sensitive env vars after command execution

---

## Rollback Plan

If issues arise:

1. Remove `__projectContext` handling from `index.ts` tool handler
2. Remove context parameter from `executeCommand()` call
3. Remove env variable checks from `connections.js`
4. Server reverts to install-path-only behavior

No persistent state to clean up - fully reversible.

## See Also

- [Connection Context Readme](./connection-context-readme.md)
- [Architecture](./architecture.md)
- [Server Usage](./server-usage.md)
