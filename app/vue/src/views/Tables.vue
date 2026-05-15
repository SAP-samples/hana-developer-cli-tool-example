<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHanaApi } from '../composables/useHanaApi'
import { useSuggestions } from '../composables/useSuggestions'
import { useSmartTable, type SmartColumn } from '../composables/useSmartTable'
import SmartTable from '../components/SmartTable.vue'

import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/SuggestionItem.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/Bar.js'

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

    <ui5-bar design="Subheader" class="filter-bar">
      <ui5-input
        slot="startContent"
        placeholder="Schema"
        :value="schema"
        show-suggestions
        filter="Contains"
        @change="(e: any) => schema = e.target.value"
        @focus="schemaSuggestions.ensureLoaded({ limit: 1000 })"
        class="filter-input"
      >
        <ui5-suggestion-item v-for="s in schemaSuggestions.items.value" :key="s" :text="s" />
      </ui5-input>
      <ui5-input
        slot="startContent"
        placeholder="Table filter (e.g. MY_*)"
        :value="tableFilter"
        @change="(e: any) => tableFilter = e.target.value"
        class="filter-input"
      />
      <ui5-select
        slot="startContent"
        @change="(e: any) => limit = Number(e.detail.selectedOption.value)"
      >
        <ui5-option value="50">50</ui5-option>
        <ui5-option value="100">100</ui5-option>
        <ui5-option value="200" selected>200</ui5-option>
        <ui5-option value="500">500</ui5-option>
        <ui5-option value="1000">1000</ui5-option>
      </ui5-select>
      <ui5-button
        slot="endContent"
        design="Emphasized"
        icon="refresh"
        @click="loadTables"
      >Execute</ui5-button>
    </ui5-bar>

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
}

.filter-bar {
  padding: 0.5rem 0;
}

.filter-input {
  width: 200px;
}
</style>
