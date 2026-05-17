# Calculation View Editor Phase 4: File Management

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement file management for the Calculation View Editor — browse/open project files, create new views, save/export, and a data source picker for adding tables/views to nodes.

**Architecture:** The CalcViewBrowser acts as a "Modeling Home" with a table-based listing of `.hdbcalculationview` files (project files mode) and HANA runtime views (database mode). Opening a file navigates to CalcViewEditor via router with a query param. The editor uses existing multi-tab support (useCalcViewTabs) to open files. Save/Export uses the existing backend routes. A DataSourcePicker dialog lets users add tables/views from project or database.

**Tech Stack:** Vue 3 + Vue Router, UI5 Web Components, existing hana-cli REST API (`/hana/calcview/project/*`, `/hana/tables`, `/hana/views`), `useHanaApi` composable

---

## File Structure

| File | Responsibility |
|------|---------------|
| `app/vue/src/composables/calcview/useCalcViewFileApi.ts` | API wrapper for calcview file operations (list, read, write) |
| `app/vue/src/views/CalcViewBrowser.vue` | Modeling Home browse page with project/runtime mode toggle |
| `app/vue/src/components/calcview/dialogs/CreateCalcViewDialog.vue` | "Create New" dialog form |
| `app/vue/src/components/calcview/dialogs/DataSourcePicker.vue` | Modal to add data sources from project or database |
| `app/vue/src/views/CalcViewEditor.vue` | Modify to handle file open/save via route query params |
| `app/vue/src/composables/calcview/useCalcViewTabs.ts` | Extend with save functionality |
| `app/vue/src/components/calcview/toolbar/EditorToolbar.vue` | Add Save/Save As buttons |
| `app/vue/src/router.ts` | Add query param support for editor route |

---

## Task 1: File API Composable

**Files:**
- Create: `app/vue/src/composables/calcview/useCalcViewFileApi.ts`

**Context:** The backend already has routes at `/hana/calcview/project/list` (GET, query: `path`), `/hana/calcview/project/read` (GET, query: `file`, `base`), `/hana/calcview/project/write` (POST, body: `{file, xml, base}`). The `useHanaApi` composable at `app/vue/src/composables/useHanaApi.ts` provides `fetchDirect(path)` for direct GET requests and `execute(command, params)` for hana-cli commands. We need a thin wrapper that encapsulates calcview file API calls.

- [ ] **Step 1: Create the file API composable**

```typescript
// app/vue/src/composables/calcview/useCalcViewFileApi.ts
import { useHanaApi } from '../useHanaApi'

export interface CalcViewFileInfo {
  name: string
  fileName: string
  filePath: string
  lastModified: string
  size: number
}

export function useCalcViewFileApi() {
  const { fetchDirect, execute } = useHanaApi()

  async function listProjectFiles(dirPath: string): Promise<CalcViewFileInfo[]> {
    const encoded = encodeURIComponent(dirPath)
    return fetchDirect<CalcViewFileInfo[]>(`/hana/calcview/project/list?path=${encoded}`)
  }

  async function readProjectFile(filePath: string, basePath?: string): Promise<{ xml: string; filePath: string }> {
    let url = `/hana/calcview/project/read?file=${encodeURIComponent(filePath)}`
    if (basePath) url += `&base=${encodeURIComponent(basePath)}`
    return fetchDirect<{ xml: string; filePath: string }>(url)
  }

  async function writeProjectFile(filePath: string, xml: string, basePath?: string): Promise<{ success: boolean; filePath: string }> {
    const res = await fetch('/hana/calcview/project/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: filePath, xml, base: basePath })
    })
    if (!res.ok) {
      const detail = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(detail.error || `${res.status} ${res.statusText}`)
    }
    return res.json()
  }

  async function listRuntimeViews(): Promise<any[]> {
    try {
      return await execute<any[]>('calcViews')
    } catch {
      return []
    }
  }

  return { listProjectFiles, readProjectFile, writeProjectFile, listRuntimeViews }
}
```

- [ ] **Step 2: Run tests and commit**

```bash
cd app/vue && npx vitest run
git add app/vue/src/composables/calcview/useCalcViewFileApi.ts
git commit -m "feat(calcview): add file API composable for project file operations"
```

