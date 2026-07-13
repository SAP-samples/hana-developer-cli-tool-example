# Export Data UI — Design

**Date:** 2026-07-13
**Status:** Approved (pending spec review)

## Problem

The hana-cli Vue web UI (`hana-cli ui`) has an **Import** view in the "Import / Convert"
sidebar group, but no corresponding **Export** view — even though the CLI has fully
functional `hana-cli export` and `hana-cli massExport` commands, and `bin/importUI.js`
already exists as a UI launcher counterpart with no `exportUI.js` sibling. The asymmetry
is visible in the code: the Import view's doc epilogue references `['import', 'export']`
as an intended pair. Users expect to find Export listed alongside Import in the sidebar.

## Goal

Add an **Export Data** view that mirrors the export CLI, delivering the exported file as a
**browser download**. Scope: single-table/view export (not massExport).

## Non-Goals

- Mass export (bulk export of many objects) — future work.
- Writing to a server-side file path — browser download only.
- i18n-wiring the Vue strings (Import.vue uses hardcoded English; we match that pattern).

## Delivery Model

**Browser download.** The user selects a source table/view, optional filters, and a format,
clicks Export, and the file is streamed back with a `Content-Disposition: attachment`
header so the browser saves it to the user's Downloads folder. This follows the existing
`/excel` route pattern (`routes/excel.js`), which already streams an Excel attachment.

## Options Exposed (core query + format)

- **Source:** Table (required), Schema (defaults to `**CURRENT_SCHEMA**`)
- **Format:** csv | excel | json (required)
- **Query options:** WHERE clause, ORDER BY, Columns (comma list), Limit
- **CSV-specific:** Delimiter, Include headers, NULL value

Dropped from the CLI (don't fit a browser-download model): `output` (server path),
`timeout` (long CLI ops), `maxRows` (overlaps with `limit`).

## Architecture

### 1. Shared serializers (refactor `bin/export.js`)

Refactor the three serializers to **pure functions that return a Buffer/string** rather
than writing to disk, and export them:

- `serializeCSV(rows, { delimiter, includeHeaders, nullValue }) -> string`
- `serializeExcel(rows, { sheetName, nullValue }) -> Promise<Buffer>`
- `serializeJSON(rows, { nullValue }) -> string`

The existing CLI `exportData` keeps its disk-writing behavior by writing the returned
buffer/string to the output file. The new route sends the buffer/string to the browser.
One source of truth for serialization, consumed by both CLI and route.

**Component boundary:** each serializer has one purpose (`rows -> bytes`), is independently
testable, and depends only on its args (plus ExcelJS for the Excel case).

### 2. New route — `routes/hanaExport.js`

`GET /hana/export` with query params: `schema`, `table`, `format`, `where`, `orderby`,
`columns`, `limit`, `delimiter`, `includeHeaders`, `nullValue`.

Flow:
1. Validate inputs (see Security).
2. `base.createDBConnection()` to get the client (established route pattern).
3. Resolve `**CURRENT_SCHEMA**` the same way `bin/export.js` does.
4. Build the `SELECT ... FROM "schema"."table" [WHERE] [ORDER BY] [LIMIT]` query
   (identical shape to `bin/export.js`).
5. Execute, serialize with the shared serializer for the requested format.
6. Stream back:
   `Content-Disposition: attachment; filename=<table>_<timestamp>.<ext>`
   with the correct content-type (text/csv, application/json, or the xlsx mime).
7. On no rows: return 200 with an empty file (headers still present) OR 404 with a
   message — **decision: 400 with `{ error: 'No data to export' }`** so the UI can show it.
8. Errors pass to `next(error)` for the global error handler.

### 3. Vue view — `app/vue/src/views/Export.vue`

Mirrors Import's card layout and CSS:
- **Source** card: Table input (with `useSuggestions('tables-ui', ...)`) + Schema input
  (with `useSuggestions('schemas-ui', ...)` and `useCurrentSchema` resolved hint).
- **Format** card: format select; CSV-specific fields (delimiter, include headers,
  null value) shown when format === csv.
- **Query Options** card: where, orderby, columns, limit.
- **Export** button (`design="Emphasized"`, `icon="download"`), disabled until table set.
- On click: build query string, trigger download via
  `fetch('/hana/export?...')` → blob → object URL → anchor click, so errors (400) can be
  surfaced as a `ui5-message-strip` instead of navigating away.

No WebSocket / progress bar — single request/response.

### 4. Wiring

- `app/vue/src/router.ts`: add `{ path: '/export', name: 'export', component: () => import('./views/Export.vue') }`.
- `app/vue/src/model/navigation.ts`: add `{ key: 'export', title: 'Export', route: 'export' }`
  to the tools group; relabel group title to **"Import / Export / Convert"**.
- `bin/exportUI.js`: new launcher `hana-cli exportUI` (aliases e.g. `expui`, `exportui`,
  `downloadUI`) mirroring `bin/importUI.js` — opens the UI on the Export screen.

## Security

`where`, `orderby`, `columns` are free-text concatenated into SQL. The CLI already has this
exposure; the route adds guards the CLI lacks:

- `schema` / `table`: validate with `base.sqlInjection.isAcceptableParameter()` before
  interpolating into the quoted qualified name.
- `columns`: split on comma; validate each identifier; reject if any fails.
- `limit`: coerce to integer; reject non-numeric.
- `where` / `orderby`: cannot be validated as identifiers; kept as-is. This matches the
  existing trust model — `hana-cli ui` binds to `localhost` by default and runs under the
  user's own DB credentials; the SQL Query view already lets them run arbitrary SQL. No
  new privilege escalation.

## Testing

- `tests/routes/hanaExport.http.Test.js` (supertest):
  - CSV/Excel/JSON each return correct content-type + `Content-Disposition` attachment.
  - Missing/invalid `table` → 400.
  - Injection guard rejects bad `schema`/`table`/`columns` identifiers.
  - No-data case → 400 with error message.
- Serializer unit tests (direct calls to the refactored pure functions):
  - CSV escaping (comma, quote, newline), delimiter, include-headers toggle, null value.
  - JSON shape + null handling.
  - Excel returns a non-empty Buffer.
- Full `npm run test:routes` and `npm run lint` stay green.

## i18n

`_i18n/export*.properties` already exists with all export keys across 10 languages. Add UI
keys only if needed. Vue strings hardcoded in English to match `Import.vue`.

## Files

**New:**
- `app/vue/src/views/Export.vue`
- `routes/hanaExport.js`
- `bin/exportUI.js`
- `tests/routes/hanaExport.http.Test.js`
- serializer unit test file (e.g. `tests/cli/export.serializers.Test.js`)

**Modified:**
- `bin/export.js` (refactor serializers to pure exported functions)
- `app/vue/src/router.ts`
- `app/vue/src/model/navigation.ts`
