import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, ScatterChart, HeatmapChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  VisualMapComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// Register all needed components once at module load
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  HeatmapChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  VisualMapComponent,
  CanvasRenderer,
])

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChartData {
  columns: string[]
  data: (string | number)[][]
}

type EChartsInstance = ReturnType<typeof echarts.init>
type EChartsOption = echarts.EChartsCoreOption

// ── Option builders ───────────────────────────────────────────────────────────

function buildBarOptions(
  data: ChartData,
  dimensions: string[],
  measures: string[],
): EChartsOption {
  const dimIdx = dimensions[0] ? data.columns.indexOf(dimensions[0]) : 0
  const measIdx = measures[0] ? data.columns.indexOf(measures[0]) : 1

  const categories = data.data.map(row => String(row[dimIdx] ?? ''))
  const values = data.data.map(row => row[measIdx] ?? 0)

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 },
    ],
    xAxis: { type: 'category', data: categories, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: values, name: measures[0] ?? '' }],
  }
}

function buildGroupedBarOptions(
  data: ChartData,
  dimensions: string[],
  measures: string[],
): EChartsOption {
  const dimIdx = dimensions[0] ? data.columns.indexOf(dimensions[0]) : 0
  const categories = data.data.map(row => String(row[dimIdx] ?? ''))

  const series = measures.map(measure => {
    const mIdx = data.columns.indexOf(measure)
    return {
      type: 'bar' as const,
      name: measure,
      data: data.data.map(row => row[mIdx] ?? 0),
    }
  })

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { show: true },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 },
    ],
    xAxis: { type: 'category', data: categories, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' },
    series,
  }
}

function buildLineOptions(
  data: ChartData,
  dimensions: string[],
  measures: string[],
): EChartsOption {
  const dimIdx = dimensions[0] ? data.columns.indexOf(dimensions[0]) : 0
  const categories = data.data.map(row => String(row[dimIdx] ?? ''))

  const series = measures.map(measure => {
    const mIdx = data.columns.indexOf(measure)
    return {
      type: 'line' as const,
      name: measure,
      smooth: true,
      data: data.data.map(row => row[mIdx] ?? 0),
    }
  })

  return {
    tooltip: { trigger: 'axis' },
    legend: { show: measures.length > 1 },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 },
    ],
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series,
  }
}

function buildPieOptions(
  data: ChartData,
  dimensions: string[],
  measures: string[],
): EChartsOption {
  const dimIdx = dimensions[0] ? data.columns.indexOf(dimensions[0]) : 0
  const measIdx = measures[0] ? data.columns.indexOf(measures[0]) : 1

  const pieData = data.data.map(row => ({
    name: String(row[dimIdx] ?? ''),
    value: row[measIdx] ?? 0,
  }))

  return {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        type: 'pie',
        name: measures[0] ?? '',
        radius: ['40%', '70%'],
        data: pieData,
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' },
        },
      },
    ],
  }
}

function buildScatterOptions(
  data: ChartData,
  _dimensions: string[],
  measures: string[],
): EChartsOption {
  const xIdx = measures[0] ? data.columns.indexOf(measures[0]) : 0
  const yIdx = measures[1] ? data.columns.indexOf(measures[1]) : 1

  const scatterData = data.data.map(row => [row[xIdx] ?? 0, row[yIdx] ?? 0])

  return {
    tooltip: { trigger: 'item' },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: { type: 'value', name: measures[0] ?? '' },
    yAxis: { type: 'value', name: measures[1] ?? '' },
    series: [{ type: 'scatter', data: scatterData, name: `${measures[0]} vs ${measures[1]}` }],
  }
}

