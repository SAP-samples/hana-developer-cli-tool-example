<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHanaApi } from '../composables/useHanaApi'
import { useDynamicTable } from '../composables/useDynamicTable'
import SmartTable from '../components/SmartTable.vue'

import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'
import '@ui5/webcomponents/dist/Card.js'
import '@ui5/webcomponents/dist/CardHeader.js'
import '@ui5/webcomponents/dist/Label.js'

const { fetchDirect } = useHanaApi()
const loading = ref(false)
const error = ref('')

const versionInfo = ref<Record<string, string>>({})
const packagesTable = useDynamicTable()

async function loadVersion() {
  loading.value = true
  error.value = ''

  try {
    const result = await fetchDirect<any>('/hana/version-ui')
    if (result && typeof result === 'object') {
      if (result.packages) {
        packagesTable.setData(result.packages)
        delete result.packages
      }
      versionInfo.value = result
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function onExport(format: 'excel' | 'csv') {
  format === 'excel'
    ? packagesTable.exportExcel('packages.xlsx')
    : packagesTable.exportCsv('packages.csv')
}

onMounted(loadVersion)
</script>

<template>
  <div class="version-view">
    <ui5-title level="H3">Version Information</ui5-title>

    <ui5-busy-indicator v-if="loading" active size="Medium" class="loading" />

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <template v-else>
      <div class="info-cards">
        <ui5-card v-for="(value, key) in versionInfo" :key="key" class="info-card">
          <ui5-card-header :title-text="String(key)" :subtitle-text="String(value)" slot="header" />
        </ui5-card>
      </div>

      <SmartTable
        v-if="packagesTable.totalCount.value > 0"
        title="Installed Packages"
        :columns="packagesTable.columns.value"
        :data="packagesTable.displayData.value"
        :sort-key="packagesTable.sortKey.value"
        :sort-dir="packagesTable.sortDir.value"
        :row-count="packagesTable.rowCount.value"
        :total-count="packagesTable.totalCount.value"
        @sort="packagesTable.toggleSort"
        @search="(q: string) => packagesTable.searchQuery.value = q"
        @export="onExport"
      />
    </template>
  </div>
</template>

<style scoped>
.version-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-card {
  min-width: 220px;
  max-width: 300px;
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
