# Swagger API Documentation

Interactive Swagger/OpenAPI 3.0 documentation is available for the HANA CLI web server. The OpenAPI specification is generated from JSDoc annotations in the route files.

## Accessing the Documentation

When the web server is running:

- **Swagger UI**: <http://localhost:3010/api-docs>
- **OpenAPI JSON Spec**: <http://localhost:3010/api-docs.json>

### Starting the Server

```bash
# Start the web server
node bin/cli.js UI

# Or using the CLI
hana-cli UI

# Aliases
hana-cli ui
hana-cli server
```

## What's Available in Swagger UI

The Swagger interface provides:

1. **Complete API reference** with routes, parameters, and schemas
2. **Try It Out** support for interactive endpoint testing
3. **Tag-based grouping** of endpoints
4. **OpenAPI JSON export** for external tooling

## API Categories

Core tags configured in the Swagger setup include:

1. **Configuration**
2. **HANA System**
3. **HANA Objects**
4. **HANA Inspect**
5. **HDI**
6. **Cloud Services**
7. **Documentation**
8. **Export**
9. **Digital First Adoption**
10. **WebSockets**

Additional route-level tags can also appear (for example: **BTP System**, **HANA Procedures**).

## Endpoint Coverage

### Configuration

- `GET /` - Get current prompts/configuration
- `PUT /` - Update prompts/configuration
- `GET /appconfig/fioriSandboxConfig.json` - Get Fiori sandbox configuration

### HANA System

- `GET /hana` - System information (session, user, overview, services, version)
- `GET /hana/version-ui` - hana-cli and tooling version info
- `GET /hana/dataTypes` - List database data types
- `GET /hana/features` - List database features
- `GET /hana/featureUsage` - Feature usage statistics
- `GET /hana/certificates` - List certificates

### HANA Objects

- `GET /hana/tables` - List tables
- `GET /hana/views` - List views
- `GET /hana/schemas` - List schemas
- `GET /hana/containers` - List HDI containers
- `GET /hana/functions` - List functions
- `GET /hana/indexes` - List indexes
- `GET /hana/users` - List users
- `GET /hana/procedures` - List procedures

### HANA Inspect and Procedures

- `GET /hana/inspectTable` - Inspect table metadata and generated artifacts
- `GET /hana/inspectView` - Inspect view metadata and generated artifacts
- `GET /hana/querySimple` - Execute a simple SQL query
- `GET /hana/callProcedure/parameters/` - Get procedure parameter metadata
- `GET /hana/callProcedure-ui/` - Execute a stored procedure

### Cloud and BTP

- `GET /hana/hdi` - List HANA Cloud HDI instances
- `GET /hana/sbss` - List HANA Cloud SBSS instances
- `GET /hana/schemaInstances` - List HANA Cloud Schema instances
- `GET /hana/securestore` - List HANA Cloud Secure Store instances
- `GET /hana/ups` - List User-Provided Service instances
- `GET /hana/btpInfo` - Get BTP information
- `GET /hana/btpSubs` - List BTP subscriptions
- `GET /hana/btp-ui` - Get BTP hierarchy for target selection
- `POST /hana/btp-ui/setTarget` - Set BTP subaccount target

### Documentation, Export, and WebSockets

- `GET /docs/readme` - Render README as HTML
- `GET /docs/changelog` - Render CHANGELOG as HTML
- `GET /excel` - Export last query results to Excel
- `GET /websockets` - WebSocket information endpoint
- `GET /sap/dfa/help/webassistant/catalogue` - DFA catalogue
- `GET /sap/dfa/help/webassistant/context` - DFA context help

## Example API Calls

```bash
# System information
curl http://localhost:3010/hana

# List tables
curl http://localhost:3010/hana/tables

# Update prompts/configuration
curl -X PUT http://localhost:3010/ -H "Content-Type: application/json" -d '{"schema":"MYSCHEMA"}'
```

## OpenAPI Specification

Use the raw JSON spec for SDK generation or import into API tooling:

```text
http://localhost:3010/api-docs.json
```

## Troubleshooting

If Swagger UI does not load:

1. Confirm the web server is running on port 3010
2. Verify `swagger-jsdoc` and `swagger-ui-express` are installed
3. Check server logs for Swagger setup errors
4. Open `/api-docs.json` to verify spec generation

## See Also

- [REST API Server Guide](./index.md)
- [HTTP Routes](./http-routes.md)
- [Command Flows & Diagrams](./command-flows.md)
- [Swagger Implementation Details](./swagger-implementation.md)
