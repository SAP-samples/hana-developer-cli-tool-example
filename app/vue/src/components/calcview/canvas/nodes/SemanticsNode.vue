<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  data: {
    label: string
    dataCategory: string
    attributeCount: number
    measureCount: number
  }
}>()
</script>

<template>
  <div class="semantics-node">
    <Handle type="target" :position="Position.Bottom" />
    <div class="node-icon">&#9672;</div>
    <div class="node-content">
      <div class="node-label">{{ data.label }}</div>
      <div class="node-subtitle">
        {{ data.dataCategory }} &middot; {{ data.attributeCount }} attrs &middot; {{ data.measureCount }} measures
      </div>
    </div>
  </div>
</template>

<style scoped>
.semantics-node {
  background: var(--sapTile_Background, #fff);
  border: 2px dashed var(--sapAccentColor6, #0854a0);
  border-radius: 10px;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 180px;
}

.node-icon {
  color: var(--sapAccentColor6, #0854a0);
  font-size: 18px;
}

.node-content {
  display: flex;
  flex-direction: column;
}

.node-label {
  color: var(--sapAccentColor6, #0854a0);
  font-weight: bold;
  font-size: 13px;
}

.node-subtitle {
  color: var(--sapContent_LabelColor, #666);
  font-size: 10px;
  margin-top: 2px;
}
</style>
