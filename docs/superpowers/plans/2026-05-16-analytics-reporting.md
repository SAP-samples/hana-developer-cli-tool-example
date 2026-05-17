# Analytics Reporting Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a graphical analytic reporting workspace with three modes (Explore, SQL, Dashboard) using Apache ECharts, integrated into the Vue web UI.

**Architecture:** Single `Analytics.vue` view with internal tabs. Shared composables manage chart state, data fetching, and persistence. A new backend route handles server-side aggregation queries. The existing QuerySimple view is refactored to extract a reusable QueryEditor component.

**Tech Stack:** Vue 3, Apache ECharts + vue-echarts, UI5 Web Components, HTML5 Drag-and-Drop, CSS Grid, Express.js backend.

**Spec:** `docs/superpowers/specs/2026-05-16-analytics-reporting-design.md`

---

## File Structure

### New Files — Frontend (`app/vue/src/`)

| File | Responsibility |
|------|---------------|
| `views/Analytics.vue` | Orchestrator: tab bar, shared state provider, routes to sub-tabs |
| `components/analytics/ExploreTab.vue` | Explore mode: wires DataSourcePicker + DragDropConfig + ChartRenderer |
| `components/analytics/SqlTab.vue` | SQL mode: embeds QueryEditor + Visualize button + ChartRenderer |
| `components/analytics/DashboardTab.vue` | Dashboard mode: grid canvas, tile management, cross-filter |
| `components/analytics/DataSourcePicker.vue` | Schema/table/view selector with typeahead |
| `components/analytics/DragDropConfig.vue` | Column list + Dimensions/Measures drop zones |
| `components/analytics/FilterBar.vue` | Filter chips row with add/remove |
| `components/analytics/ChartRenderer.vue` | ECharts wrapper: reactive options, resize, theme |
| `components/analytics/ChartTypeSwitcher.vue` | Icon toolbar for chart type selection with auto-suggest highlight |
| `components/analytics/AggregationBadge.vue` | Shows "Aggregated (45K→12)" or "Raw (230 rows)" |
| `components/analytics/DashboardGrid.vue` | 12-column CSS Grid with resizable/repositionable tiles |
| `components/analytics/ChartTile.vue` | Individual chart widget in grid with config |
| `components/analytics/DashboardToolbar.vue` | Save, load, export, import, add chart, delete |
| `components/analytics/AddChartModal.vue` | Modal for adding charts (From Explore / From SQL) |
| `components/QueryEditor.vue` | Extracted from QuerySimple: Monaco editor + tabs + history + execution |
| `composables/useChartEngine.ts` | ECharts instance lifecycle, resize, theme |
| `composables/useChartConfig.ts` | Reactive chart config state + auto-suggestion logic |
| `composables/useDataSource.ts` | Table metadata fetching, row count check, aggregation decision |
| `composables/useDragDrop.ts` | HTML5 DnD state management |
| `composables/useDashboardGrid.ts` | Tile position tracking (x, y, w, h) |
| `composables/useDashboardStore.ts` | localStorage CRUD + JSON export/import |
| `composables/useCrossFilter.ts` | Chart click → filter propagation |

### New Files — Backend (`routes/`)

| File | Responsibility |
|------|---------------|
| `routes/hanaAnalytics.js` | POST /hana/analytics-ui — builds and executes aggregation queries |

### Modified Files

| File | Change |
|------|--------|
| `app/vue/src/router.ts` | Add `/analytics` route |
| `app/vue/src/model/navigation.ts` | Add Analytics nav group |
| `app/vue/package.json` | Add `echarts` + `vue-echarts` dependencies |
| `app/vue/src/views/QuerySimple.vue` | Refactor to use extracted QueryEditor component |

### Test Files

| File | What it tests |
|------|--------------|
| `tests/routes/hanaAnalytics.Test.js` | Backend route: SQL generation, validation, parameterization |
| `tests/utils/chartAutoSuggest.Test.js` | Chart type auto-suggestion logic (pure function) |

---

## Task 1: Install Dependencies and Register Route/Navigation

**Files:**
- Modify: `app/vue/package.json`
- Modify: `app/vue/src/router.ts`
- Modify: `app/vue/src/model/navigation.ts`
- Create: `app/vue/src/views/Analytics.vue` (minimal placeholder)

- [ ] **Step 1: Install ECharts dependencies**

```bash
cd app/vue && npm install echarts vue-echarts
```

- [ ] **Step 2: Add route to router.ts**

Add after the last route entry (before the closing `]`):

```typescript
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('./views/Analytics.vue')
    }
```

- [ ] **Step 3: Add navigation group to navigation.ts**

Add after the "Developer Tools" group in the `navGroups` array:

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

- [ ] **Step 4: Create placeholder Analytics.vue**

```vue
<script setup lang="ts">
import '@ui5/webcomponents/dist/TabContainer.js'
import '@ui5/webcomponents/dist/Tab.js'
import { ref } from 'vue'

const activeTab = ref('explore')
</script>

<template>
  <div class="analytics-view">
    <ui5-tabcontainer @tab-select="(e: any) => activeTab = e.detail.tab.dataset.key">
      <ui5-tab data-key="explore" text="Explore" selected></ui5-tab>
      <ui5-tab data-key="sql" text="SQL"></ui5-tab>
      <ui5-tab data-key="dashboard" text="Dashboard"></ui5-tab>
    </ui5-tabcontainer>
    <div class="tab-content">
      <p>Active tab: {{ activeTab }}</p>
    </div>
  </div>
</template>

<style scoped>
.analytics-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
}
.tab-content {
  flex: 1;
  margin-top: 1rem;
}
</style>
```

- [ ] **Step 5: Verify in browser**

```bash
cd app/vue && npm run dev
```

Open browser, confirm "Analytics > Reports" appears in left navigation. Click it, verify the tab bar renders with three tabs.

- [ ] **Step 6: Commit**

```bash
git add app/vue/package.json app/vue/package-lock.json app/vue/src/router.ts app/vue/src/model/navigation.ts app/vue/src/views/Analytics.vue
git commit -m "feat(analytics): scaffold analytics view with route and navigation"
```

---

## Task 2: Backend Route — Analytics Aggregation Endpoint

**Files:**
- Create: `routes/hanaAnalytics.js`
- Create: `tests/routes/hanaAnalytics.Test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/routes/hanaAnalytics.Test.js`:

```javascript
import { expect } from 'chai'
import sinon from 'sinon'
import request from 'supertest'
import { createApp } from '../appFactory.js'

describe('POST /hana/analytics-ui', function () {
  let app

  before(async function () {
    app = await createApp()
  })

  it('should return 400 if schema is missing', async function () {
    const res = await request(app)
      .post('/hana/analytics-ui')
      .send({ object: 'TEST', dimensions: [], measures: [] })
    expect(res.status).to.equal(400)
    expect(res.body.error).to.include('schema')
  })

  it('should return 400 if object is missing', async function () {
    const res = await request(app)
      .post('/hana/analytics-ui')
      .send({ schema: 'TEST', dimensions: [], measures: [] })
    expect(res.status).to.equal(400)
    expect(res.body.error).to.include('object')
  })

  it('should return 400 if both dimensions and measures are empty', async function () {
    const res = await request(app)
      .post('/hana/analytics-ui')
      .send({ schema: 'TEST', object: 'MYTABLE', dimensions: [], measures: [] })
    expect(res.status).to.equal(400)
    expect(res.body.error).to.include('dimension or measure')
  })

  it('should return 400 for invalid aggregation function', async function () {
    const res = await request(app)
      .post('/hana/analytics-ui')
      .send({
        schema: 'TEST',
        object: 'MYTABLE',
        dimensions: ['COL1'],
        measures: [{ column: 'COL2', aggregation: 'DROP TABLE' }]
      })
    expect(res.status).to.equal(400)
    expect(res.body.error).to.include('aggregation')
  })

  it('should return 400 for SQL injection in column names', async function () {
    const res = await request(app)
      .post('/hana/analytics-ui')
      .send({
        schema: 'TEST',
        object: 'MYTABLE',
        dimensions: ['COL1; DROP TABLE'],
        measures: [{ column: 'COL2', aggregation: 'SUM' }]
      })
    expect(res.status).to.equal(400)
    expect(res.body.error).to.include('Invalid')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:grep -- --grep "analytics-ui"
```

Expected: FAIL (route does not exist, 404)

- [ ] **Step 3: Write the route implementation**

Create `routes/hanaAnalytics.js`:

