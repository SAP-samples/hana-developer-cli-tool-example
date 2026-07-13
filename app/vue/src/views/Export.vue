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
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/CheckBox.js'

const schema = ref('**CURRENT_SCHEMA**')
const table = ref('')
const format = ref('csv')
const columns = ref('')
const limit = ref<number | ''>('')
const delimiter = ref(',')
const includeHeaders = ref(true)
const nullValue = ref('')

const running = ref(false)
const error = ref('')

const schemaSuggestions = useSuggestions('schemas-ui', 'SCHEMA_NAME')
const tableSuggestions = useSuggestions('tables-ui', 'TABLE_NAME')
const { resolvedSchema } = useCurrentSchema()

const canStart = computed(() => !!table.value && !running.value)

async function startExport() {
  running.value = true
  error.value = ''
  try {
    const params = new URLSearchParams()
    params.set('schema', schema.value)
    params.set('table', table.value)
    params.set('format', format.value)
    if (columns.value.trim()) params.set('columns', columns.value.trim())
    if (limit.value !== '') params.set('limit', String(limit.value))
    if (format.value === 'csv') {
      params.set('delimiter', delimiter.value)
      params.set('includeHeaders', String(includeHeaders.value))
      params.set('nullValue', nullValue.value)
    }

    const res = await fetch(`/hana/export?${params.toString()}`)
    if (!res.ok) {
      const detail = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(detail.error || 'Export failed')
    }

    // Derive filename from Content-Disposition, fall back to a default
    const cd = res.headers.get('Content-Disposition') || ''
    const match = cd.match(/filename="?([^"]+)"?/)
    const ext = format.value === 'excel' ? 'xlsx' : format.value
    const filename = match ? match[1] : `${table.value}.${ext}`

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast.show('Export downloaded')
  } catch (e: any) {
    error.value = e.message
  } finally {
    running.value = false
  }
}
</script>

<template>
  <div class="export-view">
    <ui5-title level="H3">Export Data</ui5-title>
    <p class="subtitle">Export table or view data to a CSV, Excel, or JSON file download</p>

    <div class="form-card">
      <ui5-title level="H5">Source</ui5-title>
      <div class="form-grid">
        <div class="form-field">
          <ui5-label required>Source Table / View</ui5-label>
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
          <ui5-label required>Format</ui5-label>
          <ui5-select @change="(e: any) => format = e.detail?.selectedOption?.value || 'csv'">
            <ui5-option value="csv" :selected="format === 'csv'">CSV (Comma Separated Values)</ui5-option>
            <ui5-option value="excel" :selected="format === 'excel'">Excel (XLSX)</ui5-option>
            <ui5-option value="json" :selected="format === 'json'">JSON</ui5-option>
          </ui5-select>
        </div>
      </div>
    </div>

    <div class="form-card">
      <ui5-title level="H5">Query Options</ui5-title>
      <div class="form-grid">
        <div class="form-field">
          <ui5-label>Columns (comma-separated)</ui5-label>
          <ui5-input :value="columns" @change="(e: any) => columns = e.target.value" placeholder="Leave blank for all columns" />
        </div>
        <div class="form-field">
          <ui5-label>Limit</ui5-label>
          <ui5-input type="Number" :value="limit === '' ? '' : String(limit)" @change="(e: any) => limit = e.target.value === '' ? '' : Number(e.target.value)" placeholder="Max rows" />
        </div>
      </div>
    </div>

    <div v-if="format === 'csv'" class="form-card">
      <ui5-title level="H5">CSV Options</ui5-title>
      <div class="form-grid">
        <div class="form-field">
          <ui5-label>Delimiter</ui5-label>
          <ui5-input :value="delimiter" @change="(e: any) => delimiter = e.target.value || ','" />
        </div>
        <div class="form-field">
          <ui5-label>NULL Value</ui5-label>
          <ui5-input :value="nullValue" @change="(e: any) => nullValue = e.target.value" placeholder="Text for NULL cells" />
        </div>
        <div class="form-field checkbox-field">
          <ui5-checkbox text="Include Header Row" :checked="includeHeaders" @change="(e: any) => includeHeaders = e.target.checked" />
        </div>
      </div>
    </div>

    <ui5-bar design="Subheader">
      <ui5-button
        slot="endContent"
        design="Emphasized"
        icon="download"
        :disabled="!canStart"
        @click="startExport"
      >Export</ui5-button>
    </ui5-bar>

    <div v-if="error" class="error">
      <ui5-message-strip design="Negative" hide-close-button>{{ error }}</ui5-message-strip>
    </div>
  </div>
</template>

<style scoped>
.export-view {
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
</style>
