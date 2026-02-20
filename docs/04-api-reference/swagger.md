# Swagger API Documentation

Interactive Swagger/OpenAPI 3.0 documentation is available for the HANA CLI web server. The OpenAPI specification is generated automatically from JSDoc annotations in the route files.

## Accessing the Documentation

When you run the HANA CLI UI server, the Swagger documentation is available at:

- **Swagger UI**: <http://localhost:3010/api-docs>
- **OpenAPI JSON Spec**: <http://localhost:3010/api-docs.json>

### Starting the Server

```bash
# Start the UI server
node bin/cli.js ui

# Or using the CLI
hana-cli ui
```

## What's Available in Swagger UI

The interactive Swagger interface includes:

1. **Complete API Reference**
   - All REST endpoints documented
   - Request/response schemas
   - Parameter information
   - Example values

2. **Try It Out** Feature
   - Test endpoints directly from the browser
   - Configure parameters
   - See live responses
   - Inspect request/response headers

3. **API Tags**
   - Configuration endpoints
   - HANA System information
   - HANA Objects (tables, views, functions)
   - Inspection tools
   - HDI management
   - Cloud Services
   - Documentation
   - Export formats
   - WebSocket
   - Digital First Adoption (DFA)

4. **Schemas**
   - Request body schemas
   - Response object definitions
   - Data types and constraints
   - Error responses

## API Categories

The Swagger spec organizes endpoints into 10 categories:

1. **Configuration** - Application configuration and settings
2. **HANA System** - Database system information and features
3. **HANA Objects** - Tables, views, schemas, functions, indexes
4. **HANA Inspect** - Detailed object inspection outputs
5. **HDI** - HANA Deployment Infrastructure containers
6. **Cloud Services** - HANA Cloud service instances
7. **Documentation** - README and CHANGELOG rendering
8. **Export** - Data export
9. **Digital First Adoption** - DFA help and contextual assistance
10. **WebSockets** - WebSocket information

## Endpoint Coverage

### Configuration

- `GET /` - Get current prompts/configuration
- `PUT /` - Update prompts/configuration

### HANA System

- `GET /hana` - System information (session, user, overview, services, version)
- `GET /hana/dataTypes` - List database data types
- `GET /hana/features` - List database features
- `GET /hana/featureUsage` - Feature usage statistics

### HANA Objects

- `GET /hana/tables` - List all database tables
- `GET /hana/views` - List all database views
- `GET /hana/schemas` - List all database schemas
- `GET /hana/functions` - List all database functions
- `GET /hana/indexes` - List all database indexes

### HANA Inspect

- `GET /hana/inspectTable` - Inspect table structure (SQL, CDS, hdbtable formats)
- `GET /hana/inspectView` - Inspect view structure
- `GET /hana/querySimple` - Execute simple SQL query

### HDI

- `GET /hana/containers` - List HDI containers

### Cloud Services

- `GET /hana/hdi` - List HANA Cloud HDI instances
- `GET /hana/sbss` - List HANA Cloud SBSS instances
- `GET /hana/schemaInstances` - List HANA Cloud Schema instances
- `GET /hana/securestore` - List HANA Cloud Secure Store instances
- `GET /hana/ups` - List User-Provided Service instances

### Documentation

- `GET /docs/readme` - Get README as HTML
- `GET /docs/changelog` - Get CHANGELOG as HTML

### Export

- `GET /excel` - Export last query results to Excel (currently disabled)

### Digital First Adoption

- `GET /sap/dfa/help/webassistant/catalogue` - DFA help catalogue
- `GET /sap/dfa/help/webassistant/context` - DFA context help

### WebSockets

- `GET /websockets` - WebSocket information endpoint

### Static Files

- `GET /appconfig/fioriSandboxConfig.json` - Fiori Launchpad sandbox configuration

## Example API Calls

### Using curl

```bash
# Get system information
curl http://localhost:3010/hana

# List all tables
curl http://localhost:3010/hana/tables
```

### Using the Try It Out Feature

1. Open Swagger UI: `http://localhost:3010/api-docs`
2. Find an endpoint (for example, `GET /hana/tables`)
3. Click **Try it out**
4. Enter parameters if needed
5. Click **Execute**
6. View the response in **Responses**

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:

```text
http://localhost:3010/api-docs.json
```

Use this to:

- Generate client SDKs
- Import into API testing tools (Postman, Insomnia)
- Integrate with CI/CD pipelines

### Import into Postman

1. Open Postman
2. Click **Import**
3. Paste: `http://localhost:3010/api-docs.json`
4. All endpoints are added automatically
5. Ready to test

## Troubleshooting

If Swagger UI does not load:

1. Confirm the UI server is running on port 3010
2. Verify `swagger-jsdoc` is installed (`npm list swagger-jsdoc`)
3. Check server logs for Swagger setup errors
4. Visit `/api-docs.json` to verify the spec is being generated

## See Also

- [REST API Server Guide](./index.md)
- [Command Flows & Diagrams](./command-flows.md)
- [Swagger Implementation Details](./swagger-implementation.md)