```javascript
import * as base from '../utils/base.js'

const VALID_AGGREGATIONS = new Set(['SUM', 'AVG', 'COUNT', 'MIN', 'MAX'])
const VALID_OPERATORS = new Set(['=', '!=', '>', '<', '>=', '<=', 'IN', 'LIKE', 'BETWEEN'])
const IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/

function validateIdentifier(name) {
  if (!name || !IDENTIFIER_REGEX.test(name)) {
    throw new Error(`Invalid identifier: "${name}"`)
  }
  return `"${name}"`
}

function buildAnalyticsSQL(body) {
  const { schema, object, dimensions = [], measures = [], filters = [], orderBy, limit = 1000 } = body

  if (!schema) throw new Error('schema is required')
  if (!object) throw new Error('object is required')
  if (dimensions.length === 0 && measures.length === 0) {
    throw new Error('At least one dimension or measure is required')
  }

  const safeSchema = validateIdentifier(schema)
  const safeObject = validateIdentifier(object)

  const selectParts = []
  const groupByParts = []
  const params = []

  for (const dim of dimensions) {
    const safeDim = validateIdentifier(dim)
    selectParts.push(safeDim)
    groupByParts.push(safeDim)
  }

  for (const measure of measures) {
    const agg = measure.aggregation?.toUpperCase()
    if (!VALID_AGGREGATIONS.has(agg)) {
      throw new Error(`Invalid aggregation: "${measure.aggregation}". Must be one of: ${[...VALID_AGGREGATIONS].join(', ')}`)
    }
    const safeCol = validateIdentifier(measure.column)
    selectParts.push(`${agg}(${safeCol}) AS "${agg}_${measure.column}"`)
  }

  let sql = `SELECT ${selectParts.join(', ')} FROM ${safeSchema}.${safeObject}`

  if (filters.length > 0) {
    const whereParts = []
    for (const filter of filters) {
      const safeCol = validateIdentifier(filter.column)
      if (!VALID_OPERATORS.has(filter.operator)) {
        throw new Error(`Invalid operator: "${filter.operator}"`)
      }
      whereParts.push(`${safeCol} ${filter.operator} ?`)
      params.push(filter.value)
    }
    sql += ` WHERE ${whereParts.join(' AND ')}`
  }

  if (groupByParts.length > 0) {
    sql += ` GROUP BY ${groupByParts.join(', ')}`
  }

  if (orderBy?.column) {
    const safeOrderCol = validateIdentifier(orderBy.column)
    const dir = orderBy.direction?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    sql += ` ORDER BY ${safeOrderCol} ${dir}`
  }

  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 1000), 10000)
  sql += ` LIMIT ${safeLimit}`

  return { sql, params }
}

export function route(app) {
  base.debug('hanaAnalytics Route')

  /**
   * @swagger
   * /hana/analytics-ui:
   *   post:
   *     tags: [Analytics]
   *     summary: Execute an aggregation query for chart visualization
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [schema, object]
   *             properties:
   *               schema:
   *                 type: string
   *               object:
   *                 type: string
   *               dimensions:
   *                 type: array
   *               measures:
   *                 type: array
   *               filters:
   *                 type: array
   *               orderBy:
   *                 type: object
   *               limit:
   *                 type: number
   */
  app.post('/hana/analytics-ui', async (req, res, next) => {
    try {
      const { sql, params } = buildAnalyticsSQL(req.body)
      const startTime = Date.now()
      const dbStatus = await base.createDBConnection()
      const db = dbStatus.client
      const statement = await db.preparePromisified(sql)
      const results = await db.statementExecPromisified(statement, params)
      const executionTime = Date.now() - startTime

      const columns = results.length > 0 ? Object.keys(results[0]) : []
      const data = results.map(row => columns.map(col => row[col]))

      res.type('application/json').status(200).send({
        columns,
        data,
        metadata: {
          totalRows: data.length,
          aggregated: (req.body.dimensions?.length > 0 || req.body.measures?.length > 0),
          executionTime
        }
      })
    } catch (error) {
      if (error.message.includes('Invalid') || error.message.includes('required') ||
          error.message.includes('aggregation') || error.message.includes('dimension or measure')) {
        res.status(400).json({ error: error.message })
      } else {
        next(error)
      }
    }
  })
}

export { buildAnalyticsSQL }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:grep -- --grep "analytics-ui"
```

Expected: All 5 tests PASS (validation tests don't need a DB connection)

- [ ] **Step 5: Commit**

```bash
git add routes/hanaAnalytics.js tests/routes/hanaAnalytics.Test.js
git commit -m "feat(analytics): add backend aggregation route with validation"
```

---

## Task 3: Composable — useChartConfig (Core State)

**Files:**
- Create: `app/vue/src/composables/useChartConfig.ts`
- Create: `tests/utils/chartAutoSuggest.Test.js`

- [ ] **Step 1: Write tests for chart auto-suggestion logic**

Create `tests/utils/chartAutoSuggest.Test.js`:

```javascript
import { expect } from 'chai'

// Import the pure function (will be exported from composable or a util)
import { suggestChartType } from '../../app/vue/src/composables/useChartConfig.ts'

describe('Chart Auto-Suggestion', function () {
  it('suggests bar for 1 categorical + 1 numeric', function () {
    const result = suggestChartType(
      [{ column: 'REGION', dataType: 'NVARCHAR' }],
      [{ column: 'REVENUE', aggregation: 'SUM' }]
    )
    expect(result).to.equal('bar')
  })

  it('suggests line for 1 date + 1 numeric', function () {
    const result = suggestChartType(
      [{ column: 'CREATED_AT', dataType: 'TIMESTAMP' }],
      [{ column: 'AMOUNT', aggregation: 'SUM' }]
    )
    expect(result).to.equal('line')
  })

  it('suggests pie for 1 categorical (≤5 values hint) + 1 numeric', function () {
    const result = suggestChartType(
      [{ column: 'STATUS', dataType: 'NVARCHAR', distinctCount: 4 }],
      [{ column: 'COUNT', aggregation: 'COUNT' }]
    )
    expect(result).to.equal('pie')
  })

  it('suggests scatter for 2+ dims + 2 numerics', function () {
    const result = suggestChartType(
      [{ column: 'X', dataType: 'NVARCHAR' }, { column: 'Y', dataType: 'NVARCHAR' }],
      [{ column: 'A', aggregation: 'SUM' }, { column: 'B', aggregation: 'AVG' }]
    )
    expect(result).to.equal('scatter')
  })

  it('suggests kpi for 0 dims + 1 numeric', function () {
    const result = suggestChartType([], [{ column: 'TOTAL', aggregation: 'SUM' }])
    expect(result).to.equal('kpi')
  })

  it('suggests grouped bar for 1 categorical + 2+ numerics', function () {
    const result = suggestChartType(
      [{ column: 'REGION', dataType: 'NVARCHAR' }],
      [{ column: 'A', aggregation: 'SUM' }, { column: 'B', aggregation: 'AVG' }]
    )
    expect(result).to.equal('groupedBar')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:grep -- --grep "Chart Auto-Suggestion"
```

Expected: FAIL (module not found)

- [ ] **Step 3: Write useChartConfig composable**

Create `app/vue/src/composables/useChartConfig.ts`:

```typescript
import { ref, computed, type Ref } from 'vue'

export interface DimensionConfig {
  column: string
  dataType: string
  distinctCount?: number
}

export interface MeasureConfig {
  column: string
  aggregation: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX'
}

export interface FilterConfig {
  column: string
  operator: string
  value: string | string[]
}

export interface ChartConfig {
  schema: string
  object: string
  objectType: 'table' | 'view'
  dimensions: DimensionConfig[]
  measures: MeasureConfig[]
  filters: FilterConfig[]
  chartType: string
  orderBy?: { column: string; direction: 'ASC' | 'DESC' }
  limit: number
}

const DATE_TYPES = new Set(['DATE', 'TIME', 'TIMESTAMP', 'SECONDDATE'])
const NUMERIC_TYPES = new Set(['INTEGER', 'INT', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'DOUBLE', 'REAL', 'FLOAT', 'SMALLDECIMAL'])

export function suggestChartType(dimensions: DimensionConfig[], measures: MeasureConfig[]): string {
  const dimCount = dimensions.length
  const measureCount = measures.length

  if (dimCount === 0 && measureCount === 1) return 'kpi'
  if (dimCount === 0 && measureCount > 1) return 'bar'

  const hasDateDim = dimensions.some(d => DATE_TYPES.has(d.dataType?.toUpperCase()))

  if (hasDateDim && measureCount >= 1) return 'line'
  if (dimCount >= 2 && measureCount >= 2) return 'scatter'
  if (dimCount === 2 && measureCount === 1) return 'heatmap'
  if (dimCount === 1 && measureCount >= 2) return 'groupedBar'

  if (dimCount === 1 && measureCount === 1) {
    const dim = dimensions[0]
    if (dim.distinctCount !== undefined && dim.distinctCount <= 5) return 'pie'
    return 'bar'
  }

  return 'bar'
}

export function useChartConfig() {
  const schema = ref('')
  const object = ref('')
  const objectType: Ref<'table' | 'view'> = ref('table')
  const dimensions: Ref<DimensionConfig[]> = ref([])
  const measures: Ref<MeasureConfig[]> = ref([])
  const filters: Ref<FilterConfig[]> = ref([])
  const chartType = ref('bar')
  const orderBy: Ref<{ column: string; direction: 'ASC' | 'DESC' } | null> = ref(null)
  const limit = ref(1000)

  const suggestedChartType = computed(() => suggestChartType(dimensions.value, measures.value))

  const config = computed<ChartConfig>(() => ({
    schema: schema.value,
    object: object.value,
    objectType: objectType.value,
    dimensions: dimensions.value,
    measures: measures.value,
    filters: filters.value,
    chartType: chartType.value,
    orderBy: orderBy.value ?? undefined,
    limit: limit.value
  }))

  function addDimension(dim: DimensionConfig) {
    if (!dimensions.value.find(d => d.column === dim.column)) {
      dimensions.value.push(dim)
      chartType.value = suggestedChartType.value
    }
  }

  function removeDimension(column: string) {
    dimensions.value = dimensions.value.filter(d => d.column !== column)
    chartType.value = suggestedChartType.value
  }

  function addMeasure(measure: MeasureConfig) {
    if (!measures.value.find(m => m.column === measure.column)) {
      measures.value.push(measure)
      chartType.value = suggestedChartType.value
    }
  }

  function removeMeasure(column: string) {
    measures.value = measures.value.filter(m => m.column !== column)
    chartType.value = suggestedChartType.value
  }

  function addFilter(filter: FilterConfig) {
    filters.value.push(filter)
  }

  function removeFilter(index: number) {
    filters.value.splice(index, 1)
  }

  function clearAll() {
    dimensions.value = []
    measures.value = []
    filters.value = []
    chartType.value = 'bar'
    orderBy.value = null
  }

  function setDataSource(s: string, obj: string, type: 'table' | 'view') {
    schema.value = s
    object.value = obj
    objectType.value = type
    clearAll()
  }

  return {
    schema, object, objectType, dimensions, measures, filters,
    chartType, orderBy, limit, suggestedChartType, config,
    addDimension, removeDimension, addMeasure, removeMeasure,
    addFilter, removeFilter, clearAll, setDataSource
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:grep -- --grep "Chart Auto-Suggestion"
```

Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/vue/src/composables/useChartConfig.ts tests/utils/chartAutoSuggest.Test.js
git commit -m "feat(analytics): add useChartConfig composable with auto-suggestion"
```

---

## Task 4: Composable — useChartEngine (ECharts Wrapper)

**Files:**
- Create: `app/vue/src/composables/useChartEngine.ts`

- [ ] **Step 1: Write the composable**

Create `app/vue/src/composables/useChartEngine.ts`:

```typescript
import { ref, watch, onMounted, onBeforeUnmount, type Ref } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, ScatterChart, HeatmapChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent,
  GridComponent, DataZoomComponent, ToolboxComponent, VisualMapComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart, LineChart, PieChart, ScatterChart, HeatmapChart,
  TitleComponent, TooltipComponent, LegendComponent,
  GridComponent, DataZoomComponent, ToolboxComponent, VisualMapComponent,
  CanvasRenderer
])

