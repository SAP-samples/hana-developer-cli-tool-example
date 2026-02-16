# How the MCP Server Gets Connection Context - Current State & Solution

## Quick Summary

**Current Problem**: The MCP server always uses connection files from its install path or the user's home directory, not from the project being worked on by an AI Agent.

**Solution**: Pass project-specific connection context through the MCP tool parameters to the CLI execution layer.

---

## Current Flow (Simplified)

```mermaid
MCP Server
  ↓
executeCommand('tables', { schema: 'MY_SCHEMA' })
  ↓  
Spawns: node bin/cli.js tables --schema MY_SCHEMA
  ↓
CLI looks for connections:
  1. .cdsrc-private.json (install dir or pwd)
  2. default-env.json (install dir or pwd)
  3. ~/.hana-cli/default.json (user home)
  4. VCAP_SERVICES (environment)
```

**The problem**: Connection files are always from install path, not the project being analyzed.

---

## Key Code Locations

### 1. MCP Tool Execution Entry Point

**File**: `mcp-server/src/index.ts` (line 1300+)

```typescript
// Tool handler extracts command name and calls executor
const result = await executeCommand(actualCommandName, args || {});
```

Current limitation: No project context passed here.

### 2. Command Execution

**File**: `mcp-server/src/executor.ts` (line 240+)

```typescript
const child = spawn('node', [cliPath, ...commandArgs], {
  env: {
    ...process.env,
    FORCE_COLOR: '0',
  },
  cwd: join(__dirname, '..', '..'),  // Always uses install directory!
});
```

**Problem**: `cwd` (current working directory) is hardcoded to install path, environment variables are never customized for projects.

### 3. Connection Resolution

**File**: `utils/database/index.js` (line 35+)

```typescript
static async getNewClient(prompts) {
  if (!prompts.profile) {
    prompts.profile = 'hybrid'  // Default
    const { default: classAccess } = await import("./hanaDirect.js")
  } else {
    process.env.CDS_ENV = prompts.profile
    let optionsCDS = cds.env.requires.db  // Looks in cds.env
    // ...
  }
}
```

**Problem**: `cds.env.requires.db` is resolved from CDS configuration in current working directory. If CWD is install path, it uses install path config.

### 4. Credential Resolution

**File**: `utils/connections.js` (line 90+)

```typescript
export async function getConnOptions(prompts) {
  // Resolution order (all relative to process.cwd()):
  const cdsrcPrivate = getCdsrcPrivate()      // Looks in cwd
  const envFile = getDefaultEnv()             // Looks in cwd
  const envFile = getFileCheckParents(...)    // Searches up directory tree
  xsenv.loadEnv(envFile)                       // Loads from found file
}
```

**Problem**: All path searches start from current working directory and parent directories. If CWD is MCP install path, it will never find project-specific connection files.

---

## Recommended Implementation: Context Passing

### Step 1: Define ConnectionContext Interface

Create in `mcp-server/src/connection-context.ts`:

```typescript
export interface ConnectionContext {
  projectPath?: string;           // Absolute path to project
  connectionFile?: string;        // Relative path like ".env" or absolute path
  host?: string;                  // Direct connection - host
  port?: number;                  // Direct connection - port
  user?: string;                  // Direct connection - user
  password?: string;              // Direct connection - password (use cautiously)
  database?: string;              // Direct connection - database name
}
```

### Step 2: Update executeCommand() in executor.ts

**Current** (line 240):

```typescript
export async function executeCommand(
  commandName: string,
  args: Record<string, any> = {}
): Promise<ExecutionResult & { commandName: string }>
```

**Update to**:

```typescript
export async function executeCommand(
  commandName: string,
  args: Record<string, any> = {},
  context?: ConnectionContext
): Promise<ExecutionResult & { commandName: string }>
```

**Add environment setup** (before spawn):

```typescript
const env = { ...process.env, FORCE_COLOR: '0' };

// Apply project context to environment
if (context?.projectPath) {
  // Set CWD to project path so connection resolution starts there
  cwd = context.projectPath;
}

if (context?.connectionFile) {
  // Pass connection file hint to CLI
  env.HANA_CLI_CONN_FILE = context.connectionFile;
}

// Set direct credentials if provided (use cautiously for security)
if (context?.host) env.HANA_CLI_HOST = context.host;
if (context?.port) env.HANA_CLI_PORT = String(context.port);
if (context?.user) env.HANA_CLI_USER = context.user;
if (context?.password) env.HANA_CLI_PASSWORD = context.password;
if (context?.database) env.HANA_CLI_DATABASE = context.database;

const child = spawn('node', [cliPath, ...commandArgs], {
  env,
  cwd,
});
```

### Step 3: Update CLI to Recognize Context Environment Variables

Modify `utils/connections.js` (line 90+):

**Add this at the beginning of getConnOptions()**:

