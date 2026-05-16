<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHanaApi } from '../composables/useHanaApi'
import { useSuggestions } from '../composables/useSuggestions'
import { useCurrentSchema } from '../composables/useCurrentSchema'
import { useSmartTable, type SmartColumn } from '../composables/useSmartTable'
import SmartTable from '../components/SmartTable.vue'

import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/SuggestionItem.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/Label.js'

const router = useRouter()
const { execute } = useHanaApi()

const columns: SmartColumn[] = [
  { key: 'TABLE_NAME', label: 'Table Name', sortable: true, importance: 3, width: '45%' },
  { key: 'SCHEMA_NAME', label: 'Schema', sortable: true, importance: 2, width: '30%' },
  { key: 'TABLE_TYPE', label: 'Type', sortable: true, importance: 1, width: '25%' }
]

const {
  displayData, loading, searchQuery, sortKey, sortDir,
  rowCount, totalCount, setData, toggleSort, exportExcel, exportCsv
} = useSmartTable(columns)

const schema = ref('**CURRENT_SCHEMA**')
const tableFilter = ref('*')
const limit = ref(200)

const schemaSuggestions = useSuggestions('schemas-ui', 'SCHEMA_NAME')
const tableSuggestions = useSuggestions('tables-ui', 'TABLE_NAME')
const { resolvedSchema } = useCurrentSchema()

async function loadTables() {
  loading.value = true
  try {
    const result = await execute<any[]>('tables-ui', {
      schema: schema.value,
      table: tableFilter.value,
      limit: limit.value
    })
    setData(result)
  } catch (e: any) {
    console.error('Failed to load tables:', e)
    setData([])
  } finally {
    loading.value = false
  }
}

function onExport(format: 'excel' | 'csv') {
  format === 'excel' ? exportExcel('tables.xlsx') : exportCsv('tables.csv')
}

function onRowClick(row: any) {
  router.push({
    name: 'inspectTable',
    query: { table: row.TABLE_NAME, schema: row.SCHEMA_NAME }
  })
}

onMounted(loadTables)
</script>

<template>
  <div class="tables-view">
    <ui5-title level="H3">Database Tables</ui5-title>

    <div class="filter-bar">
      <div class="filter-field">
        <ui5-label for="schema">Schema:</ui5-label>
        <ui5-input
          id="schema"
          placeholder="Schema"
          :value="schema"
          show-suggestions
          filter="Contains"
          @change="(e: any) => schema = e.target.value"
          @focus="schemaSuggestions.ensureLoaded({ limit: 1000, schema: '*' })"
          class="filter-input"
        >
          <ui5-suggestion-item v-for="s in schemaSuggestions.items.value" :key="s" :text="s" />
        </ui5-input>
        <span v-if="schema === '**CURRENT_SCHEMA**' && resolvedSchema" class="resolved-schema">{{ resolvedSchema }}</span>
      </div>
      <div class="filter-field">
        <ui5-label for="tableFilter">Table:</ui5-label>
        <ui5-input
          id="tableFilter"
          placeholder="Table filter (e.g. MY_*)"
          :value="tableFilter"
          show-suggestions
          filter="Contains"
          @change="(e: any) => tableFilter = e.target.value"
          @focus="tableSuggestions.ensureLoaded({ schema: schema, table: '*', limit: 1000 })"
          class="filter-input"
        >
          <ui5-suggestion-item v-for="s in tableSuggestions.items.value" :key="s" :text="s" />
        </ui5-input>
      </div>
      <div class="filter-field">
        <ui5-label for="limit">Limit:</ui5-label>
        <ui5-select
          id="limit"
          @change="(e: any) => limit = Number(e.detail.selectedOption.value)"
        >
          <ui5-option value="50">50</ui5-option>
          <ui5-option value="100">100</ui5-option>
          <ui5-option value="200" selected>200</ui5-option>
          <ui5-option value="500">500</ui5-option>
          <ui5-option value="1000">1000</ui5-option>
        </ui5-select>
      </div>
      <ui5-button
        design="Emphasized"
        icon="refresh"
        @click="loadTables"
        class="execute-btn"
      >Execute</ui5-button>
    </div>

    <SmartTable
      title="Results"
      :columns="columns"
      :data="displayData"
      :loading="loading"
      :sort-key="sortKey"
      :sort-dir="sortDir"
      :row-count="rowCount"
      :total-count="totalCount"
      @sort="toggleSort"
      @search="(q: string) => searchQuery = q"
      @export="onExport"
      @row-click="onRowClick"
    />
  </div>
</template>

<style scoped>
.tables-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  padding: 0.5rem 0;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
  padding-bottom: 1rem;
}

.filter-input {
  width: 200px;
}

.filter-field ui5-select {
  width: 100px;
}

.execute-btn {
  margin-bottom: 1rem;
}

.resolved-schema {
  position: absolute;
  bottom: 0;
  left: 0;
  font-size: 0.75rem;
  color: var(--sapContent_LabelColor);
  font-style: italic;
}
</style>
