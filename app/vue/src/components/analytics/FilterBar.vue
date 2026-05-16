<script setup lang="ts">
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/Popover.js'
import { ref } from 'vue'
import type { FilterConfig } from '../../composables/useChartConfig'
import type { ColumnMetadata } from '../../composables/useDataSource'

const props = defineProps<{
  filters: FilterConfig[]
  columns: ColumnMetadata[]
}>()

const emit = defineEmits<{
  addFilter: [filter: FilterConfig]
  removeFilter: [index: number]
  clearAll: []
}>()

const popoverRef = ref<any>(null)
const newColumn = ref('')
const newOperator = ref('=')
const newValue = ref('')

const operators = ['=', '!=', '>', '<', '>=', '<=', 'IN', 'LIKE', 'BETWEEN']

function openPopover(event: Event) {
  popoverRef.value?.showAt(event.target)
}

function addFilter() {
  if (newColumn.value && newValue.value) {
    emit('addFilter', {
      column: newColumn.value,
      operator: newOperator.value,
      value: newValue.value
    })
    newColumn.value = ''
    newOperator.value = '='
    newValue.value = ''
    popoverRef.value?.close()
  }
}
</script>

<template>
  <div class="filter-bar">
    <div v-for="(filter, i) in filters" :key="`${filter.column}_${filter.operator}_${filter.value}`" class="filter-chip">
      <span>{{ filter.column }} {{ filter.operator }} {{ filter.value }}</span>
      <ui5-button icon="decline" design="Transparent" @click="emit('removeFilter', i)"></ui5-button>
    </div>
    <ui5-button icon="add" design="Transparent" tooltip="Add filter" @click="openPopover"></ui5-button>
    <ui5-button v-if="filters.length > 0" design="Transparent" @click="emit('clearAll')">Clear all</ui5-button>

    <ui5-popover ref="popoverRef" header-text="Add Filter" placement="Bottom">
      <div class="filter-form">
        <ui5-select class="filter-col" @change="(e: any) => newColumn = e.detail.selectedOption?.dataset?.value || ''">
          <ui5-option data-value="">Column...</ui5-option>
          <ui5-option v-for="col in columns" :key="col.column" :data-value="col.column">{{ col.column }}</ui5-option>
        </ui5-select>
        <ui5-select class="filter-op" @change="(e: any) => newOperator = e.detail.selectedOption?.dataset?.value || '='">
          <ui5-option v-for="op in operators" :key="op" :data-value="op">{{ op }}</ui5-option>
        </ui5-select>
        <ui5-input class="filter-val" placeholder="Value" :value="newValue" @input="(e: any) => newValue = e.target.value"></ui5-input>
        <ui5-button design="Emphasized" @click="addFilter">Add</ui5-button>
      </div>
    </ui5-popover>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.5rem 0;
  min-height: 2.5rem;
}
.filter-chip {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: var(--sapInformativeBackground);
  border: 1px solid var(--sapInformativeColor);
  border-radius: 1rem;
  font-size: 0.8rem;
}
.filter-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  min-width: 250px;
}
</style>
