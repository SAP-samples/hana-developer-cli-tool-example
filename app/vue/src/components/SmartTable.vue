<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SmartColumn } from '../composables/useSmartTable'
import { useCopyToClipboard } from '../composables/useCopyToClipboard'
import { useContextMenu, type ContextMenuPayload } from '../composables/useContextMenu'
import { useColumnLayout } from '../composables/useColumnLayout'
import { useGridNavigation } from '../composables/useGridNavigation'
import CellContextMenu from './CellContextMenu.vue'
import VirtualTable from './VirtualTable.vue'

import '@ui5/webcomponents/dist/Table.js'
import '@ui5/webcomponents/dist/TableHeaderRow.js'
import '@ui5/webcomponents/dist/TableHeaderCell.js'
import '@ui5/webcomponents/dist/TableRow.js'
import '@ui5/webcomponents/dist/TableCell.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Label.js'
import '@ui5/webcomponents/dist/Bar.js'

const { copiedKey, copy } = useCopyToClipboard()
const { state: menuState, open: openMenu, close: closeMenu } = useContextMenu()

const props = withDefaults(defineProps<{
  columns: SmartColumn[]
  data: any[]
  loading?: boolean
  sortKey?: string | null
  sortDir?: 'Ascending' | 'Descending'
  title?: string
  rowCount?: number
  totalCount?: number
  overflowMode?: 'Popin' | 'Scroll'
  virtualThreshold?: number
  contextId?: string
  linkColumn?: string
}>(), {
  virtualThreshold: 500,
  contextId: 'default'
})

const emit = defineEmits<{
  sort: [key: string]
  export: [format: 'excel' | 'csv']
  search: [query: string]
  rowClick: [row: any]
  escape: []
}>()

const tableBodyRef = ref<HTMLElement | null>(null)

const columnLayout = computed(() => {
  const keys = props.columns.map(c => c.key)
  return useColumnLayout(props.contextId, keys)
})

const orderedColumns = computed(() => {
  if (props.columns.length === 0) return []
  const layout = columnLayout.value
  const ordered = layout.getOrderedKeys()
  const colMap = new Map(props.columns.map(c => [c.key, c]))
  const result = ordered.filter(k => colMap.has(k)).map(k => colMap.get(k)!)
  if (result.length === 0) return props.columns
  return result
})

const gridRowCount = computed(() => props.data.length)
const gridColCount = computed(() => orderedColumns.value.length)

const gridNav = useGridNavigation({
  rowCount: gridRowCount,
  colCount: gridColCount,
  onCopy(row, col) {
    const colKey = orderedColumns.value[col]?.key
    if (colKey) copy(props.data[row]?.[colKey], `${row}-${colKey}`)
  },
  onEscape() { emit('escape') }
})

function onTableKeydown(e: KeyboardEvent) {
  gridNav.handleKeydown(e)
}

function onCellClick(rowIdx: number, colIdx: number) {
  gridNav.activate(rowIdx, colIdx)
  const col = orderedColumns.value[colIdx]
  if (col?.key === props.linkColumn) {
    const value = String(props.data[rowIdx]?.[col.key] ?? '')
    if (value.startsWith('http://') || value.startsWith('https://')) {
      window.open(value, '_blank', 'noopener')
    }
  }
}

let dragSourceKey = ''

function onHeaderDragStart(e: DragEvent, colKey: string) {
  dragSourceKey = colKey
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('text/plain', colKey)
}

function onHeaderDragOver(e: DragEvent) {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
}

function onHeaderDrop(e: DragEvent, targetKey: string) {
  e.preventDefault()
  if (dragSourceKey && dragSourceKey !== targetKey) {
    columnLayout.value.reorderColumn(dragSourceKey, targetKey)
  }
  dragSourceKey = ''
}

