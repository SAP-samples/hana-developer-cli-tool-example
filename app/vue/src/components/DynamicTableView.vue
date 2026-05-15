<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useHanaApi } from '../composables/useHanaApi'
import { useSuggestions } from '../composables/useSuggestions'
import { useDynamicTable } from '../composables/useDynamicTable'
import SmartTable from './SmartTable.vue'

import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/SuggestionItem.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/Bar.js'

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

const {
  columns, displayData, loading, searchQuery, sortKey, sortDir,
  rowCount, totalCount, setData, resetColumns, toggleSort, exportExcel, exportCsv
} = useDynamicTable()

const filterValues = ref<Record<string, string>>({})
const limit = ref(200)
const error = ref('')

const suggestions = ref<Record<string, ReturnType<typeof useSuggestions>>>({})

function initFilters() {
  const vals: Record<string, string> = {}
  const suggs: Record<string, ReturnType<typeof useSuggestions>> = {}
  props.filters.forEach(f => {
    vals[f.key] = f.default
    if (f.suggestEndpoint && f.suggestField) {
      suggs[f.key] = useSuggestions(f.suggestEndpoint, f.suggestField)
    }
  })
  filterValues.value = vals
  suggestions.value = suggs
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

    <ui5-bar design="Subheader" class="filter-bar">
      <ui5-input
        v-for="filter in filters"
        :key="filter.key"
        slot="startContent"
        :placeholder="filter.label"
        :value="filterValues[filter.key]"
        :show-suggestions="!!filter.suggestEndpoint"
        filter="Contains"
        @change="(e: any) => filterValues[filter.key] = e.target.value"
        @focus="suggestions[filter.key]?.ensureLoaded({ schema: filterValues['schema'] || '**CURRENT_SCHEMA**', limit: 1000 })"
        :class="filter.wide ? 'filter-input-wide' : 'filter-input'"
      >
        <ui5-suggestion-item
          v-for="s in (suggestions[filter.key]?.items.value || [])"
          :key="s"
          :text="s"
        />
      </ui5-input>
      <ui5-select
        v-if="showLimit"
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
        @click="loadData"
      >Execute</ui5-button>
    </ui5-bar>

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
}

.filter-bar {
  padding: 0.5rem 0;
}

.filter-input {
  width: 200px;
}

.filter-input-wide {
  width: 280px;
}

.error {
  padding: 1rem;
  color: var(--sapNegativeTextColor);
}
</style>
