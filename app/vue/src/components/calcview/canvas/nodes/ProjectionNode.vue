<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  data: {
    label: string
    typeDef: { icon: string; themeVariable: string; label: string }
    columnCount: number
    inputCount: number
  }
}>()
</script>

<template>
  <div class="projection-node" :style="{ borderColor: `var(${data.typeDef.themeVariable})` }">
    <Handle type="target" :position="Position.Bottom" />
    <Handle type="source" :position="Position.Top" />
    <div class="node-icon" :style="{ color: `var(${data.typeDef.themeVariable})` }">
      {{ data.typeDef.icon }}
    </div>
    <div class="node-content">
      <div class="node-label">{{ data.label }}</div>
      <div class="node-subtitle">{{ data.inputCount }} input &middot; {{ data.columnCount }} columns</div>
    </div>
  </div>
</template>

<style scoped>
.projection-node {
  background: var(--sapTile_Background, #fff);
  border: 2px solid;
  border-radius: 8px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 160px;
}

.node-icon {
  font-size: 16px;
}

.node-content {
  display: flex;
  flex-direction: column;
}

.node-label {
  color: var(--sapTextColor, #333);
  font-weight: 600;
  font-size: 12px;
}

.node-subtitle {
  color: var(--sapContent_LabelColor, #666);
  font-size: 10px;
  margin-top: 2px;
}
</style>
