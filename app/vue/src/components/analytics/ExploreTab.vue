<script setup lang="ts">
import { ref, watch } from 'vue'
import { useChartConfig } from '../../composables/useChartConfig'
import { useDataSource } from '../../composables/useDataSource'
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
  chartConfig.setDataSource({ schema, object, objectType })
  await dataSource.loadMetadata(schema, object)
}

async function fetchData() {
  if (chartConfig.dimensions.value.length === 0 && chartConfig.measures.value.length === 0) {
    chartData.value = null
    return
  }
  try {
    const result = await dataSource.fetchAggregated(chartConfig.config.value)
    chartData.value = { columns: result.columns, data: result.data }
  } catch {
    chartData.value = null
  }
}

watch(() => [chartConfig.dimensions.value, chartConfig.measures.value, chartConfig.filters.value], fetchData, { deep: true })

function onAddDimension(dim: DimensionConfig) { chartConfig.addDimension(dim) }
function onRemoveDimension(col: string) { chartConfig.removeDimension(col) }
function onAddMeasure(measure: MeasureConfig) { chartConfig.addMeasure(measure) }
function onRemoveMeasure(col: string) { chartConfig.removeMeasure(col) }
function onUpdateAggregation(col: string, agg: string) {
  const m = chartConfig.measures.value.find(m => m.column === col)
  if (m) m.aggregation = agg as MeasureConfig['aggregation']
}
function onAddFilter(filter: FilterConfig) { chartConfig.addFilter(filter) }
function onRemoveFilter(index: number) {
  chartConfig.removeFilterAtIndex(index)
}
</script>

<template>
  <div class="explore-tab">
    <FilterBar
      :filters="chartConfig.filters.value"
      :columns="dataSource.columns.value"
      @add-filter="onAddFilter"
      @remove-filter="onRemoveFilter"
      @clear-all="chartConfig.clearFilters"
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
          <ChartTypeSwitcher :model-value="chartConfig.chartType.value" :suggested="chartConfig.suggestedChartType.value" @update:model-value="chartConfig.setChartType" />
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
