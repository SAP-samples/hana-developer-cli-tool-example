<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSuggestions } from '../composables/useSuggestions'
import { useCurrentSchema } from '../composables/useCurrentSchema'
import { toast } from '../composables/useToast'

import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/SuggestionItem.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Bar.js'
import '@ui5/webcomponents/dist/Label.js'
import '@ui5/webcomponents/dist/MessageStrip.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'
import '@ui5/webcomponents/dist/Dialog.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/CheckBox.js'
import '@ui5/webcomponents/dist/Link.js'

const schema = ref('**CURRENT_SCHEMA**')
const table = ref('')
const filename = ref('')
const uploadedFile = ref<File | null>(null)
const uploadedPath = ref('')
const uploading = ref(false)
const useServerPath = ref(false)

const output = ref('csv')
const matchMode = ref('auto')
const truncate = ref(false)
const batchSize = ref(1000)
const worksheet = ref(1)
const startRow = ref(1)
const skipEmptyRows = ref(true)
const excelCacheMode = ref('cache')
const dryRun = ref(false)
const maxFileSizeMB = ref(500)
const timeoutSeconds = ref(3600)
const nullValues = ref('null,NULL,#N/A,')
const skipWithErrors = ref(false)
const maxErrorsAllowed = ref(-1)

const running = ref(false)
const messages = ref<string[]>([])
const error = ref('')
const progress = ref(0)
const dragOver = ref(false)

const schemaSuggestions = useSuggestions('schemas-ui', 'SCHEMA_NAME')
const tableSuggestions = useSuggestions('tables-ui', 'TABLE_NAME')
const { resolvedSchema } = useCurrentSchema()
const confirmDialogOpen = ref(false)

const effectiveFilename = computed(() => uploadedPath.value || filename.value)
const canStart = computed(() => !!table.value && !!effectiveFilename.value && !running.value && !uploading.value)

let ws: WebSocket | null = null

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) selectFile(file)
}

function onFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) selectFile(file)
}

function selectFile(file: File) {
  uploadedFile.value = file
  uploadedPath.value = ''
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'xlsx' || ext === 'xls') {
    output.value = 'excel'
  } else {
    output.value = 'csv'
  }
}

function removeFile() {
  uploadedFile.value = null
  uploadedPath.value = ''
}

