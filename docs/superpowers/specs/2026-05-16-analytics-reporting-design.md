# Analytics Reporting Tool — Design Spec

## Overview

A graphical analytic reporting workspace for the Vue web UI that enables interactive data visualization against any HANA table or view. The feature combines three modes in a single integrated view: ad-hoc data exploration (drag-and-drop), SQL-driven visualization (extending QuerySimple), and a dashboard builder (grid canvas with persistence).

## Goals

- Let users visually explore any table or view without writing SQL
- Provide chart visualization for SQL query results
- Allow users to compose multi-chart dashboards and save/share them
- Push aggregation to HANA for large datasets; handle small datasets client-side
- Integrate seamlessly with the existing Vue UI navigation and design patterns

## Technology Choices

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Charting library | Apache ECharts + vue-echarts | Rich interactivity, wide chart variety, canvas-based perf for large results, tree-shakeable, strong Vue 3 integration |
| Dashboard persistence | localStorage + JSON export/import | No schema changes, instant saves, portable via file sharing |
| Data aggregation | Hybrid server/client | Server-side GROUP BY for tables >10K rows; raw data for small tables with client aggregation |
| Drag-and-drop | HTML5 DnD API | No extra dependency; sufficient for column list → drop zone interactions |
| Grid layout | CSS Grid (12-column) | No external library; lightweight composable tracks tile positions |

## Architecture

### Layout

Single new view (`Analytics.vue`) accessible via left-side navigation under an "Analytics" group. Internally uses a tab bar to switch between three modes:

1. **Explore** — Pick a table/view, drag columns into Dimension/Measure zones, see a chart
2. **SQL** — Embeds existing QuerySimple component + "Visualize" button to chart results
3. **Dashboard** — Grid canvas of saved chart tiles with cross-filtering

### Component Tree

```
Analytics.vue (orchestrator — tab bar + shared state)
├── ExploreTab.vue
│   ├── DataSourcePicker.vue (schema/table/view selector with typeahead)
│   ├── DragDropConfig.vue (column list + Dimensions/Measures drop zones)
│   └── FilterBar.vue (global filter chips)
├── SqlTab.vue
│   ├── [Embeds existing QueryEditor.vue — extracted from QuerySimple]
│   └── VisualizeButton.vue (pipes results → chart config)
├── DashboardTab.vue
│   ├── DashboardGrid.vue (resizable tile layout)
│   ├── ChartTile.vue (individual chart widget in grid)
│   └── DashboardToolbar.vue (save, load, export, add chart)
└── shared/
    ├── ChartRenderer.vue (ECharts instance — used by ExploreTab, SqlTab, and ChartTile)
    ├── ChartTypeSwitcher.vue (icon toolbar for bar/line/pie/scatter/etc.)
    └── AggregationBadge.vue (shows server-side vs raw data mode)
```

### Composables

| Composable | Responsibility |
|---|---|
| `useChartEngine` | ECharts instance lifecycle, resize handling, theme integration |
| `useChartConfig` | Reactive state: dimensions, measures, chart type, filters, aggregation mode |
| `useDataSource` | Fetches table metadata (columns + types + row count), handles aggregation decision. Falls back to server-side aggregation if row count is unavailable (e.g., complex views). |
| `useDragDrop` | Drag-and-drop state: dragged column, drop target, validation |
| `useDashboardGrid` | Tile position management: tracks `{ id, x, y, w, h }` for each tile, handles resize/reposition |
| `useDashboardStore` | localStorage CRUD + JSON export/import for saved dashboards (serializes grid + configs) |
| `useCrossFilter` | Click-on-chart → update filters → re-query linked charts sharing the same schema+object |

### Backend Route

New route: `routes/hanaAnalytics.js`

**Endpoint:** `POST /hana/analytics-ui`