export interface ChartData {
  columns: string[]
  data: (string | number)[][]
}

export function useChartEngine(containerRef: Ref<HTMLElement | null>) {
  const chart: Ref<echarts.ECharts | null> = ref(null)
  const loading = ref(false)

  function initChart() {
    if (containerRef.value && !chart.value) {
      chart.value = echarts.init(containerRef.value)
    }
  }

  function buildOptions(chartType: string, data: ChartData, dimensions: string[], measures: string[]): echarts.EChartsOption {
    if (!data || data.data.length === 0) return {}

    const dimIndices = dimensions.map(d => data.columns.indexOf(d))
    const measureIndices = measures.map(m => data.columns.indexOf(m))

    const categories = data.data.map(row => dimIndices.map(i => row[i]).join(' / '))
    const series = measureIndices.map(idx => ({
      name: data.columns[idx],
      data: data.data.map(row => row[idx] as number)
    }))

    switch (chartType) {
      case 'bar':
        return {
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: categories },
          yAxis: { type: 'value' },
          dataZoom: [{ type: 'inside' }, { type: 'slider' }],
          series: series.map(s => ({ ...s, type: 'bar' }))
        }
      case 'groupedBar':
        return {
          tooltip: { trigger: 'axis' },
          legend: {},
          xAxis: { type: 'category', data: categories },
          yAxis: { type: 'value' },
          series: series.map(s => ({ ...s, type: 'bar' }))
        }
      case 'line':
        return {
          tooltip: { trigger: 'axis' },
          legend: {},
          xAxis: { type: 'category', data: categories },
          yAxis: { type: 'value' },
          dataZoom: [{ type: 'inside' }, { type: 'slider' }],
          series: series.map(s => ({ ...s, type: 'line', smooth: true }))
        }
      case 'pie':
        return {
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', left: 'left' },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            data: data.data.map((row, i) => ({
              name: categories[i],
              value: row[measureIndices[0]] as number
            }))
          }]
        }
      case 'scatter':
        return {
          tooltip: { trigger: 'item' },
          xAxis: { type: 'value', name: measures[0] || '' },
          yAxis: { type: 'value', name: measures[1] || '' },
          series: [{
            type: 'scatter',
            data: data.data.map(row => [row[measureIndices[0]], row[measureIndices[1]]])
          }]
        }
      case 'kpi':
        return {
          title: {
            text: String(data.data[0]?.[measureIndices[0]] ?? '—'),
            subtext: measures[0] || '',
            left: 'center', top: 'center',
            textStyle: { fontSize: 48 }
          }
        }
      default:
        return {
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: categories },
          yAxis: { type: 'value' },
          series: series.map(s => ({ ...s, type: 'bar' }))
        }
    }
  }

  function render(chartType: string, data: ChartData, dimensions: string[], measures: string[]) {
    if (!chart.value) initChart()
    if (!chart.value) return

    const options = buildOptions(chartType, data, dimensions, measures)
    chart.value.setOption(options, true)
  }

  function resize() {
    chart.value?.resize()
  }

  function onChartClick(handler: (params: any) => void) {
    chart.value?.on('click', handler)
  }

  function onBrushSelected(handler: (params: any) => void) {
    chart.value?.on('brushselected', handler)
  }

  function dispose() {
    chart.value?.dispose()
    chart.value = null
  }

  onMounted(() => {
    initChart()
    window.addEventListener('resize', resize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    dispose()
  })

  return { chart, loading, render, resize, onChartClick, onBrushSelected, dispose }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app/vue && npx vue-tsc --noEmit --skipLibCheck 2>&1 | head -20
```

Expected: No errors related to `useChartEngine.ts`

- [ ] **Step 3: Commit**

```bash
git add app/vue/src/composables/useChartEngine.ts
git commit -m "feat(analytics): add useChartEngine composable for ECharts lifecycle"
```

---

## Task 5: Composable — useDataSource

**Files:**
- Create: `app/vue/src/composables/useDataSource.ts`

- [ ] **Step 1: Write the composable**

Create `app/vue/src/composables/useDataSource.ts`:

```typescript
import { ref, type Ref } from 'vue'
import { useHanaApi } from './useHanaApi'

export interface ColumnMetadata {
  column: string
  dataType: string
  nullable: boolean
  length?: number
}

const SERVER_AGGREGATION_THRESHOLD = 10000

export function useDataSource() {
  const { execute } = useHanaApi()
  const columns: Ref<ColumnMetadata[]> = ref([])
  const rowCount: Ref<number | null> = ref(null)
  const loading = ref(false)
  const useServerAggregation = ref(false)

  async function loadMetadata(schema: string, object: string) {
    loading.value = true
    try {
      const result = await execute('inspectTable-ui', { schema, table: object })
      if (result?.COLUMNS) {
        columns.value = result.COLUMNS.map((col: any) => ({
          column: col.COLUMN_NAME,
          dataType: col.DATA_TYPE_NAME,
          nullable: col.IS_NULLABLE === 'TRUE',
          length: col.LENGTH
        }))
      }
      if (result?.TABLE_SIZE?.RECORD_COUNT !== undefined) {
        rowCount.value = parseInt(result.TABLE_SIZE.RECORD_COUNT, 10)
      } else {
        rowCount.value = null
      }
      useServerAggregation.value = rowCount.value === null || rowCount.value > SERVER_AGGREGATION_THRESHOLD
    } catch (error) {
      columns.value = []
      rowCount.value = null
      useServerAggregation.value = true
    } finally {
      loading.value = false
    }
  }

  async function fetchAggregated(config: {
    schema: string
    object: string
    dimensions: { column: string }[]
    measures: { column: string; aggregation: string }[]
    filters: { column: string; operator: string; value: string | string[] }[]
    orderBy?: { column: string; direction: string }
    limit: number
  }) {
    loading.value = true
    try {
      const res = await fetch('/hana/analytics-ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Query failed')
      }
      return await res.json()
    } finally {
      loading.value = false
    }
  }

  function clear() {
    columns.value = []
    rowCount.value = null
    useServerAggregation.value = false
  }

  return { columns, rowCount, loading, useServerAggregation, loadMetadata, fetchAggregated, clear }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app/vue && npx vue-tsc --noEmit --skipLibCheck 2>&1 | grep -i "useDataSource" || echo "No errors"
```

Expected: "No errors"

- [ ] **Step 3: Commit**

```bash
git add app/vue/src/composables/useDataSource.ts
git commit -m "feat(analytics): add useDataSource composable for metadata and aggregation"
```

---

## Task 6: Shared Components — ChartRenderer + ChartTypeSwitcher + AggregationBadge

**Files:**
- Create: `app/vue/src/components/analytics/ChartRenderer.vue`
- Create: `app/vue/src/components/analytics/ChartTypeSwitcher.vue`
- Create: `app/vue/src/components/analytics/AggregationBadge.vue`

- [ ] **Step 1: Create ChartRenderer.vue**

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useChartEngine, type ChartData } from '../../composables/useChartEngine'

const props = defineProps<{
  chartType: string
  data: ChartData | null
  dimensions: string[]
  measures: string[]
}>()

const emit = defineEmits<{
  chartClick: [params: any]
}>()

const containerRef = ref<HTMLElement | null>(null)
const { render, onChartClick } = useChartEngine(containerRef)

watch(() => [props.chartType, props.data, props.dimensions, props.measures], () => {
  if (props.data) {
    render(props.chartType, props.data, props.dimensions, props.measures)
  }
}, { deep: true })

onChartClick((params) => emit('chartClick', params))
</script>

<template>
  <div ref="containerRef" class="chart-renderer"></div>
</template>

<style scoped>
.chart-renderer {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
```

- [ ] **Step 2: Create ChartTypeSwitcher.vue**

```vue
<script setup lang="ts">
import '@ui5/webcomponents/dist/ToggleButton.js'

const props = defineProps<{
  modelValue: string
  suggested?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const chartTypes = [
  { key: 'bar', icon: 'horizontal-bar-chart', label: 'Bar' },
  { key: 'groupedBar', icon: 'vertical-bar-chart', label: 'Grouped Bar' },
  { key: 'line', icon: 'line-chart', label: 'Line' },
  { key: 'pie', icon: 'donut-chart', label: 'Pie' },
  { key: 'scatter', icon: 'scatter-chart', label: 'Scatter' },
  { key: 'heatmap', icon: 'heatmap-chart', label: 'Heatmap' },
  { key: 'kpi', icon: 'kpi-corporate-performance', label: 'KPI' }
]
</script>

<template>
  <div class="chart-type-switcher">
    <ui5-toggle-button
      v-for="ct in chartTypes"
      :key="ct.key"
      :icon="ct.icon"
      :tooltip="ct.label + (ct.key === suggested ? ' (suggested)' : '')"
      :pressed="modelValue === ct.key"
      :class="{ suggested: ct.key === suggested && modelValue !== ct.key }"
      @click="emit('update:modelValue', ct.key)"
    ></ui5-toggle-button>
  </div>
</template>

<style scoped>
.chart-type-switcher {
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem;
}
.suggested {
  outline: 2px dashed var(--sapInformativeColor);
  outline-offset: 2px;
  border-radius: 4px;
}
</style>
```

- [ ] **Step 3: Create AggregationBadge.vue**

```vue
<script setup lang="ts">
import '@ui5/webcomponents/dist/Badge.js'

defineProps<{
  aggregated: boolean
  totalRows?: number | null
  resultRows?: number
}>()
</script>

<template>
  <ui5-badge v-if="aggregated" color-scheme="8">
    Aggregated{{ totalRows ? ` (${totalRows.toLocaleString()} → ${resultRows?.toLocaleString() ?? '?'})` : '' }}
  </ui5-badge>
  <ui5-badge v-else color-scheme="6">
    Raw data{{ totalRows ? ` (${totalRows.toLocaleString()} rows)` : '' }}
  </ui5-badge>
</template>
```

- [ ] **Step 4: Verify in dev server**

```bash
cd app/vue && npx vue-tsc --noEmit --skipLibCheck 2>&1 | grep -i "analytics" || echo "No errors"
```

Expected: "No errors"

- [ ] **Step 5: Commit**

```bash
git add app/vue/src/components/analytics/ChartRenderer.vue app/vue/src/components/analytics/ChartTypeSwitcher.vue app/vue/src/components/analytics/AggregationBadge.vue
git commit -m "feat(analytics): add shared chart components (renderer, type switcher, badge)"
```

---

## Task 7: Composable — useDragDrop

**Files:**
- Create: `app/vue/src/composables/useDragDrop.ts`

- [ ] **Step 1: Write the composable**

Create `app/vue/src/composables/useDragDrop.ts`:

```typescript
import { ref, type Ref } from 'vue'
import type { ColumnMetadata } from './useDataSource'

const NUMERIC_TYPES = new Set(['INTEGER', 'INT', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'DOUBLE', 'REAL', 'FLOAT', 'SMALLDECIMAL'])

export type DropZone = 'dimensions' | 'measures' | 'source'

export function useDragDrop() {
  const draggedColumn: Ref<ColumnMetadata | null> = ref(null)
  const dropTarget: Ref<DropZone | null> = ref(null)
  const dragOverZone: Ref<DropZone | null> = ref(null)

  function startDrag(column: ColumnMetadata, event: DragEvent) {
    draggedColumn.value = column
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', column.column)
    }
  }

  function dragOver(zone: DropZone, event: DragEvent) {
    event.preventDefault()
    dragOverZone.value = zone
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  function dragLeave() {
    dragOverZone.value = null
  }

  function drop(zone: DropZone): { column: ColumnMetadata; zone: DropZone; defaultAggregation: string } | null {
    const col = draggedColumn.value
    draggedColumn.value = null
    dragOverZone.value = null

    if (!col) return null

    const isNumeric = NUMERIC_TYPES.has(col.dataType?.toUpperCase())
    const defaultAggregation = isNumeric ? 'SUM' : 'COUNT'

    return { column: col, zone, defaultAggregation }
  }

  function endDrag() {
    draggedColumn.value = null
    dragOverZone.value = null
  }

  function isNumericType(dataType: string): boolean {
    return NUMERIC_TYPES.has(dataType?.toUpperCase())
  }

  return { draggedColumn, dragOverZone, startDrag, dragOver, dragLeave, drop, endDrag, isNumericType }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/vue/src/composables/useDragDrop.ts
git commit -m "feat(analytics): add useDragDrop composable for column assignment"
```

---

## Task 8: Components — DataSourcePicker + DragDropConfig + FilterBar

**Files:**
- Create: `app/vue/src/components/analytics/DataSourcePicker.vue`
- Create: `app/vue/src/components/analytics/DragDropConfig.vue`
- Create: `app/vue/src/components/analytics/FilterBar.vue`

- [ ] **Step 1: Create DataSourcePicker.vue**

This component reuses the existing `useSuggestions` composable for typeahead. It provides schema + table/view selection:

```vue
<script setup lang="ts">
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/SuggestionItem.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import { ref, watch } from 'vue'
import { useSuggestions } from '../../composables/useSuggestions'
import { useCurrentSchema } from '../../composables/useCurrentSchema'

const emit = defineEmits<{
  select: [schema: string, object: string, objectType: 'table' | 'view']
}>()

const { currentSchema } = useCurrentSchema()
const schema = ref(currentSchema.value || '')
const objectName = ref('')
const objectType = ref<'table' | 'view'>('table')
const { suggestions, fetchSuggestions } = useSuggestions()

watch(schema, () => {
  objectName.value = ''
})

function onObjectInput(e: any) {
  objectName.value = e.target.value
  if (objectName.value.length >= 2) {
    fetchSuggestions(schema.value, objectName.value, objectType.value === 'table' ? 'tables' : 'views')
  }
}

function onObjectSelect(e: any) {
  const selected = e.detail?.item?.textContent || objectName.value
  objectName.value = selected
  emit('select', schema.value, selected, objectType.value)
}
</script>

<template>
  <div class="data-source-picker">
    <div class="picker-row">
      <ui5-input
        class="schema-input"
        placeholder="Schema"
        :value="schema"
        @input="(e: any) => schema = e.target.value"
      ></ui5-input>
      <ui5-select class="type-select" @change="(e: any) => objectType = e.detail.selectedOption.dataset.value">
        <ui5-option data-value="table" selected>Table</ui5-option>
        <ui5-option data-value="view">View</ui5-option>
      </ui5-select>
    </div>
    <ui5-input
      class="object-input"
      :placeholder="`Search ${objectType}s...`"
      :value="objectName"
      show-suggestions
      @input="onObjectInput"
      @suggestion-item-select="onObjectSelect"
    >
      <ui5-suggestion-item
        v-for="s in suggestions"
        :key="s"
        :text="s"
      ></ui5-suggestion-item>
    </ui5-input>
  </div>
</template>

<style scoped>
.data-source-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.picker-row {
  display: flex;
  gap: 0.5rem;
}
.schema-input { flex: 1; }
.type-select { width: 6rem; }
.object-input { width: 100%; }
</style>
```

- [ ] **Step 2: Create DragDropConfig.vue**

```vue
<script setup lang="ts">
import '@ui5/webcomponents/dist/List.js'
import '@ui5/webcomponents/dist/StandardListItem.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import { computed } from 'vue'
import { useDragDrop } from '../../composables/useDragDrop'
import type { ColumnMetadata } from '../../composables/useDataSource'
import type { DimensionConfig, MeasureConfig } from '../../composables/useChartConfig'

const props = defineProps<{
  columns: ColumnMetadata[]
  dimensions: DimensionConfig[]
  measures: MeasureConfig[]
}>()

const emit = defineEmits<{
  addDimension: [dim: DimensionConfig]
  removeDimension: [column: string]
  addMeasure: [measure: MeasureConfig]
  removeMeasure: [column: string]
  updateAggregation: [column: string, agg: string]
}>()

const { draggedColumn, dragOverZone, startDrag, dragOver, dragLeave, drop, endDrag, isNumericType } = useDragDrop()

const availableColumns = computed(() =>
  props.columns.filter(c =>
    !props.dimensions.find(d => d.column === c.column) &&
    !props.measures.find(m => m.column === c.column)
  )
)

function onDropDimensions(event: DragEvent) {
  event.preventDefault()
  const result = drop('dimensions')
  if (result) {
    emit('addDimension', { column: result.column.column, dataType: result.column.dataType })
  }
}

function onDropMeasures(event: DragEvent) {
  event.preventDefault()
  const result = drop('measures')
  if (result) {
    emit('addMeasure', { column: result.column.column, aggregation: result.defaultAggregation as any })
  }
}
</script>

<template>
  <div class="drag-drop-config">
    <div class="column-source">
      <h4>Columns</h4>
      <div class="column-list">
        <div
          v-for="col in availableColumns"
          :key="col.column"
          class="column-item"
          draggable="true"
          @dragstart="startDrag(col, $event)"
          @dragend="endDrag"
        >
          <span class="col-type" :class="{ numeric: isNumericType(col.dataType) }">
            {{ isNumericType(col.dataType) ? '#' : 'A' }}
          </span>
          <span class="col-name">{{ col.column }}</span>
          <span class="col-dtype">{{ col.dataType }}</span>
        </div>
      </div>
    </div>

    <div class="drop-zones">
      <div
        class="drop-zone dimensions-zone"
        :class="{ 'drag-over': dragOverZone === 'dimensions' }"
        @dragover="dragOver('dimensions', $event)"
        @dragleave="dragLeave"
        @drop="onDropDimensions"
      >
        <h4>Dimensions (Group By)</h4>
        <div v-for="dim in dimensions" :key="dim.column" class="zone-item">
          <span>{{ dim.column }}</span>
          <ui5-button icon="decline" design="Transparent" @click="emit('removeDimension', dim.column)"></ui5-button>
        </div>
        <p v-if="dimensions.length === 0" class="zone-hint">Drop columns here</p>
      </div>

      <div
        class="drop-zone measures-zone"
        :class="{ 'drag-over': dragOverZone === 'measures' }"
        @dragover="dragOver('measures', $event)"
        @dragleave="dragLeave"
        @drop="onDropMeasures"
      >
        <h4>Measures (Aggregate)</h4>
        <div v-for="measure in measures" :key="measure.column" class="zone-item">
          <span>{{ measure.column }}</span>
          <ui5-select
            class="agg-select"
            @change="(e: any) => emit('updateAggregation', measure.column, e.detail.selectedOption.dataset.value)"
          >
            <ui5-option v-for="agg in ['SUM','AVG','COUNT','MIN','MAX']" :key="agg" :data-value="agg" :selected="measure.aggregation === agg">{{ agg }}</ui5-option>
          </ui5-select>
          <ui5-button icon="decline" design="Transparent" @click="emit('removeMeasure', measure.column)"></ui5-button>
        </div>
        <p v-if="measures.length === 0" class="zone-hint">Drop numeric columns here</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drag-drop-config {
  display: flex;
  gap: 1rem;
  height: 100%;
}
.column-source {
  width: 40%;
  overflow-y: auto;
}
.drop-zones {
  width: 60%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.column-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.column-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--sapField_BorderColor);
  border-radius: 4px;
  cursor: grab;
  font-size: 0.85rem;
}
.column-item:active { cursor: grabbing; }
.col-type {
  width: 1.2rem;
  text-align: center;
  font-weight: bold;
  font-size: 0.75rem;
}
.col-type.numeric { color: var(--sapPositiveColor); }
.col-name { flex: 1; }
.col-dtype { font-size: 0.7rem; color: var(--sapNeutralColor); }
.drop-zone {
  border: 2px dashed var(--sapField_BorderColor);
  border-radius: 8px;
  padding: 0.75rem;
  min-height: 80px;
  transition: border-color 0.2s, background 0.2s;
}
.drop-zone.drag-over {
  border-color: var(--sapInformativeColor);
  background: var(--sapInformativeBackground);
}
.zone-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: var(--sapBackgroundColor);
  border-radius: 4px;
  margin-bottom: 0.25rem;
}
.zone-hint {
  color: var(--sapNeutralColor);
  font-style: italic;
  font-size: 0.85rem;
}
.agg-select { width: 5rem; }
h4 { margin: 0 0 0.5rem 0; font-size: 0.85rem; }
</style>
```

- [ ] **Step 3: Create FilterBar.vue**

```vue
<script setup lang="ts">
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/Popover.js'
import { ref } from 'vue'
import type { FilterConfig } from '../../composables/useChartConfig'
import type { ColumnMetadata } from '../../composables/useDataSource'

const props = defineProps<{
  filters: FilterConfig[]
  columns: ColumnMetadata[]
}>()

const emit = defineEmits<{
  addFilter: [filter: FilterConfig]
  removeFilter: [index: number]
  clearAll: []
}>()

const showPopover = ref(false)
const popoverRef = ref<any>(null)
const newColumn = ref('')
const newOperator = ref('=')
const newValue = ref('')

const operators = ['=', '!=', '>', '<', '>=', '<=', 'IN', 'LIKE', 'BETWEEN']

function openPopover(event: Event) {
  showPopover.value = true
  popoverRef.value?.showAt(event.target)
}

function addFilter() {
  if (newColumn.value && newValue.value) {
    emit('addFilter', {
      column: newColumn.value,
      operator: newOperator.value,
      value: newValue.value
    })
    newColumn.value = ''
    newOperator.value = '='
    newValue.value = ''
    popoverRef.value?.close()
  }
}
</script>

<template>
  <div class="filter-bar">
    <div v-for="(filter, i) in filters" :key="i" class="filter-chip">
      <span>{{ filter.column }} {{ filter.operator }} {{ filter.value }}</span>
      <ui5-button icon="decline" design="Transparent" @click="emit('removeFilter', i)"></ui5-button>
    </div>
    <ui5-button icon="add" design="Transparent" tooltip="Add filter" @click="openPopover"></ui5-button>
    <ui5-button v-if="filters.length > 0" design="Transparent" @click="emit('clearAll')">Clear all</ui5-button>

    <ui5-popover ref="popoverRef" header-text="Add Filter" placement-type="Bottom">
      <div class="filter-form">
        <ui5-select class="filter-col" @change="(e: any) => newColumn = e.detail.selectedOption?.dataset?.value || ''">
          <ui5-option data-value="">Column...</ui5-option>
          <ui5-option v-for="col in columns" :key="col.column" :data-value="col.column">{{ col.column }}</ui5-option>
        </ui5-select>
        <ui5-select class="filter-op" @change="(e: any) => newOperator = e.detail.selectedOption?.dataset?.value || '='">
          <ui5-option v-for="op in operators" :key="op" :data-value="op">{{ op }}</ui5-option>
        </ui5-select>
        <ui5-input class="filter-val" placeholder="Value" :value="newValue" @input="(e: any) => newValue = e.target.value"></ui5-input>
        <ui5-button design="Emphasized" @click="addFilter">Add</ui5-button>
      </div>
    </ui5-popover>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.5rem 0;
  min-height: 2.5rem;
}
.filter-chip {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: var(--sapInformativeBackground);
  border: 1px solid var(--sapInformativeColor);
  border-radius: 1rem;
  font-size: 0.8rem;
}
.filter-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  min-width: 250px;
}
</style>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd app/vue && npx vue-tsc --noEmit --skipLibCheck 2>&1 | grep -i "error" | head -5 || echo "No errors"
```

- [ ] **Step 5: Commit**

```bash
git add app/vue/src/components/analytics/DataSourcePicker.vue app/vue/src/components/analytics/DragDropConfig.vue app/vue/src/components/analytics/FilterBar.vue
git commit -m "feat(analytics): add DataSourcePicker, DragDropConfig, and FilterBar components"
```

---

## Task 9: ExploreTab — Wire Everything Together

**Files:**
- Create: `app/vue/src/components/analytics/ExploreTab.vue`

- [ ] **Step 1: Create ExploreTab.vue**

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useChartConfig } from '../../composables/useChartConfig'
import { useDataSource, type ColumnMetadata } from '../../composables/useDataSource'
import DataSourcePicker from './DataSourcePicker.vue'
import DragDropConfig from './DragDropConfig.vue'
import FilterBar from './FilterBar.vue'
import ChartRenderer from './ChartRenderer.vue'
import ChartTypeSwitcher from './ChartTypeSwitcher.vue'
import AggregationBadge from './AggregationBadge.vue'
import type { ChartData } from '../../composables/useChartEngine'
import type { DimensionConfig, MeasureConfig, FilterConfig } from '../../composables/useChartConfig'

