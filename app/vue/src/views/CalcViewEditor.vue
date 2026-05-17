<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { useCalcViewTabs } from '../composables/calcview/useCalcViewTabs'
import { BatchCommand, MapColumnCommand } from '../composables/calcview/commands'
import { parseCalcView } from '../services/calcview/xmlParser'
import { autoLayout } from '../composables/calcview/useCalcViewLayout'
import CalcViewCanvas from '../components/calcview/canvas/CalcViewCanvas.vue'
import NodePalette from '../components/calcview/canvas/NodePalette.vue'
import PropertiesPanel from '../components/calcview/properties/PropertiesPanel.vue'
import EditorToolbar from '../components/calcview/toolbar/EditorToolbar.vue'
import EditorTabBar from '../components/calcview/tabs/EditorTabBar.vue'
import type { NodeType, Column, JoinCondition, CalcViewModel, CalculatedColumn, Variable } from '../services/calcview/types'
import type { Node, Edge, Connection } from '@vue-flow/core'
import '@ui5/webcomponents/dist/Title.js'

const { tabs, activeTabId, activeTab, openTab, closeTab, forceCloseTab } = useCalcViewTabs()

const model = computed(() => activeTab.value?.editor.model.value ?? null)
const undoRedo = computed(() => activeTab.value?.editor.undoRedo ?? null)
const vueFlowNodes = computed(() => activeTab.value?.editor.vueFlowNodes.value ?? [])
const vueFlowEdges = computed(() => activeTab.value?.editor.vueFlowEdges.value ?? [])

const selectedNodeId = ref<string | null>(null)

function handleNodeClick(node: Node) {
  selectedNodeId.value = node.id
}

function handleConnect(connection: Connection) {
  if (connection.source && connection.target && activeTab.value) {
    activeTab.value.editor.connectNodes(connection.source, connection.target)
  }
}

function handleEdgeRemove(edge: Edge) {
  if (edge.target === '__semantics__') return
  if (activeTab.value) {
    activeTab.value.editor.disconnectNodes(edge.source, edge.target)
  }
}

function handleAddNode(type: NodeType) {
  if (activeTab.value) {
    activeTab.value.editor.addNode(type, { x: 200, y: 400 })
  }
}

function handleMapAll(nodeId: string) {
  if (!model.value || !activeTab.value) return
  const node = model.value.calculationViews.find(n => n.id === nodeId)
  if (!node) return

  const mappedIds = new Set(node.outputColumns.map(c => c.id))
  const columnsToMap: Column[] = []

  for (const input of node.inputs) {
    const ds = model.value.dataSources.find(d => d.id === input.node)
    if (ds) {
      for (const col of ds.columns) {
        if (!mappedIds.has(col.name)) {
          columnsToMap.push({ id: col.name, name: col.name, dataType: col.dataType })
        }
      }
    }
    const cvNode = model.value.calculationViews.find(n => n.id === input.node)
    if (cvNode) {
      for (const col of cvNode.outputColumns) {
        if (!mappedIds.has(col.id)) {
          columnsToMap.push({ id: col.id, name: col.name, dataType: col.dataType })
        }
      }
    }
  }

  if (columnsToMap.length > 0) {
    const modelRef = activeTab.value.editor.model as Ref<CalcViewModel>
    const commands = columnsToMap.map(col =>
      new MapColumnCommand(modelRef, nodeId, col)
    )
    activeTab.value.editor.undoRedo.push(new BatchCommand(commands, `Map all columns to ${nodeId}`))
  }
}

async function handleAutoLayout() {
  if (!model.value || !activeTab.value) return
  const modelRef = activeTab.value.editor.model as Ref<CalcViewModel>
  await autoLayout(modelRef, activeTab.value.editor.undoRedo)
}