---

## Task 2: Modeling Home Browse Page

**Files:**
- Modify: `app/vue/src/views/CalcViewBrowser.vue`

**Context:** The current `CalcViewBrowser.vue` is a stub with just a title. Replace it with a full browse page featuring:
- A SegmentedButton toggle for "Project Files" / "HANA Runtime" modes
- A path input for the project directory (persisted to localStorage)
- A table listing files with columns: Name, Data Category, Path, Last Modified
- Row click navigates to the editor with `?file=<path>` query param
- A "Create New" button that opens a dialog (Task 3)

The existing pattern from `Tables.vue` shows: use `useHanaApi`, load data on mount, display in a table, navigate on row click via `router.push`.

- [ ] **Step 1: Implement CalcViewBrowser.vue**

```vue
<!-- app/vue/src/views/CalcViewBrowser.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCalcViewFileApi, type CalcViewFileInfo } from '../composables/calcview/useCalcViewFileApi'
import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/SegmentedButton.js'
import '@ui5/webcomponents/dist/SegmentedButtonItem.js'
import '@ui5/webcomponents/dist/Table.js'
import '@ui5/webcomponents/dist/TableHeaderRow.js'
import '@ui5/webcomponents/dist/TableHeaderCell.js'
import '@ui5/webcomponents/dist/TableRow.js'
import '@ui5/webcomponents/dist/TableCell.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'
import '@ui5/webcomponents/dist/IllustratedMessage.js'
import '@ui5/webcomponents/dist/Toast.js'

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

function filteredFiles() {
  const q = searchQuery.value.toLowerCase()
  if (!q) return files.value
  return files.value.filter(f => f.name.toLowerCase().includes(q))
}

function filteredRuntimeViews() {
  const q = searchQuery.value.toLowerCase()
  if (!q) return runtimeViews.value
  return runtimeViews.value.filter((v: any) =>
    (v.SCENARIO_NAME || v.VIEW_NAME || '').toLowerCase().includes(q)
  )
}

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
  const selected = e.detail?.selectedItems?.[0]?.textContent?.trim() || e.target?.textContent?.trim()
  if (selected === 'HANA Runtime') {
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
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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

    <!-- Project mode controls -->
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

    <!-- Runtime mode controls -->
    <div class="controls" v-if="mode === 'runtime'">
      <ui5-input
        class="search-input"
        placeholder="Search runtime views..."
        :value="searchQuery"
        @input="(e: any) => searchQuery = e.target.value"
      />
    </div>

    <!-- Loading state -->
    <ui5-busy-indicator v-if="loading" active size="Medium" class="loader" />

    <!-- Error state -->
    <div v-else-if="error" class="error-banner">{{ error }}</div>

    <!-- Project files table -->
    <template v-else-if="mode === 'project'">
      <div v-if="!projectPath" class="empty-state">
        Enter a project directory path to browse calculation view files.
      </div>
      <div v-else-if="filteredFiles().length === 0" class="empty-state">
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
          v-for="file in filteredFiles()"
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

    <!-- Runtime views table -->
    <template v-else-if="mode === 'runtime'">
      <div v-if="filteredRuntimeViews().length === 0" class="empty-state">
        No runtime calculation views found.
      </div>
      <div v-else class="file-table">
        <div class="table-header">
          <span class="col-name">Scenario Name</span>
          <span class="col-path">Schema</span>
        </div>
        <div
          v-for="view in filteredRuntimeViews()"
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

.path-input {
  flex: 2;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

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
```

- [ ] **Step 2: Run tests and commit**

```bash
cd app/vue && npx vitest run
git add app/vue/src/views/CalcViewBrowser.vue
git commit -m "feat(calcview): implement Modeling Home browse page with project/runtime mode"
```

---

## Task 3: Create New Calculation View Dialog

**Files:**
- Create: `app/vue/src/components/calcview/dialogs/CreateCalcViewDialog.vue`
- Modify: `app/vue/src/views/CalcViewEditor.vue`

