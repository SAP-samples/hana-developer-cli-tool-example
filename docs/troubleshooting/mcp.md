# MCP Troubleshooting

Solutions for common MCP server issues.

## Connection Issues

### MCP Server Won't Start

**Problem:** `node dist/src/index.js` fails to run

**Solutions:**
1. Verify Node.js is installed: `node --version`
2. Check dependencies are installed: `npm install`
3. Rebuild TypeScript: `npm run build`
4. Check for port conflicts: `lsof -i :3000`

### Can't Connect to Database

**Problem:** MCP executes commands but gets database connection errors

**Solutions:**
1. Verify connection file exists in project: `ls .env` or `ls default-env.json`
2. Check credentials in connection file are correct
3. Verify network access to HANA server
4. Test direct connection: `hana-cli connect -s`

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

### Claude/AI Can't Call MCP Tools

**Problem:** AI assistant doesn't see available tools

**Solutions:**
1. Restart Claude Desktop if using it
2. Verify MCP server is running
3. Check claude_desktop_config.json configuration
4. Ensure correct path to MCP executable

### AI Gives Wrong Results

**Problem:** AI assistant returns incorrect data

**Solutions:**
1. Verify schema/table names are correct
2. Check project path in context is right project
3. Review data in database directly to confirm
4. Pass explicit parameters instead of relying on defaults

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

- Review error message carefully for clues
- Enable debug logging to see what's happening
- Check [MCP Architecture](./architecture.md) documentation
- Review [Connection Guide](./connection-guide.md)
- Open issue on [GitHub](https://github.com/SAP-samples/hana-developer-cli-tool-example/issues)

## See Also

- [Server Usage](./server-usage.md)
- [Connection Guide](./connection-guide.md)
- [Architecture](./architecture.md)