const chartConfig = useChartConfig()
const dataSource = useDataSource()
const chartData = ref<ChartData | null>(null)

async function onDataSourceSelect(schema: string, object: string, objectType: 'table' | 'view') {
  chartConfig.setDataSource(schema, object, objectType)
  await dataSource.loadMetadata(schema, object)
}

async function fetchData() {
  if (chartConfig.dimensions.value.length === 0 && chartConfig.measures.value.length === 0) {
    chartData.value = null
    return
  }
  const result = await dataSource.fetchAggregated(chartConfig.config.value)
  if (result) {
    chartData.value = { columns: result.columns, data: result.data }
  }
}

watch(() => [chartConfig.dimensions.value, chartConfig.measures.value, chartConfig.filters.value], fetchData, { deep: true })

function onAddDimension(dim: DimensionConfig) { chartConfig.addDimension(dim) }
function onRemoveDimension(col: string) { chartConfig.removeDimension(col) }
function onAddMeasure(measure: MeasureConfig) { chartConfig.addMeasure(measure) }
function onRemoveMeasure(col: string) { chartConfig.removeMeasure(col) }
function onUpdateAggregation(col: string, agg: string) {
  const m = chartConfig.measures.value.find(m => m.column === col)
  if (m) m.aggregation = agg as any
}
function onAddFilter(filter: FilterConfig) { chartConfig.addFilter(filter) }
function onRemoveFilter(index: number) { chartConfig.removeFilter(index) }
</script>

