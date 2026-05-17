<script setup lang="ts">
import { computed } from 'vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import type { CalcViewNode } from '../../../services/calcview/types'
import '@ui5/webcomponents/dist/Button.js'

const props = defineProps<{
  node: CalcViewNode
}>()

const emit = defineEmits<{
  'set-filter': [expression: string | undefined]
}>()

const hasFilter = computed(() => !!props.node.filterExpression)

function onExpressionChange(value: string | undefined) {
  emit('set-filter', value || undefined)
}

function clearFilter() {
  emit('set-filter', undefined)
}
</script>

<template>
  <div class="filter-tab">
    <div class="filter-header">
      <span class="label">WHERE clause filter</span>
      <ui5-button v-if="hasFilter" design="Transparent" @click="clearFilter">Clear</ui5-button>
    </div>
    <div class="monaco-wrapper">
      <VueMonacoEditor
        :value="node.filterExpression || ''"
        language="sql"
        :options="{ minimap: { enabled: false }, lineNumbers: 'off', fontSize: 12, scrollBeyondLastLine: false, wordWrap: 'on', automaticLayout: true }"
        theme="vs"
        height="100px"
        @change="onExpressionChange"
      />
    </div>
    <div class="available-cols">
      <span class="hint">Available columns:</span>
      <span v-for="col in node.outputColumns" :key="col.id" class="avail-chip">{{ col.name }}</span>
    </div>
  </div>
</template>

<style scoped>
.filter-tab {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-header .label {
  font-size: 11px;
  font-weight: 600;
  color: var(--sapTextColor, #333);
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
</style>
