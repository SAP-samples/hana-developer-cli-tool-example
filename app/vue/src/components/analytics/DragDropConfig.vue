<script setup lang="ts">
import '@ui5/webcomponents/dist/Button.js'
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

const { dragOverZone, startDrag, dragOver, dragLeave, drop, endDrag, isNumericType } = useDragDrop()

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
    emit('addMeasure', { column: result.column.column, aggregation: result.defaultAggregation as MeasureConfig['aggregation'] })
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
