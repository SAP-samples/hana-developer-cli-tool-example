<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHanaApi } from '../composables/useHanaApi'
import { useSuggestions } from '../composables/useSuggestions'
import { useCurrentSchema } from '../composables/useCurrentSchema'
import { useSmartTable, type SmartColumn } from '../composables/useSmartTable'
import SmartTable from '../components/SmartTable.vue'
import CodeBlock from '../components/CodeBlock.vue'

import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/SuggestionItem.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/TabContainer.js'
import '@ui5/webcomponents/dist/Tab.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'
import '@ui5/webcomponents/dist/Label.js'

const route = useRoute()
const { execute } = useHanaApi()

const schema = ref((route.query.schema as string) || '**CURRENT_SCHEMA**')
const functionName = ref((route.query.function as string) || '')
const loading = ref(false)
const error = ref('')

const schemaSuggestions = useSuggestions('schemas-ui', 'SCHEMA_NAME')
const funcSuggestions = useSuggestions('functions-ui', 'FUNCTION_NAME')
const { resolvedSchema } = useCurrentSchema()

const paramColumns: SmartColumn[] = [
  { key: 'PARAMETER_NAME', label: 'Parameter', sortable: true, importance: 3, width: '20%' },
  { key: 'DATA_TYPE_NAME', label: 'Data Type', sortable: true, importance: 3, width: '15%' },
  { key: 'LENGTH', label: 'Length', sortable: true, importance: 2, width: '10%' },
  { key: 'SCALE', label: 'Scale', importance: 1, width: '8%' },
  { key: 'POSITION', label: 'Position', sortable: true, importance: 2, width: '10%' },
  { key: 'PARAMETER_TYPE', label: 'Type', sortable: true, importance: 2, width: '10%' },
  { key: 'IS_NULLABLE', label: 'Nullable', sortable: true, importance: 1, width: '10%' },
  { key: 'TABLE_TYPE_NAME', label: 'Table Type', importance: 0, width: '17%' }
]

const colColumns: SmartColumn[] = [
  { key: 'PARAMETER_NAME', label: 'Parameter', sortable: true, importance: 3, width: '20%' },
  { key: 'COLUMN_NAME', label: 'Column', sortable: true, importance: 3, width: '20%' },
  { key: 'DATA_TYPE_NAME', label: 'Data Type', sortable: true, importance: 3, width: '15%' },
  { key: 'LENGTH', label: 'Length', sortable: true, importance: 2, width: '10%' },
  { key: 'SCALE', label: 'Scale', importance: 1, width: '10%' },
  { key: 'IS_NULLABLE', label: 'Nullable', sortable: true, importance: 1, width: '10%' }
]

const paramsTable = useSmartTable(paramColumns)
const columnsTable = useSmartTable(colColumns)

const sqlCode = ref('')
const hasColumns = ref(false)

async function loadInspection() {
  if (!functionName.value) return

  loading.value = true
  error.value = ''

  try {
    const result = await execute<any>('inspectFunction-ui', {
      schema: schema.value,
      functionName: functionName.value
    })

    paramsTable.setData(result.parameters || [])
    const cols = result.columns || []
    columnsTable.setData(cols)
    hasColumns.value = cols.length > 0
    sqlCode.value = result.sql || ''
  } catch (e: any) {
    error.value = e.message
    paramsTable.setData([])
    columnsTable.setData([])
  } finally {
    loading.value = false
  }
}

function onParamsExport(format: 'excel' | 'csv') {
  format === 'excel'
    ? paramsTable.exportExcel(`${functionName.value}_parameters.xlsx`)
    : paramsTable.exportCsv(`${functionName.value}_parameters.csv`)
}

function onColumnsExport(format: 'excel' | 'csv') {
  format === 'excel'
    ? columnsTable.exportExcel(`${functionName.value}_columns.xlsx`)
    : columnsTable.exportCsv(`${functionName.value}_columns.csv`)
}

onMounted(() => {
  if (functionName.value) loadInspection()
})

watch(() => route.query, (q) => {
  if (q.function) {
    functionName.value = q.function as string
    schema.value = (q.schema as string) || '**CURRENT_SCHEMA**'
    loadInspection()
  }
})
</script>

<template>
  <div class="inspect-function">
    <ui5-title level="H3">Inspect Function</ui5-title>

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
        <ui5-label for="functionName">Function:</ui5-label>
        <ui5-input
          id="functionName"
          placeholder="Function name"
          :value="functionName"
          show-suggestions
          filter="Contains"
          @change="(e: any) => functionName = e.target.value"
          @focus="funcSuggestions.ensureLoaded({ schema: schema, function: '*', limit: 1000 })"
          class="filter-input-wide"
        >
          <ui5-suggestion-item v-for="s in funcSuggestions.items.value" :key="s" :text="s" />
        </ui5-input>
      </div>
      <ui5-button
        design="Emphasized"
        icon="refresh"
        :disabled="!functionName"
        @click="loadInspection"
        class="execute-btn"
      >Inspect</ui5-button>
    </div>

    <ui5-busy-indicator v-if="loading" active size="Medium" class="loading" />

    <div v-else-if="error" class="error">
      <ui5-message-strip design="Negative" hide-close-button>{{ error }}</ui5-message-strip>
    </div>

    <ui5-tabcontainer v-else-if="paramsTable.totalCount.value > 0 || sqlCode" class="tabs" tab-layout="Inline">
      <ui5-tab text="Parameters" selected>
        <SmartTable
          :title="`Parameters (${paramsTable.totalCount.value})`"
          :columns="paramColumns"
          :data="paramsTable.displayData.value"
          :sort-key="paramsTable.sortKey.value"
          :sort-dir="paramsTable.sortDir.value"
          :row-count="paramsTable.rowCount.value"
          :total-count="paramsTable.totalCount.value"
          @sort="paramsTable.toggleSort"
          @search="(q: string) => paramsTable.searchQuery.value = q"
          @export="onParamsExport"
        />
      </ui5-tab>

      <ui5-tab v-if="hasColumns" text="Columns">
        <SmartTable
          :title="`Parameter Columns (${columnsTable.totalCount.value})`"
          :columns="colColumns"
          :data="columnsTable.displayData.value"
          :sort-key="columnsTable.sortKey.value"
          :sort-dir="columnsTable.sortDir.value"
          :row-count="columnsTable.rowCount.value"
          :total-count="columnsTable.totalCount.value"
          @sort="columnsTable.toggleSort"
          @search="(q: string) => columnsTable.searchQuery.value = q"
          @export="onColumnsExport"
        />
      </ui5-tab>

      <ui5-tab text="SQL">
        <CodeBlock :code="sqlCode" language="sql" />
      </ui5-tab>
    </ui5-tabcontainer>

    <div v-else-if="!loading && functionName" class="no-data">
      Enter a function name and click Inspect to view details.
    </div>
  </div>
</template>

<style scoped>
.inspect-function {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.filter-input-wide {
  width: 280px;
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

.tabs {
  min-height: 400px;
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

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--sapContent_LabelColor);
}
</style>
