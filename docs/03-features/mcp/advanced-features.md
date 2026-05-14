# MCP Advanced Features

Advanced capabilities and workflows for the MCP server.

## Progressive Tool Discovery

The MCP server uses a tiered architecture to keep the initial tool surface small while providing access to all 183+ commands:

### Using the Router Tool

For any command not in the tier-1 set, use `hana_execute`:

```json
{
  "tool": "hana_execute",
  "arguments": {
    "command": "dataProfile",
    "args": {
      "schema": "MY_SCHEMA",
      "table": "ORDERS"
    }
  }
}
```

### Dynamic Tool Promotion

Calling `hana_discover_by_category` promotes all tools in that category:

```json
{
  "tool": "hana_discover_by_category",
  "arguments": { "category": "data-tools" }
}
```

After this call, tools like `hana_import`, `hana_export`, `hana_data_profile` become directly callable. The server sends a `tools/list_changed` notification and the AI client refreshes its tool list.

A cap of 50 dynamically-promoted tools is enforced (oldest category evicted first via FIFO).

## Advanced Topics

### Presets & Configurations

Create preset configurations for common operations:

```json
{
  "preset": "production-backup",
  "__projectContext": {
    "projectPath": "/apps/production"
  }
}
```

### Recommendations Engine

Get recommendations for schema optimization:

```json
{
  "command": "analyzeSchema",
  "getRecommendations": true,
  "schema": "MY_SCHEMA"
}
```

### Workflow Automation

Chain multiple commands in a workflow:

```json
{
  "workflow": "migration",
  "steps": [
    { "command": "compareSchema", "source": "DEV", "target": "PROD" },
    { "command": "generateMigration", "fromSchema": "DEV", "toSchema": "PROD" },
    { "command": "dryRun": true }
  ]
}
```

### Batch Operations

Process multiple operations efficiently:

```json
{
  "batch": [
    { "command": "import", "file": "data1.csv" },
    { "command": "import", "file": "data2.csv" },
    { "command": "import", "file": "data3.csv" }
  ],
  "continueOnError": false
}
```

### Performance Optimization

Control resource usage:

```json
{
  "schema": "MY_SCHEMA",
  "optimize": {
    "parallelism": 4,
    "batchSize": 5000,
    "memoryLimit": "2GB"
  }
}
```

## See Also

- [Server Usage](./server-usage.md)
- [Connection Guide](./connection-guide.md)
- [Architecture](./architecture.md)
