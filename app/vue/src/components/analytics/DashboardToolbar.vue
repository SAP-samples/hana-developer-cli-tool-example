<script setup lang="ts">
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import { ref } from 'vue'
import type { DashboardDefinition } from '../../composables/useDashboardStore'

const props = defineProps<{
  dashboards: DashboardDefinition[]
  activeDashboard: DashboardDefinition | null
}>()

const emit = defineEmits<{
  create: [name: string]
  select: [id: string]
  save: []
  remove: [id: string]
  exportDash: []
  importDash: [json: string]
  addChart: []
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function handleImport() {
  fileInput.value?.click()
}

function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => emit('importDash', reader.result as string)
    reader.readAsText(file)
  }
}
</script>

<template>
  <div class="dashboard-toolbar">
    <ui5-select v-if="dashboards.length > 0" @change="(e: any) => emit('select', e.detail.selectedOption?.dataset?.id || '')">
      <ui5-option v-for="d in dashboards" :key="d.id" :data-id="d.id" :selected="d.id === activeDashboard?.id">{{ d.name }}</ui5-option>
    </ui5-select>
    <ui5-button icon="add" @click="emit('create', `Dashboard ${dashboards.length + 1}`)">New</ui5-button>
    <ui5-button v-if="activeDashboard" icon="add-activity" design="Emphasized" @click="emit('addChart')">Add Chart</ui5-button>
    <ui5-button v-if="activeDashboard" icon="save" @click="emit('save')">Save</ui5-button>
    <ui5-button v-if="activeDashboard" icon="download" @click="emit('exportDash')">Export</ui5-button>
    <ui5-button icon="upload" @click="handleImport">Import</ui5-button>
    <ui5-button v-if="activeDashboard" icon="delete" design="Negative" @click="emit('remove', activeDashboard.id)">Delete</ui5-button>
    <input ref="fileInput" type="file" accept=".json" style="display:none" @change="onFileSelected" />
  </div>
</template>

<style scoped>
.dashboard-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.5rem 0;
}
</style>
