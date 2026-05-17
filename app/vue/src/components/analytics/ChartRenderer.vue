<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useChartEngine, type ChartData } from '../../composables/useChartEngine'

// ── Props & Emits ─────────────────────────────────────────────────────────────

const props = defineProps<{
  chartType: string
  data: ChartData | null
  dimensions: string[]
  measures: string[]
}>()

const emit = defineEmits<{
  chartClick: [params: unknown]
}>()

// ── Container ref & engine ────────────────────────────────────────────────────

const containerRef = ref<HTMLElement | null>(null)

const { render, onChartClick } = useChartEngine(containerRef)

// ── Render on mount and on prop changes ───────────────────────────────────────

function tryRender(): void {
  if (!props.data) return
  render(props.chartType, props.data, props.dimensions, props.measures)
}

onMounted(() => {
  tryRender()
  onChartClick((params) => emit('chartClick', params))
})

watch(
  () => [props.chartType, props.data, props.dimensions, props.measures] as const,
  () => tryRender(),
  { deep: true },
)
</script>

<template>
  <div
    ref="containerRef"
    class="chart-renderer"
  />
</template>

<style scoped>
.chart-renderer {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
