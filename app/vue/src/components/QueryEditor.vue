<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useHanaApi } from '../composables/useHanaApi'
import { useDynamicTable } from '../composables/useDynamicTable'
import { useQueryTabs } from '../composables/useQueryTabs'
import { useQueryHistory } from '../composables/useQueryHistory'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'
import { useLiveTail } from '../composables/useLiveTail'
import { useNotifications } from '../composables/useNotifications'
import SmartTable from './SmartTable.vue'
import QueryTabBar from './QueryTabBar.vue'
import SavedQueriesPanel from './SavedQueriesPanel.vue'
import QueryHistoryPanel from './QueryHistoryPanel.vue'
import ObjectExplorer from './ObjectExplorer.vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { ref, watch, nextTick } from 'vue'

import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'
import '@ui5/webcomponents/dist/Bar.js'
import '@ui5/webcomponents/dist/SegmentedButton.js'
import '@ui5/webcomponents/dist/SegmentedButtonItem.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/ToggleButton.js'

const SqlEditor = defineAsyncComponent(() => import('./SqlEditor.vue'))
const PlanTree = defineAsyncComponent(() => import('./PlanTree.vue'))
const ResultDiffView = defineAsyncComponent(() => import('./ResultDiffView.vue'))

const emit = defineEmits<{
  results: [data: { columns: string[]; rows: any[] }]
}>()

const { execute } = useHanaApi()
const { tabs, activeTabId, activeTab, addTab, closeTab, selectTab, renameTab, updateTab, persist } = useQueryTabs()
const { addEntry: addHistoryEntry } = useQueryHistory()
const { notify } = useNotifications()

const liveTail = useLiveTail({
  onAutoStop() {
    notify('warning', 'Watch Mode Stopped', 'Auto-stopped after 3 consecutive errors')
  }
})

const resultsTable = useDynamicTable()
const savedQueriesOpen = ref(false)
const historyOpen = ref(false)
const explorerCollapsed = ref(localStorage.getItem('hana-cli-explorer-collapsed') === 'true')
const explorerSize = ref(Number(localStorage.getItem('hana-cli-explorer-width') || 20))
const sqlEditorRef = ref<any>(null)
const outputModeRef = ref<any>(null)
const editorPaneSize = ref(Number(localStorage.getItem('hana-cli-split-pos') || 40))

const currentTheme = localStorage.getItem('hana-cli-theme') || 'auto'
const monacoTheme = computed(() => {
  const theme = localStorage.getItem('hana-cli-theme') || 'auto'
  if (theme === 'sap_horizon_dark' || theme === 'sap_horizon_hcb') return 'vs-dark'
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'vs-dark' : 'vs'
  }
  return 'vs'
})

useKeyboardShortcuts([
  { key: 'n', ctrl: true, shift: true, handler: () => addTab(), description: 'New Query Tab', category: 'query' }
])

function syncResultsTable() {
  const tab = activeTab.value
  if (tab.results.length > 0) {
    resultsTable.setData(tab.results)
  } else {
    resultsTable.resetColumns()
    resultsTable.setData([])
  }
}

syncResultsTable()

let suppressSelectionEvent = false

watch(() => activeTab.value.id, () => {
  nextTick(() => {
    const el = outputModeRef.value
    if (!el) return
    suppressSelectionEvent = true
    const mode = activeTab.value.outputMode
    const items = el.querySelectorAll('ui5-segmented-button-item')
    items.forEach((item: any) => { item.selected = item.dataset.mode === mode })
    requestAnimationFrame(() => { suppressSelectionEvent = false })
  })
}, { immediate: true })

async function executeQuery() {
  const tab = activeTab.value
  if (!tab.sql.trim()) return

  updateTab(tab.id, { loading: true, error: '' })
  const startTime = Date.now()

  try {
    const result = await execute<any>('querySimple-ui', { query: tab.sql })
    const data = Array.isArray(result) ? result : []
    const duration = Date.now() - startTime
    updateTab(tab.id, { results: data, loading: false, error: '' })
    resultsTable.setData(data)
    emit('results', { columns: Object.keys(data[0] || {}), rows: data })
    addHistoryEntry(tab.sql, duration, data.length, tab.name)
  } catch (e: any) {
    const duration = Date.now() - startTime
    updateTab(tab.id, { results: [], loading: false, error: e.message })
    resultsTable.setData([])
    addHistoryEntry(tab.sql, duration, 0, tab.name, e.message)
  }
}

const planResults = ref<any[]>([])

async function explainQuery() {
  const tab = activeTab.value
  if (!tab.sql.trim()) return

  updateTab(tab.id, { loading: true, error: '', outputMode: 'plan' })

  try {
    const result = await execute<any>('queryPlan-ui', { sql: tab.sql })
    planResults.value = Array.isArray(result) ? result : []
    updateTab(tab.id, { loading: false, error: '' })
  } catch (e: any) {
    planResults.value = []
    updateTab(tab.id, { loading: false, error: e.message })
  }
}