**Context:** When the user navigates with `?new=true&dir=<path>`, the editor should show a "Create New" dialog. The dialog collects: Name, Data Category (CUBE/DIMENSION), Description, Initial Node (Projection/Aggregation/Join/None). On confirm, it generates a minimal XML skeleton, opens it in a new tab, and associates the tab with the file path.

- [ ] **Step 1: Create CreateCalcViewDialog.vue**

```vue
<!-- app/vue/src/components/calcview/dialogs/CreateCalcViewDialog.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import '@ui5/webcomponents/dist/Dialog.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/Label.js'
import '@ui5/webcomponents/dist/TextArea.js'

const props = defineProps<{
  open: boolean
  directory?: string
}>()

const emit = defineEmits<{
  'confirm': [config: { name: string; dataCategory: string; description: string; initialNode: string; directory: string }]
  'cancel': []
}>()

const name = ref('')
const dataCategory = ref('CUBE')
const description = ref('')
const initialNode = ref('projection')
const directory = ref(props.directory || '')

function onConfirm() {
  if (!name.value.trim()) return
  emit('confirm', {
    name: name.value.trim(),
    dataCategory: dataCategory.value,
    description: description.value,
    initialNode: initialNode.value,
    directory: directory.value || props.directory || ''
  })
  resetForm()
}

function onCancel() {
  emit('cancel')
  resetForm()
}

function resetForm() {
  name.value = ''
  dataCategory.value = 'CUBE'
  description.value = ''
  initialNode.value = 'projection'
}
</script>

<template>
  <ui5-dialog
    :open="open"
    header-text="Create New Calculation View"
    @close="onCancel"
  >
    <div class="dialog-content">
      <div class="form-row">
        <ui5-label for="cv-name" required>Name:</ui5-label>
        <ui5-input id="cv-name" :value="name" @input="(e: any) => name = e.target.value" placeholder="MY_VIEW" />
      </div>
      <div class="form-row">
        <ui5-label for="cv-category">Data Category:</ui5-label>
        <ui5-select id="cv-category" @change="(e: any) => dataCategory = e.detail.selectedOption.value">
          <ui5-option value="CUBE" selected>CUBE (measures + dimensions)</ui5-option>
          <ui5-option value="DIMENSION">DIMENSION (attributes only)</ui5-option>
        </ui5-select>
      </div>
      <div class="form-row">
        <ui5-label for="cv-desc">Description:</ui5-label>
        <ui5-textarea id="cv-desc" :value="description" @input="(e: any) => description = e.target.value" placeholder="Optional description" rows="2" />
      </div>
      <div class="form-row">
        <ui5-label for="cv-initial">Initial Node:</ui5-label>
        <ui5-select id="cv-initial" @change="(e: any) => initialNode = e.detail.selectedOption.value">
          <ui5-option value="projection" selected>Projection</ui5-option>
          <ui5-option value="aggregation">Aggregation</ui5-option>
          <ui5-option value="join">Join</ui5-option>
          <ui5-option value="none">None (empty)</ui5-option>
        </ui5-select>
      </div>
      <div class="form-row">
        <ui5-label for="cv-dir">Save Location:</ui5-label>
        <ui5-input id="cv-dir" :value="directory" @input="(e: any) => directory = e.target.value" placeholder="Project directory path" />
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <ui5-button design="Emphasized" @click="onConfirm" :disabled="!name.trim()">Create</ui5-button>
      <ui5-button design="Transparent" @click="onCancel">Cancel</ui5-button>
    </div>
  </ui5-dialog>
</template>

<style scoped>
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  min-width: 400px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-row ui5-input, .form-row ui5-select, .form-row ui5-textarea {
  width: 100%;
}

.dialog-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 8px 16px;
}
</style>
```

- [ ] **Step 2: Create skeleton XML generator utility**

Add to `useCalcViewFileApi.ts`:

