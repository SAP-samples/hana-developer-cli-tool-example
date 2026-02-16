# MCP Server Usage & Setup

How to run and use the MCP (Model Context Protocol) server with HANA CLI.

## Quick Start

### Installation

```bash
# Navigate to mcp-server directory
cd mcp-server

# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Running the Server

```bash
# Start MCP server (listens on stdio)
node dist/src/index.js

# With debug logging
DEBUG=hana-cli:* node dist/src/index.js

# Specify custom port (for testing)
PORT=3000 node dist/src/index.js
```

## How It Works

The MCP server:

1. **Receives tool calls** from AI assistants (Claude, etc)
2. **Extracts parameters** from the request
3. **Executes HANA CLI commands** in Node.js
4. **Returns results** in structured markdown format

## Available Tools

The MCP server exposes 150+ HANA CLI tools:

**Data Tools:** import, export, compareData, dataProfile, dataDiff, dataValidator, dataMask, dataSync, duplicateDetection, dataLineage

**Schema Tools:** compareSchema, schemaClone, tableCopy, erdDiagram, generateDocs, generateTestData

**Query Tools:** querySimple, callProcedure, tables, views, functions, procedures, roles, etc

**System Tools:** backup, replicationStatus, partitions, spatialData, and more

## Usage with AI Assistants

### With Claude Desktop

1. Configure `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hana-cli": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/src/index.js"],
      "env": {
        "DEBUG": "hana-cli:*"
      }
    }
  }
}
```

2. Restart Claude Desktop
3. Ask Claude questions about your HANA database

### With Custom AI Agents

```javascript
const { exec } = require('child_process');

// Start MCP server
const server = exec('node mcp-server/dist/src/index.js');

// Send tool call
server.stdin.write(JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "hana_tables",
    arguments: {
      schema: "MY_SCHEMA",
      __projectContext: {
        projectPath: "/path/to/project"
      }
    }
  }
}));

// Listen for results
server.stdout.on('data', (data) => {
  console.log('MCP Response:', JSON.parse(data));
});
```

## Project Context

When calling MCP tools, pass project context to automatically detect connections:

```json
{
  "schema": "MY_SCHEMA",
  "__projectContext": {
    "projectPath": "/absolute/path/to/project",
    "connectionFile": ".env"
  }
}
```

The MCP server will:
1. Change to the project directory
2. Look for `.env`, `default-env.json`, or connection files
3. Execute the command using the project's database

See [Connection Guide](./connection-guide.md) for details.

## Output Format

All results are returned as **markdown tables** for easy reading:

```markdown
| Column1 | Column2 | Column3 |
|---------|---------|---------|
| Value1  | Value2  | Value3  |
```

## Error Handling

When a command fails, the error is returned with:
- Error message
- Command that failed
- Debug information (if available)
- Suggestions for fixes

Example:
```
Error: Schema MY_SCHEMA not found
Command: hana_tables --schema MY_SCHEMA
Try: Check schema name is correct and you have permissions
```

## Advanced Configuration

### Environment Variables

- `DEBUG=hana-cli:*` - Enable debug logging
- `HANA_CLI_PROJECT_PATH` - Default project directory
- `HANA_CLI_CONN_FILE` - Default connection file

### Performance Tuning

- Increase node heap: `NODE_OPTIONS="--max-old-space-size=4096" node dist/src/index.js`
- Use connection pooling for multiple queries
- Batch operations for better performance

## Troubleshooting

See [MCP Troubleshooting](../../troubleshooting/mcp.md) for common issues.

## See Also

- [Architecture Overview](./architecture.md)
- [Connection Guide](./connection-guide.md)
- [GitHub MCP Server Code](https://github.com/SAP-samples/hana-developer-cli-tool-example/tree/Feb2026/mcp-server)
