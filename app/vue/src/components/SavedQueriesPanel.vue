<script setup lang="ts">
import { ref } from 'vue'
import { useSavedQueries, type SavedQuery } from '../composables/useSavedQueries'
import { toast } from '../composables/useToast'

import '@ui5/webcomponents/dist/Popover.js'
import '@ui5/webcomponents/dist/List.js'
import '@ui5/webcomponents/dist/ListItemStandard.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Dialog.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Label.js'

const props = defineProps<{
  open: boolean
  opener: string
  currentSql: string
}>()

const emit = defineEmits<{
  close: []
  load: [sql: string]
}>()

const { queries, save, remove } = useSavedQueries()
const saveDialogOpen = ref(false)
const saveNameInput = ref('')

function onSave() {
  if (!saveNameInput.value.trim()) return
  save(saveNameInput.value.trim(), props.currentSql)
  saveNameInput.value = ''
  saveDialogOpen.value = false
  toast.show('Query saved')
}

function onLoad(query: SavedQuery) {
  emit('load', query.sql)
  emit('close')
  toast.show(`Loaded: ${query.name}`)
}

function onDelete(query: SavedQuery) {
  remove(query.id)
  toast.show('Query deleted')
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <ui5-popover
    :open="open"
    :opener="opener"
    placement="Bottom"
    @close="emit('close')"
    class="saved-queries-popover"
  >
    <div class="panel-header">
      <ui5-button design="Emphasized" icon="save" @click="saveDialogOpen = true">Save Current</ui5-button>
    </div>

    <ui5-list v-if="queries.length > 0" class="queries-list">
      <ui5-li
        v-for="q in queries"
        :key="q.id"
        :description="q.sql.slice(0, 80)"
        :additional-text="formatDate(q.updatedAt)"
        type="Active"
        @click="onLoad(q)"
      >
        {{ q.name }}
        <ui5-button
          slot="deleteButton"
          icon="delete"
          design="Transparent"
          tooltip="Delete"
          @click.stop="onDelete(q)"
        />
      </ui5-li>
    </ui5-list>
    <div v-else class="empty-state">No saved queries</div>
  </ui5-popover>

  <ui5-dialog
    header-text="Save Query"
    :open="saveDialogOpen"
    @close="saveDialogOpen = false"
  >
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
      <ui5-label required>Query Name</ui5-label>
      <ui5-input
        :value="saveNameInput"
        placeholder="e.g. Active connections"
        @input="(e: any) => saveNameInput = e.target.value"
        style="width: 100%;"
      />
      <div class="sql-preview">{{ props.currentSql.slice(0, 200) }}</div>
    </div>
    <div slot="footer" style="display: flex; justify-content: flex-end; gap: 0.5rem; padding: 0.5rem;">
      <ui5-button design="Emphasized" :disabled="!saveNameInput.trim()" @click="onSave">Save</ui5-button>
      <ui5-button design="Transparent" @click="saveDialogOpen = false">Cancel</ui5-button>
    </div>
  </ui5-dialog>
</template>

<style scoped>
.saved-queries-popover {
  min-width: 350px;
}

.panel-header {
  padding: 0.75rem;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor);
}

.queries-list {
  max-height: 300px;
  overflow-y: auto;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--sapContent_LabelColor);
}

.sql-preview {
  padding: 0.5rem;
  background: var(--sapShell_Background);
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.75rem;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 80px;
  overflow: hidden;
  color: var(--sapContent_LabelColor);
}
</style>
