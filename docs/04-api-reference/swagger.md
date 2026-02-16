# Interactive Swagger API Documentation

The HANA CLI REST API server provides interactive Swagger/OpenAPI documentation accessible directly from the running server.

## Accessing Swagger UI

When you start the API server, Swagger documentation is available at:

```
http://localhost:3010/api/swagger
```

### Starting the API Server

```bash
# Start API server
hana-cli server

# Or with custom port
hana-cli server --port 3100

# Then visit
open http://localhost:3010/api/swagger
```

## What's Available in Swagger UI

The interactive Swagger interface includes:

### 1. **Complete API Reference**
- All 50+ REST endpoints documented
- Request/response schemas
- Parameter information
- Example values

### 2. **Try It Out** Feature
- Test endpoints directly from browser
- Configure parameters
- See live responses
- Inspect request/response headers

### 3. **API Tags**
- Configuration endpoints
- HANA System information
- HANA Objects (tables, views, functions)
- Inspection tools
- HDI management
- Cloud Services
- Documentation
- Export formats
- WebSocket
- Digital Foundation Adapter (DFA)

### 4. **Schemas**
- Request body schemas
- Response object definitions
- Data types and constraints
- Error responses

## API Endpoints by Category

### Configuration

```
GET    /                                Get current configuration
PUT    /                                Update configuration
```

### HANA System

```
GET    /hana                            System information
GET    /hana/schemas                    List schemas
GET    /hana/version                    Database version
GET    /hana/features                   Available features
```

### HANA Objects

```
GET    /hana/tables                     List tables
GET    /hana/views                      List views
GET    /hana/functions                  List functions
GET    /hana/procedures                 List procedures
GET    /hana/indexes                    List indexes
GET    /hana/roles                      List roles
GET    /hana/containers                 List HDI containers
```

### Inspection

```
GET    /hana/inspect/table/:name        Inspect table
GET    /hana/inspect/view/:name         Inspect view
GET    /hana/inspect/function/:name     Inspect function
```

### Data Operations

```
POST   /execute                         Execute SQL query
POST   /import                          Import data
POST   /export                          Export data
```

### Cloud Services

```
GET    /hana/btpInfo                    BTP information
GET    /hana/btpSubs                    BTP subaccounts
GET    /hana/hdiServiceInstances       HDI instances
```

### Documentation

```
GET    /docs                            This documentation
GET    /docs/:command                   Command-specific docs
```

## Example API Calls

### Using curl

```bash
# Get system information
curl http://localhost:3010/hana

# List all tables
curl http://localhost:3010/hana/tables

# Execute SQL query
curl -X POST http://localhost:3010/execute \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT COUNT(*) FROM MY_TABLE"
  }'
```

### Using the Try It Out Feature

1. Open Swagger UI: `http://localhost:3010/api/swagger`
2. Find endpoint (e.g., `GET /hana/tables`)
3. Click **Try it out**
4. Enter parameters if needed
5. Click **Execute**
6. View response in **Responses** section

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:

```
http://localhost:3010/swagger-output.json
```

Use this to:
- Generate client SDKs
- Import into API testing tools (Postman, Insomnia)
- Document in other tools
- Integrate with CI/CD pipelines

### Import into Postman

1. Open Postman
2. Click **Import**
3. Paste: `http://localhost:3010/swagger-output.json`
4. All endpoints automatically added
5. Ready to test

## Authentication

By default, the API server runs in **unsecured mode** (development):

```bash
hana-cli server
# No authentication required
```

### Enable Authentication

```bash
# With API key
hana-cli server --api-key "my-secret-key"

# With token
hana-cli server --token-required --tokens "token1,token2"

# Then include in requests
curl -H "Authorization: Bearer token1" \
  http://localhost:3010/hana/tables
```

## Rate Limiting & Performance

```bash
# Enable rate limiting (100 req/min)
hana-cli server --rate-limit 100

# Configure connection pool
hana-cli server --pool-size 20

# Set query timeout (30 seconds default)
hana-cli server --timeout 60
```

## See Also

- [REST API Server Guide](./index.md)
- [Command Flows & Diagrams](./command-flows.md)
- [Web UI Guide](../web-ui/)

## API Categories

### Database Information

- `GET /api/v1/dbInfo` - Get database information
- `GET /api/v1/alerts` - Get database alerts
- `GET /api/v1/replicationStatus` - Check replication status

### Tables & Schemas

- `GET /api/v1/tables` - List tables in schema
- `GET /api/v1/views` - List views in schema
- `GET /api/v1/schemas` - List all schemas

### Data Operations

- `POST /api/v1/export` - Export table data
- `POST /api/v1/import` - Import data
- `POST /api/v1/dataProfile` - Profile table data
- `POST /api/v1/dataDiff` - Compare data
- `POST /api/v1/dataValidator` - Validate data

### Schema Operations

- `POST /api/v1/compareSchema` - Compare schemas
- `POST /api/v1/schemaClone` - Clone schema
- `POST /api/v1/tableCopy` - Copy table

### Analysis

- `POST /api/v1/duplicateDetection` - Find duplicates
- `POST /api/v1/dataLineage` - Trace data lineage
- `POST /api/v1/referentialCheck` - Check foreign keys

See full [API Documentation](./endpoints.md) for details.

## Interactive Testing

Use Swagger UI for interactive API testing:

1. Start server: `hana-cli server`
2. Open: `http://localhost:3000/api-docs`
3. Expand endpoint
4. Click "Try it out"
5. Enter parameters
6. Click "Execute"

## Command Line Testing

Use curl to test endpoints:

```bash
# Get database info
curl http://localhost:3000/api/v1/dbInfo

# List tables
curl 'http://localhost:3000/api/v1/tables?schema=MYSCHEMA'

# Export data
curl -X POST http://localhost:3000/api/v1/export \
  -H "Content-Type: application/json" \
  -d '{
    "schema": "HR",
    "table": "EMPLOYEES",
    "format": "json"
  }'
```

## Authentication

All endpoints support:

- **Basic Auth**: `-u username:password`
- **Bearer Token**: `-H "Authorization: Bearer token"`
- **No Auth** (default): Open to localhost/configured hosts

## Response Format

All responses follow standard format:

**Success (200):**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-02-16T10:30:00Z"
}
```

**Error (400/500):**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-02-16T10:30:00Z"
}
```

## Integrating with Tools

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function getTableProfile(schema, table) {
  try {
    const response = await axios.post('http://localhost:3000/api/v1/dataProfile', {
      schema: schema,
      table: table
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Python

```python
import requests

def export_table(schema, table):
    endpoint = 'http://localhost:3000/api/v1/export'
    payload = {
        'schema': schema,
        'table': table,
        'format': 'json'
    }
    response = requests.post(endpoint, json=payload)
    return response.json()
```

## Documentation Files

- [Swagger Specification](./endpoints.md)
- [API Reference](/04-api-reference/)

## See Also

- [API Server Guide](../features/api-server.md)
- [REST Endpoints](./endpoints.md)
