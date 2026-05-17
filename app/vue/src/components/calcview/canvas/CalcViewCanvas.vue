<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/minimap/dist/style.css'
import '@vue-flow/controls/dist/style.css'

import SemanticsNode from './nodes/SemanticsNode.vue'
import ProjectionNode from './nodes/ProjectionNode.vue'
import DataFlowEdge from './edges/DataFlowEdge.vue'

import type { Node, Edge, NodeMouseEvent } from '@vue-flow/core'

const props = defineProps<{
  nodes: Node[]
  edges: Edge[]
}>()

const emit = defineEmits<{
  'node-click': [node: Node]
}>()

function onNodeClick(event: NodeMouseEvent) {
  emit('node-click', event.node)
}
</script>

<template>
  <div class="canvas-container">
    <VueFlow
      :nodes="props.nodes"
      :edges="props.edges"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      fit-view-on-init
      @node-click="onNodeClick"
    >
      <template #node-semantics="nodeProps">
        <SemanticsNode v-bind="nodeProps" />
      </template>
      <template #node-projection="nodeProps">
        <ProjectionNode v-bind="nodeProps" />
      </template>
      <template #edge-dataFlow="edgeProps">
        <DataFlowEdge v-bind="edgeProps" />
      </template>
      <MiniMap />
      <Controls />
    </VueFlow>
  </div>
</template>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  background: var(--sapBackgroundColor, #f5f6f7);
}
</style>