<template>
  <div class="explore-tab">
    <FilterBar
      :filters="chartConfig.filters.value"
      :columns="dataSource.columns.value"
      @add-filter="onAddFilter"
      @remove-filter="onRemoveFilter"
      @clear-all="() => chartConfig.filters.value = []"
    />
    <div class="explore-content">
      <div class="config-panel">
        <DataSourcePicker @select="onDataSourceSelect" />
        <DragDropConfig
          :columns="dataSource.columns.value"
          :dimensions="chartConfig.dimensions.value"
          :measures="chartConfig.measures.value"
          @add-dimension="onAddDimension"
          @remove-dimension="onRemoveDimension"
          @add-measure="onAddMeasure"
          @remove-measure="onRemoveMeasure"
          @update-aggregation="onUpdateAggregation"
        />
      </div>
      <div class="chart-panel">
        <div class="chart-toolbar">
          <ChartTypeSwitcher v-model="chartConfig.chartType.value" :suggested="chartConfig.suggestedChartType.value" />
          <AggregationBadge
            :aggregated="dataSource.useServerAggregation.value"
            :total-rows="dataSource.rowCount.value"
            :result-rows="chartData?.data.length"
          />
        </div>
        <ChartRenderer
          :chart-type="chartConfig.chartType.value"
          :data="chartData"
          :dimensions="chartConfig.dimensions.value.map(d => d.column)"
          :measures="chartConfig.measures.value.map(m => `${m.aggregation}_${m.column}`)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.explore-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.explore-content {
  display: flex;
  gap: 1rem;
  flex: 1;
  overflow: hidden;
}
.config-panel {
  width: 35%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}
