# Troubleshooting Guide

Solutions for common issues and problems.

## Categories

- **[Connection Issues](./connection-issues.md)** - Database connection problems
- **[MCP Server](./mcp.md)** - AI integration troubleshooting
- **[Command Errors](./command-errors.md)** - Specific command issues
- **[Performance](./performance.md)** - Slow operations
- **[Data Issues](./data-issues.md)** - Data validation and import problems

## Common Solutions

### Can't Connect to Database

1. Check connection file exists: `default-env.json` or `.env`
2. Verify credentials are correct
3. Ensure network access to host:port
4. Try: `hana-cli connect -n host:port -u user -p password -s`

### Command Not Found

1. Check command is spelled correctly
2. View all commands: `hana-cli help`
3. Ensure HANA CLI is installed: `npm install -g hana-cli`

### MCP Server Not Responding

1. Check MCP server is running
2. Verify project context is passed correctly
3. Check network connectivity to MCP server
4. Enable debug: `DEBUG=hana-cli:* hana-cli [command]`

### Import Failing

1. Validate file format (CSV/Excel)
2. Check column headers match table columns
3. Verify data types are compatible
4. Use `--matchMode order` if columns don't match by name
5. Check file encoding is UTF-8

## Getting Help

- Run `hana-cli [command] --help` for command-specific help
- Enable debug logging: `DEBUG=hana-cli:* hana-cli [command]`
- Check [GitHub Issues](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues)
- Review [FAQ](../faq.md)

## See Also

- [Developer Notes](../developer-notes/)
- [FAQ](../faq.md)
