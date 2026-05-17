<script setup lang="ts">
import { computed } from 'vue'
import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/TabContainer.js'
import '@ui5/webcomponents/dist/Tab.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Button.js'

import ViewPropertiesTab from './ViewPropertiesTab.vue'
import ParametersTab from './ParametersTab.vue'
import SemanticsColumnsTab from './SemanticsColumnsTab.vue'
import HierarchiesTab from './HierarchiesTab.vue'
import RestrictedMeasuresTab from './RestrictedMeasuresTab.vue'
import MappingTab from './MappingTab.vue'
import CalculatedColumnsTab from './CalculatedColumnsTab.vue'
import FilterTab from './FilterTab.vue'
import JoinConditionSection from './JoinConditionSection.vue'
import type { CalcViewModel, CalcViewNode, Column, JoinCondition, CalculatedColumn, Variable, Hierarchy, RestrictedMeasure } from '../../../services/calcview/types'
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
  'add-variable': [variable: Variable]
  'remove-variable': [variableId: string]
  'update-variable': [variableId: string, updates: Partial<Variable>]
  'update-column': [collection: 'attributes' | 'baseMeasures', columnId: string, updates: Partial<Column>]
  'add-data-source': [nodeId: string]
  'add-hierarchy': [hierarchy: Hierarchy]
  'remove-hierarchy': [hierarchyId: string]
  'add-restricted-measure': [measure: RestrictedMeasure]
  'remove-restricted-measure': [measureId: string]
  'rename-node': [oldId: string, newId: string]
  'delete-node': [nodeId: string]
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
      <template v-if="!selectedNodeId || selectedNodeId === '__semantics__'">
        <ui5-tabcontainer>
          <ui5-tab text="Properties">
            <ViewPropertiesTab :model="model" />
          </ui5-tab>
          <ui5-tab text="Columns">
            <SemanticsColumnsTab
              :logical-model="model.logicalModel"
              @update-column="(collection, colId, updates) => emit('update-column', collection, colId, updates)"
            />
          </ui5-tab>
          <ui5-tab text="Variables">
            <ParametersTab
              :model="model"
              @add-variable="(v) => emit('add-variable', v)"
              @remove-variable="(id) => emit('remove-variable', id)"
              @update-variable="(id, updates) => emit('update-variable', id, updates)"
            />
          </ui5-tab>
          <ui5-tab text="Hierarchies">
            <HierarchiesTab
              :logical-model="model.logicalModel"
              @add-hierarchy="(h) => emit('add-hierarchy', h)"
              @remove-hierarchy="(id) => emit('remove-hierarchy', id)"
            />
          </ui5-tab>
          <ui5-tab text="Restricted">
            <RestrictedMeasuresTab
              :logical-model="model.logicalModel"
              @add-restricted-measure="(rm) => emit('add-restricted-measure', rm)"
              @remove-restricted-measure="(id) => emit('remove-restricted-measure', id)"
            />
          </ui5-tab>
        </ui5-tabcontainer>
      </template>
      <template v-else-if="selectedNode">
        <div class="node-actions">
          <ui5-input
            :value="selectedNode.id"
            @change="(e: any) => { const v = e.target.value?.trim(); if (v && v !== selectedNode!.id) emit('rename-node', selectedNode!.id, v) }"
            class="node-name-input"
          />
          <ui5-button design="Negative" icon="delete" @click="emit('delete-node', selectedNode!.id)">Delete</ui5-button>
        </div>
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
              @add-data-source="() => emit('add-data-source', selectedNode!.id)"
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
  height: 100%;
  background: var(--sapGroup_ContentBackground, #fff);
  border-left: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  display: flex;
  flex-direction: column;
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

.node-actions {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  align-items: center;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.node-name-input {
  flex: 1;
}
</style>