async function uploadFile(): Promise<string> {
  if (!uploadedFile.value) return filename.value

  uploading.value = true
  messages.value.push(`Uploading ${uploadedFile.value.name} (${formatSize(uploadedFile.value.size)})...`)

  try {
    const formData = new FormData()
    formData.append('file', uploadedFile.value)
    const res = await fetch('/hana/upload', { method: 'POST', body: formData })
    if (!res.ok) {
      const detail = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(detail.message || 'Upload failed')
    }
    const result = await res.json()
    uploadedPath.value = result.path
    messages.value.push(`Upload complete: ${result.filename}`)
    return result.path
  } finally {
    uploading.value = false
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function connectWebSocket(filePath: string) {
  if (ws) {
    ws.onclose = null
    ws.close()
    ws = null
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/websockets`

  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    ws?.send(JSON.stringify({ action: 'import' }))
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.progress !== undefined && data.progress !== null) {
        progress.value = Math.round(data.progress)
      }
      if (data.text) {
        messages.value.push(data.text)
      }
      if (data.progress === 100 || data.text?.includes('Complete') || data.text?.includes('complete')) {
        running.value = false
        progress.value = 100
        toast.show('Import completed successfully')
      }
    } catch {
      messages.value.push(event.data)
    }
  }

  ws.onerror = () => {
    error.value = 'WebSocket connection error'
    running.value = false
  }

  ws.onclose = () => {
    if (running.value) running.value = false
  }
}

async function startImport() {
  confirmDialogOpen.value = false
  running.value = true
  messages.value = []
  error.value = ''
  progress.value = 0

  try {
    let filePath = filename.value
    if (uploadedFile.value && !uploadedPath.value) {
      filePath = await uploadFile()
    } else if (uploadedPath.value) {
      filePath = uploadedPath.value
    }

    if (!filePath) {
      error.value = 'No file specified'
      running.value = false
      return
    }

    await fetch('/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schema: schema.value,
        table: table.value,
        filename: filePath,
        output: output.value,
        matchMode: matchMode.value,
        truncate: truncate.value,
        batchSize: batchSize.value,
        worksheet: worksheet.value,
        startRow: startRow.value,
        skipEmptyRows: skipEmptyRows.value,
        excelCacheMode: excelCacheMode.value,
        dryRun: dryRun.value,
        maxFileSizeMB: maxFileSizeMB.value,
        timeoutSeconds: timeoutSeconds.value,
        nullValues: nullValues.value,
        skipWithErrors: skipWithErrors.value,
        maxErrorsAllowed: maxErrorsAllowed.value
      })
    })

    connectWebSocket(filePath)
  } catch (e: any) {
    error.value = e.message
    running.value = false
  }
}
</script>

<template>
  <div class="import-view">
    <ui5-title level="H3">Import Data</ui5-title>
    <p class="subtitle">Import data from CSV or Excel files into a database table</p>

    <div class="form-card">
      <ui5-title level="H5">Source File</ui5-title>

      <div v-if="!useServerPath" class="upload-area">
        <div
          class="drop-zone"
          :class="{ 'drop-zone-active': dragOver, 'drop-zone-has-file': uploadedFile }"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop="onDrop"
          @click="($refs.fileInput as HTMLInputElement)?.click()"
        >
          <template v-if="uploadedFile">
            <div class="file-info">
              <span class="file-icon">&#128196;</span>
              <div class="file-details">
                <strong>{{ uploadedFile.name }}</strong>
                <span class="file-size">{{ formatSize(uploadedFile.size) }}</span>
              </div>
              <ui5-button design="Transparent" icon="decline" tooltip="Remove file" @click.stop="removeFile" />
            </div>
          </template>
          <template v-else>
            <span class="drop-icon">&#128449;</span>
            <p class="drop-text">Drag & drop a file here, or click to browse</p>
            <p class="drop-hint">Supports CSV, Excel (.xlsx, .xls)</p>
          </template>
        </div>
        <input ref="fileInput" type="file" accept=".csv,.xlsx,.xls,.json,.tsv" hidden @change="onFileInput" />
        <ui5-link @click="useServerPath = true" class="toggle-link">Use server-side file path instead</ui5-link>
      </div>

      <div v-else class="server-path-area">
        <div class="form-field">
          <ui5-label required>Server File Path</ui5-label>
          <ui5-input
            :value="filename"
            @change="(e: any) => filename = e.target.value"
            placeholder="/path/to/file.csv or relative/path/file.xlsx"
          />
        </div>
        <ui5-link @click="useServerPath = false; filename = ''" class="toggle-link">Upload a file instead</ui5-link>
      </div>
    </div>

    <div class="form-card">
      <ui5-title level="H5">Import Target</ui5-title>
      <div class="form-grid">
        <div class="form-field">
          <ui5-label required>Target Table</ui5-label>
          <ui5-input
            :value="table"
            show-suggestions
            filter="Contains"
            @change="(e: any) => table = e.target.value"
            @focus="tableSuggestions.ensureLoaded({ schema: schema, table: '*', limit: 1000 })"
            placeholder="TABLE_NAME"
          >
            <ui5-suggestion-item v-for="s in tableSuggestions.items.value" :key="s" :text="s" />
          </ui5-input>
        </div>
        <div class="form-field">
          <ui5-label>Schema</ui5-label>
          <ui5-input
            :value="schema"
            show-suggestions
            filter="Contains"
            @change="(e: any) => schema = e.target.value"
            @focus="schemaSuggestions.ensureLoaded({ limit: 1000, schema: '*' })"
          >
            <ui5-suggestion-item v-for="s in schemaSuggestions.items.value" :key="s" :text="s" />
          </ui5-input>
          <span v-if="schema === '**CURRENT_SCHEMA**' && resolvedSchema" class="resolved-hint">{{ resolvedSchema }}</span>
        </div>
        <div class="form-field">
          <ui5-label required>File Format</ui5-label>
          <ui5-select @change="(e: any) => output = e.detail?.selectedOption?.value || 'csv'">
            <ui5-option value="csv" :selected="output === 'csv'">CSV (Comma Separated Values)</ui5-option>
            <ui5-option value="excel" :selected="output === 'excel'">Excel (XLSX)</ui5-option>
          </ui5-select>
        </div>
        <div class="form-field">
          <ui5-label required>Column Matching Mode</ui5-label>
          <ui5-select @change="(e: any) => matchMode = e.detail?.selectedOption?.value || 'auto'">
            <ui5-option value="auto" :selected="matchMode === 'auto'">Auto (detect from headers)</ui5-option>
            <ui5-option value="name" :selected="matchMode === 'name'">By Name</ui5-option>
            <ui5-option value="order" :selected="matchMode === 'order'">By Position</ui5-option>
          </ui5-select>
        </div>
      </div>
    </div>

    <div class="form-card">
      <ui5-title level="H5">Options</ui5-title>
      <div class="form-grid">
        <div class="form-field">
          <ui5-label>Batch Size</ui5-label>
          <ui5-input type="Number" :value="String(batchSize)" @change="(e: any) => batchSize = Number(e.target.value) || 1000" />
        </div>
        <div class="form-field">
          <ui5-label>Worksheet Number (Excel)</ui5-label>
          <ui5-input type="Number" :value="String(worksheet)" @change="(e: any) => worksheet = Number(e.target.value) || 1" />
        </div>
        <div class="form-field">
          <ui5-label>Start Row</ui5-label>
          <ui5-input type="Number" :value="String(startRow)" @change="(e: any) => startRow = Number(e.target.value) || 1" />
        </div>
        <div class="form-field">
          <ui5-label>Excel Cache Mode</ui5-label>
          <ui5-select @change="(e: any) => excelCacheMode = e.detail?.selectedOption?.value || 'cache'">
            <ui5-option value="cache" :selected="excelCacheMode === 'cache'">Cache (default)</ui5-option>
            <ui5-option value="emit" :selected="excelCacheMode === 'emit'">Emit (streaming)</ui5-option>
            <ui5-option value="ignore" :selected="excelCacheMode === 'ignore'">Ignore</ui5-option>
          </ui5-select>
        </div>
        <div class="form-field">
          <ui5-label>Max File Size (MB)</ui5-label>
          <ui5-input type="Number" :value="String(maxFileSizeMB)" @change="(e: any) => maxFileSizeMB = Number(e.target.value) || 500" />
        </div>
        <div class="form-field">
          <ui5-label>Timeout (seconds)</ui5-label>
          <ui5-input type="Number" :value="String(timeoutSeconds)" @change="(e: any) => timeoutSeconds = Number(e.target.value) || 3600" />
        </div>
        <div class="form-field">
          <ui5-label>NULL Values</ui5-label>
          <ui5-input :value="nullValues" @change="(e: any) => nullValues = e.target.value" placeholder="Comma-separated list" />
        </div>
        <div class="form-field">
          <ui5-label>Max Errors Allowed</ui5-label>
          <ui5-input type="Number" :value="String(maxErrorsAllowed)" @change="(e: any) => maxErrorsAllowed = Number(e.target.value)" placeholder="-1 = unlimited" />
        </div>
        <div class="form-field checkbox-field">
          <ui5-checkbox text="Truncate Table Before Import" :checked="truncate" @change="(e: any) => truncate = e.target.checked" />
        </div>
        <div class="form-field checkbox-field">
          <ui5-checkbox text="Skip Empty Rows" :checked="skipEmptyRows" @change="(e: any) => skipEmptyRows = e.target.checked" />
        </div>
        <div class="form-field checkbox-field">
          <ui5-checkbox text="Dry Run (Preview Only)" :checked="dryRun" @change="(e: any) => dryRun = e.target.checked" />
        </div>
        <div class="form-field checkbox-field">
          <ui5-checkbox text="Skip Errors" :checked="skipWithErrors" @change="(e: any) => skipWithErrors = e.target.checked" />
        </div>
      </div>
    </div>

    <ui5-bar design="Subheader">
      <ui5-button
        slot="endContent"
        design="Emphasized"
        icon="upload"
        :disabled="!canStart"
        @click="confirmDialogOpen = true"
      >Start Import</ui5-button>
    </ui5-bar>

    <div v-if="error" class="error">
      <ui5-message-strip design="Negative" hide-close-button>{{ error }}</ui5-message-strip>
    </div>

    <div class="log-card">
      <ui5-title level="H5">Processing Log</ui5-title>

      <div class="progress-section">
        <ui5-label>Progress:</ui5-label>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="progress-label">{{ progress }}%</span>
      </div>

      <div class="log-section">
        <ui5-label>Processing Log:</ui5-label>
        <div class="log-messages">
          <div v-if="messages.length === 0" class="log-placeholder">Waiting to start...</div>
          <div v-for="(msg, i) in messages" :key="i" class="log-line">{{ msg }}</div>
        </div>
      </div>
    </div>

    <ui5-dialog
      header-text="Confirm Import"
      :open="confirmDialogOpen"
      @close="confirmDialogOpen = false"
    >
      <p style="padding: 1rem;">
        Import data from <strong>{{ uploadedFile?.name || filename }}</strong> into table
        <strong>{{ schema }}.{{ table }}</strong>?
        <template v-if="truncate"><br/>Table will be <strong>TRUNCATED</strong> before import.</template>
        <template v-if="dryRun"><br/>This is a <strong>dry run</strong> — no data will be committed.</template>
      </p>
      <div slot="footer" style="display: flex; justify-content: flex-end; gap: 0.5rem; padding: 0.5rem;">
        <ui5-button design="Emphasized" @click="startImport">Import</ui5-button>
        <ui5-button design="Transparent" @click="confirmDialogOpen = false">Cancel</ui5-button>
      </div>
    </ui5-dialog>
  </div>
</template>

<style scoped>
.import-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  max-width: 900px;
}

.subtitle {
  color: var(--sapContent_LabelColor);
  font-size: 0.875rem;
  margin: 0;
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--sapGroup_ContentBackground, #fff);
  border-radius: 8px;
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.checkbox-field {
  justify-content: center;
}

.resolved-hint {
  font-size: 0.75rem;
  color: var(--sapContent_LabelColor);
  font-style: italic;
}

/* File Upload */
.upload-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  border: 2px dashed var(--sapField_BorderColor, #89919a);
  border-radius: 8px;
  background: var(--sapField_Background, #fff);
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  min-height: 120px;
}

.drop-zone:hover {
  border-color: var(--sapBrandColor, #0854a0);
  background: var(--sapList_Hover_Background, #e5f0fa);
}

.drop-zone-active {
  border-color: var(--sapBrandColor, #0854a0);
  background: var(--sapInfobar_Background, #e5f0fa);
  border-style: solid;
}

.drop-zone-has-file {
  border-style: solid;
  border-color: var(--sapPositiveColor, #2b7c2b);
  padding: 1rem;
}

.drop-icon {
  font-size: 2rem;
  opacity: 0.6;
}

.drop-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--sapTextColor);
  font-weight: 500;
}

.drop-hint {
  margin: 0;
  font-size: 0.75rem;
  color: var(--sapContent_LabelColor);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.file-icon {
  font-size: 1.5rem;
}

.file-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.file-details strong {
  font-size: 0.875rem;
  color: var(--sapTextColor);
}

.file-size {
  font-size: 0.75rem;
  color: var(--sapContent_LabelColor);
}

.toggle-link {
  align-self: flex-start;
  font-size: 0.8125rem;
}

.server-path-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Processing Log */
.error {
  padding: 0.5rem 0;
}

.log-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: var(--sapGroup_ContentBackground, #fff);
  border-radius: 8px;
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar-container {
  flex: 1;
  height: 10px;
  background: var(--sapField_Background, #f5f5f5);
  border-radius: 5px;
  border: 1px solid var(--sapField_BorderColor, #89919a);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--sapBrandColor, #0854a0);
  border-radius: 5px;
  transition: width 0.3s ease;
}

.progress-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--sapTextColor);
  min-width: 36px;
}

.log-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-messages {
  min-height: 120px;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.75rem;
  background: var(--sapShell_Background, #edeff0);
  border-radius: 4px;
  border: 1px dashed var(--sapField_BorderColor, #89919a);
  font-family: monospace;
  font-size: 0.8rem;
  line-height: 1.6;
}

.log-placeholder {
  color: var(--sapContent_LabelColor);
  font-style: italic;
}

.log-line {
  padding: 0.125rem 0;
}
</style>
