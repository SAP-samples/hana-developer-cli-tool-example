<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { useCalcViewTabs } from '../composables/calcview/useCalcViewTabs'
import { BatchCommand, MapColumnCommand } from '../composables/calcview/commands'
import { parseCalcView } from '../services/calcview/xmlParser'
import { serializeCalcView } from '../services/calcview/xmlSerializer'
import { autoLayout } from '../composables/calcview/useCalcViewLayout'
import { useCalcViewFileApi, generateSkeletonXml } from '../composables/calcview/useCalcViewFileApi'
import CalcViewCanvas from '../components/calcview/canvas/CalcViewCanvas.vue'
import NodePalette from '../components/calcview/canvas/NodePalette.vue'
import PropertiesPanel from '../components/calcview/properties/PropertiesPanel.vue'
import EditorToolbar from '../components/calcview/toolbar/EditorToolbar.vue'
import EditorTabBar from '../components/calcview/tabs/EditorTabBar.vue'
import CreateCalcViewDialog from '../components/calcview/dialogs/CreateCalcViewDialog.vue'
import DataSourcePicker from '../components/calcview/dialogs/DataSourcePicker.vue'
import type { DataSourceSelection } from '../components/calcview/dialogs/DataSourcePicker.vue'
import type { NodeType, Column, CalcViewModel, Hierarchy, RestrictedMeasure } from '../services/calcview/types'
import type { Node, Edge, Connection } from '@vue-flow/core'
import '@ui5/webcomponents/dist/Title.js'

const route = useRoute()
const router = useRouter()
const { readProjectFile, writeProjectFile } = useCalcViewFileApi()
const { tabs, activeTabId, activeTab, openTab, closeTab, forceCloseTab, updateTabFilePath } = useCalcViewTabs()

const model = computed(() => activeTab.value?.editor.model.value ?? null)
const undoRedo = computed(() => activeTab.value?.editor.undoRedo ?? null)
const vueFlowNodes = computed(() => activeTab.value?.editor.vueFlowNodes.value ?? [])
const vueFlowEdges = computed(() => activeTab.value?.editor.vueFlowEdges.value ?? [])

const selectedNodeId = ref<string | null>(null)
const showCreateDialog = ref(false)
const createDir = ref('')
const showDataSourcePicker = ref(false)
const dataSourceTargetNodeId = ref<string | null>(null)

const paletteCollapsed = ref(localStorage.getItem('calcview-palette-collapsed') === 'true')
const propertiesSize = ref(Number(localStorage.getItem('calcview-properties-size') || 25))
const paletteSize = ref(Number(localStorage.getItem('calcview-palette-size') || 12))

function togglePalette() {
  paletteCollapsed.value = !paletteCollapsed.value
  localStorage.setItem('calcview-palette-collapsed', String(paletteCollapsed.value))
}

function onPanesResized(panes: { size: number }[]) {
  if (paletteCollapsed.value) {
    if (panes.length >= 2) {
      propertiesSize.value = panes[panes.length - 1].size
      localStorage.setItem('calcview-properties-size', String(propertiesSize.value))
    }
  } else {
    if (panes.length >= 3) {
      paletteSize.value = panes[0].size
      propertiesSize.value = panes[2].size
      localStorage.setItem('calcview-palette-size', String(paletteSize.value))
      localStorage.setItem('calcview-properties-size', String(propertiesSize.value))
    }
  }
}

function handleNodeClick(node: Node) { selectedNodeId.value = node.id }

function handleConnect(connection: Connection) {
  if (connection.source && connection.target && activeTab.value) {
    activeTab.value.editor.connectNodes(connection.source, connection.target)
  }
}

function handleEdgeRemove(edge: Edge) {
  if (edge.target === '__semantics__') return
  if (activeTab.value) activeTab.value.editor.disconnectNodes(edge.source, edge.target)
}

function handleAddNode(type: NodeType) {
  if (activeTab.value) activeTab.value.editor.addNode(type, { x: 200, y: 400 })
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
        if (!mappedIds.has(col.name)) columnsToMap.push({ id: col.name, name: col.name, dataType: col.dataType })
      }
    }
    const cvNode = model.value.calculationViews.find(n => n.id === input.node)
    if (cvNode) {
      for (const col of cvNode.outputColumns) {
        if (!mappedIds.has(col.id)) columnsToMap.push({ id: col.id, name: col.name, dataType: col.dataType })
      }
    }
  }

  if (columnsToMap.length > 0) {
    const modelRef = activeTab.value.editor.model as Ref<CalcViewModel>
    const commands = columnsToMap.map(col => new MapColumnCommand(modelRef, nodeId, col))
    activeTab.value.editor.undoRedo.push(new BatchCommand(commands, `Map all columns to ${nodeId}`))
  }
}

