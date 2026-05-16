<script setup lang="ts">
import { ref } from 'vue'
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

const schema = ref('**CURRENT_SCHEMA**')
const table = ref('*')
const view = ref('*')
const output = ref('cds')
const limit = ref(200)
const folder = ref('./')
const filename = ref('')
const log = ref(false)
const useHanaTypes = ref(false)
const useCatalogPure = ref(false)
const useExists = ref(true)
const useQuoted = ref(false)
const namespace = ref('')
const synonyms = ref('')
const keepPath = ref(false)
const noColons = ref(false)

const running = ref(false)
const messages = ref<string[]>([])
const error = ref('')
const progress = ref(0)

const schemaSuggestions = useSuggestions('schemas-ui', 'SCHEMA_NAME')
const tableSuggestions = useSuggestions('tables-ui', 'TABLE_NAME')
const viewSuggestions = useSuggestions('views-ui', 'VIEW_NAME')
const { resolvedSchema } = useCurrentSchema()
const confirmDialogOpen = ref(false)

let ws: WebSocket | null = null

function connectWebSocket() {
  if (ws) {
    ws.onclose = null
    ws.close()
    ws = null
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/websockets`

  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    ws?.send(JSON.stringify({ action: 'massConvert' }))
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
        toast.show('Mass convert completed successfully')
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

async function startMassConvert() {
  confirmDialogOpen.value = false
  running.value = true
  messages.value = []
  error.value = ''
  progress.value = 0

  try {
    await fetch('/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schema: schema.value,
        table: table.value,
        view: view.value,
        output: output.value,
        limit: limit.value,
        folder: folder.value,
        filename: filename.value,
        log: log.value,
        useHanaTypes: useHanaTypes.value,
        useCatalogPure: useCatalogPure.value,
        useExists: useExists.value,
        useQuoted: useQuoted.value,
        namespace: namespace.value,
        synonyms: synonyms.value,
        keepPath: keepPath.value,
        noColons: noColons.value
      })
    })

    connectWebSocket()
  } catch (e: any) {
    error.value = e.message
    running.value = false
  }
}
</script>

<template>
  <div class="mass-convert-view">
    <ui5-title level="H3">Mass Convert</ui5-title>
    <p class="subtitle">Convert tables and views in a schema to CDS format (hdbtable, hdbmigrationtable, or CDS)</p>

    <div class="form-card">
      <ui5-title level="H5">Conversion Target</ui5-title>
      <div class="form-grid">
        <div class="form-field">
          <ui5-label required>Schema</ui5-label>
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
          <ui5-label required>Database Table</ui5-label>
          <ui5-input
            :value="table"
            show-suggestions
            filter="Contains"
            @change="(e: any) => table = e.target.value"
            @focus="tableSuggestions.ensureLoaded({ schema: schema, table: '*', limit: 1000 })"
            placeholder="* (all tables)"
          >
            <ui5-suggestion-item v-for="s in tableSuggestions.items.value" :key="s" :text="s" />
          </ui5-input>
        </div>
        <div class="form-field">
          <ui5-label>Database View</ui5-label>
          <ui5-input
            :value="view"
            show-suggestions
            filter="Contains"
            @change="(e: any) => view = e.target.value"
            @focus="viewSuggestions.ensureLoaded({ schema: schema, view: '*', limit: 1000 })"
            placeholder="* (all views)"
          >
            <ui5-suggestion-item v-for="s in viewSuggestions.items.value" :key="s" :text="s" />
          </ui5-input>
        </div>
        <div class="form-field">
          <ui5-label required>Output Format for Conversion</ui5-label>
          <ui5-select @change="(e: any) => output = e.detail?.selectedOption?.value || 'cds'">
            <ui5-option value="cds" :selected="output === 'cds'">CDS</ui5-option>
            <ui5-option value="hdbtable" :selected="output === 'hdbtable'">hdbtable</ui5-option>
            <ui5-option value="hdbmigrationtable" :selected="output === 'hdbmigrationtable'">hdbmigrationtable</ui5-option>
          </ui5-select>
        </div>
      </div>
    </div>

    <div class="form-card">
      <ui5-title level="H5">Conversion Options</ui5-title>
      <div class="form-grid">
        <div class="form-field">
          <ui5-label required>Limit results</ui5-label>
          <ui5-input type="Number" :value="String(limit)" @change="(e: any) => limit = Number(e.target.value) || 200" />
        </div>
        <div class="form-field">
          <ui5-label required>Output Folder</ui5-label>
          <ui5-input :value="folder" @change="(e: any) => folder = e.target.value" placeholder="./" />
        </div>
        <div class="form-field">
          <ui5-label>File name</ui5-label>
          <ui5-input :value="filename" @change="(e: any) => filename = e.target.value" placeholder="Optional output filename" />
        </div>
        <div class="form-field">
          <ui5-label>CDS namespace</ui5-label>
          <ui5-input :value="namespace" @change="(e: any) => namespace = e.target.value" placeholder="Optional CDS namespace" />
        </div>
        <div class="form-field">
          <ui5-label>Synonyms output file</ui5-label>
          <ui5-input :value="synonyms" @change="(e: any) => synonyms = e.target.value" placeholder="Optional synonyms file path" />
        </div>
        <div class="form-field checkbox-field">
          <ui5-checkbox text="Use HANA Types" :checked="useHanaTypes" @change="(e: any) => useHanaTypes = e.target.checked" />
        </div>
        <div class="form-field checkbox-field">
          <ui5-checkbox text='Use "Pure" Catalog Definitions' :checked="useCatalogPure" @change="(e: any) => useCatalogPure = e.target.checked" />
        </div>
        <div class="form-field checkbox-field">
          <ui5-checkbox text="Write progress log to file rather than stop on error" :checked="log" @change="(e: any) => log = e.target.checked" />
        </div>
        <div class="form-field checkbox-field">
          <ui5-checkbox text="Keep table/view path (with dots)" :checked="keepPath" @change="(e: any) => keepPath = e.target.checked" />
        </div>
        <div class="form-field checkbox-field">
          <ui5-checkbox text="Replace :: in table/view path with dot" :checked="noColons" @change="(e: any) => noColons = e.target.checked" />
        </div>
        <div class="form-field checkbox-field">
          <ui5-checkbox text="Use Persistence Exists Annotation" :checked="useExists" @change="(e: any) => useExists = e.target.checked" />
        </div>
        <div class="form-field checkbox-field">
          <ui5-checkbox text="Use Quoted Identifiers ![non-identifier]" :checked="useQuoted" @change="(e: any) => useQuoted = e.target.checked" />
        </div>
      </div>
    </div>

    <ui5-bar design="Subheader">
      <ui5-button
        slot="endContent"
        design="Emphasized"
        icon="batch-payments"
        :disabled="running"
        @click="confirmDialogOpen = true"
      >Start Mass Convert</ui5-button>
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
      header-text="Confirm Mass Convert"
      :open="confirmDialogOpen"
      @close="confirmDialogOpen = false"
    >
      <p style="padding: 1rem;">
        Convert tables/views in schema <strong>{{ schema }}</strong> to <strong>{{ output }}</strong> format?
        <br/>Table filter: <strong>{{ table }}</strong>, View filter: <strong>{{ view }}</strong>
        <br/>This operation may take several minutes for large schemas.
      </p>
      <div slot="footer" style="display: flex; justify-content: flex-end; gap: 0.5rem; padding: 0.5rem;">
        <ui5-button design="Emphasized" @click="startMassConvert">Convert</ui5-button>
        <ui5-button design="Transparent" @click="confirmDialogOpen = false">Cancel</ui5-button>
      </div>
    </ui5-dialog>
  </div>
</template>

<style scoped>
.mass-convert-view {
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
