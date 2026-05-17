<script setup lang="ts">
import type { CalcViewTab } from '../../../composables/calcview/useCalcViewTabs'
import '@ui5/webcomponents/dist/Button.js'

const props = defineProps<{
  tabs: CalcViewTab[]
  activeTabId: string | null
}>()

const emit = defineEmits<{
  'select-tab': [tabId: string]
  'close-tab': [tabId: string]
}>()

function isDirty(tab: CalcViewTab): boolean {
  return tab.editor.undoRedo.isDirty.value
}
</script>

<template>
  <div class="tab-bar" v-if="tabs.length > 0">
    <div
      v-for="tab in tabs"
      :key="tab.id"
      class="tab-item"
      :class="{ active: activeTabId === tab.id }"
      @click="emit('select-tab', tab.id)"
    >
      <span class="tab-title">{{ tab.title }}</span>
      <span v-if="isDirty(tab)" class="dirty-dot" />
      <button class="close-btn" @click.stop="emit('close-tab', tab.id)">&times;</button>
    </div>
  </div>
</template>

<style scoped>
.tab-bar {
  display: flex;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  background: var(--sapPageHeader_Background, #fff);
  overflow-x: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  cursor: pointer;
  border-right: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  font-size: 12px;
  white-space: nowrap;
}

.tab-item.active {
  background: var(--sapGroup_ContentBackground, #fff);
  border-bottom: 2px solid var(--sapSelectedColor, #0854a0);
}

.tab-title {
  color: var(--sapTextColor, #333);
}

.dirty-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--sapWarningColor, #e78c07);
}

.close-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--sapContent_LabelColor, #666);
  padding: 0 2px;
}

.close-btn:hover {
  color: var(--sapNegativeColor, #bb0000);
}
</style>
