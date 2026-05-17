<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCalcViewModel } from '../composables/calcview/useCalcViewModel'
import { parseCalcView } from '../services/calcview/xmlParser'
import CalcViewCanvas from '../components/calcview/canvas/CalcViewCanvas.vue'
import NodePalette from '../components/calcview/canvas/NodePalette.vue'
import PropertiesPanel from '../components/calcview/properties/PropertiesPanel.vue'
import type { NodeType } from '../services/calcview/types'
import type { Node } from '@vue-flow/core'
import '@ui5/webcomponents/dist/Title.js'

const { model, vueFlowNodes, vueFlowEdges, loadModel } = useCalcViewModel()

const selectedNodeId = ref<string | null>(null)

function handleNodeClick(node: Node) {
  selectedNodeId.value = node.id
}

onMounted(() => {
  // Load a demo model for development
  const demoXml = `<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="DEMO" applyPrivilegeType="NONE" dataCategory="CUBE">
  <descriptions defaultDescription="Demo View"/>
  <localVariables/>
  <variableMappings/>
  <dataSources>
    <DataSource id="SALES"><resourceUri>SALES</resourceUri></DataSource>
  </dataSources>
  <calculationViews>
    <calculationView xsi:type="Calculation:ProjectionView" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Projection_1">
      <viewAttributes>
        <viewAttribute id="AMOUNT"/>
        <viewAttribute id="PRODUCT_ID"/>
      </viewAttributes>
      <input node="SALES"/>
    </calculationView>
  </calculationViews>
  <logicalModel id="Projection_1">
    <attributes>
      <attribute id="PRODUCT_ID"><descriptions defaultDescription="Product"/></attribute>
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
        <upperLeftCorner x="200" y="50"/>
      </shape>
      <shape expanded="true" modelObjectName="Projection_1" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="200" y="250"/>
      </shape>
    </shapes>
  </layout>
</Calculation:scenario>`

  loadModel(parseCalcView(demoXml))
})

function handleAddNode(type: NodeType) {
  // Phase 2: will add node to model
  console.log('Add node:', type)
}
</script>

<template>
  <div class="calc-view-editor">
    <div class="editor-content" v-if="model && vueFlowNodes.length > 0">
      <NodePalette @add-node="handleAddNode" />
      <CalcViewCanvas
        :nodes="vueFlowNodes"
        :edges="vueFlowEdges"
        @node-click="handleNodeClick"
      />
      <PropertiesPanel
        :model="model"
        :selected-node-id="selectedNodeId"
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
