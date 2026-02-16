# MCP Server Connection Context Analysis & Improvement Strategy

## Current Architecture

### How Connection Context Currently Flows

```bash
AI Agent
    ↓
MCP Server (mcp-server/src/index.ts)
    ↓
executeCommand(commandName, args)  [executor.ts]
    ↓
spawn('node', ['/path/to/bin/cli.js', cmd, args])
    ↓
CLI Handler (bin/*.js)
    ↓
dbClientClass.getNewClient(prompts)  [utils/database/index.js]
    ↓
getConnOptions(prompts)  [utils/connections.js]
    ↓
Connection Resolution (in order):
  1. .cdsrc-private.json (CDS binding)
  2. default-env.json or default-env-admin.json
  3. --conn parameter (custom config file)
  4. ~/.hana-cli/default.json
  5. .env file
  6. VCAP_SERVICES environment variable
```

### Current Limitations

1. **Install Path Dependency**: The MCP server always uses connection files from:
   - The CLI installation directory
   - User's home directory (`~/.hana-cli/`)
   - Global environment variables

2. **No Project Context**: The connection context is determined at CLI runtime, with no knowledge of:
   - Which code project is being analyzed
   - Which database the project is configured for
   - Project-specific credentials or bindings

3. **Single Connection Per Session**: All commands in an MCP conversation use the same connection, even if working across different projects

4. **Environment Isolation**: Sub-processes spawned by the MCP server inherit parent environment without project-specific overrides

## Proposed Improvements

### Option 1: Context Passing (Recommended)

Pass project context directly through the MCP server to each command execution.

**Implementation Points:**

```typescript
// 1. Extend MCP Tool Schema to Accept Connection Context
interface ConnectionContext {
  projectPath?: string;
  connectionFile?: string;  // Relative to project or absolute
  connName?: string;        // Named connection from config
  credentials?: {           // Direct credentials
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
  };
  env?: Record<string, string>;  // Project-specific environment variables
}

// 2. Update Tool Input Schema in index.ts
tools.push({
  name: 'hana_<command>',
  inputSchema: {
    type: 'object',
    properties: {
      // ... existing command parameters ...
      __projectContext: {
        type: 'object',
        description: 'Project-specific connection context (optional)',
        properties: {
          projectPath: { type: 'string' },
          connectionFile: { type: 'string' },
          connName: { type: 'string' },
          // ... credential fields ...
        }
      }
    }
  }
});

// 3. Extract and Pass Context in Tool Handler
const projectContext = args?.__projectContext;

// 4. Modify executeCommand to Pass Context
await executeCommand(actualCommandName, args || {}, projectContext);

// 5. Update Executor to Apply Context
export async function executeCommand(
  commandName: string,
  args: Record<string, any> = {},
  context?: ConnectionContext
): Promise<ExecutionResult & { commandName: string }> {
  const child = spawn('node', [cliPath, ...commandArgs], {
    env: buildEnvironment(context),  // Apply project context to environment
    cwd: context?.projectPath || join(__dirname, '..', '..'),
  });
  // ...
}

// 6. Helper to Build Environment
function buildEnvironment(context?: ConnectionContext): Record<string, string> {
  const env = { ...process.env };
  
  if (!context) return env;
  
  // Set project working directory
  if (context.projectPath) {
    env.HANA_CLI_PROJECT_PATH = context.projectPath;
  }
  
  // Set connection file location
  if (context.connectionFile) {
    env.HANA_CLI_CONN_FILE = context.connectionFile;
  }
  
  // Set named connection
  if (context.connName) {
    env.HANA_CLI_CONN_NAME = context.connName;
  }
  
  // Set direct credentials (use cautiously - prefer files)
  if (context.credentials) {
    if (context.credentials.host) env.HANA_CLI_HOST = context.credentials.host;
    if (context.credentials.port) env.HANA_CLI_PORT = String(context.credentials.port);
    if (context.credentials.user) env.HANA_CLI_USER = context.credentials.user;
    if (context.credentials.password) env.HANA_CLI_PASSWORD = context.credentials.password;
    if (context.credentials.database) env.HANA_CLI_DATABASE = context.credentials.database;
  }
  
  // Merge project-specific env vars
  if (context.env) {
    Object.assign(env, context.env);
  }
  
  return env;
}
```

