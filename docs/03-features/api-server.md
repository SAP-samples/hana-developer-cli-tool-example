# REST API Server

Run HANA CLI as an HTTP server for programmatic access.

## Starting the Server

```bash
# Start on default port 3010
hana-cli server

# Equivalent command
hana-cli ui

# Start on custom port
hana-cli server --port 8080

# Start on specific host
hana-cli server --host 0.0.0.0 --port 8080
```

## Configuration

### Server Options

| Option | Type | Description |
| ------ | ---- | ----------- |
| `--port, -p` | number | Server port (default: 3010) |
| `--host` | string | Server host (default: localhost) |

## Accessing the API

### Swagger UI

```bash
http://localhost:3010/api-docs
```

### OpenAPI JSON

```bash
http://localhost:3010/api-docs.json
```

### Base URL

All routes are served from the root path:

```bash
http://localhost:3010/
```

### Example Requests

#### Get Current Configuration

```bash
curl http://localhost:3010/
```

**Response:**

```json
{
  "schema": "MYSCHEMA",
  "table": "EMPLOYEES",
  "view": "",
  "port": 3010
}
```

The response reflects the current runtime prompt/configuration object and may include additional properties.

#### Update Configuration

```bash
curl -X PUT http://localhost:3010/ \
  -H "Content-Type: application/json" \
  -d '{
    "schema": "MYSCHEMA",
    "table": "EMPLOYEES"
  }'
```

**Response:**

```json
{
  "status": "ok"
}
```

#### Access Web UI

The server also provides a browser-based UI:

```bash
http://localhost:3010/ui/#Shell-home
```

## Error Handling

The server returns standard HTTP status codes:

- `200` - Success
- `404` - Route not found
- `500` - Internal server error

Error responses include a JSON body:

`404` (not found):

```json
{
  "error": {
    "message": "Route not found",
    "status": 404,
    "path": "/invalid-path"
  }
}
```

`500` (and other server errors):

```json
{
  "message": "Internal server error",
  "status": 500
}
```

## See Also

- [REST API Endpoint Map](./api-server/)
- [API Reference](/04-api-reference/)
- [Swagger Documentation](/04-api-reference/swagger.md)
- [CLI Features](./cli-features.md)
