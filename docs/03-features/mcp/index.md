# MCP Server & AI Integration

Complete documentation for the Model Context Protocol (MCP) server that enables AI assistant integration with HANA CLI.

## Quick Start

- **[Server Usage Guide](./server-usage.md)** - Running and using the MCP server
- **[Architecture Overview](./architecture.md)** - How MCP works with HANA CLI

## Advanced Topics

- **[Connection Context](./connection-guide.md)** - Project-specific database connections
- **[Knowledge Base](./knowledge-base.md)** - Integrated knowledge base support
- **[Advanced Features](./advanced-features.md)** - Presets, recommendations, workflows

## Key Capabilities

**Progressive Tool Discovery**: Starts with ~22 focused tools; expands on demand via router or dynamic promotion

**Router Tool (`hana_execute`)**: Execute any of 183+ commands by name without pre-registration

**Context-Aware Commands**: Pass project directory and connection file to MCP server

**Structured Output**: Markdown tables and formatted responses

**Error Handling**: Comprehensive troubleshooting guide available

## For Developers

- [MCP Implementation Details](../../05-development/mcp-server)
- [Troubleshooting](../../troubleshooting/mcp.md)

## Resources

- [GitHub MCP Server Code](https://github.com/SAP-samples/hana-developer-cli-tool-example/tree/Feb2026/mcp-server)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [Claude AI Integration](https://claude.ai/)