```typescript
export async function getConnOptions(prompts) {
  base.debug(base.bundle.getText("debug.call", ["getConnOptions"]))
  
  // NEW: Check for project-specific context from MCP
  const projectPath = process.env.HANA_CLI_PROJECT_PATH || prompts.projectPath;
  const connFile = process.env.HANA_CLI_CONN_FILE;
  
  // If project path provided, use it as search origin
  if (projectPath) {
    process.chdir(projectPath);  // Change to project directory
  }
  
  delete process.env.VCAP_SERVICES
  
  // Try direct credentials first (if passed via MCP)
  if (process.env.HANA_CLI_HOST) {
    return {
      hana: {
        host: process.env.HANA_CLI_HOST,
        port: parseInt(process.env.HANA_CLI_PORT || '30013'),
        user: process.env.HANA_CLI_USER,
        password: process.env.HANA_CLI_PASSWORD,
        database: process.env.HANA_CLI_DATABASE || 'SYSTEMDB',
      }
    };
  }
  
  // Rest of existing resolution logic...
```

### Step 4: Update MCP Tool Schema in index.ts

Add to EVERY command tool (around line 14+):

```typescript
tools.push({
  name: `hana_${sanitizeToolName(name)}`,
  description: fullDescription,
  inputSchema: {
    type: 'object',
    properties: {
      ...info.schema.properties,  // Existing parameters
      
      // NEW: Project context
      __projectContext: {
        type: 'object',
        description: 'Project-specific connection context (optional)',
        properties: {
          projectPath: {
            type: 'string',
            description: 'Absolute path to the project directory'
          },
          connectionFile: {
            type: 'string',
            description: 'Name of connection file (e.g., ".env", "default-env.json"). Will be searched relative to projectPath.'
          },
          host: { type: 'string', description: 'Database host' },
          port: { type: 'number', description: 'Database port' },
          user: { type: 'string', description: 'Database user' },
          password: { type: 'string', description: 'Database password (use cautiously)' },
          database: { type: 'string', description: 'Database name' }
        }
      }
    },
    required: info.schema.required
  },
});
```

### Step 5: Extract and Pass Context in Tool Handler

Update line ~1300 in index.ts:

**Current**:

```typescript
try {
  const result = await executeCommand(actualCommandName, args || {});
  const formattedOutput = formatResult(result);
```

**Update to**:

```typescript
try {
  // Extract context if provided
  const context = (args as any)?.__projectContext;
  
  // Remove context from args before passing to CLI
  const cleanArgs = { ...args };
  delete cleanArgs.__projectContext;
  
  const result = await executeCommand(actualCommandName, cleanArgs, context);
  const formattedOutput = formatResult(result);
```

---

## Usage Example

### AI Agent with Project Context

```typescript
// Agent knows it's working on a CAP project
const projectPath = "C:/Users/developer/projects/my-cap-app";

// Call any command with project context
const tables = await mcp.callTool('hana_tables', {
  schema: 'MY_SCHEMA',
  __projectContext: {
    projectPath: projectPath,
    connectionFile: '.env'  // Uses project's .env file
  }
});

// Result uses the database connection defined in 
// C:/Users/developer/projects/my-cap-app/.env
// NOT the MCP install directory's default-env.json
```

### Without Context (Falls Back to Current Behavior)

```typescript
// If no __projectContext provided, uses install path as before
// Backward compatible!
const tables = await mcp.callTool('hana_tables', {
  schema: 'MY_SCHEMA'
});
```

---

## Files to Modify (Summary)

| File | Change | Priority |
| --- | --- | --- |
| `mcp-server/src/executor.ts` | Add `context` parameter, build environment, set cwd | HIGH |
| `mcp-server/src/index.ts` | Add `__projectContext` to tool schemas, extract in handler | HIGH |
| `utils/connections.js` | Check `HANA_CLI_*` environment variables | MEDIUM |
| `mcp-server/src/connection-context.ts` | New file - interface definition | HIGH |

---

## Testing Checklist

- [ ] Command executes with `__projectContext` provided
- [ ] Command executes without `__projectContext` (backward compat)
- [ ] Project-specific .env file is used when context provided
- [ ] CLI execution happens in correct project directory
- [ ] Environment variables properly set for direct connection
- [ ] Multiple commands can use different project contexts in same conversation
- [ ] Connection files are found relative to project path, not install path

---

## Security Notes

1. **Credentials in Parameters**: Avoid passing passwords in `__projectContext`. Prefer `.env` files.
2. **Path Validation**: Always validate `projectPath` doesn't contain `..` or escape sandbox
3. **Logging**: Never log passwords or sensitive credentials
4. **Encryption**: For future credential storage, use encrypted vaults

---

## Future Enhancements

1. **Connection Registry Tool**: `hana_set_project_context` to "remember" context for session
2. **Auto-Detection**: Detect project root from file structure, find its connection files automatically
3. **Multi-Project Workflows**: Support working with connected databases across multiple projects
4. **Secure Credential Storage**: Store credentials encrypted in MCP server state

---

## Backward Compatibility

This solution is **100% backward compatible**:

- `__projectContext` is optional
- If not provided, uses current behavior (install path connections)
- Existing MCP integrations work unchanged
- No breaking changes to CLI