**Request body:**
```json
{
  "schema": "MYSCHEMA",
  "object": "SALES_DATA",
  "objectType": "table",
  "dimensions": ["REGION", "YEAR"],
  "measures": [
    { "column": "REVENUE", "aggregation": "SUM" },
    { "column": "ORDERS", "aggregation": "COUNT" }
  ],
  "filters": [
    { "column": "YEAR", "operator": ">=", "value": "2023" }
  ],
  "orderBy": { "column": "REVENUE", "direction": "DESC" },
  "limit": 1000
}
```

**Response:**
```json
{
  "columns": ["REGION", "YEAR", "SUM_REVENUE", "COUNT_ORDERS"],
  "data": [
    ["EMEA", "2024", 1250000, 3400],
    ["APAC", "2024", 980000, 2100]
  ],
  "metadata": {
    "totalRows": 45000,
    "aggregated": true,
    "executionTime": 124
  }
}
```

**SQL generation:** The route builds a parameterized SQL statement from the spec. Table/schema/column names are validated against actual metadata from `inspectTable` (only names that exist in the real schema are allowed). Filter values use parameterized queries (`?` placeholders with bound values). Follows existing patterns in `utils/sqlInjection.js`.

## Explore Tab — Detailed Design

### Layout (left to right)

1. **Left panel (30%)** — Data source picker at top (schema dropdown + table/view typeahead using existing `useSuggestions`), then scrollable column list with data type icons
2. **Middle panel — Drop zones** — "Dimensions" zone (accepts string/date/boolean) and "Measures" zone (accepts numeric, each with aggregation dropdown: SUM, AVG, COUNT, MIN, MAX). Columns draggable between zones or back to source list.
3. **Right panel (60%)** — ChartTypeSwitcher toolbar at top, ChartRenderer filling remaining space, AggregationBadge in corner

### Chart Auto-Suggestion

| Dimensions | Measures | Suggested Chart |
|---|---|---|
| 1 categorical | 1 numeric | Horizontal bar |
| 1 categorical | 2+ numeric | Grouped bar |
| 1 date/time | 1+ numeric | Line chart |
| 2 categorical | 1 numeric | Heatmap |
| 0 (none) | 1 numeric | KPI card (single value) |
| 1 categorical (≤5 values) | 1 numeric | Pie/donut |
| 1 categorical (>10 values) | 1 numeric | Bar (sorted) |
| 2+ anything | 2 numeric | Scatter plot |

The suggestion highlights a default in ChartTypeSwitcher. All other types remain clickable — the suggestion is a hint, not a constraint.

### Drag-and-Drop

HTML5 Drag and Drop API via `useDragDrop` composable:
- Tracks `draggedColumn`, `dropTarget` (for visual hover feedback)
- Validates type compatibility on drop (warns if dropping string into measures, but allows it as COUNT)

## SQL Tab — Detailed Design

Embeds the existing `QuerySimple` component (full Monaco editor, tab management, history, execution plans). Adds a "Visualize" button that:

1. Takes the current result set (already in memory from query execution)
2. Opens a column-mapping popover: user picks which result columns are dimensions vs. measures
3. Feeds the mapped config into `useChartConfig`
4. ChartRenderer appears below/beside the result table

No new backend call needed — reuses QuerySimple's existing result data.

To enable embedding, QuerySimple's core logic will be extracted into a reusable `QueryEditor.vue` component that both the standalone `/querySimple` route and the Analytics SQL tab consume.

## Dashboard Tab — Detailed Design

### Grid Canvas

- CSS Grid, 12-column system
- Tiles are resizable (drag bottom-right corner) and repositionable (drag title bar)
- Default tile: 6 columns × 1 row (half-width). Minimum: 3 columns.
- `useDashboardGrid` composable tracks tile positions as `{ id, x, y, w, h, config }` objects

### Adding Charts

"Add Chart" button opens a modal with two paths:
- **From Explore** — mini Explore config inline (pick table, drag columns, choose chart type)
- **From SQL** — write/paste query, run it, map columns to chart roles

Each tile stores its own `ChartConfig` and re-queries independently on load or filter change.

### Cross-Filtering