.chart-panel {
  width: 65%;
  display: flex;
  flex-direction: column;
}
.chart-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
```

- [ ] **Step 2: Verify in browser**

Update `Analytics.vue` to import and render ExploreTab in the explore tab content, then test in browser:
- Navigate to Analytics
- Verify Explore tab loads
- Try selecting a schema/table (typeahead works)
- Drag columns into zones
- Chart renders

- [ ] **Step 3: Commit**

```bash
git add app/vue/src/components/analytics/ExploreTab.vue
git commit -m "feat(analytics): add ExploreTab with drag-drop data exploration"
```

---

## Task 10: QuerySimple Refactor — Extract QueryEditor Component

**Files:**
- Create: `app/vue/src/components/QueryEditor.vue`
- Modify: `app/vue/src/views/QuerySimple.vue`

This is a prerequisite for the SQL tab. The goal is to extract the core query editor functionality (Monaco editor, tab management, query execution, result display) into a reusable component. The existing QuerySimple view then becomes a thin wrapper.

- [ ] **Step 1: Create QueryEditor.vue**

Extract the core logic from `QuerySimple.vue` into a new `QueryEditor.vue` component. The component should expose:
- The Monaco editor with SQL syntax
- Tab management (new/close/switch)
- Query execution (Ctrl+Enter)
- Result display (table)
- Query history access

The component emits a `results` event containing the latest query results so parent components can react (e.g., the Visualize button in the SQL tab).

Key interface:
```typescript
defineEmits<{
  results: [data: { columns: string[], rows: any[] }]
}>()
```

Refer to the full `QuerySimple.vue` source (462 lines) and extract everything except the page-level layout wrapper. The standalone `QuerySimple.vue` becomes:

```vue
<script setup lang="ts">
import QueryEditor from '../components/QueryEditor.vue'
</script>

<template>
  <QueryEditor />
</template>
```

- [ ] **Step 2: Verify QuerySimple still works**

```bash
cd app/vue && npm run dev
```

Open browser, navigate to the existing QuerySimple page. Run a query and verify:
- Monaco editor loads
- Tabs work
- Query executes and results display
- History panel works
- Plan visualization works

- [ ] **Step 3: Commit**

```bash
git add app/vue/src/components/QueryEditor.vue app/vue/src/views/QuerySimple.vue
git commit -m "refactor: extract QueryEditor from QuerySimple for reuse"
```

---

## Task 11: SqlTab — Embed QueryEditor + Visualize Button

**Files:**
- Create: `app/vue/src/components/analytics/SqlTab.vue`

- [ ] **Step 1: Create SqlTab.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import '@ui5/webcomponents/dist/Button.js'
import QueryEditor from '../QueryEditor.vue'
import ChartRenderer from './ChartRenderer.vue'
import ChartTypeSwitcher from './ChartTypeSwitcher.vue'
import { useChartConfig } from '../../composables/useChartConfig'
import type { ChartData } from '../../composables/useChartEngine'

const chartConfig = useChartConfig()
const chartData = ref<ChartData | null>(null)
const showChart = ref(false)
const lastResults = ref<{ columns: string[]; rows: any[] } | null>(null)

function onResults(data: { columns: string[]; rows: any[] }) {
  lastResults.value = data
}

function visualize() {
  if (!lastResults.value) return
  showChart.value = true
  const cols = lastResults.value.columns
  chartData.value = {
    columns: cols,
    data: lastResults.value.rows.map(row => cols.map(c => row[c]))
  }
  // Auto-assign: first string column as dimension, first numeric as measure
  // User can override via the chart config
  if (cols.length >= 2) {
    chartConfig.clearAll()
    chartConfig.addDimension({ column: cols[0], dataType: 'NVARCHAR' })
    chartConfig.addMeasure({ column: cols[1], aggregation: 'SUM' })
  }
}
</script>

<template>
  <div class="sql-tab">
    <div class="editor-section" :class="{ 'with-chart': showChart }">
      <QueryEditor @results="onResults" />
      <ui5-button
        v-if="lastResults"
        class="visualize-btn"
        design="Emphasized"
        icon="chart-table-view"
        @click="visualize"
      >
        Visualize
      </ui5-button>
    </div>
    <div v-if="showChart" class="chart-section">
      <ChartTypeSwitcher v-model="chartConfig.chartType.value" :suggested="chartConfig.suggestedChartType.value" />
      <ChartRenderer
        :chart-type="chartConfig.chartType.value"
        :data="chartData"
        :dimensions="chartConfig.dimensions.value.map(d => d.column)"
        :measures="chartConfig.measures.value.map(m => m.column)"
      />
    </div>
  </div>
</template>

<style scoped>
.sql-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.editor-section {
  flex: 1;
  position: relative;
}
.editor-section.with-chart {
  flex: 0.6;
}
.chart-section {
  flex: 0.4;
  border-top: 1px solid var(--sapField_BorderColor);
  padding-top: 0.5rem;
}
.visualize-btn {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
}
</style>
```

- [ ] **Step 2: Verify in browser**

Open Analytics → SQL tab. Run a query, click Visualize, verify chart renders.

- [ ] **Step 3: Commit**

```bash
git add app/vue/src/components/analytics/SqlTab.vue
git commit -m "feat(analytics): add SQL tab with Visualize button"
```

---

## Task 12: Dashboard Composables — useDashboardGrid + useDashboardStore

**Files:**
- Create: `app/vue/src/composables/useDashboardGrid.ts`
- Create: `app/vue/src/composables/useDashboardStore.ts`

- [ ] **Step 1: Create useDashboardGrid.ts**

```typescript
import { ref, type Ref } from 'vue'

export interface TilePosition {
  id: string
  x: number   // 0-based column (0-11)
  y: number   // row index
  w: number   // width in columns (min 3, max 12)
  h: number   // height in rows (min 1)
}

export function useDashboardGrid() {
  const tiles: Ref<TilePosition[]> = ref([])

  function addTile(id: string): TilePosition {
    const nextY = tiles.value.length > 0
      ? Math.max(...tiles.value.map(t => t.y + t.h))
      : 0
    const tile: TilePosition = { id, x: 0, y: nextY, w: 6, h: 1 }
    tiles.value.push(tile)
    return tile
  }

  function removeTile(id: string) {
    tiles.value = tiles.value.filter(t => t.id !== id)
  }

  function resizeTile(id: string, w: number, h: number) {
    const tile = tiles.value.find(t => t.id === id)
    if (tile) {
      tile.w = Math.max(3, Math.min(12, w))
      tile.h = Math.max(1, h)
    }
  }

  function moveTile(id: string, x: number, y: number) {
    const tile = tiles.value.find(t => t.id === id)
    if (tile) {
      tile.x = Math.max(0, Math.min(12 - tile.w, x))
      tile.y = Math.max(0, y)
    }
  }

  function setTiles(positions: TilePosition[]) {
    tiles.value = positions
  }

  return { tiles, addTile, removeTile, resizeTile, moveTile, setTiles }
}
```

- [ ] **Step 2: Create useDashboardStore.ts**

