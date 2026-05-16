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
  chartConfig.setDataSource({ schema, object, objectType })
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
        @update-aggregation="(col: string, agg: string) => { const m = chartConfig.measures.value.find(x => x.column === col); if (m) m.aggregation = agg as MeasureConfig['aggregation']; }"
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
