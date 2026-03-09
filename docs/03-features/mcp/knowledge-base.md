# MCP Knowledge Base Integration

Integrated knowledge base support in the MCP server.

## Overview

The MCP server can provide contextual help and documentation links based on the commands and errors you encounter.

## Knowledge Base Features

- **Command Help** - Detailed explanations for each HANA CLI command
- **Error Resolution** - Suggestions when commands fail
- **SAP HANA Docs** - Links to official SAP HANA documentation
- **Best Practices** - Recommended patterns and optimization tips
- **Examples** - Real-world usage examples

## Using Knowledge Base with MCP

When calling tools, you can request knowledge base suggestions:

```json
{
  "schema": "MY_SCHEMA",
  "includeHelp": true,
  "__projectContext": {
    "projectPath": "/path/to/project"
  }
}
```

Response includes:
- Command results (tables/data)
- Relevant documentation links
- Usage examples
- Best practices

## Knowledge Base Content

### Database Documentation

- [SAP HANA Cloud](https://help.sap.com/docs/hana-cloud)
- [SAP HANA Developer Guide](https://help.sap.com/docs/hana)
- [Data Dictionary Documentation](https://help.sap.com/docs)

### CLI Documentation

- [Command Reference](../../02-commands/)
- [Features Guide](../)
- [API Reference](../../04-api-reference/)

### Configuration Docs

- [Connection Setup](./connection-guide.md)
- [Project Context](./architecture.md)
- [Environment Variables](../../troubleshooting/)

## Integration with AI Assistants

When Claude or other AI assistants use MCP, they can:

1. **Search Knowledge Base** for command help
2. **Get Error Explanations** when commands fail
3. **Receive Best Practices** for optimization
4. **Link to Official Docs** for deeper learning

Example Claude conversation:
```
User: "How do I find duplicate records?"
Claude: (uses MCP tool duplicateDetection)
Claude: "I found these duplicates... Here's documentation 
         on preventing duplicates in SAP HANA:"
```

## See Also

- [Server Usage](./server-usage.md)
- [Connection Guide](./connection-guide.md)
- [Features Guide](../)
