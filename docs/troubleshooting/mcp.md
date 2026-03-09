# MCP Troubleshooting

Resolve common issues when using the Model Context Protocol (MCP) server integration with HANA CLI. This guide covers startup problems, connectivity issues, command execution failures, and AI integration challenges.

## Quick Links

- [MCP Server Won't Start](#mcp-server-wont-start)
- [Can't Connect to Database](#cant-connect-to-database)
- [Project Context Not Working](#project-context-not-working)
- [Command Execution Errors](#command-execution-errors)
- [Permission Denied](#permission-denied)
- [AI Integration Issues](#ai-assistant-issues)
- [Performance Issues](#slow-queries)
- [Debugging](#enable-debug-logging)

## Connection Issues

### MCP Server Won't Start

**Problem:** `node dist/src/index.js` fails to run

**Solutions:**

1. Verify Node.js is installed: `node --version`
2. Check dependencies are installed: `npm install`
3. Rebuild TypeScript: `npm run build`
4. Check for port conflicts:

   ```bash
   # macOS/Linux
   lsof -i :3000
   
   # Windows (PowerShell)
   Get-NetTCPConnection -LocalPort 3000
   ```

### Can't Connect to Database

**Problem:** MCP executes commands but gets database connection errors

**Solutions:**

1. Verify connection file exists in project: `ls .env` or `ls default-env.json`
2. Check credentials in connection file are correct
3. Verify network access to HANA server
4. Test direct connection with CLI: `hana-cli status`

### Project Context Not Working

**Problem:** MCP ignores projectPath and uses wrong connection

**Solutions:**

1. Ensure `__projectContext` is included in tool call
2. Check projectPath is absolute path (not relative)
3. Verify connection file exists at that location
4. Enable debug: `DEBUG=hana-cli:* node dist/src/index.js`

## Command Failures

### Command Execution Errors

**Problem:** Tool call returns error from HANA CLI

**Solutions:**

1. Check command parameters are correct
2. Verify schema/table names exist and you have permissions
3. Check data types match (especially for import)
4. Review error message for specific issue

### Permission Denied

**Problem:** User doesn't have access to schema/table

**Solutions:**

1. Verify user in connection file has necessary permissions
2. Check with database admin for grants
3. Try with admin/system user temporarily
4. Review SAP HANA user privileges

## Performance Issues

### Slow Queries

**Problem:** Commands take too long to complete

**Solutions:**

1. Reduce data size with `--limit` parameter
2. Use `--batchSize` smaller values for imports
3. Add WHERE clause filtering to exports
4. Check HANA server load and resources

### Memory Issues

**Problem:** Out of memory errors

**Solutions:**

1. Use smaller `--batchSize` values
2. Process data in chunks with `--limit`
3. Use pagination for large result sets
4. Increase Node.js heap: `NODE_OPTIONS="--max-old-space-size=4096"`

## AI Assistant Issues

### Claude/LLM Integration Issues

**Problem:** AI assistant doesn't see available MCP tools

**Solutions:**

1. Restart Claude Desktop or your AI IDE extension
2. Verify MCP server is running: `npm run dev`
3. Check your IDE's MCP configuration file (e.g., `claude_desktop_config.json`)
4. Ensure the correct path to the MCP executable is configured
5. Verify the MCP server is accessible on the expected port

### AI Returns Incorrect Results

**Problem:** AI assistant generates incorrect schema names, table names, or commands

**Solutions:**

1. Verify schema and table names exist: `hana-cli inspectTable <schema> <table>`
2. Verify the correct project path is set in the context
3. Review actual data in the database to confirm expectations
4. Provide explicit parameters instead of relying on AI inference
5. Ask the AI tool to verify the database metadata first

## Debug & Logs

### Enable Debug Logging

```bash
# Standard debug
DEBUG=hana-cli:* node dist/src/index.js

# Verbose debug
DEBUG=* node dist/src/index.js

# To file
DEBUG=hana-cli:* node dist/src/index.js > debug.log 2>&1
```

### Check MCP Logs

Look for messages starting with:

- `hana-cli:` - General messages
- `hana-cli:executor:` - Command execution
- `hana-cli:connection:` - Connection issues

## Getting Help

1. **Review error messages carefully** - Error output often includes hints about the root cause
2. **Enable debug logging** - Use `DEBUG=hana-cli:*` to see detailed execution flow
3. **Check project structure** - Verify configuration files exist and contain valid JSON
4. **Test CLI separately** - Run `hana-cli status` and `hana-cli systemInfo` independently to isolate MCP issues
5. **Review related documentation**:
   - [MCP Integration Guide](../03-features/mcp-integration.md)
   - [Configuration Guide](../01-getting-started/configuration.md)
   - [API Server Documentation](../03-features/api-server.md)

## See Also

- [MCP Integration Overview](../03-features/mcp-integration.md)
- [Configuration Guide](../01-getting-started/configuration.md)
- [Installation Guide](../01-getting-started/installation.md)
- [Main Troubleshooting Guide](./index.md)
- [GitHub Issues](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues)
