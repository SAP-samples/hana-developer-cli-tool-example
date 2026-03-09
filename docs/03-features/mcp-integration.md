# Model Context Protocol (MCP) Integration

Integrate HANA CLI with AI coding assistants via the Model Context Protocol for intelligent database operations.

## What is MCP?

The Model Context Protocol enables AI assistants to interact with external tools and databases. The HANA CLI MCP Server exposes all CLI commands as standardized tools that AI agents can discover and use intelligently.

**Key Capabilities:**

- **150+ Tools** - All CLI commands accessible via MCP interface
- **Discovery** - AI-guided command recommendations and smart search
- **Workflows** - Pre-built multi-step task templates
- **Examples** - Real-world usage scenarios and parameter presets
- **Documentation** - Integrated access to 279 documentation pages
- **Resources** - Browsable metadata, schemas, and command catalog
- **Prompts** - Guided conversation workflows for common tasks

## Quick Start

### Installation

```bash
cd mcp-server
npm install
npm run build
```

### Configuration

Add to your IDE's MCP settings:

**VS Code with Claude Dev or Cline:**

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

:::tip
Replace the path with your actual project location. Connection credentials are read from `default-env.json` in the project root. Use `hana-cli connect` or `hana-cli serviceKey` to configure database connections.
:::

## Core Features

### 1. Command Tools

All CLI commands are exposed with the `hana_` prefix:

```text
hana_status              Check database connection
hana_tables              List tables in a schema
hana_import              Import data from CSV/Excel
hana_dataProfile         Analyze data quality
hana_duplicateDetection  Find duplicate rows
hana_compareSchema       Compare database schemas
hana_inspectTable        View table structure and metadata
```

Command aliases are also available (e.g., `hana_s` for status, `hana_imp` for import).

### 2. Discovery Tools

Help AI agents find the right tools:

**`hana_recommend`** - Get command suggestions based on natural language intent:

```text
Input: "find duplicate rows in my customer table"
Output: Top 5 matching commands with confidence scores and parameter templates
```

**`hana_smart_search`** - Search across commands, workflows, examples, and presets:

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

**`hana_execute_workflow`** - Run pre-built multi-step workflows:

```text
Available workflows:
- data-quality-check
- schema-comparison
- performance-optimization
- safe-import
- data-migration
... and 15+ more
```

### 5. Documentation Access

**`hana_search_docs`** - Full-text search across all documentation:

```text
Input: "import csv with errors"
Output: Top 10 relevant documentation pages with excerpts
```

**`hana_get_doc`** - Retrieve complete documentation page content.

**`hana_list_doc_categories`** - Browse documentation by category.

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

### Workflow Execution

Run complex multi-step workflows:

```text
hana_preview_workflow - Preview workflow steps before execution
hana_execute_workflow - Execute complete workflow with automated steps
```

### Result Interpretation

`hana_interpret_result` - AI-friendly analysis and insights from command output, automatically providing context-aware explanations.

### Conversation Templates

`hana_get_conversation_template` - Pre-built dialogue flows for guided troubleshooting and task completion.

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

- [API Server](./api-server.md) - REST API access to CLI commands
- [CLI Features](./cli-features.md) - Command syntax and Options
- [Knowledge Base](./knowledge-base.md) - Built-in help and documentation
