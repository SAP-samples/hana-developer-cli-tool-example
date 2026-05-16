<script setup lang="ts">
import { watchEffect } from 'vue'
import { ref } from 'vue'
import DashboardToolbar from './DashboardToolbar.vue'
import DashboardGrid from './DashboardGrid.vue'
import AddChartModal from './AddChartModal.vue'
import { useDashboardStore, type DashboardTile } from '../../composables/useDashboardStore'
import { useDashboardGrid } from '../../composables/useDashboardGrid'
import type { ChartConfig } from '../../composables/useChartConfig'

const store = useDashboardStore()
const grid = useDashboardGrid()
const addChartRef = ref<InstanceType<typeof AddChartModal> | null>(null)

watchEffect(() => {
  if (store.activeDashboard.value) {
    grid.setTiles(store.activeDashboard.value.tiles.map(t => t.position))
  }
})

function onAddChart() {
  addChartRef.value?.show()
}

function onChartConfigured(config: ChartConfig) {
  if (!store.activeDashboard.value) return
  const id = crypto.randomUUID()
  const position = grid.addTile(id)
  const tile: DashboardTile = { id, position, config }
  store.activeDashboard.value.tiles.push(tile)
  store.save()
}

function onRemoveTile(id: string) {
  if (!store.activeDashboard.value) return
  store.activeDashboard.value.tiles = store.activeDashboard.value.tiles.filter(t => t.id !== id)
  grid.removeTile(id)
  store.save()
}

function onExport() {
  if (!store.activeDashboard.value) return
  const json = store.exportDashboard(store.activeDashboard.value)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${store.activeDashboard.value.name}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function onImport(json: string) {
  store.importDashboard(json)
}
</script>

<template>
  <div class="dashboard-tab">
    <DashboardToolbar
      :dashboards="store.dashboards.value"
      :active-dashboard="store.activeDashboard.value"
      @create="(name) => store.create(name)"
      @select="(id) => store.setActive(id)"
      @save="store.save"
      @remove="(id) => store.remove(id)"
      @export-dash="onExport"
      @import-dash="onImport"
      @add-chart="onAddChart"
    />
    <DashboardGrid
      v-if="store.activeDashboard.value"
      :tiles="store.activeDashboard.value.tiles"
      @remove-tile="onRemoveTile"
    />
    <div v-else class="no-dashboard">
      <p>Select or create a dashboard to get started.</p>
    </div>
    <AddChartModal ref="addChartRef" @confirm="onChartConfigured" />
  </div>
</template>

<style scoped>
.dashboard-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.no-dashboard {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sapNeutralColor);
}
</style>
