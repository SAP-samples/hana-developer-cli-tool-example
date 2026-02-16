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

The server exposes all hana-cli commands (150+) with the `hana_` prefix. For example:

- `hana_status` - Check connection status
- `hana_tables` - List database tables
- `hana_schemas` - List database schemas
- `hana_version` - Show version information
- `hana_import` - Import data (with new matchMode, dryRun, and error handling parameters)
- `hana_dataValidator` - Validate data quality
- `hana_healthCheck` - Check system health
- `hana_memoryAnalysis` - Analyze memory consumption
- And 140+ more commands...

All command aliases are also available (e.g., `hana_s` for status, `hana_t` for tables, `hana_imp` for import).

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

The MCP server consists of four main modules:

1. **command-parser.ts** - Converts yargs command definitions to JSON Schema for MCP
   - Handles both object-based and function-based builders
   - Extracts parameter types, defaults, choices, and descriptions
   - Supports command aliases

2. **executor.ts** - Executes CLI commands and captures output
   - Spawns CLI processes with proper argument conversion
   - Handles timeouts and process errors
   - Integrates with output formatter for result formatting
   - Validates environment configuration

3. **output-formatter.ts** - Formats command output for better readability
   - Parses ASCII table output from CLI commands
   - Converts to markdown format
   - Command-specific formatting (tables, schemas, procedures, etc)
   - Schema name shortening for UUIDs

4. **index.ts** - Main MCP server implementation
   - Manages the MCP protocol communication
   - Loads all commands from the parent hana-cli project
   - Registers tools with aliases
   - Handles command execution requests

## Recent Improvements (v1.202602.0)

- **Enhanced builder introspection** - Now handles function-based builders in addition to object builders
- **Better error messages** - More informative logging during command loading
- **All new commands exposed** - 150+ commands including new data validation and health check tools
- **Full parameter documentation** - All parameters with types, defaults, and descriptions
- **Improved validation** - Better environment validation and error handling

## What's Newly Exposed

**Import Command Enhancements:**

- `matchMode` - Match columns by order, name, or auto mode
- `dryRun` - Preview import without committing to database
- `maxFileSizeMB` - Memory protection for large imports
- `timeoutSeconds` - Configurable operation timeout
- `nullValues` - Custom NULL value handling
- `skipWithErrors` - Continue import on errors
- `maxErrorsAllowed` - Error threshold control

**New Commands:**

- `healthCheck` - System health status monitoring
- `memoryLeaks` - Memory leak detection
- `memoryAnalysis` - Memory consumption analysis
- `duplicateDetection` - Find and handle duplicate records
- Plus 140+ other commands for data analysis, optimization, and management
