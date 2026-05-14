# Model Context Protocol (MCP) Integration

Integrate HANA CLI with AI coding assistants via the Model Context Protocol for intelligent database operations.

## What is MCP?

The Model Context Protocol enables AI assistants to interact with external tools and databases. The HANA CLI MCP Server exposes all CLI commands as standardized tools that AI agents can discover and use intelligently.

**Key Capabilities:**

- **Progressive Tool Discovery** - Starts with ~22 focused tools; promotes additional tools on demand (up to 186 total)
- **Router Tool** - `hana_execute` dispatches any of 183+ commands by name without pre-registration
- **Discovery** - AI-guided command recommendations and smart search
- **Workflows** - Pre-built multi-step task templates
- **Examples** - Real-world usage scenarios and parameter presets
- **Documentation** - Integrated access to 279 documentation pages
- **Resources** - Browsable metadata, schemas, and command catalog
- **Prompts** - Guided conversation workflows for common tasks

## Quick Start

### Option 1: Auto-Configure (Recommended)

If you already have `hana-cli` installed, use the built-in install command:

```bash
# Auto-detect installed clients and configure them
hana-cli mcp

# Preview what would be written without making changes
hana-cli mcp --dry-run

# Target a specific client
hana-cli mcp --client claude-desktop
hana-cli mcp --client claude-code --global
hana-cli mcp --client cursor

# Check configuration status across all clients
hana-cli mcp-status
```

See [mcpServerInstall](../02-commands/developer-tools/mcp-server-install.md) for full documentation.

### Option 2: npx (No Installation)

Run the MCP server directly via npx without installing anything:

```bash
npx -y -p hana-cli hana-cli-mcp
```

Use this in your IDE's MCP configuration:

```json
{
  "mcpServers": {
    "hana-cli": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "-p", "hana-cli", "hana-cli-mcp"]
    }
  }
}
```

### Option 3: VS Code Extension

Install the **SAP HANA CLI MCP Server** extension from the VS Code Marketplace. Search for `@mcp` in the Extensions view, or install from the command line:

```bash
code --install-extension SAPOSS.hana-cli-mcp
```

This registers the MCP server with VS Code automatically — no manual configuration needed. Works with GitHub Copilot agent mode and other AI assistants.

