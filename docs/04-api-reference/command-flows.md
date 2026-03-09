# Command and Request Flows

This page focuses on the runtime flow used by the web server and API routes.

## Server Startup Flow

```mermaid
graph TD
    A["CLI command<br/>hana-cli UI / ui / server"] --> B["base.webServerSetup(urlPath)"]
    B --> C["Create Express app + HTTP server"]
    C --> D["Discover routes<br/>routes/**/*.js"]
    D --> E["Import each route module"]
    E --> F["Register endpoints via route(app, server)"]
    F --> G["Attach 404 + global error handlers"]
    G --> H["Listen on host/port"]
    H --> I["Open browser to /ui/#Shell-home"]
```

## HTTP List Endpoint Flow (`/hana/tables` example)

```mermaid
graph TD
    A["HTTP GET /hana/tables"] --> B["routes/hanaList.js"]
    B --> C["listHandler(res, '../bin/tables', 'getTables')"]
    C --> D["base.clearConnection()"]
    D --> E["Dynamic import bin/tables.js"]
    E --> F["getTables(base.getPrompts())"]
    F --> G["base.sendResults(res, results)"]
    G --> H["JSON response + cache last results"]
```

## Inspect Endpoint Flow (`/hana/inspectTable`)

```mermaid
graph TD
    A["HTTP GET /hana/inspectTable"] --> B["routes/hanaInspect.js"]
    B --> C["inspectTableHandler(...)"]
    C --> D["Build prompt variants<br/>tbl/sql/cds/hdbtable"]
    D --> E["Run inspectTable in parallel"]
    E --> F["Merge outputs into one payload"]
    F --> G["base.sendResults(res, results)"]
```

## WebSocket Action Flow

```mermaid
graph TD
    A["Client connects ws://.../websockets"] --> B["routes/webSocket.js"]
    B --> C["WebSocketServer(noServer=true)"]
    C --> D["HTTP upgrade handled on /websockets"]
    D --> E["Receive JSON message"]
    E --> F{"action"}
    F -->|massConvert| G["massConvertLib.convert(wss)"]
    F -->|import| H["importLib.importData(base.getPrompts())"]
    F -->|other| I["Broadcast unsupported action error"]
    G --> J["Broadcast progress/status"]
    H --> J
    I --> J
```

## Error Handling Flow

```mermaid
graph TD
    A["Route throws or calls next(error)"] --> B["globalErrorHandler"]
    B --> C["Return JSON { message, status, ... }"]
    D["Unknown path"] --> E["notFoundHandler"]
    E --> F["Return JSON { error: { message, status, path } }"]
```

## See Also

- [REST API Documentation](./index.md)
- [HTTP Routes](./http-routes.md)
- [Swagger API Documentation](./swagger.md)
