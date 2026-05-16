<script setup lang="ts">
import { ref } from 'vue'
import { useHanaApi } from '../composables/useHanaApi'
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

const { execute } = useHanaApi()

const schema = ref('**CURRENT_SCHEMA**')
const table = ref('')
const filename = ref('')
const running = ref(false)
const messages = ref<string[]>([])
const error = ref('')

const schemaSuggestions = useSuggestions('schemas-ui', 'SCHEMA_NAME')
const tableSuggestions = useSuggestions('tables-ui', 'TABLE_NAME')
const { resolvedSchema } = useCurrentSchema()
const confirmDialogOpen = ref(false)

let ws: WebSocket | null = null

function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/websockets`

  ws = new WebSocket(wsUrl)

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.text) {
        messages.value.push(data.text)
      }
      if (data.progress === 100 || data.text?.includes('Complete') || data.text?.includes('complete')) {
        running.value = false
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
    running.value = false
  }
}

async function startImport() {
  if (!table.value || !filename.value) return
  confirmDialogOpen.value = false

  running.value = true
  messages.value = []
  error.value = ''

  try {
    await fetch('/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schema: schema.value,
        table: table.value,
        filename: filename.value
      })
    })

    connectWebSocket()

    ws?.addEventListener('open', () => {
      ws?.send(JSON.stringify({ action: 'import' }))
    })
  } catch (e: any) {
    error.value = e.message
    running.value = false
  }
}
</script>

<template>
  <div class="import-view">
    <ui5-title level="H3">Import Data</ui5-title>

    <div class="form-section">
      <div class="form-field" data-help-id="schema">
        <ui5-label required>Schema</ui5-label>
        <ui5-input
          :value="schema"
          show-suggestions
          filter="Contains"
          @change="(e: any) => schema = e.target.value"
          @focus="schemaSuggestions.ensureLoaded({ limit: 1000, schema: '*' })"
          placeholder="Schema"
        >
          <ui5-suggestion-item v-for="s in schemaSuggestions.items.value" :key="s" :text="s" />
        </ui5-input>
        <span v-if="schema === '**CURRENT_SCHEMA**' && resolvedSchema" class="resolved-schema">{{ resolvedSchema }}</span>
      </div>
      <div class="form-field" data-help-id="table">
        <ui5-label required>Table</ui5-label>
        <ui5-input
          :value="table"
          show-suggestions
          filter="Contains"
          @change="(e: any) => table = e.target.value"
          @focus="tableSuggestions.ensureLoaded({ schema: schema, table: '*', limit: 1000 })"
          placeholder="Target table name"
        >
          <ui5-suggestion-item v-for="s in tableSuggestions.items.value" :key="s" :text="s" />
        </ui5-input>
      </div>
      <div class="form-field" data-help-id="filename">
        <ui5-label required>Filename</ui5-label>
        <ui5-input
          :value="filename"
          @change="(e: any) => filename = e.target.value"
          placeholder="Path to file (CSV, JSON, etc.)"
          class="wide-input"
        />
      </div>
    </div>

    <ui5-bar design="Subheader">
      <ui5-button
        slot="endContent"
        design="Emphasized"
        icon="upload"
        :disabled="!table || !filename || running"
        @click="confirmDialogOpen = true"
      >Start Import</ui5-button>
    </ui5-bar>

    <ui5-busy-indicator v-if="running" active size="Medium" text="Importing..." class="loading" />

    <div v-if="error" class="error">
      <ui5-message-strip design="Negative" hide-close-button>{{ error }}</ui5-message-strip>
    </div>

    <div v-if="messages.length > 0" class="log-area">
      <ui5-title level="H5">Progress Log</ui5-title>
      <div class="log-messages">
        <div v-for="(msg, i) in messages" :key="i" class="log-line">{{ msg }}</div>
      </div>
    </div>

    <ui5-dialog
      header-text="Confirm Import"
      :open="confirmDialogOpen"
      @close="confirmDialogOpen = false"
    >
      <p style="padding: 1rem;">
        Import data from <strong>{{ filename }}</strong> into table
        <strong>{{ schema }}.{{ table }}</strong>?
        This operation may modify existing data.
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
}

.form-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: var(--sapGroup_ContentBackground, #fff);
  border-radius: 4px;
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.resolved-schema {
  font-size: 0.75rem;
  color: var(--sapContent_LabelColor);
  font-style: italic;
}

.wide-input {
  min-width: 300px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.error {
  padding: 0.5rem 0;
}

.log-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-messages {
  max-height: 400px;
  overflow-y: auto;
  padding: 0.75rem;
  background: var(--sapShell_Background, #edeff0);
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  line-height: 1.6;
}

.log-line {
  padding: 0.125rem 0;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}
</style>
