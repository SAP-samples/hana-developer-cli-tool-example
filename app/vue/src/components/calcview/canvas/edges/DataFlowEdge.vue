<script setup lang="ts">
import { BezierEdge, type BezierEdgeProps } from '@vue-flow/core'

defineProps<BezierEdgeProps>()
</script>

<template>
  <BezierEdge v-bind="$props" :style="{ stroke: 'var(--sapContent_NonInteractiveIconColor, #6a6d70)', strokeWidth: 2 }" />
</template>
