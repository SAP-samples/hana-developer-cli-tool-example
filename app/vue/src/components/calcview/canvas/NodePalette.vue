<script setup lang="ts">
import { NODE_TYPE_DEFINITIONS } from '../../../services/calcview/nodeTypes'
import type { NodeType } from '../../../services/calcview/types'

const emit = defineEmits<{
  'add-node': [type: NodeType]
}>()

const nodeTypes = Object.values(NODE_TYPE_DEFINITIONS)

function onDragStart(event: DragEvent, type: NodeType) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/calcview-node-type', type)
    event.dataTransfer.effectAllowed = 'move'
  }
}
</script>

<template>
  <div class="node-palette">
    <div class="palette-header">Nodes</div>
    <div class="palette-items">
      <div
        v-for="nodeDef in nodeTypes"
        :key="nodeDef.type"
        class="palette-item"
        draggable="true"
        @dragstart="onDragStart($event, nodeDef.type)"
        @click="emit('add-node', nodeDef.type)"
      >
        <span class="palette-icon" :style="{ color: `var(${nodeDef.themeVariable})` }">
          {{ nodeDef.icon }}
        </span>
        <span class="palette-label">{{ nodeDef.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.node-palette {
  height: 100%;
  background: var(--sapGroup_ContentBackground, #fff);
  border-right: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  padding: 12px 8px;
  overflow-y: auto;
}

.palette-header {
  color: var(--sapContent_LabelColor, #666);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  padding: 0 8px;
}

.palette-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  cursor: grab;
  border: 1px solid transparent;
  font-size: 12px;
  transition: background 0.15s;
}

.palette-item:hover {
  background: var(--sapList_Hover_Background, #e5e5e5);
  border-color: var(--sapList_BorderColor, #e5e5e5);
}

.palette-item:active {
  cursor: grabbing;
}

.palette-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.palette-label {
  color: var(--sapTextColor, #333);
}
</style>