```typescript
import { ref, type Ref } from 'vue'
import type { TilePosition } from './useDashboardGrid'
import type { ChartConfig } from './useChartConfig'

export interface DashboardTile {
  id: string
  position: TilePosition
  config: ChartConfig
}

export interface DashboardDefinition {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  globalFilters: { column: string; operator: string; value: string | string[] }[]
  tiles: DashboardTile[]
}

const STORAGE_KEY = 'hana-cli-dashboards'

export function useDashboardStore() {
  const dashboards: Ref<DashboardDefinition[]> = ref([])
  const activeDashboard: Ref<DashboardDefinition | null> = ref(null)

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      dashboards.value = raw ? JSON.parse(raw) : []
    } catch {
      dashboards.value = []
    }
  }

  function saveAll() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards.value))
  }

  function create(name: string): DashboardDefinition {
    const dashboard: DashboardDefinition = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      globalFilters: [],
      tiles: []
    }
    dashboards.value.push(dashboard)
    activeDashboard.value = dashboard
    saveAll()
    return dashboard
  }

  function save() {
    if (activeDashboard.value) {
      activeDashboard.value.updatedAt = new Date().toISOString()
      const idx = dashboards.value.findIndex(d => d.id === activeDashboard.value!.id)
      if (idx >= 0) dashboards.value[idx] = activeDashboard.value
      saveAll()
    }
  }

  function remove(id: string) {
    dashboards.value = dashboards.value.filter(d => d.id !== id)
    if (activeDashboard.value?.id === id) activeDashboard.value = null
    saveAll()
  }

  function exportDashboard(dashboard: DashboardDefinition): string {
    return JSON.stringify(dashboard, null, 2)
  }

  function importDashboard(json: string): DashboardDefinition | null {
    try {
      const dashboard = JSON.parse(json) as DashboardDefinition
      dashboard.id = crypto.randomUUID()
      dashboard.updatedAt = new Date().toISOString()
      dashboards.value.push(dashboard)
      saveAll()
      return dashboard
    } catch {
      return null
    }
  }

  function setActive(id: string) {
    activeDashboard.value = dashboards.value.find(d => d.id === id) || null
  }

  loadAll()

  return { dashboards, activeDashboard, create, save, remove, exportDashboard, importDashboard, setActive, loadAll }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/vue/src/composables/useDashboardGrid.ts app/vue/src/composables/useDashboardStore.ts
git commit -m "feat(analytics): add dashboard grid and store composables"
```

---

## Task 13: Dashboard Components — Grid, Tile, Toolbar

**Files:**
- Create: `app/vue/src/components/analytics/DashboardGrid.vue`
- Create: `app/vue/src/components/analytics/ChartTile.vue`
- Create: `app/vue/src/components/analytics/DashboardToolbar.vue`

- [ ] **Step 1: Create ChartTile.vue**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import '@ui5/webcomponents/dist/Button.js'
import ChartRenderer from './ChartRenderer.vue'
import { useDataSource } from '../../composables/useDataSource'
import type { ChartConfig } from '../../composables/useChartConfig'
import type { ChartData } from '../../composables/useChartEngine'

const props = defineProps<{
  config: ChartConfig
}>()

const emit = defineEmits<{
  chartClick: [params: any]
  remove: []
}>()

const dataSource = useDataSource()
const chartData = ref<ChartData | null>(null)

async function loadData() {
  const result = await dataSource.fetchAggregated(props.config)
  if (result) {
    chartData.value = { columns: result.columns, data: result.data }
  }
}

onMounted(loadData)
</script>

<template>
  <div class="chart-tile">
    <div class="tile-header">
      <span class="tile-title">{{ config.object }}</span>
      <ui5-button icon="decline" design="Transparent" @click="emit('remove')"></ui5-button>
    </div>
    <ChartRenderer
      :chart-type="config.chartType"
      :data="chartData"
      :dimensions="config.dimensions.map(d => d.column)"
      :measures="config.measures.map(m => `${m.aggregation}_${m.column}`)"
      @chart-click="(p) => emit('chartClick', p)"
    />
  </div>
</template>

<style scoped>
.chart-tile {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--sapField_BorderColor);
  border-radius: 8px;
  overflow: hidden;
}
.tile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: var(--sapTile_Background);
  border-bottom: 1px solid var(--sapField_BorderColor);
  cursor: move;
}
.tile-title {
  font-size: 0.85rem;
  font-weight: 600;
}
</style>
```

- [ ] **Step 2: Create DashboardGrid.vue**

```vue
<script setup lang="ts">
import ChartTile from './ChartTile.vue'
import type { DashboardTile } from '../../composables/useDashboardStore'

defineProps<{
  tiles: DashboardTile[]
}>()

const emit = defineEmits<{
  removeTile: [id: string]
  chartClick: [tileId: string, params: any]
}>()
</script>

<template>
  <div class="dashboard-grid">
    <div
      v-for="tile in tiles"
      :key="tile.id"
      class="grid-cell"
      :style="{
        gridColumn: `${tile.position.x + 1} / span ${tile.position.w}`,
        gridRow: `${tile.position.y + 1} / span ${tile.position.h}`
      }"
    >
      <ChartTile
        :config="tile.config"
        @remove="emit('removeTile', tile.id)"
        @chart-click="(p) => emit('chartClick', tile.id, p)"
      />
    </div>
    <div v-if="tiles.length === 0" class="empty-state">
      <p>No charts yet. Click "Add Chart" to get started.</p>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
  padding: 1rem 0;
  min-height: 400px;
}
.grid-cell {
  min-height: 250px;
}
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sapNeutralColor);
  font-style: italic;
}
</style>
```

- [ ] **Step 3: Create DashboardToolbar.vue**

```vue
<script setup lang="ts">
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import { ref } from 'vue'
import type { DashboardDefinition } from '../../composables/useDashboardStore'

const props = defineProps<{
  dashboards: DashboardDefinition[]
  activeDashboard: DashboardDefinition | null
}>()

const emit = defineEmits<{
  create: [name: string]
  select: [id: string]
  save: []
  remove: [id: string]
  exportDash: []
  importDash: [json: string]
  addChart: []
  rename: [name: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function handleImport() {
  fileInput.value?.click()
}

function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => emit('importDash', reader.result as string)
    reader.readAsText(file)
  }
}
</script>

<template>
  <div class="dashboard-toolbar">
    <ui5-select v-if="dashboards.length > 0" @change="(e: any) => emit('select', e.detail.selectedOption?.dataset?.id || '')">
      <ui5-option v-for="d in dashboards" :key="d.id" :data-id="d.id" :selected="d.id === activeDashboard?.id">{{ d.name }}</ui5-option>
    </ui5-select>
    <ui5-button icon="add" @click="emit('create', `Dashboard ${dashboards.length + 1}`)">New</ui5-button>
    <ui5-button v-if="activeDashboard" icon="add-activity" design="Emphasized" @click="emit('addChart')">Add Chart</ui5-button>
    <ui5-button v-if="activeDashboard" icon="save" @click="emit('save')">Save</ui5-button>
    <ui5-button v-if="activeDashboard" icon="download" @click="emit('exportDash')">Export</ui5-button>
    <ui5-button icon="upload" @click="handleImport">Import</ui5-button>
    <ui5-button v-if="activeDashboard" icon="delete" design="Negative" @click="emit('remove', activeDashboard.id)">Delete</ui5-button>
    <input ref="fileInput" type="file" accept=".json" style="display:none" @change="onFileSelected" />
  </div>
</template>

<style scoped>
.dashboard-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.5rem 0;
}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add app/vue/src/components/analytics/DashboardGrid.vue app/vue/src/components/analytics/ChartTile.vue app/vue/src/components/analytics/DashboardToolbar.vue
git commit -m "feat(analytics): add dashboard grid, tile, and toolbar components"
```

---

## Task 14: DashboardTab — Assemble Dashboard View

**Files:**
- Create: `app/vue/src/components/analytics/DashboardTab.vue`
- Create: `app/vue/src/components/analytics/AddChartModal.vue`

- [ ] **Step 1: Create AddChartModal.vue**

A simplified modal that lets users configure a new chart tile. Uses a mini version of the Explore flow (pick table, select columns, choose chart type):

```vue
<script setup lang="ts">
import '@ui5/webcomponents/dist/Dialog.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Bar.js'
import { ref } from 'vue'
import DataSourcePicker from './DataSourcePicker.vue'
import DragDropConfig from './DragDropConfig.vue'
import ChartTypeSwitcher from './ChartTypeSwitcher.vue'
import { useChartConfig, type DimensionConfig, type MeasureConfig } from '../../composables/useChartConfig'
import { useDataSource } from '../../composables/useDataSource'

const emit = defineEmits<{
  confirm: [config: ReturnType<typeof useChartConfig>['config']['value']]
  cancel: []
}>()

const chartConfig = useChartConfig()
const dataSource = useDataSource()
const dialogRef = ref<any>(null)

async function onDataSourceSelect(schema: string, object: string, objectType: 'table' | 'view') {
  chartConfig.setDataSource(schema, object, objectType)
  await dataSource.loadMetadata(schema, object)
}

function confirm() {
  emit('confirm', chartConfig.config.value)
  dialogRef.value?.close()
}

function show() {
  dialogRef.value?.show()
}

defineExpose({ show })
</script>

