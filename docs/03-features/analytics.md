# Analytics & Reporting

Interactive data visualization and reporting capabilities for SAP HANA data, available through both the Web UI and the REST API.

## Overview

The Analytics feature provides server-side aggregation with a secure query builder, enabling drag-and-drop data exploration, SQL-mode queries, and dashboard composition — all without writing raw SQL.

```mermaid
graph LR
    A[Web UI / Client] -->|POST /hana/analytics-ui| B[Analytics Route]
    B -->|Validated SQL| C[SAP HANA]
    C -->|Result Set| B
    B -->|columns + data + metadata| A
```

## Capabilities

| Feature | Description |
|---------|-------------|
| **Dimensions** | Group-by columns for categorical breakdowns |
| **Measures** | Aggregated numeric columns (SUM, AVG, COUNT, MIN, MAX) |
| **Filters** | WHERE-clause conditions with parameterized values |
| **Cross-filters** | Dashboard tiles can filter each other interactively |
| **Limit control** | Configurable row limits (1–10,000) for large datasets |
| **Execution timing** | Response includes query execution time in milliseconds |

## Quick Start

### Via Web UI

```bash
# Start the UI server
hana-cli ui

# Navigate to the Analytics workspace in the Vue UI
# Available at http://localhost:3010 under the Analytics section
```

The graphical workspace supports three modes:

1. **Explore** — Drag dimensions and measures onto a canvas to build visualizations interactively
2. **SQL** — Write and execute ad-hoc queries using the built-in query editor
3. **Dashboard** — Compose multiple chart tiles into a grid layout with cross-filtering

### Via REST API

Send a POST request to build and execute an aggregated query:

```bash
curl -X POST http://localhost:3010/hana/analytics-ui \
  -H "Content-Type: application/json" \
  -d '{
    "schema": "MY_SCHEMA",
    "object": "SALES_DATA",
    "dimensions": ["REGION", "PRODUCT_CATEGORY"],
    "measures": [
      { "column": "REVENUE", "aggregation": "SUM", "alias": "TOTAL_REVENUE" },
      { "column": "ORDER_ID", "aggregation": "COUNT", "alias": "ORDER_COUNT" }
    ],
    "filters": [
      { "column": "YEAR", "operator": "=", "value": 2026 }
    ],
    "limit": 500
  }'
```

### Response Format

```json
{
  "columns": ["REGION", "PRODUCT_CATEGORY", "TOTAL_REVENUE", "ORDER_COUNT"],
  "data": [
    ["EMEA", "Electronics", 1250000, 3420],
    ["APAC", "Electronics", 980000, 2810]
  ],
  "metadata": {
    "totalRows": 12,
    "aggregated": true,
    "executionTime": 45
  }
}
```

## API Reference

### `POST /hana/analytics-ui`

Builds and executes a parameterized `GROUP BY` query.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `schema` | string | Yes | Database schema name |
| `object` | string | Yes | Table or view name |
| `dimensions` | string[] | No* | Columns to group by |
| `measures` | object[] | No* | Aggregated columns |
| `filters` | object[] | No | WHERE conditions |
| `limit` | integer | No | Row limit (default: 1000, max: 10000) |

*At least one dimension or measure is required.

#### Measure Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `column` | string | Yes | Column name |
| `aggregation` | string | Yes | One of: `SUM`, `AVG`, `COUNT`, `MIN`, `MAX` |
| `alias` | string | No | Output column alias |

#### Filter Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `column` | string | Yes | Column name |
| `operator` | string | Yes | One of: `=`, `!=`, `>`, `<`, `>=`, `<=`, `IN`, `LIKE`, `BETWEEN` |
| `value` | any | Yes | Scalar value, array (for `IN`/`BETWEEN`), or string |

#### Filter Operator Details

| Operator | Value Type | Example |
|----------|-----------|---------|
| `=`, `!=`, `>`, `<`, `>=`, `<=` | Scalar | `{ "column": "YEAR", "operator": "=", "value": 2026 }` |
| `IN` | Non-empty array | `{ "column": "REGION", "operator": "IN", "value": ["EMEA", "APAC"] }` |
| `LIKE` | String with wildcards | `{ "column": "NAME", "operator": "LIKE", "value": "SAP%" }` |
| `BETWEEN` | Array of exactly 2 | `{ "column": "AMOUNT", "operator": "BETWEEN", "value": [100, 500] }` |

## Security

The analytics endpoint uses multiple layers of protection against SQL injection:

1. **Identifier validation** — All schema, table, column, and alias names are validated against a strict regex (`/^[a-zA-Z0-9_][a-zA-Z0-9_]*$/`). Invalid identifiers are rejected with a 400 error.
2. **Identifier quoting** — Validated identifiers are wrapped in double-quotes in the generated SQL.
3. **Parameterized values** — All filter values are passed as prepared-statement parameters (`?` placeholders) — never interpolated into the SQL string.
4. **Allowlist enforcement** — Only whitelisted aggregation functions and operators are accepted.

## Related Commands

The analytics endpoint complements these CLI analysis commands:

- [Data Profile](/02-commands/analysis-tools/data-profile) — Statistical profiling of table columns
- [Column Stats](/02-commands/analysis-tools/column-stats) — Column store compression and statistics
- [Calc View Analyzer](/02-commands/analysis-tools/calc-view-analyzer) — Performance metrics for calculation views

## See Also

- [API Server](/03-features/api-server) — REST API server overview
- [Web UI](/03-features/web-ui/) — Web user interface overview
- [HTTP Routes](/04-api-reference/http-routes) — Complete route reference
