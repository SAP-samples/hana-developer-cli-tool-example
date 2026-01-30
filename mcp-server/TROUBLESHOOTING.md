# Troubleshooting Guide for hana-cli MCP Server

## Zero Results from List Commands (tables, schemas, etc.)

If you're getting zero results when using commands like `hana_tables`, `hana_schemas`, or other list commands, this is typically caused by missing database connection configuration.

### Root Cause

The hana-cli tools require a valid SAP HANA database connection to be configured. Without this, all database queries will return empty results.

### Solution

You need to set up your HANA database connection using one of these methods:

#### Method 1: Using Service Key (Recommended for SAP BTP)

```bash
hana-cli serviceKey -i <instance-name> -k <key-name>
```

This will:
- Retrieve the service key from Cloud Foundry
- Create a `default-env.json` file with connection details
- Validate the connection

#### Method 2: Manual Connection

```bash
hana-cli connect
```

This will prompt you for connection details and create the configuration file.

#### Method 3: Create default-env.json Manually

Create a `default-env.json` file in your project root:

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "name": "my-hana-instance",
      "tags": ["hana"],
      "credentials": {
        "host": "your-host.hanacloud.ondemand.com",
        "port": "443",
        "user": "your-username",
        "password": "your-password",
        "schema": "YOUR_SCHEMA",
        "encrypt": true,
        "sslValidateCertificate": true
      }
    }]
  }
}
```

### Verifying Your Connection

After setting up the connection, test it with:

```bash
hana-cli status
```

This should display your connection details and current schema.

### Common Issues

1. **Schema Parameter**: The default schema parameter is `**CURRENT_SCHEMA**`, which gets replaced with your actual current schema. If this transformation fails, it indicates a connection issue.

2. **Empty Schema**: If the current schema is empty or null, check that your user has proper database access permissions.

3. **Connection Timeout**: Ensure your HANA instance is running and accessible from your network.

### Debug Mode

Enable debug mode to see detailed connection and query information:

```typescript
await use_mcp_tool({
  server_name: "hana-cli",
  tool_name: "hana_tables",
  arguments: {
    "table": "*",
    "schema": "**CURRENT_SCHEMA**",
    "debug": true
  }
});
```

This will output diagnostic information to help identify the issue.