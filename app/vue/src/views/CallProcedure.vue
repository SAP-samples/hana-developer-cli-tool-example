<script setup lang="ts">
import { ref, shallowRef, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHanaApi } from '../composables/useHanaApi'
import { useSuggestions } from '../composables/useSuggestions'
import { useCurrentSchema } from '../composables/useCurrentSchema'
import { useDynamicTable } from '../composables/useDynamicTable'
import SmartTable from '../components/SmartTable.vue'

import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/SuggestionItem.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'
import '@ui5/webcomponents/dist/TabContainer.js'
import '@ui5/webcomponents/dist/Tab.js'
import '@ui5/webcomponents/dist/Label.js'
import '@ui5/webcomponents/dist/MessageStrip.js'

interface ProcParam {
  PARAMETER_NAME: string
  DATA_TYPE_NAME: string
  LENGTH: number
  IS_NULLABLE: string
  PARAMETER_TYPE: string
  TABLE_TYPE_NAME?: string
}

const route = useRoute()
const { execute, fetchDirect } = useHanaApi()

const schema = ref((route.query.schema as string) || '**CURRENT_SCHEMA**')
const procedure = ref((route.query.procedure as string) || '')
const loading = ref(false)
const loadingParams = ref(false)
const error = ref('')

const schemaSuggestions = useSuggestions('schemas-ui', 'SCHEMA_NAME')
const procSuggestions = useSuggestions('procedures-ui', 'PROCEDURE_NAME')
const { resolvedSchema } = useCurrentSchema()

const parameters = ref<ProcParam[]>([])
const paramValues = ref<Record<string, string>>({})
const resultSets = ref<any[][]>([])
const outputScalar = ref<Record<string, any>>({})
const resultTables = shallowRef<ReturnType<typeof useDynamicTable>[]>([])
const executed = ref(false)

async function loadParameters() {
  if (!procedure.value) return

  loadingParams.value = true
  error.value = ''
  parameters.value = []
  paramValues.value = {}

  try {
    await fetch('/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schema: schema.value, procedure: procedure.value })
    })

    const res = await fetch('/hana/callProcedure/parameters/')
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const result = await res.json()

    const allParams: ProcParam[] = result.parameters || []
    parameters.value = allParams.filter(p =>
      !p.TABLE_TYPE_NAME && p.PARAMETER_TYPE === 'IN'
    )

    const vals: Record<string, string> = {}
    parameters.value.forEach(p => { vals[p.PARAMETER_NAME] = '' })
    paramValues.value = vals
  } catch (e: any) {
    error.value = e.message
  } finally {
    loadingParams.value = false
  }
}

