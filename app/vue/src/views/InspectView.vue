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
const viewName = ref((route.query.view as string) || '')
const loading = ref(false)
const error = ref('')

const schemaSuggestions = useSuggestions('schemas-ui', 'SCHEMA_NAME')
const viewSuggestions = useSuggestions('views-ui', 'VIEW_NAME')
const { resolvedSchema } = useCurrentSchema()

const fieldColumns: SmartColumn[] = [
  { key: 'COLUMN_NAME', label: 'Column', sortable: true, importance: 3, width: '25%' },
  { key: 'DATA_TYPE_NAME', label: 'Data Type', sortable: true, importance: 3, width: '15%' },
  { key: 'LENGTH', label: 'Length', sortable: true, importance: 2, width: '10%' },
  { key: 'SCALE', label: 'Scale', importance: 1, width: '8%' },
  { key: 'IS_NULLABLE', label: 'Nullable', sortable: true, importance: 2, width: '10%' },
  { key: 'DEFAULT_VALUE', label: 'Default', importance: 1, width: '15%' },
  { key: 'COMMENTS', label: 'Comment', importance: 0, width: '17%' }
]

const fieldsTable = useSmartTable(fieldColumns)

const sqlCode = ref('')
const cdsCode = ref('')
const hdbviewCode = ref('')

async function loadInspection() {
  if (!viewName.value) return

  loading.value = true
  error.value = ''

  try {
    const result = await execute<any>('inspectView-ui', {
      schema: schema.value,
      view: viewName.value,
      limit: 200
    })

    fieldsTable.setData(result.fields || result.columns || [])
    sqlCode.value = result.sql || ''
    cdsCode.value = result.cds || ''
    hdbviewCode.value = result.hdbtable || result.hdbview || ''
  } catch (e: any) {
    error.value = e.message
    fieldsTable.setData([])
  } finally {
    loading.value = false
  }
}

function onFieldsExport(format: 'excel' | 'csv') {
  format === 'excel'
    ? fieldsTable.exportExcel(`${viewName.value}_fields.xlsx`)
    : fieldsTable.exportCsv(`${viewName.value}_fields.csv`)
}

onMounted(() => {
  if (viewName.value) loadInspection()
})

watch(() => route.query, (q) => {
  if (q.view) {
    viewName.value = q.view as string
    schema.value = (q.schema as string) || '**CURRENT_SCHEMA**'
    loadInspection()
  }
})
</script>

<template>
  <div class="inspect-view">
    <ui5-title level="H3">Inspect View</ui5-title>

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
        <ui5-label for="viewName">View:</ui5-label>
        <ui5-input
          id="viewName"
          placeholder="View name"
          :value="viewName"
          show-suggestions
          filter="Contains"
          @change="(e: any) => viewName = e.target.value"
          @focus="viewSuggestions.ensureLoaded({ schema: schema, view: '*', limit: 1000 })"
          class="filter-input-wide"
        >
          <ui5-suggestion-item v-for="s in viewSuggestions.items.value" :key="s" :text="s" />
        </ui5-input>
      </div>
      <ui5-button
        design="Emphasized"
        icon="refresh"
        :disabled="!viewName"
        @click="loadInspection"
        class="execute-btn"
      >Inspect</ui5-button>
    </div>

    <ui5-busy-indicator v-if="loading" active size="Medium" class="loading" />

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <ui5-tabcontainer v-else-if="fieldsTable.totalCount.value > 0" class="tabs" tab-layout="Inline">
      <ui5-tab text="Fields" selected>
        <SmartTable
          :title="`Columns (${fieldsTable.totalCount.value})`"
          :columns="fieldColumns"
          :data="fieldsTable.displayData.value"
          :sort-key="fieldsTable.sortKey.value"
          :sort-dir="fieldsTable.sortDir.value"
          :row-count="fieldsTable.rowCount.value"
          :total-count="fieldsTable.totalCount.value"
          @sort="fieldsTable.toggleSort"
          @search="(q: string) => fieldsTable.searchQuery.value = q"
          @export="onFieldsExport"
        />
      </ui5-tab>

      <ui5-tab text="SQL">
        <CodeBlock :code="sqlCode" language="sql" />
      </ui5-tab>

      <ui5-tab text="CDS">
        <CodeBlock :code="cdsCode" language="sql" />
      </ui5-tab>

      <ui5-tab text="HDBView">
        <CodeBlock :code="hdbviewCode" language="sql" />
      </ui5-tab>
    </ui5-tabcontainer>

    <div v-else-if="!loading && viewName" class="no-data">
      Enter a view name and click Inspect to view details.
    </div>
  </div>
</template>

<style scoped>
.inspect-view {
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
