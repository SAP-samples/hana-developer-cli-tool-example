# MCP Server Development

The Model Context Protocol (MCP) Server implementation for HANA CLI.

## Overview

The MCP Server exposes HANA CLI functionality to AI coding assistants like Claude, enabling:

- AI-assisted database queries
- Automated schema analysis
- Intelligent data recommendations
- Code generation for data operations

## Repository Files

Complete technical documentation is available in the project:

- **Main README:** [mcp-server/README.md](../../../mcp-server/README.md)
- **Troubleshooting Guide:** [mcp-server/TROUBLESHOOTING.md](../../../mcp-server/TROUBLESHOOTING.md)
- **Complete Overview:** See [mcp-server/](../../../mcp-server/) directory

## Quick Start

### Installation

```bash
cd mcp-server
npm install
npm run build
```

### Configuration

In your IDE (VS Code with Claude Extension):

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

## Features

### Resources

- Access database metadata and schemas
- Query table structures
- Inspect database objects

### Tools

- Execute data operations
- Run analysis commands
- Perform data transformations

### Prompts

- Pre-built interaction templates
- Common use case starters
- Best practice suggestions

## Implementation Phases

### Phase 1: Core Implementation

Basic MCP server setup with fundamental tools and resources.

### Phase 2: Enhancement

Advanced features, improved error handling, comprehensive testing.

### Phase 3: Integration

Full IDE integration, optimization, production readiness.

## Troubleshooting

For common issues and solutions, see:

- [MCP Server Troubleshooting Guide](../../../mcp-server/TROUBLESHOOTING.md)

Common issues:

- Connection failures
- Permission problems
- Tool execution errors
- Timeout issues

## Use Cases

### Database Analysis

"Analyze data quality in my SALES schema"

- MCP inspects schema structure
- Runs validation commands
- Generates analysis report

### Schema Migration

"What are differences between DEV and PROD?"

- MCP compares schemas
- Identifies missing objects
- Suggests migration steps

### Import/Export

"Generate import script for CSV files in data/ folder"

- MCP inspects table structures
- Generates import commands
- Suggests column mapping

## Contributing

Interested in improving MCP Server? See:

- [Development Guide](../index.md)
- [GitHub Repository](https://github.com/SAP-samples/hana-developer-cli-tool-example)

## Technical Details

- **Framework:** Model Context Protocol (MCP)
- **Language:** TypeScript/JavaScript
- **Transport:** Stdio-based communication
- **Build:** TypeScript compilation
- **Testing:** Comprehensive test suite

## Support

- [MCP Server README](../../../mcp-server/README.md) - Complete documentation
- [Troubleshooting](../../../mcp-server/TROUBLESHOOTING.md) - Problem solving
- [GitHub Issues](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues) - Report bugs

## See Also

- [Features - MCP Integration](../../03-features/mcp-integration.md)
- [API Reference](../../04-api-reference/)
- [Development Index](../index.md)
