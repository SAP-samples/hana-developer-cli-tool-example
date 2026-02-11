# Swagger API Documentation

This document describes the Swagger/OpenAPI documentation implementation for the HANA CLI web server.

## Overview

The HANA CLI now includes full Swagger/OpenAPI 3.0 documentation for all REST API endpoints. The documentation is automatically generated from JSDoc comments in the route files using `swagger-jsdoc`.

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

## Implementation Details

### Technologies Used

- **swagger-jsdoc** (v6.2.8): Automatically generates OpenAPI specification from JSDoc comments
- **swagger-ui-express** (v5.0.0): Provides the interactive Swagger UI interface

### Architecture

The implementation consists of:

1. **routes/swagger.js**: Main Swagger configuration and route handler
   - Configures OpenAPI 3.0 specification
   - Sets up swagger-jsdoc to scan route files
   - Registers Swagger UI middleware at `/api-docs`
   - Serves raw JSON spec at `/api-docs.json`

2. **JSDoc Annotations**: All route files have been annotated with Swagger JSDoc comments:
   - routes/index.js (Configuration endpoints)
   - routes/hanaList.js (HANA list endpoints)
   - routes/hanaInspect.js (HANA inspection endpoints)
   - routes/docs.js (Documentation endpoints)
   - routes/excel.js (Export endpoints)
   - routes/dfa.js (Digital First Adoption endpoints)
   - routes/static.js (Static file and config endpoints)
   - routes/webSocket.js (WebSocket endpoints)

### OpenAPI Specification

The generated specification includes:

#### API Information

- Title: HANA CLI API
- Version: 3.202602.0
- Description: RESTful API for HANA Developer CLI Tool
- License: Apache 2.0

#### Tags/Categories

- **Configuration**: Application configuration and settings
- **HANA System**: Database system information and features
- **HANA Objects**: Database objects (tables, views, functions, indexes, schemas)
- **HANA Inspect**: Detailed object inspection with multiple output formats
- **HDI**: HANA Deployment Infrastructure containers
- **Cloud Services**: HANA Cloud service instances (HDI, SBSS, Schema, Secure Store, UPS)
- **Documentation**: README and CHANGELOG
- **Export**: Data export functionality
- **Digital First Adoption**: DFA help and contextual assistance
- **WebSockets**: Real-time operations

## Documented Endpoints

### Configuration

- `GET /` - Get current prompts/configuration
- `PUT /` - Update prompts/configuration

### HANA System

- `GET /hana` - Get system information (session, user, overview, services, version)
- `GET /hana/dataTypes` - List database data types
- `GET /hana/features` - List database features
- `GET /hana/featureUsage` - Get feature usage statistics

### HANA Objects

- `GET /hana/tables` - List all database tables
- `GET /hana/views` - List all database views
- `GET /hana/schemas` - List all database schemas
- `GET /hana/functions` - List all database functions
- `GET /hana/indexes` - List all database indexes

### HANA Inspect

- `GET /hana/inspectTable` - Inspect table structure (returns SQL, CDS, hdbtable formats)
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

- `GET /sap/dfa/help/webassistant/catalogue` - Get DFA help catalogue
- `GET /sap/dfa/help/webassistant/context` - Get DFA context help

### WebSockets

- `GET /websockets` - WebSocket information endpoint

### Static Files

- `GET /appconfig/fioriSandboxConfig.json` - Fiori Launchpad sandbox configuration

## JSDoc Annotation Format

All endpoints follow this Swagger JSDoc format:

```javascript
/**
 * @swagger
 * /endpoint/path:
 *   get:
 *     tags: [Tag Name]
 *     summary: Short description
 *     description: Longer detailed description
 *     parameters:
 *       - in: query
 *         name: paramName
 *         required: true
 *         schema:
 *           type: string
 *         description: Parameter description
 *     responses:
 *       200:
 *         description: Success response description
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 field:
 *                   type: string
 *       500:
 *         description: Error response
 */
app.get('/endpoint/path', async (req, res, next) => {
  // Handler code
})
```

## Swagger UI Features

The Swagger UI includes:

- Interactive API documentation
- Try-it-out functionality for testing endpoints
- Request/response examples
- Schema definitions
- Syntax highlighting
- Filtering and search
- Persistent authorization (if needed)
- Request duration display

## Customization

The Swagger UI has been customized with:

- Monokai syntax highlighting theme
- Hidden top bar (customCss)
- Custom site title: "HANA CLI API Documentation"
- Explorer mode enabled
- Request duration display enabled
- Filter/search enabled

## Testing

Run the included test to verify the implementation:

```bash
node test-swagger.js
```

Or run the automated tests:

```bash
npm test tests/routes/swagger.Test.js
```

## Adding New Endpoints

To document new endpoints:

1. Add JSDoc Swagger annotations above your route handler
2. Use appropriate tags to organize the endpoint
3. Document all parameters and responses
4. The Swagger specification will be automatically regenerated

Example:

```javascript
/**
 * @swagger
 * /hana/newEndpoint:
 *   get:
 *     tags: [HANA Objects]
 *     summary: My new endpoint
 *     description: Detailed description of what this does
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/hana/newEndpoint', async (req, res, next) => {
  // Your code here
})
```

## Troubleshooting

If Swagger UI doesn't load:

1. Check that the server is running on the expected port (default 3010)
2. Verify `swagger-jsdoc` is installed: `npm list swagger-jsdoc`
3. Check server console for any Swagger setup errors
4. Visit `/api-docs.json` to see if the spec is being generated

## Dependencies

The following npm packages are required:

- `swagger-jsdoc: ^6.2.8` - OpenAPI specification generator
- `swagger-ui-express: ^5.0.0` - Swagger UI middleware (already installed)

## References

- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express Documentation](https://github.com/scottie1984/swagger-ui-express)
