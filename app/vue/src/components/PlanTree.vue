<script setup lang="ts">
import { computed } from 'vue'

export interface PlanNode {
  id: number
  parentId: number | null
  operator: string
  details: string
  cost: number
  outputSize: number
  children: PlanNode[]
}

const props = defineProps<{
  data: any[]
}>()

function buildTree(rows: any[]): PlanNode[] {
  if (!rows || rows.length === 0) return []

  const nodes: PlanNode[] = rows.map(r => ({
    id: r.ID ?? r.id ?? 0,
    parentId: r.PARENT_ID ?? r.parent_id ?? null,
    operator: r.OPERATOR_NAME ?? r.operator_name ?? 'Unknown',
    details: r.OPERATOR_DETAILS ?? r.operator_details ?? '',
    cost: Number(r.SUBTREE_COST ?? r.subtree_cost ?? 0),
    outputSize: Number(r.OUTPUT_SIZE ?? r.output_size ?? 0),
    children: []
  }))

  const map = new Map<number, PlanNode>()
  nodes.forEach(n => map.set(n.id, n))

  const roots: PlanNode[] = []
  nodes.forEach(n => {
    if (n.parentId === null || n.parentId === 0 || !map.has(n.parentId)) {
      roots.push(n)
    } else {
      map.get(n.parentId)!.children.push(n)
    }
  })

  return roots
}

const tree = computed(() => buildTree(props.data))
const maxCost = computed(() => {
  if (!props.data || props.data.length === 0) return 1
  return Math.max(...props.data.map(r => Number(r.SUBTREE_COST ?? r.subtree_cost ?? 0)), 1)
})

function costPercent(cost: number): number {
  return Math.round((cost / maxCost.value) * 100)
}

function costColor(percent: number): string {
  if (percent > 60) return 'var(--sapNegativeColor, #bb0000)'
  if (percent > 30) return 'var(--sapCriticalColor, #e76500)'
  return 'var(--sapPositiveColor, #2b7c2b)'
}
</script>

<template>
  <div class="plan-tree">
    <div v-if="tree.length === 0" class="plan-empty">No plan data</div>
    <template v-else>
      <PlanNodeItem
        v-for="node in tree"
        :key="node.id"
        :node="node"
        :max-cost="maxCost"
        :depth="0"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, h, type VNode } from 'vue'

const PlanNodeItem = defineComponent({
  name: 'PlanNodeItem',
  props: {
    node: { type: Object, required: true },
    maxCost: { type: Number, required: true },
    depth: { type: Number, default: 0 }
  },
  setup(props): () => VNode {
    return (): VNode => {
      const node = props.node as PlanNode
      const percent = Math.round((node.cost / props.maxCost) * 100)
      const color = percent > 60 ? 'var(--sapNegativeColor, #bb0000)'
        : percent > 30 ? 'var(--sapCriticalColor, #e76500)'
        : 'var(--sapPositiveColor, #2b7c2b)'

      const children: VNode[] = node.children.map((child: PlanNode) =>
        h(PlanNodeItem, { node: child, maxCost: props.maxCost, depth: props.depth + 1, key: child.id })
      )

      return h('div', { class: 'plan-node-wrapper' }, [
        h('div', {
          class: 'plan-node',
          style: { paddingLeft: `${props.depth * 24 + 8}px` },
          title: node.details
        }, [
          h('span', { class: 'node-operator' }, node.operator),
          h('div', { class: 'node-cost-bar' }, [
            h('div', {
              class: 'node-cost-fill',
              style: { width: `${percent}%`, backgroundColor: color }
            })
          ]),
          h('span', { class: 'node-cost-label' }, `${percent}%`),
          h('span', { class: 'node-rows' }, `${node.outputSize.toLocaleString()} rows`)
        ]),
        ...children
      ])
    }
  }
})
</script>

<style scoped>
.plan-tree {
  padding: 0.5rem;
  overflow: auto;
  height: 100%;
}

.plan-empty {
  padding: 2rem;
  text-align: center;
  color: var(--sapContent_LabelColor);
}
</style>

<style>
.plan-node {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 2px;
  transition: background-color 0.1s;
  cursor: default;
}

.plan-node:hover {
  background: var(--sapList_Hover_Background, #e5f0fa);
}

.node-operator {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--sapTextColor);
  min-width: 140px;
  white-space: nowrap;
}

.node-cost-bar {
  width: 100px;
  height: 8px;
  background: var(--sapField_Background, #f5f5f5);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--sapField_BorderColor, #89919a);
}

.node-cost-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.node-cost-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--sapContent_LabelColor);
  min-width: 30px;
}

.node-rows {
  font-size: 0.6875rem;
  color: var(--sapContent_LabelColor);
  margin-left: auto;
}
</style>
