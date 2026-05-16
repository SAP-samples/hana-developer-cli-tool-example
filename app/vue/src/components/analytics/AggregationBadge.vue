<script setup lang="ts">
import '@ui5/webcomponents/dist/Tag.js'
import { computed } from 'vue'

// ── Props ─────────────────────────────────────────────────────────────────────

const props = defineProps<{
  aggregated: boolean
  totalRows?: number | null
  resultRows?: number
}>()

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1000) {
    return `${Math.round(n / 1000)}K`
  }
  return String(n)
}

// ── Derived display ───────────────────────────────────────────────────────────

const colorScheme = computed<string>(() => (props.aggregated ? '8' : '6'))

const label = computed<string>(() => {
  if (props.aggregated) {
    const total = props.totalRows != null ? formatNumber(props.totalRows) : '?'
    const result = props.resultRows != null ? String(props.resultRows) : '?'
    return `Aggregated (${total} → ${result})`
  }
  const rows = props.totalRows != null ? formatNumber(props.totalRows) : '?'
  return `Raw data (${rows} rows)`
})
</script>

<template>
  <ui5-tag :color-scheme="colorScheme">
    {{ label }}
  </ui5-tag>
</template>
