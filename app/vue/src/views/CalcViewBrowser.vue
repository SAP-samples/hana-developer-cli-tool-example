<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCalcViewFileApi, type CalcViewFileInfo } from '../composables/calcview/useCalcViewFileApi'
import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/SegmentedButton.js'
import '@ui5/webcomponents/dist/SegmentedButtonItem.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'

const router = useRouter()
const { listProjectFiles, listRuntimeViews } = useCalcViewFileApi()

const PROJECT_PATH_KEY = 'calcview-project-path'
const mode = ref<'project' | 'runtime'>('project')
const projectPath = ref(localStorage.getItem(PROJECT_PATH_KEY) || '')
const files = ref<CalcViewFileInfo[]>([])
const runtimeViews = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')

const filteredFiles = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return files.value
  return files.value.filter(f => f.name.toLowerCase().includes(q))
})

const filteredRuntimeViews = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return runtimeViews.value
  return runtimeViews.value.filter((v: any) =>
    (v.SCENARIO_NAME || v.VIEW_NAME || '').toLowerCase().includes(q)
  )
})

async function loadProjectFiles() {
  if (!projectPath.value) return
  loading.value = true
  error.value = ''
  try {
    localStorage.setItem(PROJECT_PATH_KEY, projectPath.value)
    files.value = await listProjectFiles(projectPath.value)
  } catch (e: any) {
    error.value = e.message || 'Failed to list files'
    files.value = []
  } finally {
    loading.value = false
  }
}

async function loadRuntimeViews() {
  loading.value = true
  error.value = ''
  try {
    runtimeViews.value = await listRuntimeViews()
  } catch (e: any) {
    error.value = e.message || 'Failed to list runtime views'
    runtimeViews.value = []
  } finally {
    loading.value = false
  }
}

function onModeChange(e: any) {
  const items = e.detail?.selectedItems
  if (items && items.length > 0 && items[0].textContent?.trim() === 'HANA Runtime') {
    mode.value = 'runtime'
    loadRuntimeViews()
  } else {
    mode.value = 'project'
    if (projectPath.value) loadProjectFiles()
  }
}

function openFile(filePath: string) {
  router.push({ name: 'calcViewEditor', query: { file: filePath } })
}

function createNew() {
  router.push({ name: 'calcViewEditor', query: { new: 'true', dir: projectPath.value } })
}

function formatDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

onMounted(() => {
  if (projectPath.value) loadProjectFiles()
})
</script>

<template>
  <div class="calc-view-browser">
    <div class="browser-header">
      <ui5-title level="H3">Calculation Views</ui5-title>
      <div class="header-actions">
        <ui5-segmented-button @selection-change="onModeChange">
          <ui5-segmented-button-item selected>Project Files</ui5-segmented-button-item>
          <ui5-segmented-button-item>HANA Runtime</ui5-segmented-button-item>
        </ui5-segmented-button>
        <ui5-button design="Emphasized" @click="createNew" v-if="mode === 'project'">Create New</ui5-button>
      </div>
    </div>

    <div class="controls" v-if="mode === 'project'">
      <ui5-input
        class="path-input"
        placeholder="Project directory path (e.g. D:\projects\myapp\db\src)"
        :value="projectPath"
        @change="(e: any) => { projectPath = e.target.value; loadProjectFiles() }"
      />
      <ui5-input
        class="search-input"
        placeholder="Search by name..."
        :value="searchQuery"
        @input="(e: any) => searchQuery = e.target.value"
      />
    </div>

    <div class="controls" v-if="mode === 'runtime'">
      <ui5-input
        class="search-input full-width"
        placeholder="Search runtime views..."
        :value="searchQuery"
        @input="(e: any) => searchQuery = e.target.value"
      />
    </div>

    <ui5-busy-indicator v-if="loading" active size="Medium" class="loader" />

    <div v-else-if="error" class="error-banner">{{ error }}</div>

    <template v-else-if="mode === 'project'">
      <div v-if="!projectPath" class="empty-state">
        Enter a project directory path to browse calculation view files.
      </div>
      <div v-else-if="filteredFiles.length === 0" class="empty-state">
        No .hdbcalculationview files found.
      </div>
      <div v-else class="file-table">
        <div class="table-header">
          <span class="col-name">Name</span>
          <span class="col-path">Path</span>
          <span class="col-modified">Modified</span>
          <span class="col-size">Size</span>
        </div>
        <div
          v-for="file in filteredFiles"
          :key="file.filePath"
          class="table-row"
          @click="openFile(file.filePath)"
        >
          <span class="col-name">{{ file.name }}</span>
          <span class="col-path">{{ file.filePath }}</span>
          <span class="col-modified">{{ formatDate(file.lastModified) }}</span>
          <span class="col-size">{{ formatSize(file.size) }}</span>
        </div>
      </div>
    </template>

    <template v-else-if="mode === 'runtime'">
      <div v-if="filteredRuntimeViews.length === 0" class="empty-state">
        No runtime calculation views found.
      </div>
      <div v-else class="file-table">
        <div class="table-header">
          <span class="col-name">Scenario Name</span>
          <span class="col-path">Schema</span>
        </div>
        <div
          v-for="view in filteredRuntimeViews"
          :key="view.SCENARIO_NAME || view.VIEW_NAME"
          class="table-row"
          @click="openFile(view.SCENARIO_NAME || view.VIEW_NAME)"
        >
          <span class="col-name">{{ view.SCENARIO_NAME || view.VIEW_NAME }}</span>
          <span class="col-path">{{ view.SCHEMA_NAME || '' }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.calc-view-browser {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.browser-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.path-input { flex: 2; }
.search-input { flex: 1; min-width: 200px; }
.full-width { flex: 1; }

.loader {
  margin-top: 2rem;
  align-self: center;
}

.error-banner {
  padding: 12px;
  background: var(--sapErrorBackground, #fff3f3);
  border: 1px solid var(--sapErrorBorderColor, #e00);
  border-radius: 8px;
  color: var(--sapNegativeTextColor, #bb0000);
  font-size: 12px;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--sapContent_LabelColor, #666);
}

.file-table {
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
  overflow-y: auto;
}

.table-header {
  display: flex;
  padding: 10px 16px;
  background: var(--sapList_HeaderBackground, #f2f2f2);
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  font-size: 11px;
  font-weight: 600;
  color: var(--sapContent_LabelColor, #666);
}

.table-row {
  display: flex;
  padding: 10px 16px;
  border-bottom: 1px solid var(--sapList_BorderColor, #e5e5e5);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.table-row:hover {
  background: var(--sapList_Hover_Background, #e8f0fe);
}

.col-name { flex: 2; font-weight: 500; overflow: hidden; text-overflow: ellipsis; }
.col-path { flex: 3; color: var(--sapContent_LabelColor, #666); overflow: hidden; text-overflow: ellipsis; }
.col-modified { flex: 1.5; color: var(--sapContent_LabelColor, #666); }
.col-size { flex: 0.5; color: var(--sapContent_LabelColor, #666); text-align: right; }
</style>