```typescript
export function generateSkeletonXml(config: {
  name: string
  dataCategory: string
  description: string
  initialNode: string
}): string {
  const { name, dataCategory, description, initialNode } = config

  let calcViewsXml = ''
  let shapesXml = ''

  if (initialNode !== 'none') {
    const typeMap: Record<string, string> = {
      projection: 'Calculation:ProjectionView',
      aggregation: 'Calculation:AggregationView',
      join: 'Calculation:JoinView'
    }
    const xsiType = typeMap[initialNode] || 'Calculation:ProjectionView'
    const nodeId = `${initialNode.charAt(0).toUpperCase() + initialNode.slice(1)}_1`

    calcViewsXml = `
    <calculationView xsi:type="${xsiType}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="${nodeId}">
      <viewAttributes/>
      <input/>
    </calculationView>`

    shapesXml = `
      <shape expanded="true" modelObjectName="${nodeId}" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="200" y="250"/>
      </shape>`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="${name}" applyPrivilegeType="NONE" dataCategory="${dataCategory}">
  <descriptions defaultDescription="${description}"/>
  <localVariables/>
  <variableMappings/>
  <dataSources/>
  <calculationViews>${calcViewsXml}
  </calculationViews>
  <logicalModel${initialNode !== 'none' ? ` id="${initialNode.charAt(0).toUpperCase() + initialNode.slice(1)}_1"` : ''}>
    <attributes/>
    <calculatedAttributes/>
    <baseMeasures/>
    <calculatedMeasures/>
    <restrictedMeasures/>
  </logicalModel>
  <layout>
    <shapes>
      <shape expanded="true" modelObjectName="Output" modelObjectNameSpace="MeasureGroup">
        <upperLeftCorner x="200" y="50"/>
      </shape>${shapesXml}
    </shapes>
  </layout>
</Calculation:scenario>`
}
```

- [ ] **Step 3: Integrate "Create New" flow in CalcViewEditor.vue**

Update `CalcViewEditor.vue` to:
1. Check for `?new=true` query param on mount
2. Show the CreateCalcViewDialog when that param is present
3. On confirm, generate skeleton XML, open as a new tab with the target file path, and remove the query param

Add these imports and logic:
```typescript
import { useRoute, useRouter } from 'vue-router'
import CreateCalcViewDialog from '../components/calcview/dialogs/CreateCalcViewDialog.vue'
import { generateSkeletonXml } from '../composables/calcview/useCalcViewFileApi'

const route = useRoute()
const router = useRouter()
const showCreateDialog = ref(false)
const createDir = ref('')

// Make onMounted async to support file loading:
// onMounted(async () => { ... })
// After existing demo logic, check for ?new=true:
if (route.query.new === 'true') {
  createDir.value = String(route.query.dir || '')
  showCreateDialog.value = true
}

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
```

Add the dialog to the template (before the closing `</div>`):
```vue
<CreateCalcViewDialog
  :open="showCreateDialog"
  :directory="createDir"
  @confirm="handleCreateConfirm"
  @cancel="handleCreateCancel"
/>
```

- [ ] **Step 4: Run tests and commit**

```bash
cd app/vue && npx vitest run
git add app/vue/src/components/calcview/dialogs/CreateCalcViewDialog.vue app/vue/src/composables/calcview/useCalcViewFileApi.ts app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add create new calculation view dialog with skeleton generator"
```

---

## Task 4: Open File from Browser and Save

**Files:**
- Modify: `app/vue/src/views/CalcViewEditor.vue`
- Modify: `app/vue/src/composables/calcview/useCalcViewTabs.ts`
- Modify: `app/vue/src/components/calcview/toolbar/EditorToolbar.vue`

**Context:** When the user navigates with `?file=<path>`, the editor reads the file via the API and opens it in a tab. The EditorToolbar gets Save / Save As buttons. Save writes the XML back using `writeProjectFile`. The `CalcViewTab` already has `filePath`. After save, call `undoRedo.markSaved()`.

- [ ] **Step 1: Add save method to useCalcViewTabs**

Extend `useCalcViewTabs.ts` — add an `updateTabFilePath` method:

```typescript
function updateTabFilePath(tabId: string, filePath: string) {
  const tab = tabs.value.find(t => t.id === tabId)
  if (tab) tab.filePath = filePath
}

