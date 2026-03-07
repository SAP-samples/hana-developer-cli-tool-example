# Swagger Implementation Details

This page explains how Swagger/OpenAPI is wired in the HANA CLI web server and how route documentation is discovered.

## Implementation Overview

Swagger is configured in `routes/swagger.js` and mounted when the web server starts via `base.webServerSetup()`.

Key behavior:

- Builds an OpenAPI 3.0 definition (`swagger-jsdoc`)
- Reads API annotations from route files (`routes/*.js`)
- Serves interactive docs at `/api-docs`
- Serves raw JSON spec at `/api-docs.json`
- Applies UI options (filtering, request duration, syntax highlighting)

## Source of Truth

The API specification is generated from `@swagger` JSDoc annotations embedded in route handlers, including:

- `routes/index.js`
- `routes/hanaList.js`
- `routes/hanaInspect.js`
- `routes/docs.js`
- `routes/excel.js`
- `routes/dfa.js`
- `routes/static.js`
- `routes/webSocket.js`
- `routes/swagger.js` (for `/api-docs.json`)

## Runtime Entry Points

To start the web server and access Swagger:

```bash
hana-cli UI
```

Aliases:

```bash
hana-cli ui
hana-cli server
```

Swagger URLs:

- <http://localhost:3010/api-docs>
- <http://localhost:3010/api-docs.json>

## OpenAPI Metadata

Swagger metadata is configured in `routes/swagger.js` and includes:

- OpenAPI version: `3.0.0`
- API title/description/license/contact from i18n bundle keys
- API version read from `package.json`
- Server entries for `http://localhost:3010` and variable port form

## Notes on Tagging

The Swagger setup defines core tags (Configuration, HANA System, HANA Objects, HANA Inspect, HDI, Cloud Services, Documentation, Export, Digital First Adoption, WebSockets).

Some route annotations also use additional tag names (for example `BTP System`, `HANA Procedures`), which may appear in the rendered documentation.

## Adding or Updating Endpoint Docs

When adding an endpoint:

1. Add or update the route handler in `routes/*.js`
2. Add `@swagger` JSDoc above the handler
3. Include method, path, tags, summary, parameters (if any), and responses
4. Restart the server and verify `/api-docs` and `/api-docs.json`

## Troubleshooting

If Swagger is unavailable:

1. Confirm the server is running on the expected host/port
2. Check for route/JSDoc syntax errors in `routes/*.js`
3. Verify Swagger dependencies are installed
4. Open `/api-docs.json` first to isolate UI-only issues

## See Also

- [Swagger API Documentation](./swagger.md)
- [HTTP Routes](./http-routes.md)
- [REST API Server Guide](./index.md)
