<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSchemaCache, type TableInfo, type ColumnInfo } from '../composables/useSchemaCache'

import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'
import '@ui5/webcomponents/dist/Icon.js'

const emit = defineEmits<{
  insert: [text: string]
}>()

const { getSchemas, getTables, getColumns, refresh } = useSchemaCache()

interface TreeNode {
  key: string
  label: string
  icon: string
  type: 'schema' | 'table' | 'view' | 'column'
  qualifiedName: string
  children?: TreeNode[]
  expanded: boolean
  loading: boolean
  loaded: boolean
}

const tree = ref<TreeNode[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  const schemas = await getSchemas()
  tree.value = schemas.map(s => ({
    key: s,
    label: s,
    icon: 'folder-blank',
    type: 'schema' as const,
    qualifiedName: `"${s}"`,
    children: [],
    expanded: false,
    loading: false,
    loaded: false
  }))
  loading.value = false
})

async function toggleNode(node: TreeNode) {
  if (node.type === 'column') return

  if (node.expanded) {
    node.expanded = false
    return
  }

  node.expanded = true

  if (node.loaded) return

  node.loading = true

  if (node.type === 'schema') {
    const tables = await getTables(node.key)
    node.children = tables.map(t => ({
      key: `${node.key}.${t.name}`,
      label: t.name,
      icon: t.type === 'VIEW' ? 'grid' : 'table-view',
      type: (t.type === 'VIEW' ? 'view' : 'table') as 'table' | 'view',
      qualifiedName: `"${node.key}"."${t.name}"`,
      children: [],
      expanded: false,
      loading: false,
      loaded: false
    }))
  } else if (node.type === 'table' || node.type === 'view') {
    const parts = node.key.split('.')
    const cols = await getColumns(parts[0], parts[1])
    node.children = cols.map(c => ({
      key: `${node.key}.${c.name}`,
      label: `${c.name} (${c.dataType}${c.length ? `(${c.length})` : ''})`,
      icon: 'text-formatting',
      type: 'column' as const,
      qualifiedName: `"${c.name}"`,
      children: undefined,
      expanded: false,
      loading: false,
      loaded: true
    }))
  }

  node.loaded = true
  node.loading = false
}

function onDragStart(event: DragEvent, node: TreeNode) {
  event.dataTransfer?.setData('text/plain', node.qualifiedName)
  event.dataTransfer!.effectAllowed = 'copy'
}

function onDoubleClick(node: TreeNode) {
  emit('insert', node.qualifiedName)
}

async function onRefresh() {
  refresh()
  loading.value = true
  const schemas = await getSchemas()
  tree.value = schemas.map(s => ({
    key: s,
    label: s,
    icon: 'folder-blank',
    type: 'schema' as const,
    qualifiedName: `"${s}"`,
    children: [],
    expanded: false,
    loading: false,
    loaded: false
  }))
  loading.value = false
}
</script>

<template>
  <div class="object-explorer">
    <div class="explorer-header">
      <span class="explorer-title">Objects</span>
      <ui5-button design="Transparent" icon="refresh" tooltip="Refresh" @click="onRefresh" />
    </div>

    <ui5-busy-indicator v-if="loading" active size="Small" class="explorer-loading" />

    <div v-else class="explorer-tree">
      <template v-for="node in tree" :key="node.key">
        <div
          class="tree-node depth-0"
          :class="{ expanded: node.expanded }"
          draggable="true"
          @click="toggleNode(node)"
          @dblclick.stop="onDoubleClick(node)"
          @dragstart="onDragStart($event, node)"
        >
          <span class="node-chevron" :class="{ hidden: node.type === 'column' }">{{ node.expanded ? '▾' : '▸' }}</span>
          <ui5-icon :name="node.icon" class="node-icon" />
          <span class="node-label">{{ node.label }}</span>
          <ui5-busy-indicator v-if="node.loading" active size="Small" class="node-spinner" />
        </div>

        <template v-if="node.expanded && node.children">
          <template v-for="child in node.children" :key="child.key">
            <div
              class="tree-node depth-1"
              :class="{ expanded: child.expanded }"
              draggable="true"
              @click="toggleNode(child)"
              @dblclick.stop="onDoubleClick(child)"
              @dragstart="onDragStart($event, child)"
            >
              <span class="node-chevron" :class="{ hidden: child.type === 'column' }">{{ child.expanded ? '▾' : '▸' }}</span>
              <ui5-icon :name="child.icon" class="node-icon" />
              <span class="node-label">{{ child.label }}</span>
              <ui5-busy-indicator v-if="child.loading" active size="Small" class="node-spinner" />
            </div>

            <template v-if="child.expanded && child.children">
              <div
                v-for="leaf in child.children"
                :key="leaf.key"
                class="tree-node depth-2"
                draggable="true"
                @dblclick.stop="onDoubleClick(leaf)"
                @dragstart="onDragStart($event, leaf)"
              >
                <span class="node-chevron hidden" />
                <ui5-icon :name="leaf.icon" class="node-icon" />
                <span class="node-label">{{ leaf.label }}</span>
              </div>
            </template>
          </template>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.object-explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  background: var(--sapGroup_TitleBackground, #f2f2f2);
}

.explorer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.explorer-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--sapTextColor);
}

.explorer-loading {
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.explorer-tree {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.25rem 0;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--sapTextColor);
  white-space: nowrap;
  transition: background-color 0.1s;
  user-select: none;
}

.tree-node:hover {
  background: var(--sapList_Hover_Background, #e5f0fa);
}

.depth-0 { padding-left: 0.5rem; }
.depth-1 { padding-left: 1.5rem; }
.depth-2 { padding-left: 2.5rem; }

.node-chevron {
  width: 12px;
  flex-shrink: 0;
  font-size: 0.625rem;
  color: var(--sapContent_LabelColor);
}

.node-chevron.hidden {
  visibility: hidden;
}

.node-icon {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--sapContent_IconColor);
}

.node-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-spinner {
  margin-left: auto;
}
</style>