// return also: updateTabFilePath
```

- [ ] **Step 2: Add Save/SaveAs buttons to EditorToolbar**

Add to `EditorToolbar.vue`:
- Props: `filePath?: string` (to show "Save" vs "Save As")
- Emits: `'save': []`, `'save-as': []`
- Two additional buttons after the separator:

```vue
<div class="separator" />
<ui5-button design="Transparent" icon="save" @click="emit('save')" tooltip="Save (Ctrl+S)" />
<ui5-button design="Transparent" icon="request" @click="emit('save-as')" tooltip="Save As..." />
```

Update the props:
```typescript
const props = defineProps<{
  canUndo: boolean
  canRedo: boolean
  filePath?: string
}>()
```

Update emits:
```typescript
const emit = defineEmits<{
  'undo': []
  'redo': []
  'auto-layout': []
  'save': []
  'save-as': []
}>()
```

- [ ] **Step 3: Implement file open and save in CalcViewEditor**

Add to `CalcViewEditor.vue`:

```typescript
import { useCalcViewFileApi } from '../composables/calcview/useCalcViewFileApi'
import { serializeCalcView } from '../services/calcview/xmlSerializer'

const { readProjectFile, writeProjectFile } = useCalcViewFileApi()

// IMPORTANT: The onMounted callback must be async since it uses await.
// Ensure it's declared as: onMounted(async () => { ... })
// In onMounted, handle ?file= query param (after the existing demo XML block):
if (route.query.file) {
  const filePath = String(route.query.file)
  try {
    const { xml } = await readProjectFile(filePath)
    const tab = openTab(filePath.split(/[\\/]/).pop()?.replace('.hdbcalculationview', '') || 'Untitled', filePath)
    tab.editor.loadModel(parseCalcView(xml))
    tab.editor.undoRedo.markSaved()
  } catch (e: any) {
    console.error('Failed to open file:', e)
  }
  router.replace({ name: 'calcViewEditor' })
}

// Save handler:
async function handleSave() {
  if (!activeTab.value || !model.value) return
  const filePath = activeTab.value.filePath
  if (!filePath) {
    handleSaveAs()
    return
  }
  const xml = serializeCalcView(model.value)
  await writeProjectFile(filePath, xml)
  activeTab.value.editor.undoRedo.markSaved()
}

// Save As handler (prompts for path):
async function handleSaveAs() {
  if (!activeTab.value || !model.value) return
  const newPath = prompt('Save as (full path):', activeTab.value.filePath || '')
  if (!newPath) return
  const xml = serializeCalcView(model.value)
  await writeProjectFile(newPath, xml)
  updateTabFilePath(activeTab.value.id, newPath)
  activeTab.value.editor.undoRedo.markSaved()
}
```

Add Ctrl+S keyboard handler in `handleKeydown`:
```typescript
if ((e.ctrlKey || e.metaKey) && e.key === 's') {
  e.preventDefault()
  handleSave()
}
```

Wire in template — update EditorToolbar:
```vue
<EditorToolbar
  :can-undo="undoRedo?.canUndo.value ?? false"
  :can-redo="undoRedo?.canRedo.value ?? false"
  :file-path="activeTab?.filePath"
  @undo="undoRedo?.undo()"
  @redo="undoRedo?.redo()"
  @auto-layout="handleAutoLayout"
  @save="handleSave"
  @save-as="handleSaveAs"
/>
```

- [ ] **Step 4: Run tests and commit**

```bash
cd app/vue && npx vitest run
git add app/vue/src/views/CalcViewEditor.vue app/vue/src/composables/calcview/useCalcViewTabs.ts app/vue/src/components/calcview/toolbar/EditorToolbar.vue
git commit -m "feat(calcview): implement file open from browser and save/save-as with Ctrl+S"
```

---

## Task 5: Data Source Picker Dialog

**Files:**
- Create: `app/vue/src/components/calcview/dialogs/DataSourcePicker.vue`
- Modify: `app/vue/src/views/CalcViewEditor.vue`
- Modify: `app/vue/src/components/calcview/properties/MappingTab.vue` (or PropertiesPanel)

**Context:** The Data Source Picker is a modal dialog triggered when adding a data source to a node. The spec calls for two tabs: "Project" (local `.hdbtable`, `.hdbview`, `.hdbcalculationview` files) and "Database" (queries `/hana/tables` and `/hana/views`). This task implements the **Database tab only** — the Project tab is deferred to Phase 5 since it requires project file scanning for non-calcview artifacts. On selection, the node's input list gets updated with the new data source. This task creates the dialog and wires the "Add Data Source" trigger.

- [ ] **Step 1: Create DataSourcePicker.vue**

```vue
<!-- app/vue/src/components/calcview/dialogs/DataSourcePicker.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useHanaApi } from '../../../composables/useHanaApi'
import '@ui5/webcomponents/dist/Dialog.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/TabContainer.js'
import '@ui5/webcomponents/dist/Tab.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'

