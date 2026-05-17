<script setup lang="ts">
import { computed } from 'vue'
import type { CalcViewNode, CalcViewModel, Column } from '../../../services/calcview/types'
import '@ui5/webcomponents/dist/Button.js'

const props = defineProps<{
  node: CalcViewNode
  model: CalcViewModel
}>()

const emit = defineEmits<{
  'map-column': [column: Column]
  'unmap-column': [columnId: string]
  'map-all': []
}>()

interface InputColumn {
  id: string
  name: string
  dataType: string
  sourceName: string
  isMapped: boolean
}

const inputColumns = computed<InputColumn[]>(() => {
  const columns: InputColumn[] = []
  const mappedIds = new Set(props.node.outputColumns.map(c => c.id))

  for (const input of props.node.inputs) {
    const ds = props.model.dataSources.find(d => d.id === input.node)
    if (ds) {
      for (const col of ds.columns) {
        columns.push({
          id: col.name,
          name: col.name,
          dataType: col.dataType,
          sourceName: input.node,
          isMapped: mappedIds.has(col.name)
        })
      }
    }
    const cvNode = props.model.calculationViews.find(n => n.id === input.node)
    if (cvNode) {
      for (const col of cvNode.outputColumns) {
        columns.push({
          id: col.id,
          name: col.name,
          dataType: col.dataType,
          sourceName: input.node,
          isMapped: mappedIds.has(col.id)
        })
      }
    }
  }
  return columns
})

function onDragStart(e: DragEvent, col: InputColumn) {
  e.dataTransfer?.setData('text/plain', JSON.stringify(col))
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const data = e.dataTransfer?.getData('text/plain')
  if (!data) return
  const col: InputColumn = JSON.parse(data)
  emit('map-column', {
    id: col.id,
    name: col.name,
    dataType: col.dataType
  })
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

function handleUnmap(columnId: string) {
  emit('unmap-column', columnId)
}

function handleMapAll() {
  emit('map-all')
}
</script>

<template>
  <div class="mapping-tab">
    <div class="mapping-columns">
      <div class="column-list input-columns">
        <div class="column-header">
          <span>Input Columns</span>
          <ui5-button design="Transparent" @click="handleMapAll">Map All</ui5-button>
        </div>
        <div
          v-for="col in inputColumns"
          :key="`${col.sourceName}-${col.id}`"
          class="column-item"
          :class="{ mapped: col.isMapped }"
          :draggable="!col.isMapped"
          @dragstart="onDragStart($event, col)"
        >
          <span class="col-name">{{ col.name }}</span>
          <span class="col-meta">{{ col.dataType }} · {{ col.sourceName }}</span>
        </div>
      </div>

      <div
        class="column-list output-columns"
        @drop="onDrop"
        @dragover="onDragOver"
      >
        <div class="column-header">
          <span>Output Columns ({{ node.outputColumns.length }})</span>
        </div>
        <div
          v-for="col in node.outputColumns"
          :key="col.id"
          class="column-item output-item"
        >
          <span class="col-name">{{ col.name }}</span>
          <span class="col-meta">{{ col.dataType }}</span>
          <ui5-button
            design="Transparent"
            icon="decline"
            class="remove-btn"
            @click="handleUnmap(col.id)"
          />
        </div>
        <div v-if="node.outputColumns.length === 0" class="drop-zone">
          Drag columns here to map
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mapping-tab {
  padding: 12px;
  height: 100%;
  overflow: hidden;
}

.mapping-columns {
  display: flex;
  gap: 12px;
  height: 100%;
}

.column-list {
  flex: 1;
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.column-header {
  padding: 8px 12px;
  background: var(--sapList_HeaderBackground, #f2f2f2);
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  font-size: 11px;
  font-weight: 600;
  color: var(--sapTextColor, #333);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-item {
  padding: 6px 12px;
  border-bottom: 1px solid var(--sapList_BorderColor, #e5e5e5);
  cursor: grab;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.column-item.mapped {
  opacity: 0.5;
  text-decoration: line-through;
  cursor: default;
}

.output-item {
  cursor: default;
}

.col-name {
  color: var(--sapTextColor, #333);
  font-weight: 500;
}

.col-meta {
  color: var(--sapContent_LabelColor, #666);
  font-size: 10px;
  margin-left: auto;
}

.remove-btn {
  margin-left: 4px;
}

.drop-zone {
  padding: 24px;
  text-align: center;
  color: var(--sapContent_LabelColor, #666);
  font-size: 11px;
  border: 2px dashed var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 6px;
  margin: 8px;
}
</style>
