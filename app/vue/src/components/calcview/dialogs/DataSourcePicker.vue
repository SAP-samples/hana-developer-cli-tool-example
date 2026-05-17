<script setup lang="ts">
import { ref } from 'vue'
import { useHanaApi } from '../../../composables/useHanaApi'
import '@ui5/webcomponents/dist/Dialog.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/TabContainer.js'
import '@ui5/webcomponents/dist/Tab.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'
import '@ui5/webcomponents/dist/SegmentedButton.js'
import '@ui5/webcomponents/dist/SegmentedButtonItem.js'

export interface DataSourceSelection {
  id: string
  type: 'table' | 'view' | 'calculationView'
  schemaName?: string
  objectName: string
}

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'select': [source: DataSourceSelection]
  'cancel': []
}>()

const { execute } = useHanaApi()

const sourceType = ref<'tables' | 'views'>('tables')
const query = ref('')
const results = ref<Array<{ schema: string; name: string }>>([])
const selectedIndex = ref<number | null>(null)
const loading = ref(false)
const error = ref('')

function handleSourceTypeChange(e: any) {
  const text = e.detail?.selectedItems?.[0]?.textContent?.trim()
  const newType = text === 'Views' ? 'views' : 'tables'
  if (newType !== sourceType.value) sourceType.value = newType
}

async function handleSearch() {
  if (!query.value.trim()) return
  loading.value = true
  error.value = ''
  results.value = []
  selectedIndex.value = null

  try {
    if (sourceType.value === 'tables') {
      const data = await execute<Array<{ TABLE_NAME: string; SCHEMA_NAME: string }>>('tables-ui', { table: query.value, limit: 50 })
      results.value = data.map(r => ({ schema: r.SCHEMA_NAME, name: r.TABLE_NAME }))
    } else {
      const data = await execute<Array<{ VIEW_NAME: string; SCHEMA_NAME: string }>>('views-ui', { view: query.value, limit: 50 })
      results.value = data.map(r => ({ schema: r.SCHEMA_NAME, name: r.VIEW_NAME }))
    }
  } catch (e: any) {
    error.value = e.message || 'Search failed'
  } finally {
    loading.value = false
  }
}

function handleSelect(index: number) {
  selectedIndex.value = index
}

function handleAdd() {
  if (selectedIndex.value === null) return
  const item = results.value[selectedIndex.value]
  if (!item) return
  const selection: DataSourceSelection = {
    id: item.name,
    type: sourceType.value === 'tables' ? 'table' : 'view',
    schemaName: item.schema,
    objectName: item.name
  }
  emit('select', selection)
  resetState()
}

function handleCancel() {
  emit('cancel')
  resetState()
}

function resetState() {
  query.value = ''
  results.value = []
  selectedIndex.value = null
  error.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') handleSearch()
}
</script>

<template>
  <ui5-dialog :open="open" header-text="Add Data Source" @close="handleCancel">
    <div class="picker-content">
      <div class="source-type-row">
        <ui5-segmented-button @selection-change="handleSourceTypeChange">
          <ui5-segmented-button-item :pressed="sourceType === 'tables'">Tables</ui5-segmented-button-item>
          <ui5-segmented-button-item :pressed="sourceType === 'views'">Views</ui5-segmented-button-item>
        </ui5-segmented-button>
      </div>

      <div class="search-row">
        <ui5-input
          class="search-input"
          :value="query"
          :placeholder="`Search ${sourceType}...`"
          @input="(e: any) => query = e.target.value"
          @keydown="handleKeydown"
        />
        <ui5-button design="Emphasized" @click="handleSearch">Search</ui5-button>
      </div>

      <ui5-busy-indicator :active="loading" size="M" class="results-area">
        <div v-if="error" class="error-msg">{{ error }}</div>
        <div v-else-if="results.length === 0 && !loading" class="empty-msg">
          Enter a search term and press Search
        </div>
        <div v-else class="results-list">
          <div
            v-for="(item, index) in results"
            :key="`${item.schema}.${item.name}`"
            class="result-item"
            :class="{ selected: selectedIndex === index }"
            @click="handleSelect(index)"
          >
            <span class="item-name">{{ item.name }}</span>
            <span class="item-schema">{{ item.schema }}</span>
          </div>
        </div>
      </ui5-busy-indicator>
    </div>

    <div slot="footer" class="dialog-footer">
      <ui5-button design="Emphasized" :disabled="selectedIndex === null" @click="handleAdd">Add</ui5-button>
      <ui5-button design="Transparent" @click="handleCancel">Cancel</ui5-button>
    </div>
  </ui5-dialog>
</template>

<style scoped>
.picker-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  min-width: 450px;
}

.source-type-row {
  display: flex;
  justify-content: center;
}

.search-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  flex: 1;
}

.results-area {
  min-height: 200px;
  max-height: 350px;
  display: flex;
  flex-direction: column;
}

.results-list {
  overflow-y: auto;
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 6px;
  max-height: 300px;
}

.result-item {
  padding: 8px 12px;
  border-bottom: 1px solid var(--sapList_BorderColor, #e5e5e5);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.result-item:hover {
  background: var(--sapList_Hover_Background, #e8f0fe);
}

.result-item.selected {
  background: var(--sapList_Active_Background, #0a6ed1);
  color: var(--sapList_Active_TextColor, #fff);
}

.result-item.selected .item-schema {
  color: var(--sapList_Active_TextColor, #fff);
  opacity: 0.8;
}

.item-name {
  font-weight: 500;
}

.item-schema {
  color: var(--sapContent_LabelColor, #666);
  font-size: 11px;
}

.error-msg {
  color: var(--sapNegativeColor, #b00);
  padding: 12px;
  text-align: center;
}

.empty-msg {
  color: var(--sapContent_LabelColor, #666);
  padding: 24px;
  text-align: center;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 8px 16px;
}
</style>
