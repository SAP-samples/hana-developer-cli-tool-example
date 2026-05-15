<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { computeDiff, type DiffResult } from '../composables/useResultDiff'
import { useQueryTabs } from '../composables/useQueryTabs'
import { useQueryHistory } from '../composables/useQueryHistory'

import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/Label.js'

const props = defineProps<{
  currentData: any[]
}>()

const { tabs, activeTabId } = useQueryTabs()
const { entries } = useQueryHistory()

type DiffSource = { label: string; data: any[] }

const sources = computed<DiffSource[]>(() => {
  const result: DiffSource[] = []
  for (const tab of tabs.value) {
    if (tab.id !== activeTabId.value && tab.results.length > 0) {
      result.push({ label: `Tab: ${tab.name}`, data: tab.results })
    }
  }
  for (const entry of entries.value.slice(0, 10)) {
    if (!entry.error) {
      result.push({ label: `History: ${entry.sql.slice(0, 40)}...`, data: [] })
    }
  }
  return result
})

const selectedSourceIdx = ref(0)
const diffResult = ref<DiffResult | null>(null)

watch([() => props.currentData, selectedSourceIdx, sources], () => {
  const source = sources.value[selectedSourceIdx.value]
  if (!source || !props.currentData.length || !source.data.length) {
    diffResult.value = null
    return
  }
  diffResult.value = computeDiff(source.data, props.currentData)
}, { immediate: true })

function onSourceChange(e: Event) {
  const idx = Number((e.target as any).selectedOption?.dataset.idx || 0)
  selectedSourceIdx.value = idx
}

function statusColor(status: string): string {
  switch (status) {
    case 'added': return 'var(--sapSuccessBackground, #f1fdf6)'
    case 'removed': return 'var(--sapErrorBackground, #fff3f3)'
    case 'changed': return 'var(--sapWarningBackground, #fef7f1)'
    default: return 'transparent'
  }
}

function cellClass(status: string, col: string, changedKeys?: string[]): string {
  if (status === 'changed' && changedKeys?.includes(col)) return 'diff-cell-changed'
  return ''
}
</script>

<template>
  <div class="result-diff">
    <div class="diff-toolbar">
      <ui5-label>Compare with:</ui5-label>
      <ui5-select class="source-select" @change="onSourceChange">
        <ui5-option
          v-for="(src, idx) in sources"
          :key="idx"
          :data-idx="idx"
          :selected="idx === selectedSourceIdx"
        >{{ src.label }}</ui5-option>
      </ui5-select>
    </div>

    <div v-if="!diffResult" class="diff-empty">
      <p v-if="sources.length === 0">No comparison sources available. Open another tab with results or run queries to build history.</p>
      <p v-else>Select a source to compare against current results.</p>
    </div>

    <template v-else>
      <div class="diff-stats">
        <span class="stat stat-added">+{{ diffResult.stats.added }} added</span>
        <span class="stat stat-removed">-{{ diffResult.stats.removed }} removed</span>
        <span class="stat stat-changed">~{{ diffResult.stats.changed }} changed</span>
        <span class="stat stat-unchanged">{{ diffResult.stats.unchanged }} unchanged</span>
      </div>

      <div class="diff-table-container">
        <table class="diff-table">
          <thead>
            <tr>
              <th class="diff-status-col"></th>
              <th v-for="col in diffResult.columns" :key="col">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in diffResult.rows"
              :key="i"
              :style="{ backgroundColor: statusColor(row.status) }"
            >
              <td class="diff-status-col">
                <span v-if="row.status === 'added'" class="status-badge badge-added">+</span>
                <span v-else-if="row.status === 'removed'" class="status-badge badge-removed">-</span>
                <span v-else-if="row.status === 'changed'" class="status-badge badge-changed">~</span>
              </td>
              <td
                v-for="col in diffResult.columns"
                :key="col"
                :class="cellClass(row.status, col, row.changedKeys)"
              >
                <template v-if="row.status === 'removed'">{{ row.left?.[col] ?? '' }}</template>
                <template v-else-if="row.status === 'added'">{{ row.right?.[col] ?? '' }}</template>
                <template v-else-if="row.status === 'changed' && row.changedKeys?.includes(col)">
                  <span class="old-value">{{ row.left?.[col] ?? '' }}</span>
                  <span class="arrow"> → </span>
                  <span class="new-value">{{ row.right?.[col] ?? '' }}</span>
                </template>
                <template v-else>{{ row.right?.[col] ?? row.left?.[col] ?? '' }}</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.result-diff {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.diff-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  flex-shrink: 0;
}

.source-select {
  min-width: 250px;
}

.diff-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--sapContent_LabelColor);
  font-size: 0.875rem;
  padding: 2rem;
  text-align: center;
}

.diff-stats {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  flex-shrink: 0;
}

.stat-added { color: var(--sapPositiveColor, #2b7c2b); }
.stat-removed { color: var(--sapNegativeColor, #bb0000); }
.stat-changed { color: var(--sapCriticalColor, #e76500); }
.stat-unchanged { color: var(--sapContent_LabelColor); }

.diff-table-container {
  flex: 1;
  overflow: auto;
}

.diff-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.diff-table th {
  position: sticky;
  top: 0;
  background: var(--sapList_HeaderBackground, #f2f2f2);
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  white-space: nowrap;
}

.diff-table td {
  padding: 0.375rem 0.75rem;
  border-bottom: 1px solid var(--sapList_BorderColor, #e5e5e5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.diff-status-col {
  width: 24px;
  text-align: center;
  padding: 0 4px !important;
}

.status-badge {
  display: inline-block;
  width: 18px;
  height: 18px;
  line-height: 18px;
  border-radius: 50%;
  text-align: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: white;
}

.badge-added { background: var(--sapPositiveColor, #2b7c2b); }
.badge-removed { background: var(--sapNegativeColor, #bb0000); }
.badge-changed { background: var(--sapCriticalColor, #e76500); }

.diff-cell-changed {
  background: var(--sapWarningBackground, #fef7f1) !important;
}

.old-value {
  color: var(--sapNegativeColor, #bb0000);
  text-decoration: line-through;
  opacity: 0.7;
}

.arrow {
  color: var(--sapContent_LabelColor);
  margin: 0 2px;
}

.new-value {
  color: var(--sapPositiveColor, #2b7c2b);
  font-weight: 500;
}
</style>
