<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHanaApi } from '../composables/useHanaApi'

import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Label.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Table.js'
import '@ui5/webcomponents/dist/TableHeaderRow.js'
import '@ui5/webcomponents/dist/TableHeaderCell.js'
import '@ui5/webcomponents/dist/TableRow.js'
import '@ui5/webcomponents/dist/TableCell.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'

const { fetchDirect } = useHanaApi()

interface SystemData {
  user: Array<{ CURRENT_USER: string; CURRENT_SCHEMA: string }>
  version: {
    SYSTEM_ID: string
    DATABASE_NAME: string
    HOST: string
    START_TIME: string
    VERSION: string
  }
  overview: Array<{ SECTION: string; NAME: string; VALUE: string; STATUS: string }>
}

const data = ref<SystemData | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    data.value = await fetchDirect<SystemData>('/hana')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="system-info">
    <ui5-title level="H3">System Information</ui5-title>

    <ui5-busy-indicator v-if="loading" active size="Medium" class="loading" />

    <div v-else-if="error" class="error">
      <ui5-title level="H5">Connection Error</ui5-title>
      <p>{{ error }}</p>
    </div>

    <template v-else-if="data">
      <section class="info-section">
        <ui5-title level="H5">Current Session</ui5-title>
        <div class="form-grid">
          <ui5-label>User:</ui5-label>
          <ui5-input :value="data.user[0]?.CURRENT_USER" readonly />
          <ui5-label>Schema:</ui5-label>
          <ui5-input :value="data.user[0]?.CURRENT_SCHEMA" readonly />
        </div>
      </section>

      <section class="info-section">
        <ui5-title level="H5">Version Info</ui5-title>
        <div class="form-grid">
          <ui5-label>System ID:</ui5-label>
          <ui5-input :value="data.version.SYSTEM_ID" readonly />
          <ui5-label>Database:</ui5-label>
          <ui5-input :value="data.version.DATABASE_NAME" readonly />
          <ui5-label>Host:</ui5-label>
          <ui5-input :value="data.version.HOST" readonly />
          <ui5-label>Start Time:</ui5-label>
          <ui5-input :value="data.version.START_TIME" readonly />
          <ui5-label>Version:</ui5-label>
          <ui5-input :value="data.version.VERSION" readonly />
        </div>
      </section>

      <section class="info-section">
        <ui5-title level="H5">System Overview</ui5-title>
        <ui5-table overflow-mode="Popin">
          <ui5-table-header-row slot="headerRow">
            <ui5-table-header-cell width="20%" importance="3">Section</ui5-table-header-cell>
            <ui5-table-header-cell width="30%" importance="3">Name</ui5-table-header-cell>
            <ui5-table-header-cell width="35%" importance="2" popin-text="Value">Value</ui5-table-header-cell>
            <ui5-table-header-cell width="15%" importance="1" popin-text="Status">Status</ui5-table-header-cell>
          </ui5-table-header-row>

          <ui5-table-row v-for="(row, i) in data.overview" :key="i">
            <ui5-table-cell>{{ row.SECTION }}</ui5-table-cell>
            <ui5-table-cell>{{ row.NAME }}</ui5-table-cell>
            <ui5-table-cell>{{ row.VALUE }}</ui5-table-cell>
            <ui5-table-cell>{{ row.STATUS }}</ui5-table-cell>
          </ui5-table-row>
        </ui5-table>
      </section>
    </template>
  </div>
</template>

<style scoped>
.system-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.5rem 1rem;
  align-items: center;
  max-width: 500px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.error {
  padding: 1rem;
  color: var(--sapNegativeTextColor);
}
</style>
