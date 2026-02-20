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
- **[HTTP Routes](./http-routes.md)** - Web server routes and endpoints
- **[REST Endpoints](./endpoints.md)** - Detailed endpoint documentation

## Starting the API Server

```bash
hana-cli server
```

The server runs on `http://localhost:3010` by default.

Access Swagger UI:

```text
http://localhost:3010/api-docs
```

## Quick Example

```bash
# Start the server
hana-cli server

# In another terminal, get current configuration
curl http://localhost:3010/

# Update configuration
curl -X PUT http://localhost:3010/ \
  -H "Content-Type: application/json" \
  -d '{
    "schema": "MYSCHEMA",
    "table": "EMPLOYEES"
  }'
```

## Configuration Options

Customize the server with command-line options:

```bash
# Custom port
hana-cli server --port 8080

# Custom host
hana-cli server --host 0.0.0.0 --port 8080
```

See [Swagger documentation](./swagger.md) for API details.

## Next Steps

- [Swagger API Docs](./swagger.md)
- [Endpoint Reference](./endpoints.md)
- [Integration Examples](/03-features/)