### Option 2: Connection Registry Service

Create a connection registry that the MCP server can query to get project-specific connections.

**Implementation Points:**

```typescript
// 1. Create a Connection Manager Service
class ConnectionManager {
  private connections: Map<string, ConnectionContext> = new Map();
  
  /**
   * Register a connection that can be referenced by agents
   */
  registerConnection(name: string, context: ConnectionContext): void {
    this.connections.set(name, context);
  }
  
  /**
   * Get connection by name or project path
   */
  getConnection(identifier: string): ConnectionContext | undefined {
    return this.connections.get(identifier);
  }
  
  /**
   * Discover connections from a project directory
   */
  discoverConnections(projectPath: string): ConnectionContext[] {
    // Look for .env, default-env.json, package.json, etc. in project
    // Return available connections in that project
  }
}

// 2. MCP Tool to List Available Connections
tools.push({
  name: 'hana_list_connections',
  description: 'List available database connections for the current project context',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: { type: 'string' }
    }
  }
});

// 3. MCP Tool to Set Active Connection
tools.push({
  name: 'hana_set_connection',
  description: 'Set the active database connection for subsequent commands',
  inputSchema: {
    type: 'object',
    properties: {
      connectionName: { type: 'string' },
      projectPath: { type: 'string' }
    },
    required: ['connectionName']
  }
});
```

### Option 3: Project Auto-Detection

Automatically detect and use project-specific connections based on the current working directory or user context.

**Implementation Points:**

```typescript
// 1. Add Project Detection Service
class ProjectDetector {
  /**
   * Detect the current project based on context
   */
  static detectProject(cwd: string): ProjectContext | null {
    // Check for package.json to identify project root
    // Look for CAP project structure (db/, srv/, app/)
    // Check for .env or default-env.json in project root
    // Return project metadata
  }
  
  /**
   * Get project-specific connection from detected project
   */
  static getProjectConnection(projectPath: string): ConnectionContext | null {
    // Look for:
    // - .env file in project
    // - default-env.json in project
    // - .cdsrc-private.json in project
    // - package.json with cds configuration
  }
}

// 2. Extend Tool Parameters
// Each command tool gets optional project path parameter:
projectPath: {
  type: 'string',
  description: 'Optional path to project directory. If provided, will use project-specific connection files.'
}

// 3. Auto-Detect in Handler
if (args.projectPath) {
  const projectConnection = ProjectDetector.getProjectConnection(args.projectPath);
  if (projectConnection) {
    context = projectConnection;
  }
}
```

## Recommended Implementation Approach

### Phase 1: Add Context Passing (Weeks 1-2)

1. **Extend executor.ts**:
   - Add `ConnectionContext` interface
   - Modify `executeCommand()` to accept and apply context
   - Add `buildEnvironment()` helper function

2. **Update index.ts**:
   - Add `__projectContext` to all command schemas (or create wrapper)
   - Extract context in tool handler
   - Pass context to executeCommand()

3. **Update connections.js** to detect context:
   - Check for `HANA_CLI_PROJECT_PATH` environment variable
   - Look for connection files relative to project path
   - Merge project-specific environment variables

### Phase 2: Add Connection Management Tools (Weeks 2-3)

1. **Create `connection-manager.ts`**:
   - ConnectionManager class to registry connections
   - Methods to register, list, and resolve connections

2. **Add MCP Tools**:
   - `hana_list_connections`: List available connections
   - `hana_set_connection`: Set active connection for subsequent commands
   - `hana_detect_project`: Auto-detect project and its connections

3. **Storage**:
   - Use file-based storage in user's home directory
   - Or store in MCP server state if session-based

### Phase 3: Project Auto-Detection (Week 3-4)

1. **Create `project-detector.ts`**:
   - Detect project root from file structure
   - Extract connection config from project files
   - Cache project metadata

