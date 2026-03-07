# Model Context Protocol (MCP) Integration

Integrate HANA CLI with AI coding assistants via the Model Context Protocol.

## What is MCP?

The Model Context Protocol enables AI assistants to interact with external tools and databases. HANA CLI implements MCP to allow:

- AI-assisted database queries
- Automated schema analysis
- Intelligent data recommendations
- Code generation for data operations

## Resources

See the MCP Server documentation in the repository for complete setup and usage guides.

### Key Features

- **Resources** - Access database metadata and schemas
- **Tools** - Execute data operations
- **Prompts** - Pre-built interaction templates

## Quick Start

### Install MCP Server

```bash
cd mcp-server
npm install
npm run build
```

### Configure in IDE

**VS Code with Claude Extension:**

```json
{
  "mcpServers": {
    "hana-cli": {
      "command": "node",
      "args": ["../mcp-server/build/index.js"],
      "env": {
        "HANA_CLI_HOST": "your-server.com",
        "HANA_CLI_PORT": "30013",
        "HANA_CLI_USER": "dbuser",
        "HANA_CLI_PASSWORD": "password"
      }
    }
  }
}
```

:::info
Connection credentials can be provided through environment variables (as shown above) or passed through tool arguments by the AI agent. Environment variables are optional but provide fallback credentials when not specified in tool calls.
:::

## Available Tools

### Database Inspection

Query database metadata:

```bash
Tool: inspect_tables
Parameters: schema, pattern
Returns: list of tables matching pattern
```

### Data Operations

Execute data commands:

```bash
Tool: run_command
Parameters: command, args
Returns: command output
```

### Query Assistance

Get help crafting queries:

```bash
Tool: suggest_query
Parameters: intent, schema, tables
Returns: suggested SQL or command
```

## Use Cases

### Generate Import Scripts

Ask Claude:

> "Generate an import command script for CSV files in the data/ folder into my HR schema"

Claude will:

1. Use MCP to inspect available table structures
2. Generate appropriate import commands
3. Recommend column mapping

### Database Analysis

> "Analyze data quality in my SALES schema"

Claude will:

1. Use inspection tools to understand structure
2. Run data profile and validation
3. Generate analysis report

### Schema Migration

> "What are the differences between my DEV and PROD schemas?"

Claude will:

1. Inspect both schemas
2. Run compareSchema command
3. Provide detailed comparison

## Implementation Details

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MCP Server Documentation](https://github.com/SAP-samples/hana-developer-cli-tool-example/tree/main/mcp-server)

## See Also

- [API Server](./api-server.md)
- [CLI Features](./cli-features.md)
