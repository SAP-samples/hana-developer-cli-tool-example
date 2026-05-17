import { ref, computed, watch } from 'vue'

// ── Type definitions ─────────────────────────────────────────────────────────

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

// ── Helpers ──────────────────────────────────────────────────────────────────

const DATE_TYPES = new Set(['DATE', 'TIME', 'TIMESTAMP', 'SECONDDATE'])
const NUMERIC_TYPES = new Set([
  'INTEGER', 'INT', 'BIGINT', 'SMALLINT', 'TINYINT',
  'DECIMAL', 'DOUBLE', 'REAL', 'FLOAT', 'SMALLDECIMAL',
])

function isDateType(dataType: string): boolean {
  return DATE_TYPES.has(dataType.toUpperCase())
}

// ── Pure suggestion function ─────────────────────────────────────────────────

export function suggestChartType(
  dimensions: DimensionConfig[],
  measures: MeasureConfig[],
): string {
  const dimCount = dimensions.length
  const mCount = measures.length

  // 0 dimensions
  if (dimCount === 0) {
    if (mCount === 1) return 'kpi'
    if (mCount > 1) return 'bar'
    return 'bar'
  }

  // 1 date dimension
  if (dimCount === 1 && isDateType(dimensions[0].dataType) && mCount >= 1) {
    return 'line'
  }

  // ≥2 dimensions, ≥2 measures → scatter
  if (dimCount >= 2 && mCount >= 2) return 'scatter'

  // 2 dimensions, 1 measure → heatmap
  if (dimCount === 2 && mCount === 1) return 'heatmap'

  // 1 dimension, ≥2 measures → groupedBar
  if (dimCount === 1 && mCount >= 2) return 'groupedBar'

  // 1 dimension, 1 measure
  if (dimCount === 1 && mCount === 1) {
    const dc = dimensions[0].distinctCount
    if (dc !== undefined && dc <= 5) return 'pie'
    return 'bar'
  }

  return 'bar'
}

// ── Composable ───────────────────────────────────────────────────────────────

export function useChartConfig() {
  // Core state refs
  const schema = ref<string>('')
  const object = ref<string>('')
  const objectType = ref<'table' | 'view'>('table')
  const dimensions = ref<DimensionConfig[]>([])
  const measures = ref<MeasureConfig[]>([])
  const filters = ref<FilterConfig[]>([])
  const chartType = ref<string>('bar')
  const chartTypeUserOverride = ref(false)
  const orderBy = ref<{ column: string; direction: 'ASC' | 'DESC' } | undefined>(undefined)
  const limit = ref<number>(100)

  // Computed: suggested chart type based on current dims/measures
  const suggestedChartType = computed(() =>
    suggestChartType(dimensions.value, measures.value),
  )

  // Computed: full config snapshot
  const config = computed<ChartConfig>(() => ({
    schema: schema.value,
    object: object.value,
    objectType: objectType.value,
    dimensions: dimensions.value,
    measures: measures.value,
    filters: filters.value,
    chartType: chartType.value,
    orderBy: orderBy.value,
    limit: limit.value,
  }))

  // Auto-update chartType whenever dims/measures change (unless user overrode)
  watch(
    [dimensions, measures],
    () => {
      if (!chartTypeUserOverride.value) {
        chartType.value = suggestedChartType.value
      }
    },
    { deep: true },
  )

  // ── Methods ────────────────────────────────────────────────────────────────

  function addDimension(dim: DimensionConfig): void {
    if (!dimensions.value.some(d => d.column === dim.column)) {
      dimensions.value = [...dimensions.value, dim]
    }
  }

  function removeDimension(column: string): void {
    dimensions.value = dimensions.value.filter(d => d.column !== column)
  }

  function addMeasure(measure: MeasureConfig): void {
    if (!measures.value.some(m => m.column === measure.column)) {
      measures.value = [...measures.value, measure]
    }
  }

  function removeMeasure(column: string): void {
    measures.value = measures.value.filter(m => m.column !== column)
  }

  function addFilter(filter: FilterConfig): void {
    filters.value = [...filters.value, filter]
  }

  function removeFilter(column: string): void {
    filters.value = filters.value.filter(f => f.column !== column)
  }

  function removeFilterAtIndex(index: number): void {
    filters.value = filters.value.filter((_, i) => i !== index)
  }

  function clearFilters(): void {
    filters.value = []
  }

  function clearAll(): void {
    dimensions.value = []
    measures.value = []
    filters.value = []
    chartType.value = 'bar'
    chartTypeUserOverride.value = false
    orderBy.value = undefined
    limit.value = 100
  }

  function setChartType(type: string): void {
    chartType.value = type
    chartTypeUserOverride.value = true
  }

  function setDataSource(params: {
    schema: string
    object: string
    objectType: 'table' | 'view'
  }): void {
    schema.value = params.schema
    object.value = params.object
    objectType.value = params.objectType
    clearAll()
  }

  return {
    // State
    schema,
    object,
    objectType,
    dimensions,
    measures,
    filters,
    chartType,
    orderBy,
    limit,
    // Computed
    suggestedChartType,
    config,
    // Methods
    addDimension,
    removeDimension,
    addMeasure,
    removeMeasure,
    addFilter,
    removeFilter,
    removeFilterAtIndex,
    clearFilters,
    setChartType,
    clearAll,
    setDataSource,
  }
}
