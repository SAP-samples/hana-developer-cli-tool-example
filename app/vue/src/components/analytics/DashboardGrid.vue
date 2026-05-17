<script setup lang="ts">
import ChartTile from './ChartTile.vue'
import type { DashboardTile } from '../../composables/useDashboardStore'
import type { FilterConfig } from '../../composables/useChartConfig'

defineProps<{
  tiles: DashboardTile[]
  crossFiltersFn?: (tileId: string) => FilterConfig[]
}>()

const emit = defineEmits<{
  removeTile: [id: string]
  chartClick: [tileId: string, params: any]
}>()
</script>

<template>
  <div class="dashboard-grid">
    <div
      v-for="tile in tiles"
      :key="tile.id"
      class="grid-cell"
      :style="{
        gridColumn: `${tile.position.x + 1} / span ${tile.position.w}`,
        gridRow: `${tile.position.y + 1} / span ${tile.position.h}`
      }"
    >
      <ChartTile
        :config="tile.config"
        :cross-filters="crossFiltersFn?.(tile.id)"
        @remove="emit('removeTile', tile.id)"
        @chart-click="(p) => emit('chartClick', tile.id, p)"
      />
    </div>
    <div v-if="tiles.length === 0" class="empty-state">
      <p>No charts yet. Click "Add Chart" to get started.</p>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
  padding: 1rem 0;
  min-height: 400px;
}
.grid-cell {
  min-height: 250px;
}
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sapNeutralColor);
  font-style: italic;
}
</style>