function onSqlChange(value: string) {
  updateTab(activeTab.value.id, { sql: value })
}

function onTabSelect(id: string) {
  liveTail.stop()
  selectTab(id)
  syncResultsTable()
}

function onTabClose(id: string) {
  liveTail.stop()
  closeTab(id)
  syncResultsTable()
}

function onOutputModeChange(e: Event) {
  if (suppressSelectionEvent) return
  const items = (e as CustomEvent).detail?.selectedItems
  const selected = items?.[0]
  if (selected) {
    const mode = selected.dataset.mode || 'table'
    if (mode === activeTab.value.outputMode) return
    updateTab(activeTab.value.id, { outputMode: mode, error: '' })
    if (mode === 'plan' && planResults.value.length === 0 && activeTab.value.sql.trim()) {
      explainQuery()
    }
  }
}

function toggleWatch() {
  if (liveTail.isWatching.value) {
    liveTail.stop()
  } else {
    liveTail.start(executeQuery)
  }
}

function onWatchIntervalChange(e: Event) {
  const val = Number((e.target as any).selectedOption?.value || 5000)
  liveTail.updateInterval(val)
  if (liveTail.isWatching.value) {
    liveTail.stop()
    liveTail.start(executeQuery)
  }
}

function onExport(format: 'excel' | 'csv') {
  format === 'excel'
    ? resultsTable.exportExcel('query_results.xlsx')
    : resultsTable.exportCsv('query_results.csv')
}

function onPaneResized(panes: any[]) {
  if (panes[0]) {
    editorPaneSize.value = panes[0].size
    localStorage.setItem('hana-cli-split-pos', String(panes[0].size))
  }
}

function onLoadSavedQuery(sql: string) {
  updateTab(activeTab.value.id, { sql })
}

function toggleExplorer() {
  explorerCollapsed.value = !explorerCollapsed.value
  localStorage.setItem('hana-cli-explorer-collapsed', String(explorerCollapsed.value))
}

function onExplorerResized(panes: any[]) {
  if (panes[0]) {
    explorerSize.value = panes[0].size
    localStorage.setItem('hana-cli-explorer-width', String(panes[0].size))
  }
}

function onExplorerInsert(text: string) {
  if (sqlEditorRef.value?.insertText) {
    sqlEditorRef.value.insertText(text)
  }
}
</script>

