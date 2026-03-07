# MCP Connection Context Guide

How to pass project-specific database connections to MCP server tools.

## The Problem Solved

**Before:** The MCP server always used connection files from the installation path (`~/.hana-cli/default.json`).

**After:** You can pass project-specific context, and the MCP server automatically detects the correct project connection.

## Connection Context Parameters

When calling MCP tools, add `__projectContext`:

```json
{
  "schema": "MY_SCHEMA",
  "__projectContext": {
    "projectPath": "/absolute/path/to/my-project",
    "connectionFile": ".env"
  }
}
```

## How It Works

1. **AI Agent** passes `__projectContext` with project path
2. **MCP Server** detects the context parameter
3. **Server extracts** projectPath and connectionFile
4. **CLI process** changes directory to project
5. **CLI loads** connection from project's .env or default-env.json
6. **Database connects** using project-specific credentials

## Connection Resolution Order

After project context is applied:

1. `.cdsrc-private.json` (project directory)
2. `default-env.json` (project directory) ← Most common
3. `.env` (project directory) ← Also common
4. `~/.hana-cli/default.json` (fallback to install path)
5. `VCAP_SERVICES` environment variable
6. Direct connection parameters

## Examples

### Example 1: Project with default-env.json

```javascript
// AI Agent calling MCP
const result = await mcpClient.call('hana_tables', {
  schema: 'MYDB_OBJECTS',
  __projectContext: {
    projectPath: '/home/user/my-sap-project'
    // MCP will look for:
    // /home/user/my-sap-project/default-env.json
  }
})
```

### Example 2: Project with .env file

```javascript
const result = await mcpClient.call('hana_export', {
  schema: 'DATA',
  table: 'CUSTOMERS',
  output: 'json',
  __projectContext: {
    projectPath: '/home/user/analytics-app',
    connectionFile: '.env'
    // MCP will look for:
    // /home/user/analytics-app/.env
  }
})
```

### Example 3: Multiple projects

```javascript
// Project A
await mcpClient.call('hana_tables', {
  schema: 'PROJECT_A',
  __projectContext: {
    projectPath: '/projects/app-a'
  }
})

// Project B (same MCP server)
await mcpClient.call('hana_tables', {
  schema: 'PROJECT_B',
  __projectContext: {
    projectPath: '/projects/app-b'
  }
})
```

## Benefits

✅ **Multi-Project Support**  
Switch between projects without restarting MCP server

✅ **Automatic Connection Discovery**  
No manual credential passing needed

✅ **Local-First**  
Respects project's own .env or default-env.json files

✅ **Backwards Compatible**  
Works even without `__projectContext` (falls back to install path)

✅ **Secure**  
Credentials stay in project, not sent in requests

## Without Project Context

If `__projectContext` is not provided:

```javascript
// Uses install path connection
await mcpClient.call('hana_tables', {
  schema: 'MYDB'
  // Falls back to ~/.hana-cli/default.json
})
```

## Configuration in Files

### For Claude Desktop

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hana-cli": {
      "command": "node",
      "args": ["/path/to/mcp-server/build/index.js"],
      "env": {
        "HANA_CLI_PROJECT_PATH": "/default/project/path"
      }
    }
  }
}
```

Then Claude can auto-detect the project.

### For Custom Integrations

```javascript
const context = {
  projectPath: process.cwd(), // Use current working directory
  connectionFile: '.env'
};

await mcpClient.call('hana_tables', {
  schema: 'MYDB',
  __projectContext: context
});
```

## Troubleshooting

**Q: MCP can't find my .env file**  
A: Pass absolute path to projectPath. Check file exists: `ls /path/to/project/.env`

**Q: Still using wrong connection**  
A: Verify the context is being passed. Enable debug: `DEBUG=hana-cli:* node mcp-server/build/index.js`

**Q: Different project, same schema name**  
A: Confirm projectPath is correct for each call. MCP uses projectPath to resolve connections.

## See Also

- [MCP Architecture](./architecture.md) - Technical implementation
- [Server Usage](./server-usage.md) - How to run MCP server
- [Troubleshooting](../../troubleshooting/mcp.md) - MCP issues
