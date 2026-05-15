<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQueryHistory, type HistoryEntry } from '../composables/useQueryHistory'
import { useCopyToClipboard } from '../composables/useCopyToClipboard'

import '@ui5/webcomponents/dist/Dialog.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Icon.js'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  rerun: [sql: string]
}>()

const { entries, search, remove, clearAll } = useQueryHistory()
const { copy } = useCopyToClipboard()

const searchQuery = ref('')

const filtered = computed(() => {
  return search(searchQuery.value).slice(0, 100)
})

function onSearchInput(e: Event) {
  searchQuery.value = (e.target as any).value || ''
}

function onRerun(entry: HistoryEntry) {
  emit('rerun', entry.sql)
  emit('close')
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function truncateSql(sql: string, max = 120): string {
  const oneline = sql.replace(/\s+/g, ' ').trim()
  return oneline.length > max ? oneline.slice(0, max) + '...' : oneline
}
</script>

<template>
  <ui5-dialog
    :open="open"
    header-text="Query History"
    @close="emit('close')"
    class="history-dialog"
  >
    <div class="history-content">
      <div class="history-toolbar">
        <ui5-input
          placeholder="Search queries..."
          show-clear-icon
          class="history-search"
          @input="onSearchInput"
        >
          <ui5-icon slot="icon" name="search" />
        </ui5-input>
        <ui5-button design="Transparent" icon="delete" tooltip="Clear All History" @click="clearAll" />
      </div>

      <div class="history-list" v-if="filtered.length > 0">
        <div
          v-for="entry in filtered"
          :key="entry.id"
          class="history-entry"
          :class="{ 'has-error': !!entry.error }"
          @click="onRerun(entry)"
        >
          <div class="entry-sql">{{ truncateSql(entry.sql) }}</div>
          <div class="entry-meta">
            <span class="entry-badge duration">{{ formatDuration(entry.duration) }}</span>
            <span v-if="!entry.error" class="entry-badge rows">{{ entry.rowCount }} rows</span>
            <span v-else class="entry-badge error">Error</span>
            <span class="entry-time">{{ formatTime(entry.timestamp) }}</span>
            <span class="entry-tab">{{ entry.tabName }}</span>
          </div>
          <div class="entry-actions">
            <ui5-button
              design="Transparent"
              icon="copy"
              tooltip="Copy SQL"
              @click.stop="copy(entry.sql, entry.id)"
            />
            <ui5-button
              design="Transparent"
              icon="delete"
              tooltip="Remove"
              @click.stop="remove(entry.id)"
            />
          </div>
        </div>
      </div>

      <div v-else class="history-empty">
        {{ searchQuery ? 'No matching queries found' : 'No query history yet' }}
      </div>
    </div>

    <div slot="footer" class="history-footer">
      <ui5-button design="Emphasized" @click="emit('close')">Close</ui5-button>
    </div>
  </ui5-dialog>
</template>

<style scoped>
.history-dialog {
  width: min(600px, 90vw);
  height: min(500px, 70vh);
}

.history-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.history-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0;
  align-items: center;
}

.history-search {
  flex: 1;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  border-top: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.history-entry {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  cursor: pointer;
  transition: background-color 0.15s;
  position: relative;
}

.history-entry:hover {
  background: var(--sapList_Hover_Background, #e5f0fa);
}

.history-entry.has-error {
  border-left: 3px solid var(--sapNegativeColor, #bb0000);
}

.entry-sql {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--sapTextColor);
  margin-bottom: 0.375rem;
  line-height: 1.4;
}

.entry-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.6875rem;
}

.entry-badge {
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.entry-badge.duration {
  background: var(--sapInformationBackground, #e8f3ff);
  color: var(--sapInformativeColor, #0854a0);
}

.entry-badge.rows {
  background: var(--sapSuccessBackground, #f1fdf6);
  color: var(--sapPositiveColor, #2b7c2b);
}

.entry-badge.error {
  background: var(--sapErrorBackground, #fff3f3);
  color: var(--sapNegativeColor, #bb0000);
}

.entry-time {
  color: var(--sapContent_LabelColor);
}

.entry-tab {
  color: var(--sapContent_LabelColor);
  font-style: italic;
}

.entry-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0;
  opacity: 0;
  transition: opacity 0.15s;
}

.history-entry:hover .entry-actions {
  opacity: 1;
}

.history-empty {
  padding: 2rem;
  text-align: center;
  color: var(--sapContent_LabelColor);
  font-size: 0.8125rem;
}

.history-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
