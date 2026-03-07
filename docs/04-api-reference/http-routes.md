# HTTP Routes Documentation

This page documents the HTTP endpoints exposed by the hana-cli web server.

## Server Overview

Start the web server with:

```bash
hana-cli UI
```

Aliases:

```bash
hana-cli ui
hana-cli server
```

Server behavior:

- **Default Port**: `3010` (override with `PORT` env var or `--port`)
- **Default Host**: `localhost` (override with `HOST` or `--host`)
- **Base URL**: `http://localhost:3010`
- **Route loading**: all files in `routes/**/*.js` are auto-loaded

## Configuration Endpoints (`routes/index.js`)

- `GET /` - Get current prompts/configuration
- `PUT /` - Update prompts/configuration

Example:

```bash
curl -X PUT http://localhost:3010/ -H "Content-Type: application/json" -d '{"schema":"MYSCHEMA","table":"MYTABLE"}'
```

## HANA List and System Endpoints (`routes/hanaList.js`)

### Core system

- `GET /hana`
- `GET /hana/version-ui`

### List endpoints (JSON and `-ui` aliases)

Each of the following is available as both `/hana/<name>` and `/hana/<name>-ui`:

- `tables`
- `views`
- `schemas`
- `containers`
- `certificates`
- `btpInfo`
- `btpSubs`
- `dataTypes`
- `features`
- `featureUsage`
- `functions`
- `hdi`
- `sbss`
- `schemaInstances`
- `securestore`
- `ups`
- `indexes`
- `users`
- `procedures`

### BTP target endpoints

- `GET /hana/btp-ui`
- `POST /hana/btp-ui/setTarget`

Example request body:

```json
{
  "subaccount": "<subaccount-guid>"
}
```

## HANA Inspect and Procedure Endpoints (`routes/hanaInspect.js`)

Inspect/query endpoints support both base and `-ui` paths:

- `GET /hana/inspectTable`
- `GET /hana/inspectView`
- `GET /hana/querySimple`

Procedure endpoints:

- `GET /hana/callProcedure/parameters/`
- `GET /hana/callProcedure-ui/`

## Documentation Endpoints (`routes/docs.js`)

- `GET /docs/readme` - Render `README.md` as HTML
- `GET /docs/changelog` - Render `CHANGELOG.md` as HTML

## DFA Endpoints (`routes/dfa.js`)

- `GET /sap/dfa/help/webassistant/catalogue`
- `GET /sap/dfa/help/webassistant/context`

Notes:

- `catalogue` expects `appUrl` query input
- `context` expects required `id` query input

## Static and App Config Endpoints (`routes/static.js`)

Static mappings:

- `/ui/` -> `app/resources`
- `/sap/dfa/` -> `app/dfa`
- `/resources/sap/dfa/` -> `app/dfa`
- `/i18n/` -> `_i18n`
- `/favicon.ico` -> UI favicon

Documented config endpoint:

- `GET /appconfig/fioriSandboxConfig.json`

## WebSocket Endpoint (`routes/webSocket.js`)

- `GET /websockets` (informational HTML)
- WebSocket upgrade path: `ws://localhost:3010/websockets`

Supported actions currently handled:

- `massConvert`
- `import`

## Excel Export Endpoint (`routes/excel.js`)

- `GET /excel` - Export last stored results to `.xlsx`

Notes:

- Success returns Excel MIME type
- Requires previous results stored by the server (`base.getLastResults()`)

## Error Handling

Centralized middleware returns JSON for most runtime errors:

```json
{
  "message": "Error message",
  "status": 500,
  "stack": "Only included in development"
}
```

404 responses use a different shape:

```json
{
  "error": {
    "message": "Route not found",
    "status": 404,
    "path": "/unknown"
  }
}
```

## Authentication and Security

The web server is intended for local use:

- No built-in authentication
- Binds to localhost by default
- Reuses CLI connection credentials/configuration

## See Also

- [REST API Server Guide](./index.md)
- [Swagger API Documentation](./swagger.md)
- [Swagger Implementation Details](./swagger-implementation.md)