- Click a bar/slice/point → adds a temporary filter (e.g., REGION = "EMEA")
- All other tiles on the same dashboard receive this filter and re-render
- "Clear cross-filters" button appears in FilterBar when active
- Cross-filtering only applies within tiles sharing the same data source (avoids impossible JOINs)

### Persistence

```typescript
interface DashboardDefinition {
  id: string           // UUID
  name: string         // User-given name
  createdAt: string    // ISO timestamp
  updatedAt: string    // ISO timestamp
  globalFilters: Filter[]
  tiles: DashboardTile[]
}

interface DashboardTile {
  id: string
  position: { x: number, y: number, w: number, h: number }
  config: ChartConfig  // data source, dims, measures, chartType, filters
}
```

**Storage behavior:**
- Auto-save to localStorage every 10 seconds (debounced) while editing
- Explicit "Save" button persists current state
- "Export" downloads `DashboardDefinition` as `.json`
- "Import" loads a `.json` file into local dashboard list
- Dashboard list view shows saved dashboards with name, last modified, tile count

**Toolbar:** `[ Dashboard Name (editable) ] [ + Add Chart ] [ 💾 Save ] [ ⬇ Export ] [ ⬆ Import ] [ 🗑 Delete ]`

## Filter Bar — Shared Component

Horizontal row of filter chips below the tab bar, shared across all tabs:

- Each chip: `COLUMN operator VALUE` with × to remove
- "+" button opens filter builder popover:
  - Column dropdown (from current data source)
  - Operator dropdown (=, !=, >, <, >=, <=, IN, LIKE, BETWEEN — varies by type)
  - Value input (text, multi-select for IN, date picker for dates)
- Filters persist per-tab (Explore/SQL/Dashboard each has its own context)
- In Dashboard mode, filter bar shows global filters applying to all tiles

## Chart Interactions

All powered by ECharts events:

| Interaction | Behavior |
|---|---|
| Hover | Tooltip with exact values |
| Click | Dashboard: cross-filter. Explore: "Drill into [value]" popover |
| Brush select | Filters to selected range (scatter/line/bar) |
| Data zoom | Scrollbar for panning time-series |
| Right-click | Context menu: "Exclude value", "Drill into", "Copy value" |

## App Integration

**Navigation:** New entry in left sidebar:
```
Analytics
  └── Reports    →  /analytics
```

**Router:** Single route in `router.ts`:
```typescript
{ path: '/analytics', name: 'analytics', component: () => import('./views/Analytics.vue') }
```

**Navigation model:** Added to `navigation.ts` after "Developer Tools", using the existing `NavGroup`/`NavItem` interface:
```typescript
{
  key: 'analytics',
  title: 'Analytics',
  icon: 'business-objects-experience',
  items: [
    { key: 'analytics', title: 'Reports', icon: 'chart-table-view' }
  ]
}
```

Navigation resolves routes via `item.route || item.key`, so the `key: 'analytics'` maps to the router's named route `'analytics'`.

**New dependencies** (added to `app/vue/package.json`):
- `echarts`
- `vue-echarts`

**Backend route:** `routes/hanaAnalytics.js` registered in Express app alongside existing routes.

**QuerySimple refactor:** Extract core editor logic into `QueryEditor.vue` component, consumed by both standalone QuerySimple view and Analytics SQL tab. This is a prerequisite step that must be verified (existing QuerySimple still works) before building the SQL tab.

## Data Flow Summary

```
User action (Explore/SQL/Dashboard)
  → useChartConfig (reactive config state)
  → useDataSource (checks row count via inspectTable metadata)
  → IF rows > 10,000: POST /hana/analytics-ui (server-side aggregation)
    ELSE: GET raw data with LIMIT, aggregate client-side
  → useChartEngine (ECharts render)
  → Chart interactions → useCrossFilter → re-query affected tiles
```

## Out of Scope (for now)

- Real-time streaming / live-updating charts
- Scheduled report generation / email delivery
- Multi-user dashboard sharing via HANA storage
- Map/geo visualizations
- Custom calculated fields / DAX-style expressions
