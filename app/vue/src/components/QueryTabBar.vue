<script setup lang="ts">
import { ref } from 'vue'
import type { QueryTab } from '../composables/useQueryTabs'

import '@ui5/webcomponents/dist/Button.js'

const props = defineProps<{
  tabs: QueryTab[]
  activeTabId: string
}>()

const emit = defineEmits<{
  select: [id: string]
  close: [id: string]
  add: []
  rename: [id: string, name: string]
}>()

const editingId = ref<string | null>(null)
const editingName = ref('')

function startRename(tab: QueryTab) {
  editingId.value = tab.id
  editingName.value = tab.name
}

function finishRename() {
  if (editingId.value && editingName.value.trim()) {
    emit('rename', editingId.value, editingName.value.trim())
  }
  editingId.value = null
}
</script>

<template>
  <div class="tab-bar">
    <div class="tab-list">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ active: tab.id === activeTabId }"
        @click="emit('select', tab.id)"
        @dblclick="startRename(tab)"
      >
        <input
          v-if="editingId === tab.id"
          v-model="editingName"
          class="tab-rename-input"
          @blur="finishRename"
          @keydown.enter="finishRename"
          @keydown.escape="editingId = null"
          @click.stop
          ref="renameInput"
        />
        <span v-else class="tab-name">{{ tab.name }}</span>
        <span
          v-if="tabs.length > 1"
          class="tab-close"
          @click.stop="emit('close', tab.id)"
        >&times;</span>
      </div>
    </div>
    <ui5-button
      design="Transparent"
      icon="add"
      tooltip="New Query Tab (Ctrl+Shift+N)"
      class="tab-add-btn"
      @click="emit('add')"
    />
  </div>
</template>

<style scoped>
.tab-bar {
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  background: var(--sapGroup_TitleBackground, #f2f2f2);
  overflow-x: auto;
}

.tab-list {
  display: flex;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  white-space: nowrap;
  border-right: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  font-size: 0.8125rem;
  color: var(--sapContent_LabelColor);
  transition: background-color 0.15s;
}

.tab-item:hover {
  background: var(--sapList_Hover_Background, #e5f0fa);
}

.tab-item.active {
  background: var(--sapBackgroundColor, #fff);
  color: var(--sapTextColor);
  border-bottom: 2px solid var(--sapBrandColor, #0854a0);
  margin-bottom: -1px;
}

.tab-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-close {
  font-size: 1rem;
  line-height: 1;
  padding: 0 2px;
  border-radius: 3px;
  opacity: 0.5;
}

.tab-close:hover {
  opacity: 1;
  background: var(--sapButton_Lite_Hover_Background, #e0e0e0);
}

.tab-rename-input {
  width: 80px;
  border: 1px solid var(--sapField_BorderColor);
  border-radius: 2px;
  padding: 1px 4px;
  font-size: 0.8125rem;
  background: var(--sapField_Background);
  color: var(--sapField_TextColor);
}

.tab-add-btn {
  flex-shrink: 0;
}
</style>
