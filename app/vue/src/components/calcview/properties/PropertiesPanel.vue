<script setup lang="ts">
import { computed } from 'vue'
import '@ui5/webcomponents/dist/Title.js'

import ViewPropertiesTab from './ViewPropertiesTab.vue'
import type { CalcViewModel, CalcViewNode } from '../../../services/calcview/types'
import { NODE_TYPE_DEFINITIONS } from '../../../services/calcview/nodeTypes'

const props = defineProps<{
  model: CalcViewModel
  selectedNodeId: string | null
}>()

const selectedNode = computed<CalcViewNode | null>(() => {
  if (!props.selectedNodeId || props.selectedNodeId === '__semantics__') return null
  return props.model.calculationViews.find(n => n.id === props.selectedNodeId) || null
})

const panelTitle = computed(() => {
  if (!props.selectedNodeId || props.selectedNodeId === '__semantics__') return 'View Properties'
  if (selectedNode.value) {
    const typeDef = NODE_TYPE_DEFINITIONS[selectedNode.value.type]
    return `${selectedNode.value.id} (${typeDef.label})`
  }
  return 'Properties'
})
</script>

<template>
  <div class="properties-panel">
    <div class="panel-header">
      <ui5-title level="H5">{{ panelTitle }}</ui5-title>
    </div>
    <div class="panel-content">
      <ViewPropertiesTab
        v-if="!selectedNodeId || selectedNodeId === '__semantics__'"
        :model="model"
      />
      <div v-else class="node-properties-placeholder">
        <p>Node properties for <strong>{{ selectedNode?.id }}</strong></p>
        <p>Type: {{ selectedNode?.type }}</p>
        <p>Columns: {{ selectedNode?.outputColumns.length }}</p>
        <p class="note">Full property editing in Phase 2.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.properties-panel {
  width: 300px;
  background: var(--sapGroup_ContentBackground, #fff);
  border-left: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
}

.node-properties-placeholder {
  padding: 12px;
  color: var(--sapTextColor, #333);
  font-size: 12px;
}

.note {
  color: var(--sapContent_LabelColor, #666);
  font-style: italic;
  margin-top: 8px;
}
</style>
