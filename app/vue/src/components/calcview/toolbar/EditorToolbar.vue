<script setup lang="ts">
import '@ui5/webcomponents/dist/Button.js'

defineProps<{
  canUndo: boolean
  canRedo: boolean
  filePath?: string
  paletteVisible: boolean
}>()

const emit = defineEmits<{
  'undo': []
  'redo': []
  'auto-layout': []
  'save': []
  'save-as': []
  'toggle-palette': []
}>()
</script>

<template>
  <div class="editor-toolbar">
    <ui5-button design="Transparent" :icon="paletteVisible ? 'close-command-field' : 'open-command-field'" @click="emit('toggle-palette')" :tooltip="paletteVisible ? 'Hide Node Palette' : 'Show Node Palette'" />
    <div class="separator" />
    <ui5-button design="Transparent" icon="undo" :disabled="!canUndo" @click="emit('undo')" tooltip="Undo (Ctrl+Z)" />
    <ui5-button design="Transparent" icon="redo" :disabled="!canRedo" @click="emit('redo')" tooltip="Redo (Ctrl+Y)" />
    <div class="separator" />
    <ui5-button design="Transparent" icon="save" @click="emit('save')" tooltip="Save (Ctrl+S)" />
    <ui5-button design="Transparent" icon="request" @click="emit('save-as')" tooltip="Save As..." />
    <div class="separator" />
    <ui5-button design="Transparent" icon="resize" @click="emit('auto-layout')" tooltip="Auto Layout" />
  </div>
</template>

<style scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  background: var(--sapPageHeader_Background, #fff);
  flex-shrink: 0;
}

.separator {
  width: 1px;
  height: 20px;
  background: var(--sapGroup_ContentBorderColor, #d9d9d9);
  margin: 0 4px;
}
</style>