function handleCloseTab(tabId: string) {
  const closed = closeTab(tabId)
  if (!closed) {
    // Tab is dirty - force close (in a real app, show confirmation dialog)
    forceCloseTab(tabId)
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!undoRedo.value) return
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undoRedo.value.undo()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
    e.preventDefault()
    undoRedo.value.redo()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault()
    undoRedo.value.redo()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)

  const demoXml = `<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="SALES_ANALYSIS" applyPrivilegeType="NONE" dataCategory="CUBE">
  <descriptions defaultDescription="Sales Analysis with Products"/>
  <localVariables/>
  <variableMappings/>
  <dataSources>
    <DataSource id="SALES"><resourceUri>SALES</resourceUri></DataSource>
    <DataSource id="PRODUCTS"><resourceUri>PRODUCTS</resourceUri></DataSource>
  </dataSources>
  <calculationViews>
    <calculationView xsi:type="Calculation:ProjectionView" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Projection_1">
      <viewAttributes>
        <viewAttribute id="AMOUNT"/>
        <viewAttribute id="PRODUCT_ID"/>
        <viewAttribute id="SALES_DATE"/>
      </viewAttributes>
      <input node="SALES"/>
    </calculationView>
    <calculationView xsi:type="Calculation:ProjectionView" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Projection_2">
      <viewAttributes>
        <viewAttribute id="PRODUCT_NAME"/>
        <viewAttribute id="CATEGORY"/>
        <viewAttribute id="PRODUCT_ID"/>
      </viewAttributes>
      <input node="PRODUCTS"/>
    </calculationView>
    <calculationView xsi:type="Calculation:JoinView" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Join_1" cardinality="C1_N" joinType="inner">
      <viewAttributes>
        <viewAttribute id="PRODUCT_ID"/>
        <viewAttribute id="AMOUNT"/>
        <viewAttribute id="PRODUCT_NAME"/>
      </viewAttributes>
      <calculatedViewAttributes/>
      <input node="Projection_1"/>
      <input node="Projection_2"/>
      <joinAttribute name="PRODUCT_ID"/>
    </calculationView>
  </calculationViews>
  <logicalModel id="Join_1">
    <attributes>
      <attribute id="PRODUCT_ID"><descriptions defaultDescription="Product ID"/></attribute>
      <attribute id="PRODUCT_NAME"><descriptions defaultDescription="Product Name"/></attribute>
    </attributes>
    <calculatedAttributes/>
    <baseMeasures>
      <measure id="AMOUNT" aggregationType="sum"><descriptions defaultDescription="Amount"/></measure>
    </baseMeasures>
    <calculatedMeasures/>
    <restrictedMeasures/>
  </logicalModel>
  <layout>
    <shapes>
      <shape expanded="true" modelObjectName="Output" modelObjectNameSpace="MeasureGroup">
        <upperLeftCorner x="250" y="50"/>
      </shape>
      <shape expanded="true" modelObjectName="Join_1" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="250" y="200"/>
      </shape>
      <shape expanded="true" modelObjectName="Projection_1" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="100" y="400"/>
      </shape>
      <shape expanded="true" modelObjectName="Projection_2" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="400" y="400"/>
      </shape>
    </shapes>
  </layout>
</Calculation:scenario>`

  const tab = openTab('SALES_ANALYSIS')
  tab.editor.loadModel(parseCalcView(demoXml))
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="calc-view-editor">
    <template v-if="tabs.length > 0">
      <EditorTabBar
        :tabs="tabs"
        :active-tab-id="activeTabId"
        @select-tab="(id) => activeTabId = id"
        @close-tab="handleCloseTab"
      />
      <template v-if="model && vueFlowNodes.length > 0">
        <EditorToolbar
          :can-undo="undoRedo?.canUndo.value ?? false"
          :can-redo="undoRedo?.canRedo.value ?? false"
          @undo="undoRedo?.undo()"
          @redo="undoRedo?.redo()"
          @auto-layout="handleAutoLayout"
        />
        <div class="editor-content">
          <NodePalette @add-node="handleAddNode" />
          <CalcViewCanvas
            :nodes="vueFlowNodes"
            :edges="vueFlowEdges"
            @node-click="handleNodeClick"
            @connect="handleConnect"
            @edge-remove="handleEdgeRemove"
          />
          <PropertiesPanel
            :model="model"
            :selected-node-id="selectedNodeId"
            @map-column="(nodeId, col) => activeTab?.editor.mapColumn(nodeId, col)"
            @unmap-column="(nodeId, colId) => activeTab?.editor.unmapColumn(nodeId, colId)"
            @map-all="handleMapAll"
            @add-join-condition="(nodeId, cond) => activeTab?.editor.addJoinCondition(nodeId, cond)"
            @remove-join-condition="(nodeId, idx) => activeTab?.editor.removeJoinCondition(nodeId, idx)"
            @add-calculated-column="(nodeId, col) => activeTab?.editor.addCalculatedColumn(nodeId, col)"
            @remove-calculated-column="(nodeId, colId) => activeTab?.editor.removeCalculatedColumn(nodeId, colId)"
            @update-calculated-column="(nodeId, colId, updates) => activeTab?.editor.updateCalculatedColumn(nodeId, colId, updates)"
            @set-filter="(nodeId, expr) => activeTab?.editor.setFilterExpression(nodeId, expr)"
            @add-variable="(v) => activeTab?.editor.addVariable(v)"
            @remove-variable="(id) => activeTab?.editor.removeVariable(id)"
            @update-variable="(id, updates) => activeTab?.editor.updateVariable(id, updates)"
          />
        </div>
      </template>
    </template>
    <div v-else class="empty-state">
      <ui5-title level="H3">No Calculation View loaded</ui5-title>
    </div>
  </div>
</template>

<style scoped>
.calc-view-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-content {
  display: flex;
  flex: 1;
  min-height: 0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
