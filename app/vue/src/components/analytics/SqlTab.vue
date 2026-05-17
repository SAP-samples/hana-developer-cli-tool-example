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
  min-height: 0;
  overflow: hidden;
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
