<script setup lang="ts">
import { computed } from 'vue'
import type { ContextMenuState } from '../composables/useContextMenu'
import { useCopyToClipboard } from '../composables/useCopyToClipboard'
import { toast } from '../composables/useToast'

const props = defineProps<{
  state: ContextMenuState
}>()

const emit = defineEmits<{
  close: []
  filter: [value: string]
}>()

const { copy } = useCopyToClipboard()

const style = computed(() => ({
  left: `${props.state.x}px`,
  top: `${props.state.y}px`
}))

function copyValue() {
  if (props.state.payload) {
    copy(props.state.payload.value, 'ctx-value')
  }
  emit('close')
}

function copyRowJson() {
  if (props.state.payload) {
    const json = JSON.stringify(props.state.payload.row, null, 2)
    navigator.clipboard.writeText(json)
    toast.show('Row copied as JSON', 1500)
  }
  emit('close')
}

function copyRowInsert() {
  if (!props.state.payload) return
  const { row, columns } = props.state.payload
  const cols = columns.map(c => `"${c.key}"`).join(', ')
  const vals = columns.map(c => {
    const v = row[c.key]
    if (v === null || v === undefined) return 'NULL'
    if (typeof v === 'number') return String(v)
    return `'${String(v).replace(/'/g, "''")}'`
  }).join(', ')
  const sql = `INSERT INTO "TABLE_NAME" (${cols}) VALUES (${vals});`
  navigator.clipboard.writeText(sql)
  toast.show('Copied as INSERT statement', 1500)
  emit('close')
}

function filterByValue() {
  if (props.state.payload) {
    emit('filter', String(props.state.payload.value ?? ''))
  }
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="state.visible"
      class="context-menu"
      :style="style"
      @click.stop
      @contextmenu.prevent
    >
      <div class="menu-item" @click="copyValue">
        <span class="menu-icon">&#128203;</span>
        <span>Copy Value</span>
      </div>
      <div class="menu-item" @click="copyRowJson">
        <span class="menu-icon">{ }</span>
        <span>Copy Row as JSON</span>
      </div>
      <div class="menu-item" @click="copyRowInsert">
        <span class="menu-icon">SQL</span>
        <span>Copy Row as INSERT</span>
      </div>
      <div class="menu-divider" />
      <div class="menu-item" @click="filterByValue">
        <span class="menu-icon">&#128269;</span>
        <span>Filter by this value</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 9999;
  background: var(--sapGroup_ContentBackground, #fff);
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  padding: 4px 0;
  font-size: 0.8125rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  color: var(--sapTextColor);
  transition: background-color 0.1s;
}

.menu-item:hover {
  background: var(--sapList_Hover_Background, #e5f0fa);
}

.menu-icon {
  width: 24px;
  text-align: center;
  font-size: 0.75rem;
  color: var(--sapContent_LabelColor);
}

.menu-divider {
  height: 1px;
  background: var(--sapGroup_ContentBorderColor, #d9d9d9);
  margin: 4px 0;
}
</style>