function handleAddDataSource(nodeId: string) {
  dataSourceTargetNodeId.value = nodeId
  showDataSourcePicker.value = true
}

function handleRenameNode(oldId: string, newId: string) {
  if (activeTab.value) activeTab.value.editor.renameNode(oldId, newId)
}

function handleDeleteNode(nodeId: string) {
  if (activeTab.value) activeTab.value.editor.removeNode(nodeId)
  if (selectedNodeId.value === nodeId) selectedNodeId.value = null
}

function handleNodeDragStop(nodeId: string, position: { x: number; y: number }) {
  if (nodeId === '__semantics__') return
  if (activeTab.value) activeTab.value.editor.moveNode(nodeId, position)
}

function handleDataSourceSelected(source: DataSourceSelection) {
  showDataSourcePicker.value = false
  if (!activeTab.value || !model.value || !dataSourceTargetNodeId.value) return

  // Add to dataSources if not already present
  if (!model.value.dataSources.find(d => d.id === source.id)) {
    model.value.dataSources.push({
      id: source.id,
      type: source.type,
      schemaName: source.schemaName,
      objectName: source.objectName,
      columns: []
    })
  }

  // Add input reference to the target node
  const targetNode = model.value.calculationViews.find(n => n.id === dataSourceTargetNodeId.value)
  if (targetNode && !targetNode.inputs.find(i => i.node === source.id)) {
    targetNode.inputs.push({ name: source.id, node: source.id })
  }

  dataSourceTargetNodeId.value = null
}

async function handleAutoLayout() {
  if (!model.value || !activeTab.value) return
  await autoLayout(activeTab.value.editor.model as Ref<CalcViewModel>, activeTab.value.editor.undoRedo)
}

function handleCloseTab(tabId: string) {
  const closed = closeTab(tabId)
  if (!closed) forceCloseTab(tabId)
}

// --- Save ---

async function handleSave() {
  if (!activeTab.value || !model.value) return
  const filePath = activeTab.value.filePath
  if (!filePath) { handleSaveAs(); return }
  const xml = serializeCalcView(model.value)
  await writeProjectFile(filePath, xml)
  activeTab.value.editor.undoRedo.markSaved()
}

async function handleSaveAs() {
  if (!activeTab.value || !model.value) return
  const newPath = prompt('Save as (full path):', activeTab.value.filePath || '')
  if (!newPath) return
  const xml = serializeCalcView(model.value)
  await writeProjectFile(newPath, xml)
  updateTabFilePath(activeTab.value.id, newPath)
  activeTab.value.editor.undoRedo.markSaved()
}

// --- Create New ---

function handleCreateConfirm(config: { name: string; dataCategory: string; description: string; initialNode: string; directory: string }) {
  showCreateDialog.value = false
  const xml = generateSkeletonXml(config)
  const filePath = config.directory
    ? `${config.directory.replace(/\\/g, '/')}/${config.name}.hdbcalculationview`
    : undefined
  const tab = openTab(config.name, filePath)
  tab.editor.loadModel(parseCalcView(xml))
  router.replace({ name: 'calcViewEditor' })
}

function handleCreateCancel() {
  showCreateDialog.value = false
  router.replace({ name: 'calcViewEditor' })
}

// --- Keyboard ---

function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    handleSave()
    return
  }
  if (!undoRedo.value) return
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault(); undoRedo.value.undo()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
    e.preventDefault(); undoRedo.value.redo()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault(); undoRedo.value.redo()
  }
}

onMounted(async () => {
  document.addEventListener('keydown', handleKeydown)

  // Handle ?file= query param — open an existing file
  if (route.query.file) {
    const filePath = String(route.query.file)
    try {
      const { xml } = await readProjectFile(filePath)
      const name = filePath.split(/[\\/]/).pop()?.replace('.hdbcalculationview', '') || 'Untitled'
      const tab = openTab(name, filePath)
      tab.editor.loadModel(parseCalcView(xml))
      tab.editor.undoRedo.markSaved()
    } catch (e: any) {
      console.error('Failed to open file:', e)
    }
    router.replace({ name: 'calcViewEditor' })
    return
  }

  // Handle ?new=true — show create dialog
  if (route.query.new === 'true') {
    createDir.value = String(route.query.dir || '')
    showCreateDialog.value = true
    return
  }

  // Default: open demo if no tabs
  if (tabs.value.length === 0) {
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
  }
})

