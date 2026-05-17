<script setup lang="ts">
import { computed } from 'vue'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/CheckBox.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import type { LogicalModel, Column } from '../../../services/calcview/types'

const props = defineProps<{
  logicalModel: LogicalModel
}>()

const emit = defineEmits<{
  'update-column': [collection: 'attributes' | 'baseMeasures', columnId: string, updates: Partial<Column>]
}>()

interface DisplayColumn {
  id: string
  name: string
  label: string
  semanticType: 'attribute' | 'measure'
  aggregationType: string
  hidden: boolean
  collection: 'attributes' | 'baseMeasures'
}

const columns = computed<DisplayColumn[]>(() => {
  const result: DisplayColumn[] = []
  for (const a of props.logicalModel.attributes) {
    result.push({
      id: a.id, name: a.name, label: a.label || '',
      semanticType: 'attribute', aggregationType: '', hidden: a.hidden || false,
      collection: 'attributes'
    })
  }
  for (const m of props.logicalModel.baseMeasures) {
    result.push({
      id: m.id, name: m.name, label: m.label || '',
      semanticType: 'measure', aggregationType: m.aggregationType || 'sum', hidden: m.hidden || false,
      collection: 'baseMeasures'
    })
  }
  return result
})

function handleLabelChange(col: DisplayColumn, e: any) {
  const newLabel = e.target.value
  if (newLabel !== col.label) {
    emit('update-column', col.collection, col.id, { label: newLabel })
  }
}

function handleHiddenChange(col: DisplayColumn, e: any) {
  emit('update-column', col.collection, col.id, { hidden: e.target.checked })
}

function handleAggregationChange(col: DisplayColumn, e: any) {
  const val = e.detail?.selectedOption?.value || e.detail?.selectedOption?.textContent?.trim()
  if (val && val !== col.aggregationType) {
    emit('update-column', col.collection, col.id, { aggregationType: val })
  }
}
</script>

<template>
  <div class="semantics-columns-tab">
    <div class="column-table">
      <div class="table-header">
        <span class="col-name-h">Column</span>
        <span class="col-label-h">Label</span>
        <span class="col-type-h">Type</span>
        <span class="col-agg-h">Aggregation</span>
        <span class="col-hidden-h">Hidden</span>
      </div>
      <div
        v-for="col in columns"
        :key="col.id"
        class="table-row"
        :class="{ 'measure-row': col.semanticType === 'measure' }"
      >
        <span class="col-name">{{ col.name }}</span>
        <ui5-input
          class="col-label"
          :value="col.label"
          placeholder="Description..."
          @change="handleLabelChange(col, $event)"
        />
        <span class="col-type">{{ col.semanticType === 'measure' ? 'Measure' : 'Attribute' }}</span>
        <template v-if="col.semanticType === 'measure'">
          <ui5-select class="col-agg" @change="handleAggregationChange(col, $event)">
            <ui5-option value="sum" :selected="col.aggregationType === 'sum'">SUM</ui5-option>
            <ui5-option value="count" :selected="col.aggregationType === 'count'">COUNT</ui5-option>
            <ui5-option value="min" :selected="col.aggregationType === 'min'">MIN</ui5-option>
            <ui5-option value="max" :selected="col.aggregationType === 'max'">MAX</ui5-option>
            <ui5-option value="avg" :selected="col.aggregationType === 'avg'">AVG</ui5-option>
          </ui5-select>
        </template>
        <span v-else class="col-agg">&mdash;</span>
        <ui5-checkbox
          class="col-hidden"
          :checked="col.hidden"
          @change="handleHiddenChange(col, $event)"
        />
      </div>
      <div v-if="columns.length === 0" class="empty">
        No output columns defined in semantics
      </div>
    </div>
  </div>
</template>

<style scoped>
.semantics-columns-tab { padding: 8px; }

.column-table { font-size: 11px; }

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 0.8fr 1fr 0.5fr;
  gap: 4px;
  padding: 6px 8px;
  background: var(--sapList_HeaderBackground, #f2f2f2);
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  font-weight: 600;
  color: var(--sapTextColor, #333);
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 0.8fr 1fr 0.5fr;
  gap: 4px;
  padding: 4px 8px;
  border-bottom: 1px solid var(--sapList_BorderColor, #e5e5e5);
  align-items: center;
}

.measure-row { background: var(--sapList_AlternatingBackground, #f7f7f7); }
.col-name { font-weight: 500; overflow: hidden; text-overflow: ellipsis; }
.col-type { color: var(--sapContent_LabelColor, #666); }
.col-agg { color: var(--sapContent_LabelColor, #666); }
.col-label { width: 100%; }
.col-hidden { justify-self: center; }
.empty { padding: 16px; text-align: center; color: var(--sapContent_LabelColor, #666); }
</style>