Source: [SAP-samples/hana-cli-vscode-mcp](https://github.com/SAP-samples/hana-cli-vscode-mcp)

### Option 4: Claude Code Plugin

Install the hana-cli plugin directly in Claude Code:

```text
/plugin install https://github.com/SAP-samples/hana-cli-claude-plugin
```

Source: [SAP-samples/hana-cli-claude-plugin](https://github.com/SAP-samples/hana-cli-claude-plugin)

### Option 5: MCP Registry

The MCP server is published to the [MCP Registry](https://registry.modelcontextprotocol.io) as `io.github.SAP-samples/hana-cli`. AI clients and aggregators that support the MCP Registry can discover and install it automatically.

### Manual Configuration

You can also point directly to a local build:

```json
{
  "mcpServers": {
    "hana-cli": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-server/build/index.js"
      ]
    }
  }
}
```

:::tip
Replace the path with your actual project location. Connection credentials are read from `default-env.json` in the project root. Use `hana-cli connect` or `hana-cli serviceKey` to configure database connections.
:::

## Tool Architecture

### Tiered Tool Exposure

The MCP server uses a progressive discovery model to keep the initial tool surface small and focused:

| Layer | Tools | Description |
| ----- | ----- | ----------- |
| **Tier 1** (always-on) | `hana_query_simple`, `hana_tables`, `hana_inspect_table`, `hana_views`, `hana_status` | Core database tools available immediately |
| **Router** | `hana_execute` | Dispatches any of 183+ commands by name |
| **Discovery** | `hana_discover_categories`, `hana_discover_by_category`, `hana_discover_by_tag`, `hana_recommend`, etc. | Help AI agents find the right tools |
| **Content** | `hana_examples`, `hana_parameter_presets`, `hana_get_doc`, etc. | Usage examples and documentation |
| **Dynamic** | Up to 50 additional tools | Promoted when a category is explored via `hana_discover_by_category` |

**Default:** ~22 tools registered at startup.
**Full mode:** All 186 tools registered (use `--full` flag).

### The Router Tool (`hana_execute`)

For commands not in the tier-1 set, the router tool provides direct access without requiring dynamic promotion:

```json
{
  "tool": "hana_execute",
  "arguments": {
    "command": "dataProfile",
    "args": { "schema": "MY_SCHEMA", "table": "ORDERS" }
  }
}
```

The router resolves commands by exact name, camelCase-to-snake_case conversion, or alias matching.

### Dynamic Tool Promotion

When an AI agent calls `hana_discover_by_category` (e.g., to browse "data-tools"), the server:

1. Promotes all tools in that category to first-class MCP tools
2. Sends a `tools/list_changed` notification so the client refreshes its tool list
3. Enforces a cap of 50 dynamically-promoted tools (oldest category evicted first)

This means frequently-used categories become directly callable without the router.

### Full Mode

For environments where tool count is not a concern, pass `--full` to expose all 186 tools at startup:

```json
{
  "mcpServers": {
    "hana-cli": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "-p", "hana-cli", "hana-cli-mcp", "--full"]
    }
  }
}
```

## Core Features

### 1. Command Tools

Tier-1 commands are always available with the `hana_` prefix:

```text
hana_status              Check database connection
hana_tables              List tables in a schema
hana_inspect_table       View table structure and metadata
hana_views               List views in a schema
hana_query_simple        Execute SQL queries
```

All other commands (183+) are accessible via `hana_execute`:

```text
hana_execute { command: "import", args: { ... } }
hana_execute { command: "dataProfile", args: { ... } }
hana_execute { command: "duplicateDetection", args: { ... } }
hana_execute { command: "compareSchema", args: { ... } }
```

Command aliases still work when called (e.g., `hana_s` for status, `hana_imp` for import), but they are not registered as separate tools to keep the tool list concise.

### 2. Discovery Tools

Help AI agents find the right tools:

**`hana_recommend`** - Get command suggestions based on natural language intent:

```text
Input: "find duplicate rows in my customer table"
Output: Top 5 matching commands with confidence scores and parameter templates
```

**`hana_search`** - Search across commands, workflows, examples, presets, and documentation:

```text
Input: "csv import"
Output: Related commands, workflows, examples, and documentation
```

**`hana_quickstart`** - Essential commands guide for new users covering the 6 most common operations.

### 3. Examples and Presets

**`hana_examples`** - Get real-world usage scenarios:

```text
Input: { command: "import" }
Output: Multiple scenarios with complete parameter sets and best practices
```

**`hana_parameter_presets`** - Pre-configured parameter combinations for common use cases:

```text
Input: { command: "dataProfile", useCase: "data_quality" }
Output: Recommended parameters for comprehensive analysis
```

### 4. Workflows

**`hana_workflows`** - List available multi-step workflow templates:

```text
Available workflows:
- data-quality-check
- schema-comparison
- performance-optimization
- safe-import
- data-migration
... and 15+ more
```

**`hana_workflow_by_id`** - Get detailed steps for a specific workflow.

### 5. Documentation Access

**`hana_get_doc`** - Retrieve full content of a documentation page found via search:

```text
Input: "import csv with errors"
Output: Top 10 relevant documentation pages with excerpts
```

**`hana_get_doc`** - Retrieve complete documentation page content.

## Use Cases

### Database Exploration

Ask your AI assistant:

> "Show me the structure of tables in the HR schema"

The AI will:

1. Use `hana_recommend` to find relevant commands
2. Execute `hana_tables` to list tables
3. Use `hana_inspectTable` to examine structure
4. Format results in a readable summary

### Data Quality Analysis

> "Analyze data quality in my SALES.ORDERS table"

The AI will:

1. Execute `hana_dataProfile` for statistical analysis
2. Run `hana_duplicateDetection` to find duplicates
3. Use `hana_dataValidator` to check constraints
4. Provide a comprehensive quality report

### Import Automation

> "Import all CSV files from the data/ folder into my schema"

The AI will:

1. Check available tables with `hana_tables`
2. Use `hana_examples` to get import templates
3. Generate appropriate import commands for each file
4. Provide error handling recommendations

### Schema Migration

> "Compare my DEV and PROD schemas and show differences"

The AI will:

1. Use `hana_recommend` to find schema comparison tools
2. Execute `hana_compareSchema` with both connections
3. Use result interpretation to highlight key differences
4. Suggest next steps for migration

## Advanced Features

### Workflow Templates

Browse and use pre-built multi-step workflows:

```text
hana_workflows          - List available workflow templates
hana_workflow_by_id     - Get detailed steps for a specific workflow
hana_search_workflows   - Search workflows by tag or purpose
```

The AI agent orchestrates the individual steps — workflow templates provide the sequence and recommended parameters, while the LLM handles execution and decision-making between steps.

### Result Interpretation

`hana_interpret_result` - AI-friendly analysis and insights from command output, automatically providing context-aware explanations.

### Conversation Templates

`hana_conversation_templates` / `hana_get_template` - Pre-built dialogue flows for guided troubleshooting and task completion.

## Connection Management

### Default Connection

The MCP server reads connection details from `default-env.json` in the project root. Configure using:

```bash
# SAP BTP HANA Cloud
hana-cli serviceKey -i instance-name -k key-name

# Interactive setup
hana-cli connect
```

### Project-Specific Connections

Tools accept an optional `__projectContext` parameter:

```json
{
  "projectPath": "/path/to/project",
  "connectionFile": "default-env.json"
}
```

This allows AI agents to work with multiple database connections across different projects.

## Complete Documentation

For comprehensive guides, implementation details, and troubleshooting:

- **[MCP Server Overview](/05-development/mcp-server/)** - Complete feature documentation
- **[Setup and Configuration](/05-development/mcp-server/setup-and-configuration)** - Installation and IDE configuration
- **[Discovery Tools](/05-development/mcp-server/discovery-tools)** - Recommendations, search, and workflows
- **[Advanced Features](/05-development/mcp-server/advanced-features)** - Workflow execution and result interpretation
- **[Troubleshooting](/05-development/mcp-server/troubleshooting)** - Common issues and solutions

## See Also

- [VS Code Extension](https://github.com/SAP-samples/hana-cli-vscode-mcp) - MCP server as a VS Code extension for GitHub Copilot
- [Claude Code Plugin](https://github.com/SAP-samples/hana-cli-claude-plugin) - Plugin for the Claude Code marketplace
- [MCP Registry](https://registry.modelcontextprotocol.io/?q=hana-cli) - MCP Registry listing
- [API Server](./api-server.md) - REST API access to CLI commands
- [CLI Features](./cli-features.md) - Command syntax and Options
- [Knowledge Base](./knowledge-base.md) - Built-in help and documentation
