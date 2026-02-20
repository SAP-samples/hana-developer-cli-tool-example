# REST API Server

Documentation for running HANA CLI as a REST API server for programmatic access.

## Quick Start

Start the API server:

```bash
hana-cli server

# By default listens on http://localhost:3010
```

Access the API:

```bash
# List all tables
curl http://localhost:3010/hana/tables

# Get table details
curl http://localhost:3010/hana/tables/MY_SCHEMA/MY_TABLE 

# Execute query
curl -X POST http://localhost:3010/hana/querySimple \
  -H "Content-Type: application/json" \
  -d '{"q": "SELECT * FROM MY_TABLE LIMIT 10"}'
```

## API Overview

The HANA CLI API server provides HTTP endpoints for all CLI commands.

### Request Format

```json
POST /hana/execute HTTP/1.1
Content-Type: application/json

{
  "command": "tables",
  "args": {
    "schema": "MY_SCHEMA",
    "output": "json"
  }
}
```

### Response Format

Success response:

```json
{
  "success": true,
  "data": {
    "rows": [...],
    "columns": [...]
  },
  "metadata": {
    "executionTime": "234ms",
    "rowCount": 42
  }
}
```

Error response:

```json
{
  "success": false,
  "error": "Schema MY_SCHEMA not found",
  "command": "tables --schema MY_SCHEMA",
  "suggestion": "Check schema name and permissions"
}
```

## Available Endpoints

### Connection

- `GET /hana/connection` - Current connection info
- `POST /hana/connect` - Establish new connection
- `POST /hana/disconnect` - Close connection

### Data Operations

- `GET /hana/tables?schema=SCHEMA` - List tables
- `GET /hana/tables/SCHEMA/TABLE` - Table details
- `GET /hana/views?schema=SCHEMA` - List views
- `POST /hana/export` - Export data
- `POST /hana/import` - Import data

### Schema Operations

- `GET /hana/schemas` - List all schemas
- `GET /hana/objects?schema=SCHEMA` - List objects
- `POST /hana/compareSchema` - Compare schemas
- `POST /hana/schemaClone` - Clone schema

### Query Execution

- `POST /hana/execute` - Run SQL query
- `POST /hana/callProcedure` - Execute stored procedure
- `GET /hana/query/:id/results` - Get query results
- `POST /hana/query/:id/cancel` - Cancel running query

### System

- `GET /hana/health` - Health check
- `GET /hana/metrics` - Performance metrics

## Authentication

By default, run in **unsecured mode** (development/local):

```bash
hana-cli server
```

## Configuration

### Port

```bash
hana-cli server --port 3010
```

### Host

```bash
hana-cli server --host 0.0.0.0  # Listen on all interfaces
```

## Usage Examples

### Using with curl

```bash
# Get tables
curl "http://localhost:3010/hana/tables?schema=MY_SCHEMA"

# Export data with filters
curl -X POST "http://localhost:3010/hana/export" \
  -H "Content-Type: application/json" \
  -d '{
    "schema": "MY_SCHEMA",
    "table": "MY_TABLE",
    "where": "STATUS = '\''ACTIVE'\''",
    "output": "json"
  }'

# Execute query
curl -X POST "http://localhost:3010/hana/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT COUNT(*) FROM MY_TABLE"
  }'
```

### Using with Node.js

```javascript
const fetch = require('node-fetch');

// Get table list
const response = await fetch('http://localhost:3010/hana/tables?schema=MY_SCHEMA');
const data = await response.json();
console.log(data.data.rows);

// Execute query
const queryResult = await fetch('http://localhost:3010/hana/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql: 'SELECT TOP 10 * FROM MY_TABLE'
  })
});
```

### Using with Python

```python
import requests
import json

# Get tables
response = requests.get(
    'http://localhost:3010/hana/tables',
    params={'schema': 'MY_SCHEMA'}
)
tables = response.json()['data']['rows']
print(tables)

# Execute query
result = requests.post(
    'http://localhost:3010/hana/execute',
    json={'sql': 'SELECT * FROM MY_TABLE LIMIT 5'}
)
print(result.json())
```

## See Also

- [Web UI](../web-ui/)
- [REST API Documentation](../../04-api-reference/)
- [Server Mode Guide](../../01-getting-started/)