export interface DataSourceSelection {
  id: string
  type: 'table' | 'view' | 'calculationView'
  schemaName?: string
  objectName: string
}

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'select': [source: DataSourceSelection]
  'cancel': []
}>()

const { execute } = useHanaApi()
const searchQuery = ref('')
const loading = ref(false)
const dbResults = ref<any[]>([])
const selectedItem = ref<DataSourceSelection | null>(null)
const sourceType = ref<'tables' | 'views'>('tables')

async function searchDatabase() {
  loading.value = true
  try {
    const command = sourceType.value === 'tables' ? 'tables-ui' : 'views-ui'
    const results = await execute<any[]>(command, {
      table: searchQuery.value || '*',
      view: searchQuery.value || '*',
      limit: 50
    })
    dbResults.value = results
  } catch (e: any) {
    console.error('Failed to search database:', e)
    dbResults.value = []
  } finally {
    loading.value = false
  }
}

function selectItem(item: any) {
  const name = item.TABLE_NAME || item.VIEW_NAME || ''
  selectedItem.value = {
    id: name,
    type: sourceType.value === 'tables' ? 'table' : 'view',
    schemaName: item.SCHEMA_NAME,
    objectName: name
  }
}

function confirm() {
  if (selectedItem.value) {
    emit('select', selectedItem.value)
    reset()
  }
}

function cancel() {
  emit('cancel')
  reset()
}

function reset() {
  searchQuery.value = ''
  dbResults.value = []
  selectedItem.value = null
}
</script>

<template>
  <ui5-dialog :open="open" header-text="Add Data Source" @close="cancel">
    <div class="picker-content">
      <ui5-tabcontainer>
        <ui5-tab text="Database">
          <div class="db-controls">
            <ui5-segmented-button @selection-change="(e: any) => { sourceType = e.detail?.selectedItems?.[0]?.textContent?.trim() === 'Views' ? 'views' : 'tables' }">
              <ui5-segmented-button-item selected>Tables</ui5-segmented-button-item>
              <ui5-segmented-button-item>Views</ui5-segmented-button-item>
            </ui5-segmented-button>
            <ui5-input
              placeholder="Search..."
              :value="searchQuery"
              @input="(e: any) => searchQuery = e.target.value"
              @change="searchDatabase"
            />
            <ui5-button @click="searchDatabase">Search</ui5-button>
          </div>
          <ui5-busy-indicator v-if="loading" active size="Small" />
          <div v-else class="results-list">
            <div
              v-for="item in dbResults"
              :key="item.TABLE_NAME || item.VIEW_NAME"
              class="result-item"
              :class="{ selected: selectedItem?.objectName === (item.TABLE_NAME || item.VIEW_NAME) }"
              @click="selectItem(item)"
            >
              <span class="item-name">{{ item.TABLE_NAME || item.VIEW_NAME }}</span>
              <span class="item-schema">{{ item.SCHEMA_NAME }}</span>
            </div>
            <div v-if="dbResults.length === 0 && !loading" class="empty">
              Search for tables or views
            </div>
          </div>
        </ui5-tab>
      </ui5-tabcontainer>
    </div>
    <div slot="footer" class="dialog-footer">
      <ui5-button design="Emphasized" @click="confirm" :disabled="!selectedItem">Add</ui5-button>
      <ui5-button design="Transparent" @click="cancel">Cancel</ui5-button>
    </div>
  </ui5-dialog>
</template>

<style scoped>
.picker-content {
  min-width: 500px;
  min-height: 400px;
  padding: 12px;
}

