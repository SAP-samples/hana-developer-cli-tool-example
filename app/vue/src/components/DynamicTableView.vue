<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useHanaApi } from '../composables/useHanaApi'
import { useSuggestions } from '../composables/useSuggestions'
import { useCurrentSchema } from '../composables/useCurrentSchema'
import { useDynamicTable } from '../composables/useDynamicTable'
import SmartTable from './SmartTable.vue'

import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/SuggestionItem.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/Label.js'

export interface FilterField {
  key: string
  label: string
  default: string
  wide?: boolean
  suggestEndpoint?: string
  suggestField?: string
}

const props = withDefaults(defineProps<{
  title: string
  endpoint: string
  filters?: FilterField[]
  showLimit?: boolean
  rowClickRoute?: string
  rowClickParams?: (row: any) => Record<string, string>
}>(), {
  filters: () => [],
  showLimit: true
})

const emit = defineEmits<{
  rowClick: [row: any]
}>()

const { execute } = useHanaApi()
const { resolvedSchema } = useCurrentSchema()

const {
  columns, displayData, loading, searchQuery, sortKey, sortDir,
  rowCount, totalCount, setData, resetColumns, toggleSort, exportExcel, exportCsv
} = useDynamicTable()

const filterValues = ref<Record<string, string>>({})
const limit = ref(200)
const error = ref('')

const suggestions = reactive<Record<string, ReturnType<typeof useSuggestions>>>({})

function initFilters() {
  const vals: Record<string, string> = {}
  props.filters.forEach(f => {
    vals[f.key] = f.default
    if (f.suggestEndpoint && f.suggestField) {
      suggestions[f.key] = useSuggestions(f.suggestEndpoint, f.suggestField)
    }
  })
  filterValues.value = vals
}

async function loadData() {
  loading.value = true
  error.value = ''
  resetColumns()

  try {
    const params: Record<string, any> = { ...filterValues.value }
    if (props.showLimit) params.limit = limit.value

    const result = await execute<any>(props.endpoint, params)
    const data = Array.isArray(result) ? result : []
    setData(data)
  } catch (e: any) {
    error.value = e.message
    setData([])
  } finally {
    loading.value = false
  }
}

function onExport(format: 'excel' | 'csv') {
  const filename = props.endpoint.replace(/-ui$/, '')
  format === 'excel'
    ? exportExcel(`${filename}.xlsx`)
    : exportCsv(`${filename}.csv`)
}

function onRowClick(row: any) {
  emit('rowClick', row)
}

onMounted(() => {
  initFilters()
  loadData()
})
</script>

<template>
  <div class="dynamic-table-view">
    <ui5-title level="H3">{{ title }}</ui5-title>

    <div class="filter-bar">
      <div v-for="filter in filters" :key="filter.key" class="filter-field" :class="{ wide: filter.wide }">
        <ui5-label :for="filter.key">{{ filter.label }}:</ui5-label>
        <ui5-input
          :id="filter.key"
          :placeholder="filter.label"
          :value="filterValues[filter.key]"
          :show-suggestions="!!filter.suggestEndpoint"
          filter="Contains"
          :data-help-id="filter.key"
          @change="(e: any) => filterValues[filter.key] = e.target.value"
          @focus="suggestions[filter.key]?.ensureLoaded({ ...filterValues, [filter.key]: '*', limit: 1000 })"
        >
          <ui5-suggestion-item
            v-for="s in (suggestions[filter.key]?.items || [])"
            :key="s"
            :text="s"
          />
        </ui5-input>
        <span v-if="filterValues[filter.key] === '**CURRENT_SCHEMA**' && resolvedSchema" class="resolved-schema">{{ resolvedSchema }}</span>
      </div>
      <div v-if="showLimit" class="filter-field">
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
        @click="loadData"
        class="execute-btn"
      >Execute</ui5-button>
    </div>

    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <SmartTable
      v-else
      :title="'Results'"
      :columns="columns"
      :data="displayData"
      :loading="loading"
      :sort-key="sortKey"
      :sort-dir="sortDir"
      :row-count="rowCount"
      :total-count="totalCount"
      :context-id="endpoint"
      @sort="toggleSort"
      @search="(q: string) => searchQuery = q"
      @export="onExport"
      @row-click="onRowClick"
    />
  </div>
</template>

<style scoped>
.dynamic-table-view {
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

.filter-field ui5-input {
  width: 200px;
}

.filter-field.wide ui5-input {
  width: 280px;
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

.error {
  padding: 1rem;
  color: var(--sapNegativeTextColor);
}
</style>
