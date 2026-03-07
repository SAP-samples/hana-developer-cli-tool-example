# REST API Server

Companion page for the REST API route map and navigation.

The canonical server setup guide is:

- [REST API Server Overview](../api-server.md)

## Route Families at a Glance

The API server loads all route modules from `routes/*.js` and exposes route families like these:

| Family | Examples |
| ------ | -------- |
| Configuration | `GET /`, `PUT /` |
| Swagger/OpenAPI | `GET /api-docs`, `GET /api-docs.json` |
| HANA List & Metadata | `GET /hana`, `GET /hana/tables`, `GET /hana/views`, `GET /hana/schemas` |
| HANA Inspect | `GET /hana/inspectTable`, `GET /hana/inspectView`, `GET /hana/querySimple` |
| Cloud/BTP | `GET /hana/hdi`, `GET /hana/sbss`, `GET /hana/schemaInstances`, `GET /hana/btpInfo` |
| Documentation | `GET /docs/readme`, `GET /docs/changelog` |
| UI & Static | `/ui/*`, `/i18n/*`, `/appconfig/fioriSandboxConfig.json` |
| WebSockets | `GET /websockets` and `ws://localhost:3010/websockets` |

## Start and Access

```bash
# Start server
hana-cli server

# Equivalent alias
hana-cli ui

# API docs
http://localhost:3010/api-docs
http://localhost:3010/api-docs.json

# Base URL
http://localhost:3010/
```

## See Also

- [REST API Server Overview](../api-server.md)
- [API Reference](/04-api-reference/)
- [HTTP Routes](/04-api-reference/http-routes.md)
- [Swagger Documentation](/04-api-reference/swagger.md)
- [Web UI](../web-ui/)