function buildKpiOptions(
  data: ChartData,
  _dimensions: string[],
  measures: string[],
): EChartsOption {
  const measName = measures[0] ?? (data.columns[0] ?? '')
  const measIdx = measName ? data.columns.indexOf(measName) : 0
  const value = data.data[0]?.[measIdx] ?? 0

  return {
    title: [
      {
        text: String(value),
        textStyle: { fontSize: 48, fontWeight: 'bold' },
        left: 'center',
        top: 'center',
      },
      {
        text: measName,
        textStyle: { fontSize: 16, color: '#666' },
        left: 'center',
        top: '65%',
      },
    ],
    series: [],
  }
}

function buildHeatmapOptions(
  data: ChartData,
  dimensions: string[],
  measures: string[],
): EChartsOption {
  const xDimIdx = dimensions[0] ? data.columns.indexOf(dimensions[0]) : 0
  const yDimIdx = dimensions[1] ? data.columns.indexOf(dimensions[1]) : 1
  const measIdx = measures[0] ? data.columns.indexOf(measures[0]) : 2

  const xCategories = [...new Set(data.data.map(row => String(row[xDimIdx] ?? '')))]
  const yCategories = [...new Set(data.data.map(row => String(row[yDimIdx] ?? '')))]

  const heatData = data.data.map(row => [
    xCategories.indexOf(String(row[xDimIdx] ?? '')),
    yCategories.indexOf(String(row[yDimIdx] ?? '')),
    row[measIdx] ?? 0,
  ])

  const values = data.data.map(row => Number(row[measIdx] ?? 0))
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)

  return {
    tooltip: { position: 'top' },
    grid: { left: '3%', right: '10%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: xCategories, splitArea: { show: true } },
    yAxis: { type: 'category', data: yCategories, splitArea: { show: true } },
    visualMap: {
      min: minVal,
      max: maxVal,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
    },
    series: [
      {
        type: 'heatmap',
        data: heatData,
        name: measures[0] ?? '',
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
      },
    ],
  }
}

// ── Main option builder dispatcher ────────────────────────────────────────────

function buildOptions(
  chartType: string,
  data: ChartData,
  dimensions: string[],
  measures: string[],
): EChartsOption {
  switch (chartType) {
    case 'bar':
      return buildBarOptions(data, dimensions, measures)
    case 'groupedBar':
      return buildGroupedBarOptions(data, dimensions, measures)
    case 'line':
      return buildLineOptions(data, dimensions, measures)
    case 'pie':
      return buildPieOptions(data, dimensions, measures)
    case 'scatter':
      return buildScatterOptions(data, dimensions, measures)
    case 'kpi':
      return buildKpiOptions(data, dimensions, measures)
    case 'heatmap':
      return buildHeatmapOptions(data, dimensions, measures)
    default:
      return buildBarOptions(data, dimensions, measures)
  }
}

// ── Composable ────────────────────────────────────────────────────────────────

export function useChartEngine(containerRef: Ref<HTMLElement | null>) {
  const chart = ref<EChartsInstance | null>(null)
  const loading = ref(false)

  function initChart(): void {
    if (!containerRef.value || chart.value) return
    chart.value = echarts.init(containerRef.value)
  }

  function render(
    chartType: string,
    data: ChartData,
    dimensions: string[],
    measures: string[],
  ): void {
    if (!chart.value) initChart()
    if (!chart.value) return

    const options = buildOptions(chartType, data, dimensions, measures)
    chart.value.setOption(options, true)
  }

  function resize(): void {
    chart.value?.resize()
  }

  function onChartClick(handler: (params: unknown) => void): void {
    chart.value?.on('click', handler)
  }

  function onBrushSelected(handler: (params: unknown) => void): void {
    chart.value?.on('brushSelected', handler)
  }

  function dispose(): void {
    chart.value?.dispose()
    chart.value = null
  }

  const resizeObserverHandler = (): void => resize()

  onMounted(() => {
    initChart()
    window.addEventListener('resize', resizeObserverHandler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeObserverHandler)
    dispose()
  })

  return {
    chart,
    loading,
    render,
    resize,
    onChartClick,
    onBrushSelected,
    dispose,
  }
}
