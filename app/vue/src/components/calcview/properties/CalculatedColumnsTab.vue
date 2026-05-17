<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import type { CalcViewNode, CalculatedColumn } from '../../../services/calcview/types'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'

const props = defineProps<{
  node: CalcViewNode
}>()

const emit = defineEmits<{
  'add-column': [column: CalculatedColumn]
  'remove-column': [columnId: string]
  'update-column': [columnId: string, updates: Partial<CalculatedColumn>]
}>()

const selectedColumnId = ref<string | null>(null)

const selectedColumn = computed(() => {
  if (!selectedColumnId.value) return null
  return props.node.calculatedColumns.find(c => c.id === selectedColumnId.value) ?? null
})

const availableColumns = computed(() => {
  return props.node.outputColumns.map(c => c.name)
})

function addNewColumn() {
  const id = `CC_${Date.now()}`
  emit('add-column', { id, name: id, dataType: 'NVARCHAR', expression: '' })
  selectedColumnId.value = id
}

function removeColumn(columnId: string) {
  emit('remove-column', columnId)
  if (selectedColumnId.value === columnId) selectedColumnId.value = null
}

function onExpressionChange(value: string | undefined) {
  if (selectedColumnId.value && value !== undefined) {
    emit('update-column', selectedColumnId.value, { expression: value })
  }
}

function onNameChange(e: any) {
  if (selectedColumnId.value) {
    emit('update-column', selectedColumnId.value, { name: e.target.value })
  }
}

function onDataTypeChange(e: any) {
  if (selectedColumnId.value) {
    emit('update-column', selectedColumnId.value, { dataType: e.detail.selectedOption.value })
  }
}
</script>

<template>
  <div class="calculated-columns-tab">
    <div class="column-chips">
      <div
        v-for="col in node.calculatedColumns"
        :key="col.id"
        class="chip"
        :class="{ selected: selectedColumnId === col.id }"
        @click="selectedColumnId = col.id"
      >
        <span>{{ col.name }}</span>
        <ui5-button design="Transparent" icon="decline" @click.stop="removeColumn(col.id)" />
      </div>
      <ui5-button design="Transparent" @click="addNewColumn">+ New</ui5-button>
    </div>

    <div v-if="selectedColumn" class="editor-section">
      <div class="props-row">
        <label>Name:</label>
        <ui5-input :value="selectedColumn.name" @change="onNameChange" />
      </div>
      <div class="props-row">
        <label>Type:</label>
        <ui5-select @change="onDataTypeChange">
          <ui5-option v-for="dt in ['NVARCHAR', 'INTEGER', 'BIGINT', 'DECIMAL', 'DATE', 'TIMESTAMP']" :key="dt" :value="dt" :selected="selectedColumn.dataType === dt">{{ dt }}</ui5-option>
        </ui5-select>
      </div>
      <div class="monaco-wrapper">
        <VueMonacoEditor
          :value="selectedColumn.expression"
          language="sql"
          :options="{ minimap: { enabled: false }, lineNumbers: 'off', fontSize: 12, scrollBeyondLastLine: false, wordWrap: 'on', automaticLayout: true }"
          theme="vs"
          height="120px"
          @change="onExpressionChange"
        />
      </div>
      <div class="available-cols">
        <span class="hint">Available columns:</span>
        <span v-for="col in availableColumns" :key="col" class="avail-chip">{{ col }}</span>
      </div>
    </div>
    <div v-else class="no-selection">
      Select a calculated column or create a new one
    </div>
  </div>
</template>

<style scoped>
.calculated-columns-tab {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 16px;
  font-size: 11px;
  cursor: pointer;
  background: var(--sapButton_Lite_Background, #f5f6f7);
}

.chip.selected {
  border-color: var(--sapSelectedColor, #0854a0);
  background: var(--sapInfobar_Background, #e5f0fa);
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.props-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.props-row label {
  width: 50px;
  color: var(--sapContent_LabelColor, #666);
}

.props-row ui5-input, .props-row ui5-select {
  flex: 1;
}

.monaco-wrapper {
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 4px;
  overflow: hidden;
}

.available-cols {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.available-cols .hint {
  font-size: 10px;
  color: var(--sapContent_LabelColor, #666);
}

.avail-chip {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--sapButton_Lite_Background, #f5f6f7);
  border-radius: 4px;
  font-family: monospace;
}

.no-selection {
  color: var(--sapContent_LabelColor, #666);
  font-size: 11px;
  padding: 8px 0;
}
</style>
