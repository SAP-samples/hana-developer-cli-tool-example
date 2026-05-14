# MCP Server Usage & Setup

How to run and use the MCP (Model Context Protocol) server with HANA CLI.

## Quick Start

### Easiest: Auto-Configure

```bash
# Auto-detect installed AI clients and configure them
hana-cli mcp

# Or target a specific client
hana-cli mcp --client claude-desktop
hana-cli mcp --client claude-code --global
hana-cli mcp --client cursor
```

### Via npx (No Local Install)

Run the MCP server via npx — no global install or build step needed:

```bash
npx -y -p hana-cli hana-cli-mcp
```

### From Source (Development)

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
# Start MCP server (listens on stdio) — default: ~22 tools
node build/index.js

# Full mode: all 186 tools exposed at startup
node build/index.js --full

# With debug logging
DEBUG=hana-cli:* node build/index.js

# With larger heap for very large workloads
NODE_OPTIONS="--max-old-space-size=4096" node build/index.js
```

### MCP Registry

The server is published to the [MCP Registry](https://registry.modelcontextprotocol.io) as `io.github.SAP-samples/hana-cli`. AI clients that support the MCP Registry can discover and install it automatically.

## How It Works

The MCP server:

1. **Receives tool calls** from AI assistants (Claude, etc)
2. **Extracts parameters** from the request
3. **Executes HANA CLI commands** in Node.js
4. **Returns results** in structured markdown format

## Available Tools

By default, the MCP server exposes ~22 tools at startup using a progressive discovery model:

**Tier-1 (always available):** `hana_query_simple`, `hana_tables`, `hana_inspect_table`, `hana_views`, `hana_status`

**Router:** `hana_execute` — dispatches any of 183+ commands by name (e.g., `{ "command": "import", "args": { ... } }`)

**Discovery:** `hana_discover_categories`, `hana_discover_by_category`, `hana_discover_by_tag`, `hana_recommend`, `hana_search`, `hana_quickstart`

**Content:** `hana_examples`, `hana_parameter_presets`, `hana_get_doc`, `hana_interpret_result`, `hana_conversation_templates`, `hana_get_template`

**Workflows:** `hana_workflows`, `hana_workflow_by_id`, `hana_search_workflows`

When an AI agent explores a category via `hana_discover_by_category`, those tools are dynamically promoted to first-class tools (up to 50 additional tools, oldest category evicted first).

Use `--full` mode to expose all 186 tools at startup for environments where tool count is not a concern.

## Usage with AI Assistants

### With Claude Desktop

1. Configure `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hana-cli": {
      "command": "npx",
      "args": ["-y", "-p", "hana-cli", "hana-cli-mcp"]
    }
  }
}
```

Or run `hana-cli mcp --client claude-desktop` to configure automatically.

1. Restart Claude Desktop
1. Ask Claude questions about your HANA database

### With VSCode (GitHub Copilot)

1. **Configure VSCode MCP Settings**

   Edit your VSCode MCP configuration at `~/.config/Code/User/mcp.json` (or find it in your User settings):

   ```json
   {
     "servers": {
       "io.github.SAP-samples/hana-cli": {
         "type": "stdio",
         "command": "npx",
         "args": ["-y", "-p", "hana-cli", "hana-cli-mcp"]
       }
     }
   }
   ```

   Or if you have a local build, point directly to it:

   ```json
   {
     "servers": {
       "io.github.SAP-samples/hana-cli": {
         "type": "stdio",
         "command": "node",
         "args": [
           "/absolute/path/to/mcp-server/build/index.js"
         ]
       }
     }
   }
   ```

   **Important Notes:**

   - Use absolute paths when pointing to a local build
   - Use forward slashes `/` even on Windows

1. **Restart VSCode**

   VSCode will automatically detect and load the MCP server

1. **Verify Installation**

  Open the VSCode output panel (View → Output), then select **Copilot** from the dropdown.

  You should see messages like:

  `[MCP] Loaded ... command modules from hana-cli`

  `[MCP] Registered ... unique commands with ... processed modules`

  `[MCP] SAP HANA CLI MCP Server running on stdio`

1. **Use with Copilot**

   Ask Copilot questions about your HANA database:

   - "Show me all tables in my schema"
   - "Import CSV data into this table"
   - "Compare data between two tables"
   - Copilot will use the `hana_*` tools to answer

**Tip:** Use `hana_search` tool to search the full documentation for answers to complex questions.

### With Custom AI Agents

```javascript
const { exec } = require('child_process');

// Start MCP server
const server = exec('node mcp-server/build/index.js');

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
1. Look for `.env`, `default-env.json`, or connection files
1. Execute the command using the project's database

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

```text
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

- Increase node heap: `NODE_OPTIONS="--max-old-space-size=4096" node build/index.js`
- Use connection pooling for multiple queries
- Batch operations for better performance

## Troubleshooting

See [MCP Troubleshooting](../../troubleshooting/mcp.md) for common issues.

## See Also

- [Architecture Overview](./architecture.md)
- [Connection Guide](./connection-guide.md)
- [GitHub MCP Server Code](https://github.com/SAP-samples/hana-developer-cli-tool-example/tree/Feb2026/mcp-server)