<template>
  <div class="query-view">
    <QueryTabBar
      :tabs="tabs"
      :active-tab-id="activeTabId"
      @select="onTabSelect"
      @close="onTabClose"
      @add="addTab()"
      @rename="renameTab"
    />

    <Splitpanes class="default-theme explorer-splitpanes" @resized="onExplorerResized">
      <Pane v-if="!explorerCollapsed" :size="explorerSize" :min-size="10" :max-size="40">
        <ObjectExplorer @insert="onExplorerInsert" />
      </Pane>
      <Pane :size="explorerCollapsed ? 100 : (100 - explorerSize)">
        <Splitpanes class="default-theme query-splitpanes" horizontal @resized="onPaneResized">
          <Pane :size="editorPaneSize" :min-size="20">
            <div class="editor-pane">
              <ui5-bar design="Subheader" class="toolbar">
                <ui5-button
                  slot="startContent"
                  design="Transparent"
                  :icon="explorerCollapsed ? 'open-command-field' : 'close-command-field'"
                  :tooltip="explorerCollapsed ? 'Show Object Explorer' : 'Hide Object Explorer'"
                  @click="toggleExplorer"
                />
                <ui5-segmented-button ref="outputModeRef" slot="startContent" @selection-change="onOutputModeChange">
                  <ui5-segmented-button-item data-mode="table" icon="table-view">Table</ui5-segmented-button-item>
                  <ui5-segmented-button-item data-mode="json" icon="syntax">JSON</ui5-segmented-button-item>
                  <ui5-segmented-button-item data-mode="plan" icon="tree">Plan</ui5-segmented-button-item>
                  <ui5-segmented-button-item data-mode="diff" icon="compare">Diff</ui5-segmented-button-item>
                </ui5-segmented-button>
                <ui5-button
                  slot="endContent"
                  design="Transparent"
                  icon="history"
                  tooltip="Query History"
                  @click="historyOpen = true"
                />
                <ui5-button
                  slot="endContent"
                  design="Transparent"
                  icon="bookmark"
                  id="savedQueriesBtn"
                  tooltip="Saved Queries"
                  @click="savedQueriesOpen = !savedQueriesOpen"
                />
                <ui5-toggle-button
                  slot="endContent"
                  design="Transparent"
                  icon="refresh"
                  :pressed="liveTail.isWatching.value"
                  :tooltip="liveTail.isWatching.value ? 'Stop Watch Mode' : 'Watch Mode'"
                  :class="{ 'watch-active': liveTail.isWatching.value }"
                  @click="toggleWatch"
                  :disabled="!activeTab.sql.trim()"
                />
                <ui5-select
                  v-if="liveTail.isWatching.value"
                  slot="endContent"
                  class="interval-select"
                  @change="onWatchIntervalChange"
                >
                  <ui5-option value="1000" :selected="liveTail.interval.value === 1000">1s</ui5-option>
                  <ui5-option value="5000" :selected="liveTail.interval.value === 5000">5s</ui5-option>
                  <ui5-option value="10000" :selected="liveTail.interval.value === 10000">10s</ui5-option>
                  <ui5-option value="30000" :selected="liveTail.interval.value === 30000">30s</ui5-option>
                  <ui5-option value="60000" :selected="liveTail.interval.value === 60000">60s</ui5-option>
                </ui5-select>
                <ui5-button
                  slot="endContent"
                  design="Transparent"
                  icon="tree"
                  tooltip="Explain Plan"
                  @click="explainQuery"
                  :disabled="!activeTab.sql.trim()"
                >Explain</ui5-button>
                <ui5-button
                  slot="endContent"
                  design="Emphasized"
                  icon="play"
                  @click="executeQuery"
                  :disabled="!activeTab.sql.trim()"
                >Execute</ui5-button>
              </ui5-bar>
              <div class="editor-container">
                <SqlEditor
                  ref="sqlEditorRef"
                  :model-value="activeTab.sql"
                  :theme="monacoTheme"
                  @update:model-value="onSqlChange"
                  @execute="executeQuery"
                />
              </div>
            </div>
          </Pane>
          <Pane :size="100 - editorPaneSize" :min-size="15">
            <div class="results-pane">
              <ui5-busy-indicator v-if="activeTab.loading" active size="Medium" class="loading" />

              <div v-else-if="activeTab.error" class="error">
                <p>{{ activeTab.error }}</p>
              </div>

              <template v-else-if="resultsTable.totalCount.value > 0 || activeTab.outputMode !== 'table'">
                <SmartTable
                  v-if="activeTab.outputMode === 'table'"
                  title="Results"
                  :columns="resultsTable.columns.value"
                  :data="resultsTable.displayData.value"
                  :sort-key="resultsTable.sortKey.value"
                  :sort-dir="resultsTable.sortDir.value"
                  :row-count="resultsTable.rowCount.value"
                  :total-count="resultsTable.totalCount.value"
                  @sort="resultsTable.toggleSort"
                  @search="(q: string) => resultsTable.searchQuery.value = q"
                  @export="onExport"
                />
                <PlanTree v-else-if="activeTab.outputMode === 'plan'" :data="planResults" />
                <ResultDiffView v-else-if="activeTab.outputMode === 'diff'" :current-data="activeTab.results" />
                <div v-else class="json-output">
                  <pre>{{ JSON.stringify(activeTab.results, null, 2) }}</pre>
                </div>
              </template>

              <div v-else class="empty-results">
                Press <kbd>Ctrl+Enter</kbd> or click Execute to run the query
              </div>
            </div>
          </Pane>
        </Splitpanes>
      </Pane>
    </Splitpanes>

    <SavedQueriesPanel
      :open="savedQueriesOpen"
      opener="savedQueriesBtn"
      :current-sql="activeTab.sql"
      @close="savedQueriesOpen = false"
      @load="onLoadSavedQuery"
    />

    <QueryHistoryPanel
      :open="historyOpen"
      @close="historyOpen = false"
      @rerun="onLoadSavedQuery"
    />
  </div>
</template>

<style scoped>
.query-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.query-splitpanes {
  flex: 1;
  min-height: 0;
}

.explorer-splitpanes {
  flex: 1;
  min-height: 0;
}

.editor-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.toolbar {
  flex-shrink: 0;
}

.interval-select {
  width: 70px;
}

.watch-active {
  color: var(--sapPositiveColor, #2b7c2b) !important;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.editor-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.results-pane {
  height: 100%;
  overflow: auto;
  padding: 0.5rem;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.error {
  padding: 1rem;
  color: var(--sapNegativeTextColor);
}

.json-output {
  height: 100%;
  overflow: auto;
  padding: 1rem;
  background: var(--sapShell_Background, #edeff0);
  border-radius: 4px;
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.json-output pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--sapTextColor);
}

.empty-results {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--sapContent_LabelColor);
  font-size: 0.875rem;
}

.empty-results kbd {
  padding: 2px 6px;
  border: 1px solid var(--sapField_BorderColor);
  border-radius: 3px;
  background: var(--sapField_Background);
  font-family: monospace;
  margin: 0 4px;
}
</style>

<style>
.query-splitpanes .splitpanes__splitter {
  background: var(--sapGroup_ContentBorderColor, #d9d9d9) !important;
  min-height: 6px;
}
.query-splitpanes .splitpanes__splitter:hover {
  background: var(--sapBrandColor, #0854a0) !important;
}
</style>
