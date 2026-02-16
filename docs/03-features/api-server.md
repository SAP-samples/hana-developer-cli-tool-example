# REST API Server

Run HANA CLI as an HTTP server for programmatic access.

## Starting the Server

```bash
# Start on default port 3000
hana-cli server

# Start on custom port
hana-cli server --port 8080

# With authentication
hana-cli server --auth basic
```

## Configuration

### Environment Variables

```bash
# Server configuration
HANA_API_PORT=3000
HANA_API_HOST=localhost
HANA_API_AUTH=basic
HANA_API_TIMEOUT=30000
```

### Server Options

| Option | Type | Description |
| ------ | ---- | ----------- |
| `--port` | number | Server port (default: 3000) |
| `--host` | string | Server host (default: localhost) |
| `--auth` | string | Authentication type: `none`, `basic`, `bearer` |
| `--timeout` | number | Request timeout in ms |

## Accessing the API

### Swagger UI

```
http://localhost:3000/api-docs
```

### Base URL

```
http://localhost:3000/api/v1
```

### Example Requests

#### Get Database Info

```bash
curl http://localhost:3000/api/v1/dbInfo
```

**Response:**
```json
{
  "database": "HDB",
  "version": "2.00.050",
  "platform": "SAP HANA"
}
```

#### List Tables

```bash
curl 'http://localhost:3000/api/v1/tables?schema=MYSCHEMA'
```

#### Run Export

```bash
curl -X POST http://localhost:3000/api/v1/export \
  -H "Content-Type: application/json" \
  -d '{
    "schema": "HR",
    "table": "EMPLOYEES",
    "format": "json"
  }'
```

## Authentication

### Basic Auth

```bash
# Start server with basic auth
hana-cli server --auth basic

# Call with credentials
curl -u username:password http://localhost:3000/api/v1/dbInfo
```

### Bearer Token

```bash
# Start server
hana-cli server --auth bearer

# Call with token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/dbInfo
```

## CORS & Headers

The API accepts these headers:

```
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
X-Request-ID: <uuid>
```

## Rate Limiting

Default limits per IP:

- 100 requests per minute
- 1000 requests per hour

Configure via environment:

```bash
export HANA_API_RATE_LIMIT=200
export HANA_API_RATE_WINDOW=60
```

## Error Handling

API returns standard HTTP status codes:

```json
{
  "error": "Table not found",
  "code": "TABLE_NOT_FOUND",
  "details": "Schema 'INVALID' not found"
}
```

Status codes:

- `200` - Success
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

## See Also

- [API Reference](/04-api-reference/)
- [Swagger Documentation](/04-api-reference/swagger.md)
- [CLI Features](./cli-features.md)
