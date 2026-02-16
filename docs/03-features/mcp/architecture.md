# MCP Architecture & Connection Context

How the MCP server passes project-specific connection context to HANA CLI.

## The Problem

Previously, the MCP server always used connection files from the install path (`~/.hana-cli/default.json`), not the project being analyzed. This meant AI assistants couldn't automatically connect to the correct project's database.

## The Solution

**Pass project context through MCP tool parameters** → MCP server extracts context → CLI changes working directory and sets environment variables → CLI connects via project's local connection files.

## Architecture Flow

```
AI Agent Request
  ↓
{"schema": "MY_SCHEMA", 
 "__projectContext": {
   "projectPath": "/path/to/project",
   "connectionFile": ".env"
 }}
  ↓
MCP Server Receives Context
  ↓
executeCommand(cmd, args, context)
  ↓
Executor Sets Environment
  ├─ env.HANA_CLI_PROJECT_PATH = "/path/to/project"
  ├─ env.HANA_CLI_CONN_FILE = ".env"
  ├─ spawn(cli.js, cmd, {env, cwd: "/path/to/project"})
  ↓
CLI Process
  ├─ Checks environment for project context
  ├─ Changes directory to project
  ├─ Looks for ./.env or default-env.json
  ↓
Correct Database Connected ✓
```

## Connection Search Order

After project context is applied, connections are resolved in this order:

1. `.cdsrc-private.json` (project directory)
2. `default-env.json` (project directory)
3. `~/.hana-cli/default.json` (fallback)
4. `.env` file (project directory)
5. `VCAP_SERVICES` environment variable
6. Direct connection parameters

## Implementation Details

### Files Modified

**mcp-server/src/executor.ts**
- Accepts optional `ConnectionContext` parameter
- Extracts project path from context
- Sets environment variables for CLI to detect
- Updates `spawn()` call with environment and working directory

**mcp-server/src/index.ts**
- Extracts `__projectContext` from tool arguments
- Removes context from args before calling CLI (it's metadata, not a parameter)
- Passes context to `executeCommand()`

**utils/connections.js**
- Checks `process.env.HANA_CLI_PROJECT_PATH`
- Changes working directory if context provided
- Falls back to home/install paths if not found

### Connection Context Interface

```typescript
export interface ConnectionContext {
  /** Absolute path to project directory */
  projectPath?: string;
  
  /** Connection file relative to projectPath */
  connectionFile?: string;
  
  /** Direct connection - host */
  host?: string;
  
  /** Direct connection - port (default: 30013) */
  port?: number;
  
  /** Direct connection - user */
  user?: string;
  
  /** Direct connection - password */
  password?: string;
  
  /** Direct connection - database (default: SYSTEMDB) */
  database?: string;
}
```

## Usage from AI Agents

When calling MCP server tools, include context:

```javascript
// Before (all commands use install path)
mcp.call('hana_tables', { schema: 'MSCHEMA' })

// After (command uses project context)
mcp.call('hana_tables', { 
  schema: 'MSCHEMA',
  __projectContext: {
    projectPath: '/home/user/my-project',
    connectionFile: '.env'
  }
})
```

## Benefits

✅ **Multi-Project Support** - Switch between projects seamlessly  
✅ **Automatic Connection** - No manual credential passing  
✅ **Local-First** - Uses .env or default-env.json from project  
✅ **Backwards Compatible** - Falls back to install path if context not provided  
✅ **Secure** - Respects existing connection file permissions  
✅ **Flexible** - Supports multiple connection methods

## Testing

To test connection context:

```bash
# Start MCP server with debug
DEBUG=hana-cli:* node mcp-server/dist/src/index.js

# In AI agent, call with context
hana_tables {
  "schema": "YOUR_SCHEMA",
  "__projectContext": {
    "projectPath": "/absolute/path/to/project"
  }
}

# Should connect via /absolute/path/to/project/.env or default-env.json
```

## See Also

- [MCP Server Usage](./server-usage.md)
- [Connection Guide](./connection-guide.md)
- [Quick Setup](../../01-getting-started/mcp-quickstart.md)