onUnmounted(() => { document.removeEventListener('keydown', handleKeydown) })
</script>

<template>
  <div class="calc-view-editor">
    <template v-if="tabs.length > 0 || showCreateDialog">
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
          :file-path="activeTab?.filePath"
          :palette-visible="!paletteCollapsed"
          @undo="undoRedo?.undo()"
          @redo="undoRedo?.redo()"
          @auto-layout="handleAutoLayout"
          @save="handleSave"
          @save-as="handleSaveAs"
          @toggle-palette="togglePalette"
        />
        <Splitpanes class="editor-splitpanes" @resized="onPanesResized">
          <Pane v-if="!paletteCollapsed" :size="paletteSize" :min-size="8" :max-size="20">
            <NodePalette @add-node="handleAddNode" />
          </Pane>
          <Pane :size="paletteCollapsed ? (100 - propertiesSize) : (100 - paletteSize - propertiesSize)">
            <CalcViewCanvas
              :nodes="vueFlowNodes"
              :edges="vueFlowEdges"
              @node-click="handleNodeClick"
              @connect="handleConnect"
              @edge-remove="handleEdgeRemove"
              @node-drag-stop="handleNodeDragStop"
            />
          </Pane>
          <Pane :size="propertiesSize" :min-size="15" :max-size="50">
            <PropertiesPanel
              :model="model"
              :selected-node-id="selectedNodeId"
              @map-column="(nodeId, col) => activeTab?.editor.mapColumn(nodeId, col)"
              @unmap-column="(nodeId, colId) => activeTab?.editor.unmapColumn(nodeId, colId)"
              @map-all="handleMapAll"
              @add-data-source="handleAddDataSource"
              @add-join-condition="(nodeId, cond) => activeTab?.editor.addJoinCondition(nodeId, cond)"
              @remove-join-condition="(nodeId, idx) => activeTab?.editor.removeJoinCondition(nodeId, idx)"
              @add-calculated-column="(nodeId, col) => activeTab?.editor.addCalculatedColumn(nodeId, col)"
              @remove-calculated-column="(nodeId, colId) => activeTab?.editor.removeCalculatedColumn(nodeId, colId)"
              @update-calculated-column="(nodeId, colId, updates) => activeTab?.editor.updateCalculatedColumn(nodeId, colId, updates)"
              @set-filter="(nodeId, expr) => activeTab?.editor.setFilterExpression(nodeId, expr)"
              @add-variable="(v) => activeTab?.editor.addVariable(v)"
              @remove-variable="(id) => activeTab?.editor.removeVariable(id)"
              @update-variable="(id, updates) => activeTab?.editor.updateVariable(id, updates)"
              @update-column="(collection, colId, updates) => activeTab?.editor.updateColumnProperties(collection, colId, updates)"
              @add-hierarchy="(h) => activeTab?.editor.addHierarchy(h)"
              @remove-hierarchy="(id) => activeTab?.editor.removeHierarchy(id)"
              @add-restricted-measure="(rm) => activeTab?.editor.addRestrictedMeasure(rm)"
              @remove-restricted-measure="(id) => activeTab?.editor.removeRestrictedMeasure(id)"
              @rename-node="handleRenameNode"
              @delete-node="handleDeleteNode"
            />
          </Pane>
        </Splitpanes>
      </template>
    </template>
    <div v-else class="empty-state">
      <ui5-title level="H3">No Calculation View loaded</ui5-title>
    </div>

    <CreateCalcViewDialog
      :open="showCreateDialog"
      :directory="createDir"
      @confirm="handleCreateConfirm"
      @cancel="handleCreateCancel"
    />

    <DataSourcePicker
      :open="showDataSourcePicker"
      @select="handleDataSourceSelected"
      @cancel="showDataSourcePicker = false"
    />
  </div>
</template>

<style scoped>
.calc-view-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-splitpanes {
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

<style>
.editor-splitpanes .splitpanes__splitter {
  background: var(--sapGroup_ContentBorderColor, #d9d9d9) !important;
  min-width: 4px !important;
  width: 4px !important;
}
.editor-splitpanes .splitpanes__splitter:hover {
  background: var(--sapBrandColor, #0854a0) !important;
}
</style>
