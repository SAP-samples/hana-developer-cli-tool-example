# API Reference

Access HANA CLI programmatically through REST APIs.

## Overview

HANA CLI can run as an HTTP server, exposing all commands through REST endpoints. This enables:

- **Programmatic Access** - Integrate with external applications
- **Web Dashboards** - Build UI on top of HANA operations
- **Microservices** - Use as a service component
- **CI/CD Integration** - Automate database operations

## Available Resources

- **[Swagger/OpenAPI](./swagger.md)** - Complete API specification
- **[REST Endpoints](./endpoints.md)** - Detailed endpoint documentation

## Starting the API Server

```bash
hana-cli server
```

The server runs on `http://localhost:3000` by default.

Access Swagger UI:

```
http://localhost:3000/api-docs
```

## Quick Example

```bash
# Start the server
hana-cli server

# In another terminal, call an API endpoint
curl http://localhost:3000/api/alerts

# Or with data
curl -X POST http://localhost:3000/api/import \
  -H "Content-Type: application/json" \
  -d '{
    "schema": "MYSCHEMA",
    "table": "EMPLOYEES",
    "file": "data.csv"
  }'
```

## Authentication

API endpoints support:
- Basic Authentication
- API Key authentication
- Custom headers

See [Swagger documentation](./swagger.md) for details.

## Rate Limiting

Default rate limits:
- 100 requests per minute per IP
- Configurable via environment variables

## Next Steps

- [Swagger API Docs](./swagger.md)
- [Endpoint Reference](./endpoints.md)
- [Integration Examples](/03-features/)