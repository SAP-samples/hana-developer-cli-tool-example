# SAP HANA CLI MCP Server

This MCP (Model Context Protocol) server exposes all SAP HANA CLI commands as tools that can be used by AI assistants like Claude.

## Installation

The server is already built and ready to use. Dependencies are installed automatically via the `prepare` script.

## Configuration

To use this MCP server with Cline/Claude Dev, add the following to your MCP settings file:

**Location:** `C:\Users\I809764\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "hana-cli": {
      "command": "node",
      "args": [
        "D:/projects/hana-developer-cli-tool-example/mcp-server/build/index.js"
      ],
      "env": {}
    }
  }
}
```

## Server Icon

This MCP server publishes an icon via the MCP `serverInfo.icons` metadata. For compatibility, the icon is embedded as a PNG data URI derived from `../app/resources/favicon.ico`. If you want to swap the logo, replace the PNG data URI in `src/index.ts` with a new PNG or SVG data URI and update the `mimeType` accordingly.

## Available Commands

The server exposes all hana-cli commands with the `hana_` prefix. For example:

- `hana_status` - Check connection status
- `hana_tables` - List database tables
- `hana_schemas` - List database schemas
- `hana_version` - Show version information
- And 100+ more commands...

All command aliases are also available (e.g., `hana_s` for status, `hana_t` for tables).

## Usage

Once configured, the AI assistant can call these tools directly:

```bash
Can you show me the current database connection status?
```

The assistant will use the `hana_status` tool to execute the command.

## Connection

The MCP server uses the same connection configuration as the hana-cli tool:

- `.env` files in the project root
- `default-env.json` files
- Command-line connection parameters

Make sure your database connection is properly configured before using commands that require database access.

## Customization

The output formatter can be customized by editing `src/output-formatter.ts`. You can:

- Add new command-specific formatters
- Adjust table grouping logic
- Modify schema name shortening behavior
- Change markdown table formatting style

After making changes, rebuild with:

```bash
npm run build
```

## Development

To rebuild after making changes:

```bash
cd mcp-server
npm run build
```

## Architecture

The MCP server consists of three main modules:

1. **command-parser.ts** - Converts yargs command definitions to JSON Schema for MCP
2. **executor.ts** - Executes CLI commands and captures output
3. **index.ts** - Main MCP server implementation with tool handlers

The server dynamically loads all commands from `../bin/index.js` at startup, ensuring it always exposes the complete set of available commands.