function onResizePointerDown(e: PointerEvent, colKey: string, headerEl: HTMLElement) {
  e.stopPropagation()
  const startWidth = headerEl.offsetWidth
  columnLayout.value.startResize(colKey, e.clientX, startWidth)

  const onMove = (me: PointerEvent) => {
    columnLayout.value.onResize(me.clientX)
  }
  const onUp = () => {
    columnLayout.value.endResize()
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function getColStyle(col: SmartColumn): Record<string, string> {
  const w = columnLayout.value.getColumnWidth(col.key)
  if (w) return { width: `${w}px`, minWidth: '80px', flexShrink: '0' }
  if (col.width) return { width: col.width, minWidth: '80px', flexShrink: '0' }
  return { flex: '1 1 0', minWidth: '80px', overflow: 'hidden' }
}

function getSortIndicator(col: SmartColumn): string {
  if (!col.sortable || props.sortKey !== col.key) return 'None'
  return props.sortDir || 'None'
}

function onHeaderClick(col: SmartColumn) {
  if (col.sortable) emit('sort', col.key)
}

function onSearchInput(e: Event) {
  const val = (e.target as any).value || ''
  emit('search', val)
}

function onRowClick(row: any) {
  emit('rowClick', row)
}

function onCellContext(event: MouseEvent, row: any, col: SmartColumn, rowIndex: number) {
  const payload: ContextMenuPayload = {
    value: row[col.key],
    row,
    columnKey: col.key,
    columnLabel: col.label,
    rowIndex,
    columns: props.columns.map(c => ({ key: c.key, label: c.label }))
  }
  openMenu(event, payload)
}

function onContextFilter(value: string) {
  emit('search', value)
}

function onResetLayout() {
  columnLayout.value.resetLayout()
}

const countLabel = computed(() => {
  if (props.rowCount !== undefined && props.totalCount !== undefined) {
    if (props.rowCount === props.totalCount) return `${props.totalCount} items`
    return `${props.rowCount} of ${props.totalCount} items`
  }
  return `${props.data.length} items`
})
</script>

<template>
  <div class="smart-table">
    <ui5-bar design="Header">
      <ui5-title slot="startContent" level="H4">{{ title }}</ui5-title>
      <ui5-label slot="startContent" class="count-label">{{ countLabel }}</ui5-label>

      <ui5-input
        slot="endContent"
        placeholder="Search..."
        show-clear-icon
        class="search-input"
        @input="onSearchInput"
      >
        <ui5-icon slot="icon" name="search" />
      </ui5-input>
      <ui5-button
        slot="endContent"
        icon="reset"
        tooltip="Reset Column Layout"
        design="Transparent"
        @click="onResetLayout"
      />
      <ui5-button
        slot="endContent"
        icon="excel-attachment"
        tooltip="Export to Excel"
        design="Transparent"
        @click="emit('export', 'excel')"
      />
      <ui5-button
        slot="endContent"
        icon="download"
        tooltip="Export to CSV"
        design="Transparent"
        @click="emit('export', 'csv')"
      />
    </ui5-bar>

    <template v-if="data.length > virtualThreshold">
      <VirtualTable
        :columns="orderedColumns"
        :data="data"
        :context-id="contextId"
        :link-column="linkColumn"
        @row-click="onRowClick"
      />
    </template>

    <div
      v-else
      ref="tableBodyRef"
      class="grid-table"
      tabindex="0"
      @keydown="onTableKeydown"
      @focus="gridNav.active.value || gridNav.activate(0, 0)"
    >
      <div class="grid-header">
        <div
          v-for="col in orderedColumns"
          :key="col.key"
          class="grid-header-cell"
          :class="{ sortable: col.sortable }"
          :style="getColStyle(col)"
          draggable="true"
          @dragstart="onHeaderDragStart($event, col.key)"
          @dragover="onHeaderDragOver"
          @drop="onHeaderDrop($event, col.key)"
          @click="onHeaderClick(col)"
        >
          <span class="header-label">{{ col.label }}</span>
          <span v-if="sortKey === col.key" class="sort-icon">{{ sortDir === 'Ascending' ? '▲' : '▼' }}</span>
          <span
            class="resize-handle"
            @pointerdown.stop="(e: PointerEvent) => onResizePointerDown(e, col.key, (e.currentTarget as HTMLElement).parentElement as HTMLElement)"
          />
        </div>
      </div>
      <div class="grid-body">
        <div
          v-for="(row, rowIdx) in data"
          :key="rowIdx"
          class="grid-row"
          @click="onRowClick(row)"
        >
          <span
            v-for="(col, colIdx) in orderedColumns"
            :key="col.key"
            class="grid-cell"
            :class="{
              'cell-copied': copiedKey === `${rowIdx}-${col.key}`,
              'grid-cell-focused': gridNav.isFocused(rowIdx, colIdx),
              'cell-link': col.key === linkColumn
            }"
            :style="getColStyle(col)"
            :title="String(row[col.key] ?? '')"
            @click="onCellClick(rowIdx, colIdx)"
            @contextmenu="onCellContext($event, row, col, rowIdx)"
          >{{ row[col.key] ?? '' }}</span>
        </div>
      </div>
    </div>

    <div v-if="!loading && data.length === 0" class="no-data">
      No data available
    </div>

    <CellContextMenu
      :state="menuState"
      @close="closeMenu"
      @filter="onContextFilter"
    />
  </div>
</template>

<style scoped>
.smart-table {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.search-input {
  width: 250px;
}

.count-label {
  margin-left: 1rem;
  color: var(--sapContent_LabelColor);
}

.grid-table {
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 4px;
  overflow: auto;
  outline: none;
  flex: 1;
  min-height: 0;
  background: var(--sapList_Background, #fff);
  color: var(--sapTextColor, #32363a);
}

.grid-header {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--sapList_HeaderBackground, #f2f2f2);
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.grid-header-cell {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--sapList_HeaderTextColor, #32363a);
  white-space: nowrap;
  user-select: none;
}

.grid-header-cell.sortable {
  cursor: pointer;
}

.grid-header-cell.sortable:hover {
  background: var(--sapList_Hover_Background, #e5f0fa);
}

.header-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.sort-icon {
  margin-left: 4px;
  font-size: 0.625rem;
}

.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background-color 0.15s;
}

.resize-handle:hover {
  background: var(--sapBrandColor, #0854a0);
}

.grid-body {
  display: flex;
  flex-direction: column;
}

.grid-row {
  display: flex;
  border-bottom: 1px solid var(--sapList_BorderColor, #e5e5e5);
  cursor: pointer;
  transition: background-color 0.1s;
  background: var(--sapList_Background, #fff);
}

.grid-row:nth-child(even) {
  background: var(--sapList_AlternatingBackground, var(--sapList_Background, #fff));
}

.grid-row:hover {
  background: var(--sapList_Hover_Background, #e5f0fa);
}

.grid-cell {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.cell-link {
  color: var(--sapLinkColor, #0064d9);
  cursor: pointer;
}

.grid-row:hover .cell-link {
  text-decoration: underline;
}

.cell-copied {
  background-color: var(--sapSuccessBackground, #f1fdf6);
}

.grid-cell-focused {
  outline: 2px solid var(--sapBrandColor, #0854a0);
  outline-offset: -2px;
  border-radius: 2px;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--sapContent_LabelColor);
}
</style>
