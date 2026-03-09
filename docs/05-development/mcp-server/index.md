# MCP Server Development

The Model Context Protocol (MCP) Server implementation for HANA CLI provides AI assistants with comprehensive tools and workflows to interact with SAP HANA databases.

## What is MCP Server?

The MCP Server exposes all HANA CLI commands as tools that can be used by AI assistants like Claude, enabling:

- **AI-assisted database queries** - Natural language interface to database operations
- **Automated schema analysis** - Intelligent exploration and analysis workflows
- **Command recommendations** - Intent-based discovery of the right tools
- **Guided workflows** - Pre-built multi-step task templates
- **Real-world examples** - Usage examples and parameter presets for every command

## Key Features

- **150+ Tools** - All `hana-cli` commands accessible via standardized MCP interface
- **📚 Resources** - Browsable documentation and metadata resources
- **🎬 Prompts** - Guided conversation workflows for common tasks
- **🔍 Discovery Tools** - Intent-based recommendations and smart search
- **📖 Examples** - Real-world usage examples and parameter templates for 20+ commands
- **🔄 Workflows** - Pre-built multi-step sequences for common scenarios
- **🤖 Result Interpretation** - AI-friendly analysis and insights from command results
- **📖 Integrated Docs** - 279 documentation pages with full-text search

## Quick Start

### Installation

```bash
cd mcp-server
npm install
npm run build
```

### Configuration

To use with Claude Dev or Cline in VS Code:

```json
{
  "mcpServers": {
    "hana-cli": {
      "command": "node",
      "args": ["../mcp-server/build/index.js"],
      "env": {}
    }
  }
}
```

## Documentation Sections

### Foundational Topics

- **[Setup and Configuration](./setup-and-configuration.md)** - Installation, configuration, and connection setup
- **[Features Overview](./features.md)** - Complete overview of all MCP capabilities
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

### Advanced Features

- **[Discovery Tools](./discovery-tools.md)** - Command recommendations, search, workflows, and templates
- **[Advanced Features](./advanced-features.md)** - Workflow execution, result interpretation, and more
- **[Prompts and Resources](./prompts-and-resources.md)** - MCP resources, prompts, and how agents use them

### Implementation Details

- **[Implementation Phases](./implementation-phases.md)** - Phase 1-3 improvements and technical details
- **[Documentation Search](./docs-search.md)** - Access to 279 documentation pages via MCP

## Architecture Overview

```bash
MCP Server
├── Tools (150+)
│   ├── Database Commands
│   ├── Analysis Tools
│   └── System Commands
├── Discovery
│   ├── Command Recommendations
│   ├── Smart Search
│   └── Workflow Suggestions
├── Resources
│   ├── Documentation
│   ├── Examples
│   └── Presets
└── Prompts
    ├── Task Workflows
    ├── Troubleshooting
    └── Learning Guides
```

## Common Use Cases

### 1. Database Exploration

**Goal:** Understand database structure and data quality

**Workflow:**

1. Use `hana_status` to verify connection
2. Use `hana_schemas` to list available schemas
3. Use `hana_tables` to see tables in interesting schemas
4. Use `hana_dataProfile` to analyze data quality

**MCP Help:** Use `hana_recommend` with "explore database" for guided steps

### 2. Data Import with Validation

**Goal:** Safely import data from a CSV file with validation

**Workflow:**

1. Use `hana_import` with `dryRun: true` to preview
2. Review the dry run output for issues
3. Run actual import with error handling
4. Use `hana_dataValidator` to verify imported data

**MCP Help:** Use the `import-data` prompt for guided workflow

### 3. Schema Comparison

**Goal:** Find differences between DEV and PROD schemas

**Workflow:**

1. Execute `hana_compareSchema` with source and target
2. Analyze differences in objects, columns, types
3. Generate migration DDL
4. Validate differences with team

**MCP Help:** Use `hana_examples` for compareSchema to see parameter options

## Key Components

### 1. Tools (Commands)

All `hana-cli` commands are exposed as MCP tools with the `hana_` prefix:

- `hana_status` - Connection and user information
- `hana_tables` - List database tables
- `hana_import` - Import data from files
- And 140+ more...

### 2. Discovery System

- **`hana_recommend`** - Get command suggestions from natural language intent
- **`hana_smart_search`** - Search commands, examples, presets, and workflows
- **`hana_quickstart`** - Get beginner-friendly first commands
- **`hana_conversation_templates`** - Browse pre-built task workflows

### 3. Resources

AI agents can browse documentation:

- `hana://docs/overview` - Project overview
- `hana://docs/commands/import` - Command-specific guides
- `hana://docs/categories/data-quality` - Category guides
- And 276 more...

### 4. Prompts

Guided workflows for common tasks:

- `explore-database` - Step-by-step database exploration
- `import-data` - Safe data import workflow
- `validate-data-quality` - Data quality check workflow
- And 5 more...

## Capabilities Summary

| Feature | Details |
| --------- | --------- |
| **Tools** | 150+ database commands with full parameter support |
| **Discovery** | Intent-based recommendations, keyword search, category browsing |
| **Examples** | 40+ real-world usage examples with parameter sets |
| **Presets** | 30+ parameter templates for common scenarios |
| **Workflows** | 20+ multi-step task sequences |
| **Documentation** | 279 searchable documentation pages |
| **Error Handling** | Intelligent error analysis with actionable suggestions |
| **Result Interpretation** | AI-friendly analysis and insights from command output |

## How Agents Use MCP Server

### Example: Data Import Task

```bash
Agent: "I need to import customer data from a CSV file"

System: 
1. Calls hana_recommend with intent → Gets import command + 4 related commands
2. User confirms import is correct command
3. Agent calls hana_examples with command="import" → Gets 5 usage scenarios
4. Agent calls hana_parameter_presets with command="import" → Gets preset templates
5. Agent executes import with dryRun:true
6. Agent calls hana_interpret_result → Gets AI-friendly analysis
7. Agent reviews results and proceeds with actual import
8. System suggests next steps: dataValidator, dataProfile, duplicateDetection
```

## For More Information

- **[Features Overview](./features.md)** - Detailed feature list
- **[Discovery Tools](./discovery-tools.md)** - How to find the right commands
- **[Advanced Features](./advanced-features.md)** - Workflows, interpretation, and more
- **[Implementation Phases](./implementation-phases.md)** - Technical implementation details
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

## Related Documentation

- **[MCP Feature Documentation](../../03-features/mcp/)** - User-facing MCP documentation
- **[Development Guide](../index.md)** - Overall development documentation
- **[GitHub Repository](https://github.com/SAP-samples/hana-developer-cli-tool-example)** - Source code and issues

## Next Steps

Ready to get started? See:

1. [Setup and Configuration](./setup-and-configuration.md) - Get MCP running
2. [Features Overview](./features.md) - Understand what's available
3. [Discovery Tools](./discovery-tools.md) - Learn how to find commands
