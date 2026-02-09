# HTTP Routes Documentation

This document provides comprehensive documentation for all HTTP endpoints exposed by the hana-cli web server. The web server provides a RESTful API interface to all hana-cli functionality, making it accessible via HTTP requests rather than command-line invocations.

## Table of Contents

- [Server Overview](#server-overview)
- [Base Configuration Endpoints](#base-configuration-endpoints)
- [HANA Database Endpoints](#hana-database-endpoints)
  - [HANA Status and Metadata](#hana-status-and-metadata)
  - [HANA List Operations](#hana-list-operations)
  - [HANA Inspect Operations](#hana-inspect-operations)
- [Documentation Endpoints](#documentation-endpoints)
- [Digital Foundation Adapter (DFA) Endpoints](#digital-foundation-adapter-dfa-endpoints)
- [Static Resource Endpoints](#static-resource-endpoints)
- [WebSocket Endpoints](#websocket-endpoints)
- [Excel Export Endpoint](#excel-export-endpoint)

## Server Overview

The HTTP server is automatically initialized when certain CLI commands are run (e.g., `hana-cli inspectTable -o json -w`). The server:

- **Default Port**: 3010 (configurable via `PORT` environment variable or `--port` parameter)
- **Base URL**: `http://localhost:3010`
- **Route Loading**: All route files in the `/routes` folder are automatically loaded at startup
- **Error Handling**: Centralized error handling with proper HTTP status codes and JSON error responses
- **Static Content**: Serves UI5 application resources and documentation

All routes are registered via the `route(app, server)` function exported by each route file.

## Base Configuration Endpoints

**File**: `routes/index.js`

### GET /

Retrieves the current prompt/configuration settings.

**Response**: JSON object containing current CLI prompts and configuration

**Example**:

```bash
curl http://localhost:3010/
```

**Response**:

```json
{
  "schema": "MYSCHEMA",
  "table": "*",
  "view": "*",
  "port": 3010
}
```

### PUT /

Updates the prompt/configuration settings.

**Request Body**: JSON object with new configuration values

**Example**:

```bash
curl -X PUT http://localhost:3010/ \
  -H "Content-Type: application/json" \
  -d '{"schema": "NEWSCHEMA", "table": "MYTABLE"}'
```

**Response**:

```json
{
  "status": "ok"
}
```

## HANA Database Endpoints

**File**: `routes/hanaList.js` and `routes/hanaInspect.js`

### HANA Status and Metadata

#### GET /hana

Retrieves comprehensive HANA database status information including session context, current user, system overview, services, and version.

**Example**:

```bash
curl http://localhost:3010/hana
```

**Response**:

```json
{
  "CURRENT_USER": "DBADMIN",
  "session": [...],
  "user": [...],
  "overview": [...],
  "services": [...],
  "version": "4.0.0.0"
}
```

### HANA List Operations

All list endpoints support two URL patterns:

- `/hana/{resource}` - Returns JSON data
- `/hana/{resource}-ui` - Returns JSON data formatted for UI consumption

#### GET /hana/tables

#### GET /hana/tables-ui

Lists all tables in the current schema.

**Example**:

```bash
curl http://localhost:3010/hana/tables
```

**Response**: Array of table metadata objects

#### GET /hana/views

#### GET /hana/views-ui

Lists all views in the current schema.

**Example**:

```bash
curl http://localhost:3010/hana/views
```

**Response**: Array of view metadata objects

#### GET /hana/schemas

#### GET /hana/schemas-ui

Lists all available schemas.

**Example**:

```bash
curl http://localhost:3010/hana/schemas
```

**Response**: Array of schema objects

#### GET /hana/containers

#### GET /hana/containers-ui

Lists all HDI containers.

**Example**:

```bash
curl http://localhost:3010/hana/containers
```

**Response**: Array of container objects

#### GET /hana/dataTypes

#### GET /hana/dataTypes-ui

Lists all available data types in the HANA database.

**Example**:

```bash
curl http://localhost:3010/hana/dataTypes
```

**Response**: Array of data type definitions

#### GET /hana/features

#### GET /hana/features-ui

Lists all enabled HANA database features.

**Example**:

```bash
curl http://localhost:3010/hana/features
```

**Response**: Array of feature objects

#### GET /hana/featureUsage

#### GET /hana/featureUsage-ui

Lists feature usage statistics.

**Example**:

```bash
curl http://localhost:3010/hana/featureUsage
```

**Response**: Array of feature usage statistics

#### GET /hana/functions

#### GET /hana/functions-ui

Lists all functions in the current schema.

**Example**:

```bash
curl http://localhost:3010/hana/functions
```

**Response**: Array of function metadata objects

#### GET /hana/hdi

#### GET /hana/hdi-ui

Lists all HANA Cloud HDI service instances.

**Example**:

```bash
curl http://localhost:3010/hana/hdi
```

**Response**: Array of HDI instance objects

#### GET /hana/sbss

#### GET /hana/sbss-ui

Lists all HANA Cloud Schema and Broker for SAP HANA Service (SBSS) instances.

**Example**:

```bash
curl http://localhost:3010/hana/sbss
```

**Response**: Array of SBSS instance objects

#### GET /hana/schemaInstances

#### GET /hana/schemaInstances-ui

Lists all HANA Cloud schema service instances.

**Example**:

```bash
curl http://localhost:3010/hana/schemaInstances
```

**Response**: Array of schema service instance objects

#### GET /hana/securestore

#### GET /hana/securestore-ui

Lists all HANA Cloud Secure Store instances.

**Example**:

```bash
curl http://localhost:3010/hana/securestore
```

**Response**: Array of secure store instance objects

#### GET /hana/ups

#### GET /hana/ups-ui

Lists all User-Provided Service (UPS) instances.

**Example**:

```bash
curl http://localhost:3010/hana/ups
```

**Response**: Array of UPS instance objects

#### GET /hana/indexes

#### GET /hana/indexes-ui

Lists all indexes in the current schema.

**Example**:

```bash
curl http://localhost:3010/hana/indexes
```

**Response**: Array of index metadata objects

### HANA Inspect Operations

All inspect endpoints support two URL patterns and return detailed metadata including SQL, CDS, and HDI artifact definitions.

#### GET /hana/inspectTable

#### GET /hana/inspectTable-ui

Inspects a specific table and returns comprehensive metadata including column definitions, SQL DDL, CDS entity definition, and hdbtable artifact.

**Example**:

```bash
curl http://localhost:3010/hana/inspectTable
```

**Response**:

```json
{
  "columns": [...],
  "sql": "CREATE TABLE ...",
  "cds": "entity MyTable { ... }",
  "hdbtable": "{ \"tableName\": \"MyTable\", ... }"
}
```

#### GET /hana/inspectView

#### GET /hana/inspectView-ui

Inspects a specific view and returns comprehensive metadata including column definitions, SQL DDL (if available), CDS entity definition, and hdbview artifact.

**Example**:

```bash
curl http://localhost:3010/hana/inspectView
```

**Response**:

```json
{
  "columns": [...],
  "sql": "CREATE VIEW ... (or error message if not available)",
  "cds": "entity MyView { ... }",
  "hdbtable": "{ \"viewName\": \"MyView\", ... }"
}
```

**Note**: SQL generation for views may fail for complex views (calculation views, etc.), in which case the error message is returned in the `sql` field.

#### GET /hana/querySimple

#### GET /hana/querySimple-ui

Executes a simple SQL query against the database.

**Example**:

```bash
curl http://localhost:3010/hana/querySimple
```

**Response**: Query result set as JSON array

## Documentation Endpoints

**File**: `routes/docs.js`

### GET /docs/readme

Returns the main project README.md as HTML.

**Example**:

```bash
curl http://localhost:3010/docs/readme
```

**Response**: HTML rendered from README.md

### GET /docs/changelog

Returns the project CHANGELOG.md as HTML.

**Example**:

```bash
curl http://localhost:3010/docs/changelog
```

**Response**: HTML rendered from CHANGELOG.md

## Digital Foundation Adapter (DFA) Endpoints

**File**: `routes/dfa.js`

These endpoints support SAP Digital Foundation Adapter (DFA) web assistant integration for in-app help.

### GET /sap/dfa/help/webassistant/catalogue

Retrieves help catalogue data for specified applications.

**Query Parameters**:

- `appUrl[]` - Array of application URLs to retrieve catalogues for

**Example**:

```bash
curl "http://localhost:3010/sap/dfa/help/webassistant/catalogue?appUrl[]=app1&appUrl[]=app2"
```

**Response**:

```json
{
  "status": "OK",
  "data": [...]
}
```

**Note**: Returns empty data array with OK status if catalogues are not found.

### GET /sap/dfa/help/webassistant/context

Retrieves contextual help content for a specific help ID.

**Query Parameters**:

- `id` (required) - Help context ID

**Example**:

```bash
curl "http://localhost:3010/sap/dfa/help/webassistant/context?id=Shell-home!whatsnew"
```

**Response**:

```json
{
  "status": "OK",
  "data": {
    "tiles": [...]
  }
}
```

**Special Handling**: When `id=Shell-home!whatsnew`, the endpoint dynamically generates tiles from CHANGELOG.json with formatted HTML content.

## Static Resource Endpoints

**File**: `routes/static.js`

These endpoints serve static files for the web UI.

### Static Routes

- **GET /ui/** - Serves UI5 application resources from `/app/resources`
- **GET /sap/dfa/** - Serves DFA resources from `/app/dfa`
- **GET /resources/sap/dfa/** - Alternative path for DFA resources
- **GET /i18n/** - Serves internationalization files from `/_i18n`
- **GET /favicon.ico** - Serves the application favicon

**Example**:

```bash
curl http://localhost:3010/ui/index.html
```

### GET /appconfig/fioriSandboxConfig.json

Returns the Fiori launchpad sandbox configuration with the current hana-cli version injected.

**Example**:

```bash
curl http://localhost:3010/appconfig/fioriSandboxConfig.json
```

**Response**: JSON configuration object with version information

## WebSocket Endpoints

**File**: `routes/webSocket.js`

### GET /websockets

Returns a simple HTML page describing the WebSocket endpoint.

**Example**:

```bash
curl http://localhost:3010/websockets
```

**Response**: HTML page with WebSocket information

### WebSocket Connection: ws://localhost:3010/websockets

Establishes a WebSocket connection for real-time bidirectional communication.

**Protocol**: WebSocket upgrade from HTTP

**Connection Example** (JavaScript):

```javascript
const ws = new WebSocket('ws://localhost:3010/websockets');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Message:', data.text, 'Progress:', data.progress);
};

ws.send(JSON.stringify({
  action: 'massConvert'
}));
```

**Supported Actions**:

- `massConvert` - Initiates mass conversion process with progress updates

**Message Format**:

```json
{
  "action": "massConvert"
}
```

**Response Messages**:

```json
{
  "text": "Status message",
  "progress": 75
}
```

**Features**:

- Real-time progress updates
- Broadcast capability to all connected clients
- Error handling and reconnection support

## Excel Export Endpoint

**File**: `routes/excel.js`

### GET /excel

Exports the last query results to Excel format.

**Status**: Currently disabled due to module installation issues in SAP Business Application Studio

**Example**:

```bash
curl http://localhost:3010/excel
```

**Response**: HTTP 503 Service Unavailable

```json
{
  "error": "Excel Export temporarily disabled due to issue with install of required module in Business Application Studio"
}
```

**Note**: This endpoint requires the last command to have stored results via `base.getLastResults()`. It will return an error if no results are available.

## Error Handling

All endpoints use centralized error handling that returns JSON error responses:

```json
{
  "error": "Error message",
  "statusCode": 400,
  "stack": "Stack trace (in development mode)"
}
```

Common HTTP status codes:

- **200** - Success
- **400** - Bad Request (missing parameters, invalid input)
- **404** - Not Found (unknown route)
- **500** - Internal Server Error
- **503** - Service Unavailable (temporary issues)

## Authentication and Security

The HTTP server currently:

- Runs locally on localhost by default
- Does not implement authentication (intended for local development)
- Should not be exposed directly to the internet
- Uses the same connection credentials as the CLI (from default-env.json, .env, or connection files)

## Development Notes

### Adding New Routes

To add a new route:

1. Create a new file in the `/routes` folder (e.g., `myRoute.js`)
2. Export a `route(app, server)` function:

```javascript
export function route(app, server) {
    app.get('/myendpoint', async (req, res, next) => {
        try {
            // Your logic here
            res.json({ status: 'ok' });
        } catch (error) {
            next(error); // Pass to error handler
        }
    });
}
```

1. The route will be automatically loaded at server startup

### Best Practices

- Always use `try/catch` blocks and pass errors to `next(error)`
- Use `base.clearConnection()` before database operations to ensure fresh connections
- Store configuration via `base.setPrompts()` and retrieve via `base.getPrompts()`
- Use `base.sendResults(res, results)` to both store and send results
- Return proper HTTP status codes and JSON responses
- Handle missing parameters gracefully with appropriate error messages

## See Also

- [Main README](../README.md) - Project overview and CLI documentation
- [Utils Documentation](../utils/README.md) - Internal utility modules
- [CHANGELOG](../CHANGELOG.md) - Project change history