.db-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.db-controls ui5-input {
  flex: 1;
}

.results-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 8px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--sapList_BorderColor, #e5e5e5);
  cursor: pointer;
  font-size: 12px;
}

.result-item:hover {
  background: var(--sapList_Hover_Background, #e8f0fe);
}

.result-item.selected {
  background: var(--sapInfobar_Background, #e5f0fa);
  border-left: 3px solid var(--sapSelectedColor, #0854a0);
}

.item-name { font-weight: 500; }
.item-schema { color: var(--sapContent_LabelColor, #666); }
.empty { padding: 2rem; text-align: center; color: var(--sapContent_LabelColor, #666); font-size: 12px; }

.dialog-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 8px 16px;
}
</style>
```

- [ ] **Step 2: Wire DataSourcePicker into CalcViewEditor**

In `CalcViewEditor.vue`:
1. Import the dialog and the `DataSourceSelection` type
2. Add state: `showDataSourcePicker = ref(false)`, `dataSourceTargetNodeId = ref<string | null>(null)`
3. Add emit handler from PropertiesPanel — add a new event `@add-data-source` on PropertiesPanel (or emit from a button in MappingTab)
4. On selection, create an `AddDataSourceCommand` or push directly to the model's `dataSources` array and connect to the target node

For simplicity, on confirm:
```typescript
function handleAddDataSource(nodeId: string) {
  dataSourceTargetNodeId.value = nodeId
  showDataSourcePicker.value = true
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

  // Add input reference to the target node (data sources are NOT calc view nodes,
  // so we cannot use connectNodes — that only connects calc view nodes to each other)
  const targetNode = model.value.calculationViews.find(n => n.id === dataSourceTargetNodeId.value)
  if (targetNode && !targetNode.inputs.find(i => i.node === source.id)) {
    targetNode.inputs.push({ name: source.id, node: source.id })
  }

  dataSourceTargetNodeId.value = null
}
```

Add to template:
```vue
<DataSourcePicker
  :open="showDataSourcePicker"
  @select="handleDataSourceSelected"
  @cancel="showDataSourcePicker = false"
/>
```

- [ ] **Step 3: Add "Add Data Source" button to MappingTab**

In `app/vue/src/components/calcview/properties/MappingTab.vue`, add a button that emits an `add-data-source` event. This event bubbles up through PropertiesPanel to CalcViewEditor.

Add emit to MappingTab:
```typescript
const emit = defineEmits<{
  'map-column': [column: Column]
  'unmap-column': [columnId: string]
  'map-all': []
  'add-data-source': []
}>()
```

Add button in template (at top of the available columns section):
```vue
<ui5-button design="Transparent" @click="emit('add-data-source')">+ Data Source</ui5-button>
```

Wire through PropertiesPanel:
```typescript
// In PropertiesPanel emits:
'add-data-source': [nodeId: string]

// In PropertiesPanel template MappingTab:
@add-data-source="() => emit('add-data-source', selectedNode!.id)"
```

Wire in CalcViewEditor:
```vue
@add-data-source="handleAddDataSource"
```

- [ ] **Step 4: Run tests and commit**

```bash
cd app/vue && npx vitest run
git add app/vue/src/components/calcview/dialogs/DataSourcePicker.vue app/vue/src/views/CalcViewEditor.vue app/vue/src/components/calcview/properties/MappingTab.vue app/vue/src/components/calcview/properties/PropertiesPanel.vue
git commit -m "feat(calcview): add data source picker dialog with database search"
```

---

## Summary

| Task | Description | Key Components |
|------|-------------|----------------|
| 1 | File API Composable | useCalcViewFileApi.ts (list/read/write/runtime) |
| 2 | Modeling Home Browse Page | CalcViewBrowser.vue (project/runtime modes, file table) |
| 3 | Create New Dialog | CreateCalcViewDialog.vue + skeleton XML generator |
| 4 | Open File & Save | Route param handling, Save/SaveAs, Ctrl+S |
| 5 | Data Source Picker | DataSourcePicker.vue (database tab, search, select) |

**Estimated time:** ~20-30 minutes per task via subagent