<template>
  <ui5-dialog ref="dialogRef" header-text="Add Chart">
    <div class="modal-content">
      <DataSourcePicker @select="onDataSourceSelect" />
      <DragDropConfig
        v-if="dataSource.columns.value.length > 0"
        :columns="dataSource.columns.value"
        :dimensions="chartConfig.dimensions.value"
        :measures="chartConfig.measures.value"
        @add-dimension="(d: DimensionConfig) => chartConfig.addDimension(d)"
        @remove-dimension="(c: string) => chartConfig.removeDimension(c)"
        @add-measure="(m: MeasureConfig) => chartConfig.addMeasure(m)"
        @remove-measure="(c: string) => chartConfig.removeMeasure(c)"
        @update-aggregation="(col: string, agg: string) => { const m = chartConfig.measures.value.find(x => x.column === col); if (m) m.aggregation = agg as any; }"
      />
      <ChartTypeSwitcher v-model="chartConfig.chartType.value" :suggested="chartConfig.suggestedChartType.value" />
    </div>
    <div slot="footer">
      <ui5-bar design="Footer">
        <ui5-button slot="endContent" design="Emphasized" @click="confirm" :disabled="chartConfig.measures.value.length === 0">Add</ui5-button>
        <ui5-button slot="endContent" @click="emit('cancel'); dialogRef?.close()">Cancel</ui5-button>
      </ui5-bar>
    </div>
  </ui5-dialog>
</template>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  min-width: 500px;
  min-height: 300px;
}
</style>
```

- [ ] **Step 2: Create DashboardTab.vue**

```vue
<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import DashboardToolbar from './DashboardToolbar.vue'
import DashboardGrid from './DashboardGrid.vue'
import FilterBar from './FilterBar.vue'
import AddChartModal from './AddChartModal.vue'
import { useDashboardStore, type DashboardTile } from '../../composables/useDashboardStore'
import { useDashboardGrid } from '../../composables/useDashboardGrid'
import type { ChartConfig, FilterConfig } from '../../composables/useChartConfig'
import type { ColumnMetadata } from '../../composables/useDataSource'

const store = useDashboardStore()
const grid = useDashboardGrid()
const addChartRef = ref<InstanceType<typeof AddChartModal> | null>(null)

watchEffect(() => {
  if (store.activeDashboard.value) {
    grid.setTiles(store.activeDashboard.value.tiles.map(t => t.position))
  }
})

function onAddChart() {
  addChartRef.value?.show()
}

function onChartConfigured(config: ChartConfig) {
  if (!store.activeDashboard.value) return
  const id = crypto.randomUUID()
  const position = grid.addTile(id)
  const tile: DashboardTile = { id, position, config }
  store.activeDashboard.value.tiles.push(tile)
  store.save()
}

function onRemoveTile(id: string) {
  if (!store.activeDashboard.value) return
  store.activeDashboard.value.tiles = store.activeDashboard.value.tiles.filter(t => t.id !== id)
  grid.removeTile(id)
  store.save()
}

function onExport() {
  if (!store.activeDashboard.value) return
  const json = store.exportDashboard(store.activeDashboard.value)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${store.activeDashboard.value.name}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function onImport(json: string) {
  store.importDashboard(json)
}
</script>

<template>
  <div class="dashboard-tab">
    <DashboardToolbar
      :dashboards="store.dashboards.value"
      :active-dashboard="store.activeDashboard.value"
      @create="(name) => store.create(name)"
      @select="(id) => store.setActive(id)"
      @save="store.save"
      @remove="(id) => store.remove(id)"
      @export-dash="onExport"
      @import-dash="onImport"
      @add-chart="onAddChart"
    />
    <DashboardGrid
      v-if="store.activeDashboard.value"
      :tiles="store.activeDashboard.value.tiles"
      @remove-tile="onRemoveTile"
    />
    <div v-else class="no-dashboard">
      <p>Select or create a dashboard to get started.</p>
    </div>
    <AddChartModal ref="addChartRef" @confirm="onChartConfigured" />
  </div>
</template>

<style scoped>
.dashboard-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.no-dashboard {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sapNeutralColor);
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add app/vue/src/components/analytics/DashboardTab.vue app/vue/src/components/analytics/AddChartModal.vue
git commit -m "feat(analytics): add DashboardTab with grid, toolbar, and add-chart modal"
```

---

## Task 15: Assemble Analytics.vue — Wire All Tabs

**Files:**
- Modify: `app/vue/src/views/Analytics.vue`

- [ ] **Step 1: Update Analytics.vue to render all tabs**

Replace the placeholder content with the full orchestrator:

```vue
<script setup lang="ts">
import '@ui5/webcomponents/dist/TabContainer.js'
import '@ui5/webcomponents/dist/Tab.js'
import { ref } from 'vue'
import ExploreTab from '../components/analytics/ExploreTab.vue'
import SqlTab from '../components/analytics/SqlTab.vue'
import DashboardTab from '../components/analytics/DashboardTab.vue'

const activeTab = ref('explore')

function onTabSelect(e: any) {
  activeTab.value = e.detail.tab.dataset.key
}
</script>

<template>
  <div class="analytics-view">
    <ui5-tabcontainer @tab-select="onTabSelect">
      <ui5-tab data-key="explore" text="Explore" icon="chart-table-view" selected></ui5-tab>
      <ui5-tab data-key="sql" text="SQL" icon="syntax"></ui5-tab>
      <ui5-tab data-key="dashboard" text="Dashboard" icon="dashboard"></ui5-tab>
    </ui5-tabcontainer>
    <div class="tab-content">
      <ExploreTab v-if="activeTab === 'explore'" />
      <SqlTab v-else-if="activeTab === 'sql'" />
      <DashboardTab v-else-if="activeTab === 'dashboard'" />
    </div>
  </div>
</template>

<style scoped>
.analytics-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
}
.tab-content {
  flex: 1;
  margin-top: 1rem;
  overflow: hidden;
}
</style>
```

- [ ] **Step 2: Full integration test in browser**

```bash
cd app/vue && npm run dev
```

Test all three tabs:
1. **Explore**: Select table → drag columns → chart renders → change chart type → filters work
2. **SQL**: Write query → execute → click Visualize → chart appears
3. **Dashboard**: Create dashboard → Add Chart → chart tile appears → Save → Refresh page → dashboard persists

- [ ] **Step 3: Commit**

```bash
git add app/vue/src/views/Analytics.vue
git commit -m "feat(analytics): assemble Analytics view with all three tabs"
```

---

## Task 16: Cross-Filter Composable + Integration

**Files:**
- Create: `app/vue/src/composables/useCrossFilter.ts`
- Modify: `app/vue/src/components/analytics/DashboardTab.vue`

- [ ] **Step 1: Create useCrossFilter.ts**

```typescript
import { ref, type Ref } from 'vue'
import type { FilterConfig } from './useChartConfig'

export interface CrossFilter {
  sourceTileId: string
  filter: FilterConfig
}

export function useCrossFilter() {
  const crossFilters: Ref<CrossFilter[]> = ref([])

  function addCrossFilter(sourceTileId: string, column: string, value: string) {
    crossFilters.value = crossFilters.value.filter(cf => cf.sourceTileId !== sourceTileId)
    crossFilters.value.push({
      sourceTileId,
      filter: { column, operator: '=', value }
    })
  }

  function clearCrossFilters() {
    crossFilters.value = []
  }

  function getFiltersForTile(tileId: string, tileDataSource: string): FilterConfig[] {
    return crossFilters.value
      .filter(cf => cf.sourceTileId !== tileId)
      .map(cf => cf.filter)
  }

  const hasCrossFilters = ref(false)

  return { crossFilters, addCrossFilter, clearCrossFilters, getFiltersForTile, hasCrossFilters }
}
```

- [ ] **Step 2: Integrate into DashboardTab**

Add cross-filter handling to DashboardTab.vue's `chartClick` event:
- When a chart element is clicked, extract the dimension value and call `addCrossFilter`
- Pass combined filters (global + cross) to each ChartTile

- [ ] **Step 3: Verify cross-filtering in browser**

Create a dashboard with two chart tiles from the same table. Click a bar in one chart, verify the other updates.

- [ ] **Step 4: Commit**

```bash
git add app/vue/src/composables/useCrossFilter.ts app/vue/src/components/analytics/DashboardTab.vue
git commit -m "feat(analytics): add cross-filter support for dashboard tiles"
```

---

## Task 17: Final Integration Testing + Cleanup

- [ ] **Step 1: Run TypeScript check**

```bash
cd app/vue && npx vue-tsc --noEmit --skipLibCheck
```

Fix any type errors.

- [ ] **Step 2: Run linter**

```bash
cd app/vue && npx eslint src/views/Analytics.vue src/components/analytics/ src/composables/useChart* src/composables/useDashboard* src/composables/useDragDrop.ts src/composables/useDataSource.ts src/composables/useCrossFilter.ts
```

Fix any lint errors.

- [ ] **Step 3: Run existing test suite**

```bash
npm test
```

Verify no regressions. The QuerySimple refactor (Task 10) is the highest risk — ensure all query-related tests still pass.

- [ ] **Step 4: Run backend route tests**

```bash
npm run test:grep -- --grep "analytics"
```

All analytics route tests pass.

- [ ] **Step 5: Browser smoke test all features**

Full end-to-end walkthrough:
- Navigation: Analytics appears in sidebar, navigates correctly
- Explore: Select table → columns load → drag to zones → chart renders → type switcher works → filters work
- SQL: Query executes → Visualize button → chart renders
- Dashboard: Create → Add Chart → configure → tile appears → resize → save → reload → persists → export → import → cross-filter

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix(analytics): address lint/type errors and polish integration"
```
