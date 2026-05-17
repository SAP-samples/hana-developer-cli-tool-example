<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { useCalcViewModel } from '../composables/calcview/useCalcViewModel'
import { BatchCommand, MapColumnCommand } from '../composables/calcview/commands'
import { parseCalcView } from '../services/calcview/xmlParser'
import CalcViewCanvas from '../components/calcview/canvas/CalcViewCanvas.vue'
import NodePalette from '../components/calcview/canvas/NodePalette.vue'
import PropertiesPanel from '../components/calcview/properties/PropertiesPanel.vue'
import type { NodeType, Column, JoinCondition, CalcViewModel } from '../services/calcview/types'
import type { Node, Edge, Connection } from '@vue-flow/core'
import '@ui5/webcomponents/dist/Title.js'

const {
  model, undoRedo, vueFlowNodes, vueFlowEdges,
  loadModel, addNode, connectNodes, disconnectNodes,
  mapColumn, unmapColumn, addJoinCondition, removeJoinCondition
} = useCalcViewModel()

const selectedNodeId = ref<string | null>(null)

function handleNodeClick(node: Node) {
  selectedNodeId.value = node.id
}

function handleConnect(connection: Connection) {
  if (connection.source && connection.target) {
    connectNodes(connection.source, connection.target)
  }
}

function handleEdgeRemove(edge: Edge) {
  if (edge.target === '__semantics__') return
  disconnectNodes(edge.source, edge.target)
}

function handleAddNode(type: NodeType) {
  addNode(type, { x: 200, y: 400 })
}

function handleMapAll(nodeId: string) {
  if (!model.value) return
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
    const commands = columnsToMap.map(col =>
      new MapColumnCommand(model as Ref<CalcViewModel>, nodeId, col)
    )
    undoRedo.push(new BatchCommand(commands, `Map all columns to ${nodeId}`))
  }
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undoRedo.undo()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
    e.preventDefault()
    undoRedo.redo()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault()
    undoRedo.redo()
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

  loadModel(parseCalcView(demoXml))
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="calc-view-editor">
    <div class="editor-content" v-if="model && vueFlowNodes.length > 0">
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
        @map-column="(nodeId, col) => mapColumn(nodeId, col)"
        @unmap-column="(nodeId, colId) => unmapColumn(nodeId, colId)"
        @map-all="handleMapAll"
        @add-join-condition="(nodeId, cond) => addJoinCondition(nodeId, cond)"
        @remove-join-condition="(nodeId, idx) => removeJoinCondition(nodeId, idx)"
      />
    </div>
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
  height: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
