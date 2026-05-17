<script setup lang="ts">
import { computed } from 'vue'
import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/TabContainer.js'
import '@ui5/webcomponents/dist/Tab.js'

import ViewPropertiesTab from './ViewPropertiesTab.vue'
import MappingTab from './MappingTab.vue'
import CalculatedColumnsTab from './CalculatedColumnsTab.vue'
import FilterTab from './FilterTab.vue'
import JoinConditionSection from './JoinConditionSection.vue'
import type { CalcViewModel, CalcViewNode, Column, JoinCondition, CalculatedColumn } from '../../../services/calcview/types'
import { NODE_TYPE_DEFINITIONS } from '../../../services/calcview/nodeTypes'

const props = defineProps<{
  model: CalcViewModel
  selectedNodeId: string | null
}>()

const emit = defineEmits<{
  'map-column': [nodeId: string, column: Column]
  'unmap-column': [nodeId: string, columnId: string]
  'map-all': [nodeId: string]
  'add-join-condition': [nodeId: string, condition: JoinCondition]
  'remove-join-condition': [nodeId: string, index: number]
  'add-calculated-column': [nodeId: string, column: CalculatedColumn]
  'remove-calculated-column': [nodeId: string, columnId: string]
  'update-calculated-column': [nodeId: string, columnId: string, updates: Partial<CalculatedColumn>]
  'set-filter': [nodeId: string, expression: string | undefined]
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

const isJoinNode = computed(() => {
  return selectedNode.value?.type === 'join' || selectedNode.value?.type === 'nonEquiJoin'
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
      <template v-else-if="selectedNode">
        <JoinConditionSection
          v-if="isJoinNode"
          :node="selectedNode"
          :model="model"
          @add-condition="(cond) => emit('add-join-condition', selectedNode!.id, cond)"
          @remove-condition="(idx) => emit('remove-join-condition', selectedNode!.id, idx)"
        />
        <ui5-tabcontainer>
          <ui5-tab text="Mapping">
            <MappingTab
              :node="selectedNode"
              :model="model"
              @map-column="(col) => emit('map-column', selectedNode!.id, col)"
              @unmap-column="(colId) => emit('unmap-column', selectedNode!.id, colId)"
              @map-all="() => emit('map-all', selectedNode!.id)"
            />
          </ui5-tab>
          <ui5-tab text="Calculated">
            <CalculatedColumnsTab
              :node="selectedNode"
              @add-column="(col) => emit('add-calculated-column', selectedNode!.id, col)"
              @remove-column="(colId) => emit('remove-calculated-column', selectedNode!.id, colId)"
              @update-column="(colId, updates) => emit('update-calculated-column', selectedNode!.id, colId, updates)"
            />
          </ui5-tab>
          <ui5-tab text="Filter">
            <FilterTab
              :node="selectedNode"
              @set-filter="(expr) => emit('set-filter', selectedNode!.id, expr)"
            />
          </ui5-tab>
        </ui5-tabcontainer>
      </template>
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
</style>