async function callProcedure() {
  loading.value = true
  error.value = ''
  executed.value = false
  resultSets.value = []
  resultTables.value = []
  outputScalar.value = {}

  try {
    const params: Record<string, any> = {
      schema: schema.value,
      procedure: procedure.value,
      ...paramValues.value
    }

    const result = await execute<any>('callProcedure-ui', params)

    if (result.outputScalar) {
      outputScalar.value = result.outputScalar
    }

    const sets: any[][] = []
    for (const key of Object.keys(result)) {
      if (key === 'outputScalar') continue
      const val = result[key]
      if (Array.isArray(val) && val.length > 0) {
        sets.push(val)
      }
    }

    resultSets.value = sets
    resultTables.value = sets.map(() => useDynamicTable())
    sets.forEach((data, i) => {
      resultTables.value[i].setData(data)
    })

    executed.value = true
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function onExport(index: number, format: 'excel' | 'csv') {
  const table = resultTables.value[index]
  if (!table) return
  format === 'excel'
    ? table.exportExcel(`${procedure.value}_result${index + 1}.xlsx`)
    : table.exportCsv(`${procedure.value}_result${index + 1}.csv`)
}

onMounted(() => {
  if (procedure.value) loadParameters()
})

watch(() => route.query, (q) => {
  if (q.procedure) {
    procedure.value = q.procedure as string
    schema.value = (q.schema as string) || '**CURRENT_SCHEMA**'
    loadParameters()
  }
})
</script>

<template>
  <div class="call-proc-view">
    <ui5-title level="H3">Call Procedure</ui5-title>

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
        <ui5-label for="procedure">Procedure:</ui5-label>
        <ui5-input
          id="procedure"
          placeholder="Procedure name"
          :value="procedure"
          show-suggestions
          filter="Contains"
          @change="(e: any) => procedure = e.target.value"
          @focus="procSuggestions.ensureLoaded({ schema: schema, procedure: '*', limit: 1000 })"
          class="filter-input-wide"
        >
          <ui5-suggestion-item v-for="s in procSuggestions.items.value" :key="s" :text="s" />
        </ui5-input>
      </div>
      <ui5-button
        design="Default"
        icon="detail-view"
        :disabled="!procedure"
        @click="loadParameters"
        class="execute-btn"
      >Load Parameters</ui5-button>
      <ui5-button
        design="Emphasized"
        icon="play"
        :disabled="!procedure"
        @click="callProcedure"
        class="execute-btn"
      >Execute</ui5-button>
    </div>

    <ui5-busy-indicator v-if="loadingParams" active size="Medium" class="loading" />

    <div v-if="parameters.length > 0" class="params-section">
      <ui5-title level="H5">Input Parameters</ui5-title>
      <div class="params-grid">
        <div v-for="param in parameters" :key="param.PARAMETER_NAME" class="param-field">
          <ui5-label>{{ param.PARAMETER_NAME }} ({{ param.DATA_TYPE_NAME }})</ui5-label>
          <ui5-input
            :value="paramValues[param.PARAMETER_NAME]"
            :placeholder="param.IS_NULLABLE === 'TRUE' ? 'Optional' : 'Required'"
            @change="(e: any) => paramValues[param.PARAMETER_NAME] = e.target.value"
          />
        </div>
      </div>
    </div>

    <ui5-busy-indicator v-if="loading" active size="Medium" class="loading" />

    <div v-else-if="error" class="error">
      <ui5-message-strip design="Negative" hide-close-button>{{ error }}</ui5-message-strip>
    </div>

    <template v-else-if="executed">
      <div v-if="Object.keys(outputScalar).length > 0" class="scalar-output">
        <ui5-message-strip design="Information" hide-close-button>
          Output Scalars:
          <span v-for="(val, key) in outputScalar" :key="key" class="scalar-item">
            {{ key }}={{ val }}
          </span>
        </ui5-message-strip>
      </div>

      <template v-if="resultTables.length > 0">
        <ui5-tabcontainer v-if="resultTables.length > 1" class="tabs">
          <ui5-tab
            v-for="(table, i) in resultTables"
            :key="i"
            :text="`Result Set ${i + 1}`"
            :selected="i === 0"
          >
            <SmartTable
              :title="`Result Set ${i + 1} (${table.totalCount.value})`"
              :columns="table.columns.value"
              :data="table.displayData.value"
              :sort-key="table.sortKey.value"
              :sort-dir="table.sortDir.value"
              :row-count="table.rowCount.value"
              :total-count="table.totalCount.value"
              @sort="table.toggleSort"
              @search="(q: string) => table.searchQuery.value = q"
              @export="(fmt: 'excel' | 'csv') => onExport(i, fmt)"
            />
          </ui5-tab>
        </ui5-tabcontainer>

        <SmartTable
          v-else
          :title="`Results (${resultTables[0].totalCount.value})`"
          :columns="resultTables[0].columns.value"
          :data="resultTables[0].displayData.value"
          :sort-key="resultTables[0].sortKey.value"
          :sort-dir="resultTables[0].sortDir.value"
          :row-count="resultTables[0].rowCount.value"
          :total-count="resultTables[0].totalCount.value"
          @sort="resultTables[0].toggleSort"
          @search="(q: string) => resultTables[0].searchQuery.value = q"
          @export="(fmt: 'excel' | 'csv') => onExport(0, fmt)"
        />
      </template>

      <ui5-message-strip
        v-else-if="Object.keys(outputScalar).length === 0"
        design="Positive"
        hide-close-button
      >Procedure executed successfully (no result sets returned)</ui5-message-strip>
    </template>
  </div>
</template>

<style scoped>
.call-proc-view {
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

.params-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--sapGroup_ContentBackground, #fff);
  border-radius: 4px;
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
}

.param-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.scalar-output {
  margin-bottom: 0.5rem;
}

.scalar-item {
  margin-left: 1rem;
  font-family: monospace;
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
</style>