2. **Integrate Auto-Detection**:
   - Use when no explicit context provided
   - Detect from CWD or from Agent's working context

## Architecture Diagram

```bash
AI Agent/LLM
    ↓ (with optional projectContext)
MCP Server (index.ts)
    ├─ Built-in Tools (discovery, workflows, etc.)
    └─ Command Tools (hana_tables, hana_import, etc.)
         ↓ (with projectContext)
    Connection Manager (new)
         ├─ ConnectionContext registry
         ├─ Auto-detection logic
         └─ Environment builder
         ↓
    Executor (updated executor.ts)
         ├─ Build environment with context
         └─ Set working directory
         ↓
    CLI Process
         ├─ bin/cli.js
         └─ connects via utils/connections.js
              (now checks context env vars first)
```

## API Changes Summary

### MCP Tool Input Schema Changes

**Before:**

```json
{
  "table": "MY_TABLE",
  "schema": "MY_SCHEMA"
}
```

**After:**

```json
{
  "table": "MY_TABLE",
  "schema": "MY_SCHEMA",
  "__projectContext": {
    "projectPath": "/path/to/myproject",
    "connectionFile": ".env"
  }
}
```

### New MCP Tools

1. **hana_list_connections**
   - Input: `{ projectPath?: string }`
   - Output: List of available connections

2. **hana_set_connection**
   - Input: `{ connectionName: string, projectPath?: string }`
   - Output: Confirmation of active connection

3. **hana_detect_project**
   - Input: `{ startPath: string }`
   - Output: Detected project info and available connections

## Security Considerations

1. **Credential Handling**:
   - Prefer connection files over direct credentials in parameters
   - Never log passwords
   - Use encrypted storage for credential registry

2. **Path Traversal**:
   - Validate projectPath doesn't escape sandbox
   - Use `path.resolve()` and normalize paths
   - Check against whitelist of allowed project paths

3. **Environment Variable Injection**:
   - Sanitize custom environment variables
   - Prevent override of critical system vars
   - Log all context applications

## Testing Strategy

1. **Unit Tests**:
   - Connection context building
   - Environment variable generation
   - Path resolution and validation

2. **Integration Tests**:
   - Commands with explicit context
   - Auto-detection from project
   - Context switching between commands

3. **End-to-End Tests**:
   - Multi-project workflows
   - Connection switching in conversation
   - Fallback to default connection

## Migration Path

1. **Backward Compatibility**:
   - Make `__projectContext` optional
   - Default behavior unchanged if no context provided
   - Existing MCP integrations continue working

2. **Gradual Adoption**:
   - AI Agents can optionally provide context
   - Auto-detection helps agents that don't
   - No breaking changes to CLI behavior

3. **Documentation**:
   - Update README with new context parameters
   - Add examples of project-specific connections
   - Document security best practices

## Example Usage Flow

```typescript
// Agent discovers project
const projectPath = "/workspace/my-hana-project";

// Agent sets context for future commands
await mcp.callTool('hana_set_connection', {
  projectPath: projectPath
});

// Now all commands use project-specific connection
const tables = await mcp.callTool('hana_tables', {
  schema: 'MY_SCHEMA'
  // No need to specify connection - uses project context
});

// Or explicitly override for specific command
const status = await mcp.callTool('hana_status', {
  __projectContext: {
    projectPath: '/other/project'
  }
});
```

## Implementation Files to Modify/Create

### Modify

- `mcp-server/src/executor.ts` - Add context parameter
- `mcp-server/src/index.ts` - Update tool schemas and handlers
- `utils/connections.js` - Check for context environment variables

### Create

- `mcp-server/src/connection-manager.ts` - Connection registry
- `mcp-server/src/project-detector.ts` - Project auto-detection
- Tests for new functionality

## Expected Benefits

1. **Multi-Project Support**: Handle multiple projects in one conversation
2. **Better Isolation**: Each project uses its own database connection
3. **Improved UX**: No manual connection setup per command
4. **Auto-Detection**: Agents can discover and use project connections automatically
5. **Dynamic Switching**: Change connections mid-conversation seamlessly
