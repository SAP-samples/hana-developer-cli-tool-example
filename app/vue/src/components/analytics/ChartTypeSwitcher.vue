<script setup lang="ts">
import '@ui5/webcomponents/dist/ToggleButton.js'

// ── Props & Emits ─────────────────────────────────────────────────────────────

const props = defineProps<{
  modelValue: string
  suggested?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// ── Chart type definitions ────────────────────────────────────────────────────

interface ChartTypeEntry {
  type: string
  icon: string
  label: string
}

const CHART_TYPES: ChartTypeEntry[] = [
  { type: 'bar', icon: 'vertical-bar-chart', label: 'Bar' },
  { type: 'groupedBar', icon: 'horizontal-bar-chart', label: 'Grouped Bar' },
  { type: 'line', icon: 'line-chart', label: 'Line' },
  { type: 'pie', icon: 'donut-chart', label: 'Pie' },
  { type: 'scatter', icon: 'scatter-chart', label: 'Scatter' },
  { type: 'heatmap', icon: 'heatmap-chart', label: 'Heatmap' },
  { type: 'kpi', icon: 'kpi-corporate-performance', label: 'KPI' },
]

// ── Handlers ──────────────────────────────────────────────────────────────────

function select(type: string): void {
  if (props.modelValue !== type) {
    emit('update:modelValue', type)
  }
}
</script>

<template>
  <div class="chart-type-switcher">
    <ui5-toggle-button
      v-for="entry in CHART_TYPES"
      :key="entry.type"
      :icon="entry.icon"
      :tooltip="entry.label"
      :pressed="modelValue === entry.type"
      :class="{ 'is-suggested': suggested === entry.type }"
      design="Transparent"
      @click="select(entry.type)"
    >
      {{ entry.label }}
    </ui5-toggle-button>
  </div>
</template>

<style scoped>
.chart-type-switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
}

.is-suggested {
  outline: 2px dashed var(--sapHighlightColor, #0070f2);
  outline-offset: 1px;
  border-radius: 4px;
}
</style>
