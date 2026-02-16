# REST API Server

Documentation for running HANA CLI as a REST API server for programmatic access.

## Quick Start

Start the API server:

```bash
hana-cli server

# By default listens on http://localhost:3001
```

Access the API:

```bash
# List all tables
curl http://localhost:3001/api/tables -H "Authorization: Bearer YOUR_TOKEN"

# Get table details
curl http://localhost:3001/api/tables/MY_SCHEMA/MY_TABLE -H "Authorization: Bearer YOUR_TOKEN"

# Execute query
curl -X POST http://localhost:3001/api/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM MY_TABLE LIMIT 10"}'
```

## API Overview

The HANA CLI API server provides HTTP endpoints for all CLI commands.

### Server Modes

**CLI Mode** (default)
```bash
hana-cli [command] [options]
```

**Web UI Mode** (interactive UI)
```bash
hana-cli [command] -w --port 3010
```

**API Server Mode** (programmatic access)
```bash
hana-cli server --port 3001
```

### Request Format

```json
POST /api/execute HTTP/1.1
Authorization: Bearer <token>
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

- `GET /api/connection` - Current connection info
- `POST /api/connect` - Establish new connection
- `POST /api/disconnect` - Close connection

### Data Operations

- `GET /api/tables?schema=SCHEMA` - List tables
- `GET /api/tables/SCHEMA/TABLE` - Table details
- `GET /api/views?schema=SCHEMA` - List views
- `POST /api/export` - Export data
- `POST /api/import` - Import data

### Schema Operations

- `GET /api/schemas` - List all schemas
- `GET /api/objects?schema=SCHEMA` - List objects
- `POST /api/compareSchema` - Compare schemas
- `POST /api/schemaClone` - Clone schema

### Query Execution

- `POST /api/execute` - Run SQL query
- `POST /api/callProcedure` - Execute stored procedure
- `GET /api/query/:id/results` - Get query results
- `POST /api/query/:id/cancel` - Cancel running query

### System

- `GET /api/system/info` - System information
- `GET /api/system/version` - Database version
- `GET /api/health` - Health check
- `GET /api/metrics` - Performance metrics

## Authentication

By default, run in **unsecured mode** (development/local):

```bash
hana-cli server
```

With token authentication:

```bash
hana-cli server --token-required \
  --tokens "prod-token:secret123,dev-token:secret456"
```

With API key:

```bash
hana-cli server --api-key "my-app-api-key"
```

## Configuration

### Port

```bash
hana-cli server --port 3001
```

### Host

```bash
hana-cli server --host 0.0.0.0  # Listen on all interfaces
```

### Database

Use specific connection:

```bash
hana-cli server -d host:port -u user -p password
```

### CORS

Enable cross-origin requests:

```bash
hana-cli server --cors "*"
hana-cli server --cors "https://myapp.example.com"
```

### Rate Limiting

```bash
hana-cli server --rate-limit 100  # Max 100 requests per minute
```

## Usage Examples

### Using with curl

```bash
# Get tables
curl "http://localhost:3001/api/tables?schema=MY_SCHEMA"

# Export data with filters
curl -X POST "http://localhost:3001/api/export" \
  -H "Content-Type: application/json" \
  -d '{
    "schema": "MY_SCHEMA",
    "table": "MY_TABLE",
    "where": "STATUS = '\''ACTIVE'\''",
    "output": "json"
  }'

# Execute query
curl -X POST "http://localhost:3001/api/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT COUNT(*) FROM MY_TABLE"
  }'
```

### Using with Node.js

```javascript
const fetch = require('node-fetch');

// Get table list
const response = await fetch('http://localhost:3001/api/tables?schema=MY_SCHEMA');
const data = await response.json();
console.log(data.data.rows);

// Execute query
const queryResult = await fetch('http://localhost:3001/api/execute', {
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
    'http://localhost:3001/api/tables',
    params={'schema': 'MY_SCHEMA'}
)
tables = response.json()['data']['rows']
print(tables)

# Execute query
result = requests.post(
    'http://localhost:3001/api/execute',
    json={'sql': 'SELECT * FROM MY_TABLE LIMIT 5'}
)
print(result.json())
```

## Performance Considerations

### Connection Pooling

Server maintains connection pool:
- Default pool size: 10 connections
- Configure: `--pool-size 20`

### Query Timeout

Default timeout: 30 seconds

```bash
hana-cli server --timeout 60
```

### Result Caching

Cache recent queries:

```bash
hana-cli server --cache-queries
```

### Compression

Enable response compression:

```bash
hana-cli server --compress
```

## See Also

- [Web UI](../web-ui/)
- [REST API Documentation](../../04-api-reference/)
- [Server Mode Guide](../../01-getting-started/)
